import { OAuth2Client, OAuth2Tokens, generateState } from "arctic";

import { resolveProxyHost, shouldUseProxyHost } from "@/auth.config";
import { Env } from "@/lib/Env";
import prisma from "@/lib/prisma";
import { lucia } from "@/lib/lucia";
import { loger } from "@/lib/console-loger";
import type { MiddlewareContext } from "@/lib/middleware-globals";
import type { Session } from "lucia";

const AUTHORIZATION_ENDPOINT = "https://oauth.yandex.ru/authorize";
const TOKEN_ENDPOINT = "https://oauth.yandex.ru/token";
const USERINFO_ENDPOINT = "https://login.yandex.ru/info?format=json";
const YANDEX_SCOPES = ["login:info", "login:email", "login:avatar"] as const;

interface YandexRawProfile {
  id?: string;
  client_id?: string;
  default_email?: string;
  emails?: string[];
  display_name?: string;
  real_name?: string;
  first_name?: string;
  is_avatar_empty?: boolean;
  default_avatar_id?: string;
}

export interface NormalizedYandexProfile {
  oauthId: string;
  email: string | null;
  name: string | null;
  image: string | null;
}

class YandexZoneError extends Error {
  constructor(message = "Yandex OAuth is only available for RU domain zone") {
    super(message);
    this.name = "YandexZoneError";
  }
}

const isRuDomain = (value: string | null | undefined): boolean => {
  if (!value) return false;
  try {
    const url = value.includes("://") ? new URL(value) : new URL(`https://${value}`);
    return url.hostname.endsWith(".ru");
  } catch {
    return value.endsWith(".ru");
  }
};

const assertRuZone = (context: MiddlewareContext) => {
  if (context.domainInfo?.zone === "ru") {
    return;
  }
  if (isRuDomain(context.referalDomain)) {
    return;
  }
  throw new YandexZoneError();
};

const resolveEffectiveProxyHost = (
  requestUrl: URL,
  context: MiddlewareContext,
): string | null => {
  const fromHelper = resolveProxyHost(requestUrl);
  if (fromHelper) {
    return fromHelper;
  }
  return context.proxyHost ?? null;
};

const resolveBaseAuthUrl = (context: MiddlewareContext, requestUrl: URL): URL => {
  const preferredBase =
    context.domainInfo?.zone === "ru"
      ? Env.NEXTAUTH_URL_RU ?? Env.NEXTAUTH_URL
      : Env.NEXTAUTH_URL;

  if (preferredBase) {
    try {
      return new URL(preferredBase);
    } catch (error) {
      console.warn("Invalid NEXTAUTH_URL value", preferredBase, error);
    }
  }

  try {
    return new URL(requestUrl.origin);
  } catch {
    return new URL("/", requestUrl);
  }
};

const buildRedirectUri = (requestUrl: URL, context: MiddlewareContext): string => {
  const base = resolveBaseAuthUrl(context, requestUrl);
  const target = new URL("/api/lucia/yandex/callback", base);
  const proxyHost = resolveEffectiveProxyHost(requestUrl, context);
  if (proxyHost && shouldUseProxyHost(requestUrl.hostname, proxyHost)) {
    target.protocol = "https:";
    target.hostname = proxyHost;
    target.port = "";
  }
  return target.toString();
};

const getYandexCredentials = () => {
  const clientId = Env.YANDEX_CLIENT_ID_RU ?? Env.YANDEX_CLIENT_ID;
  const clientSecret = Env.YANDEX_CLIENT_SECRET_RU ?? Env.YANDEX_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Yandex OAuth credentials are not configured");
  }
  return { clientId, clientSecret };
};

const createOAuthClient = (redirectUri: string): OAuth2Client => {
  const { clientId, clientSecret } = getYandexCredentials();
  return new OAuth2Client(clientId, clientSecret, redirectUri);
};

export const createYandexAuthorizationUrl = (
  requestUrl: URL,
  context: MiddlewareContext,
) => {
  assertRuZone(context);
  const redirectUri = buildRedirectUri(requestUrl, context);
  const client = createOAuthClient(redirectUri);
  const state = generateState();
  const url = client.createAuthorizationURL(AUTHORIZATION_ENDPOINT, state, [...YANDEX_SCOPES]);
  return { url, state, redirectUri };
};

export const exchangeYandexAuthorizationCode = async (
  code: string,
  requestUrl: URL,
  context: MiddlewareContext,
): Promise<{ tokens: OAuth2Tokens; profile: NormalizedYandexProfile }> => {
  assertRuZone(context);
  const redirectUri = buildRedirectUri(requestUrl, context);
  const client = createOAuthClient(redirectUri);
  const tokens = await client.validateAuthorizationCode(TOKEN_ENDPOINT, code, null);
  const accessToken = tokens.accessToken();
  const profile = await fetchYandexProfile(accessToken);
  const normalized = normalizeYandexProfile(profile);
  loger.info("Yandex OAuth exchange completed", {
    profile: normalized,
  });
  return { tokens, profile: normalized };
};

const fetchYandexProfile = async (accessToken: string): Promise<YandexRawProfile> => {
  const response = await fetch(USERINFO_ENDPOINT, {
    headers: {
      Authorization: `OAuth ${accessToken}`,
    },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch Yandex profile");
  }
  const rawProfile = (await response.json()) as YandexRawProfile;
  loger.info("Raw Yandex profile received", { profile: rawProfile });
  return rawProfile;
};

const normalizeYandexProfile = (profile: YandexRawProfile): NormalizedYandexProfile => {
  const oauthId = profile.id ?? profile.client_id;
  if (!oauthId) {
    throw new Error("Yandex profile does not include an identifier");
  }

  const email = profile.default_email ?? profile.emails?.[0] ?? null;
  const name = profile.display_name ?? profile.real_name ?? profile.first_name ?? null;
  const image =
    profile.is_avatar_empty === false && profile.default_avatar_id
      ? `https://avatars.yandex.net/get-yapic/${profile.default_avatar_id}/islands-200`
      : null;

  return {
    oauthId,
    email,
    name,
    image,
  };
};

export const upsertYandexUser = async (profile: NormalizedYandexProfile) => {
  const data = {
    email: profile.email,
    name: profile.name,
    image: profile.image,
    provider: "yandex" as const,
    oauthId: profile.oauthId,
  };

  const existing = await prisma.user.findUnique({
    where: {
      provider_oauthId: {
        provider: "yandex",
        oauthId: profile.oauthId,
      },
    },
  });

  if (existing) {
    return prisma.user.update({
      where: { id: existing.id },
      data: {
        email: profile.email,
        name: profile.name,
        image: profile.image,
      },
    });
  }

  return prisma.user.create({
    data,
  });
};

export const createLuciaSessionForUser = async (userId: string): Promise<{
  session: Session;
  sessionCookie: ReturnType<typeof lucia.createSessionCookie>;
}> => {
  const session = await lucia.createSession(userId, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  return { session, sessionCookie };
};

export { buildRedirectUri as computeYandexRedirectUri };
