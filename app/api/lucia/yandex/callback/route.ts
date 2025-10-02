import { NextRequest, NextResponse } from "next/server";

import { getMiddlewareContext } from "@/lib/middleware-globals";
import {
  exchangeYandexAuthorizationCode,
  upsertYandexUser,
  createLuciaSessionForUser,
} from "@/lib/oauth/yandex";

const STATE_COOKIE_NAME = "lucia-yandex-oauth-state";

type StatePayload = {
  state: string;
  originHost: string | null;
  createdAt: number;
};

const deserializeState = (raw: string | undefined): StatePayload | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StatePayload;
  } catch {
    return null;
  }
};

const normalizeTargetOrigin = (originHost: string | null, fallback: string): string => {
  if (!originHost) {
    return fallback;
  }
  try {
    const url = originHost.includes("://") ? new URL(originHost) : new URL(`https://${originHost}`);
    return url.origin;
  } catch {
    return fallback;
  }
};

const renderPostMessagePage = (
  payload: unknown,
  targetOrigin: string,
  status: number,
) => {
  const scriptPayload = JSON.stringify(payload);
  const scriptOrigin = JSON.stringify(targetOrigin);
  const html = `<!DOCTYPE html>
<html>
  <body>
    <script>
      (function() {
        var message = ${scriptPayload};
        var targetOrigin = ${scriptOrigin};
        try {
          if (window.opener) {
            window.opener.postMessage(message, targetOrigin);
          }
        } catch (error) {
          console.error('postMessage error', error);
        }
        window.close();
      })();
    </script>
  </body>
</html>`;

  return new NextResponse(html, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
};

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const context = getMiddlewareContext();

  const errorCode = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");
  const stateParam = requestUrl.searchParams.get("state");
  const code = requestUrl.searchParams.get("code");

  const storedStateRaw = request.cookies.get(STATE_COOKIE_NAME)?.value;
  const storedState = deserializeState(storedStateRaw);

  const targetOrigin = normalizeTargetOrigin(
    storedState?.originHost ?? context.referalDomain ?? null,
    requestUrl.origin,
  );

  const clearStateCookie = (response: NextResponse) => {
    response.cookies.set({
      name: STATE_COOKIE_NAME,
      value: "",
      path: "/",
      maxAge: 0,
    });
  };

  if (!storedState) {
    const response = renderPostMessagePage(
      {
        action: "error",
        key: "yandex",
        value: { message: "OAuth state cookie is missing" },
      },
      targetOrigin,
      400,
    );
    clearStateCookie(response);
    return response;
  }

  if (!stateParam || storedState.state !== stateParam) {
    const response = renderPostMessagePage(
      {
        action: "error",
        key: "yandex",
        value: { message: "OAuth state mismatch" },
      },
      targetOrigin,
      400,
    );
    clearStateCookie(response);
    return response;
  }

  if (errorCode) {
    const response = renderPostMessagePage(
      {
        action: "error",
        key: "yandex",
        value: {
          message: errorDescription ?? errorCode,
        },
      },
      targetOrigin,
      400,
    );
    clearStateCookie(response);
    return response;
  }

  if (!code) {
    const response = renderPostMessagePage(
      {
        action: "error",
        key: "yandex",
        value: { message: "Authorization code is missing" },
      },
      targetOrigin,
      400,
    );
    clearStateCookie(response);
    return response;
  }

  try {
    const { profile } = await exchangeYandexAuthorizationCode(code, requestUrl, context);
    const user = await upsertYandexUser(profile);
    const { sessionCookie } = await createLuciaSessionForUser(user.id);

    const redirectLink = normalizeTargetOrigin(
      storedState.originHost ?? context.referalDomain ?? null,
      requestUrl.origin,
    );

    const response = renderPostMessagePage(
      {
        action: "login",
        key: "yandex",
        value: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          },
          redirectLink,
        },
      },
      targetOrigin,
      200,
    );

    clearStateCookie(response);

    response.cookies.set({
      name: sessionCookie.name,
      value: sessionCookie.value,
      httpOnly: sessionCookie.attributes.httpOnly ?? true,
      sameSite: sessionCookie.attributes.sameSite ?? "lax",
      secure: sessionCookie.attributes.secure ?? true,
      path: sessionCookie.attributes.path ?? "/",
      domain: sessionCookie.attributes.domain,
      expires: sessionCookie.attributes.expires,
      maxAge: sessionCookie.attributes.maxAge,
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to complete Yandex authentication";
    const response = renderPostMessagePage(
      {
        action: "error",
        key: "yandex",
        value: { message },
      },
      targetOrigin,
      500,
    );
    clearStateCookie(response);
    return response;
  }
}
