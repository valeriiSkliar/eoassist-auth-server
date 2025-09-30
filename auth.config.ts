import type { NextAuthConfig } from 'next-auth';
import Google from "next-auth/providers/google";
import Yandex from "next-auth/providers/yandex";
import { Env } from "./lib/Env";
import { loger } from './lib/console-loger';

const AUTH_BASE_PATH = '/api/auth';

const yandexRedirectProxyUrl = (() => {
  const ensureBasePath = (url: string) => {
    const normalized = url.replace(/\/$/, '');
    return normalized.endsWith(AUTH_BASE_PATH)
      ? normalized
      : `${normalized}${AUTH_BASE_PATH}`;
  };

  if (Env.NEXTAUTH_URL_RU) {
    return ensureBasePath(Env.NEXTAUTH_URL_RU);
  }

  const mappings: Array<[string, string]> = [
    ['nutrioassist.com', 'nutrioassist.ru'],
    ['eoassist.com', 'eoassist.ru'],
  ];

  for (const [from, to] of mappings) {
    if (Env.NEXTAUTH_URL.includes(from)) {
      return ensureBasePath(Env.NEXTAUTH_URL.replace(from, to));
    }
  }

  return undefined;
})();

const ALLOWED_BASE_DOMAINS = ['eoassist.com', 'eoassist.ru', 'eoassist.store', 'nutroassist.com', 'nutroassist.ru'];

const DOMAIN_MAPPINGS = [
  { source: 'nutrioassist.com', target: 'nutrioassist.ru' },
  { source: 'eoassist.com', target: 'eoassist.ru' },
];

const sanitizeHost = (value: string | null | undefined): string | null => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim().toLowerCase();
  if (!trimmed) {
    return null;
  }

  const sanitized = trimmed.replace(/[^a-z0-9.-]/g, '');
  if (!sanitized) {
    return null;
  }

  return sanitized;
};

const isAllowedDomain = (host: string | null | undefined): host is string => {
  const sanitizedHost = sanitizeHost(host);
  if (!sanitizedHost) {
    return false;
  }

  return ALLOWED_BASE_DOMAINS.some(domain => sanitizedHost === domain || sanitizedHost.endsWith(`.${domain}`));
};

const resolveProxyHost = (origin: URL): string | null => {
  const hostFromSearch = sanitizeHost(origin.searchParams.get('ruProxyHost'));
  if (hostFromSearch && isAllowedDomain(hostFromSearch)) {
    return hostFromSearch;
  }

  const globalHost = sanitizeHost((globalThis as any)?.__NEXT_PRIVATE_PROXY_HOST as string | undefined);
  if (globalHost && isAllowedDomain(globalHost)) {
    return globalHost;
  }

  return null;
};

const shouldUseProxyHost = (currentHost: string, proxyHost: string): boolean => {
  if (currentHost === proxyHost) {
    return false;
  }

  if (!isAllowedDomain(proxyHost)) {
    return false;
  }

  return DOMAIN_MAPPINGS.some(({ source, target }) =>
    currentHost.endsWith(source) && proxyHost.endsWith(target)
  );
};

declare module 'next-auth' {
  interface Session {
    provider: string;
  }
}

export const authConfig: NextAuthConfig = {
    callbacks: {
        // async signIn({ user, account, profile, email, credentials }) {
        //   return true
        // },

        async redirect({ url, baseUrl }) {
            const origin = new URL(url);
            
            // Если есть originHost параметр, сохраняем его
            if (origin.searchParams.has('originHost')) {
                const originHost = origin.searchParams.get('originHost')!;

                // Проверяем, что originHost - это валидный домен из разрешенных
                try {
                    const originUrl = new URL(originHost.startsWith('http') ? originHost : `https://${originHost}`);
                    if (isAllowedDomain(originUrl.hostname)) {
                        return originUrl.toString();
                    }
                } catch (e) {
                    loger.info('Invalid originHost', { originHost, error: e });
                }
            }
            
            const proxyHost = resolveProxyHost(origin);

            // Если URL начинается с baseUrl, используем baseUrl (с учетом ruProxyHost)
            if (url.startsWith(baseUrl)) {
                try {
                    const normalizedUrl = new URL(baseUrl);
                    if (proxyHost && shouldUseProxyHost(normalizedUrl.hostname, proxyHost)) {
                        normalizedUrl.hostname = proxyHost;
                        normalizedUrl.protocol = 'https:';
                        normalizedUrl.port = '';
                        return normalizedUrl.toString();
                    }
                    return baseUrl;
                } catch (error) {
                    loger.error('Failed to normalize baseUrl for redirect', { baseUrl, proxyHost, error });
                    return baseUrl;
                }
            }
            
            // В остальных случаях добавляем originHost параметр
            const baseWithOriginHost = new URL(baseUrl);
            baseWithOriginHost.searchParams.set('originHost', url);
            if (proxyHost) {
                baseWithOriginHost.searchParams.set('ruProxyHost', proxyHost);
            }
            return baseWithOriginHost.toString();
        },
        async session({ session, user, token }) {
            const exparedAt = new Date(Date.now() + 10000);
          //   loger.info('exparedAt', exparedAt)
          //   loger.info('session-callback', {
          //   session, user, token
          // })
          return {
            ...session,
          }
        },
        async jwt({ token, user, account, profile }) {
          loger.info('jwt-callback', { token, user, account, profile })
          return {
            ...token,
          }
        }
    },
    session: {
        // strategy: "jwt",
        maxAge: 10,
    },
    experimental: {
        enableWebAuthn: true,
    },
    providers: [
    Google({
        clientId: Env.AUTH_GOOGLE_ID,
        clientSecret: Env.AUTH_GOOGLE_SECRET,
        allowDangerousEmailAccountLinking: true,
        checks: ['pkce'],    
      async profile (profile) {
        if (profile) {
          return {
              oauth_id: profile.sub,
              name: profile.name,
              email: profile.email,
              image: profile.picture,
              ok: true,
              provider: 'google',
              success: "Successfully logged in",
          }
        }
        return {
          oauth_id: null,
          name: null,
          email: null,
          image: null,
          auth_key: null,
          domain:  null,
          ok: true,
          provider: 'google',
          success: "Failed logged in",
        };
      }
    }),
    Yandex({
      clientId: Env.YANDEX_CLIENT_ID_RU ?? Env.YANDEX_CLIENT_ID,
      clientSecret: Env.YANDEX_CLIENT_SECRET_RU ?? Env.YANDEX_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
      checks: ['pkce'],
      redirectProxyUrl: yandexRedirectProxyUrl,

      async profile (profile) {         
        if (profile) {

          return {
              oauth_id: profile.id ?? profile.client_id,
              name: profile.real_name,
              email: profile.default_email,
              image: profile.is_avatar_empty ? null : `https://avatars.yandex.net/get-yapic/${profile.default_avatar_id}/islands-200`,
              ok: true,
              provider: 'yandex',
              success: "Successfully logged in",
            }
        }
        return  {
          oauth_id: null,
          name: null,
          email: null,
          image: null,
          auth_key: null,
          domain:  null,
          ok: true,
          provider: 'yandex',
          success: "Failed logged in",
        };;
      },
    }),

    // ...add more providers here
    // Credentials({
    //     name: 'EmailPassword',
    //     credentials: {
    //       username: { label: 'Username', type: 'text' },
    //       password: { label: 'Password', type: 'password' },
    //     },
    //     // authorize: async (credentials) => {
    //     //   const { username, password } = credentials
    //     //   if (username === 'admin' && password === 'admin') {
    //     //     return {
    //     //       id: 1,
    //     //       name: 'admin',
    //     //       email: 'admin',
    //     //     }
    //     //   }
    //     //   return null
    //     // },
    //   }),
   
  ],    
};
