import { NextRequest, NextResponse } from "next/server";

import { getMiddlewareContext } from "@/lib/middleware-globals";
import { createYandexAuthorizationUrl } from "@/lib/oauth/yandex";

const STATE_COOKIE_NAME = "lucia-yandex-oauth-state";
const STATE_COOKIE_MAX_AGE = 60 * 10; // 10 minutes

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const context = getMiddlewareContext();

  try {
    const { url, state } = createYandexAuthorizationUrl(requestUrl, context);
    const originHost = requestUrl.searchParams.get("originHost");

    const payload = JSON.stringify({
      state,
      originHost,
      createdAt: Date.now(),
    });

    const response = NextResponse.json({
      authorizationUrl: url.toString(),
    });

    response.cookies.set({
      name: STATE_COOKIE_NAME,
      value: payload,
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: STATE_COOKIE_MAX_AGE,
    });

    return response;
  } catch (error) {
    const status = error instanceof Error && error.name === "YandexZoneError" ? 403 : 500;
    const message = error instanceof Error ? error.message : "Unable to start Yandex authentication";
    return NextResponse.json({ error: message }, { status });
  }
}
