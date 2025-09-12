import type { NextAuthConfig } from 'next-auth';
import Google, { GoogleProfile } from "next-auth/providers/google";
import Yandex from "next-auth/providers/yandex";
import { detectZone } from './lib/auth/zone-detector';
import { loger } from './lib/console-loger';
import { Env } from './lib/Env';

declare module 'next-auth' {
  interface Session {
    provider: string;
  }
}

const commonGoogleSettings = {
  allowDangerousEmailAccountLinking: true,
  checks: ['pkce'] as ('pkce' | 'state' | 'none')[],
}

const googleProfile = async (profile: GoogleProfile) => {
    loger.info('google-profile', profile)
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
    };

// Функция для создания Google провайдера с динамическим определением зоны
const createGoogleProvider = () => {
  return Google({
    clientId: Env.AUTH_GOOGLE_ID, // базовые креды по умолчанию
    clientSecret: Env.AUTH_GOOGLE_SECRET,
    ...commonGoogleSettings,
    profile: googleProfile,
    async authorization(params: any) {
      // Динамически определяем зону и выбираем соответствующие креды
      const zone = await detectZone();
      const isRu = zone === 'ru';
      
      loger.info('Google authorization - detected zone:', zone, 'isRu:', isRu);
      
      // Переопределяем креды на основе зоны
      if (isRu) {
        params.client_id = Env.AUTH_GOOGLE_ID_RU;
        // client_secret будет обработан в JWT callback
      }
      
      return {
        url: "https://accounts.google.com/o/oauth2/v2/auth",
        params: {
          ...params,
          client_id: isRu ? Env.AUTH_GOOGLE_ID_RU : Env.AUTH_GOOGLE_ID,
          scope: "openid email profile",
          response_type: "code",
        }
      }
    }
  })
};

const createYandexProvider = () => {
  return Yandex({
    clientId: Env.YANDEX_CLIENT_ID, // базовые креды по умолчанию
    clientSecret: Env.YANDEX_CLIENT_SECRET,
    async authorization(params: any) {
      // Динамически определяем зону и выбираем соответствующие креды
      const zone = await detectZone();
      const isRu = zone === 'ru';
      
      loger.info('Yandex authorization - detected zone:', zone, 'isRu:', isRu);
      
      return {
        url: "https://oauth.yandex.ru/authorize",
        params: {
          ...params,
          client_id: isRu ? Env.YANDEX_CLIENT_ID_RU : Env.YANDEX_CLIENT_ID,
          response_type: "code",
        }
      }
    }
  })
};


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
                    const allowedDomains = ['eoassist.com', 'eoassist.ru', 'eoassist.store'];
                    const isAllowed = allowedDomains.some(domain => 
                        originUrl.hostname.endsWith(domain)
                    );
                    
                    if (isAllowed) {
                        // Сохраняем originHost в URL для последующего использования
                        return origin.toString();
                    }
                } catch (e) {
                    loger.info('Invalid originHost', { originHost, error: e });
                }
            }
            
            // Если URL начинается с baseUrl, используем baseUrl
            if (url.startsWith(baseUrl)) return baseUrl;
            
            // В остальных случаях добавляем originHost параметр
            const baseWithOriginHost = new URL(baseUrl);
            baseWithOriginHost.searchParams.set('originHost', url);
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
      createGoogleProvider(),
      createYandexProvider(),
    // Google({
    //     clientId: Env.AUTH_GOOGLE_ID,
    //     clientSecret: Env.AUTH_GOOGLE_SECRET,
    //     allowDangerousEmailAccountLinking: true,
    //     checks: ['pkce'],    
    //   async profile (profile) {
    //     if (profile) {
    //       return {
    //           oauth_id: profile.sub,
    //           name: profile.name,
    //           email: profile.email,
    //           image: profile.picture,
    //           ok: true,
    //           provider: 'google',
    //           success: "Successfully logged in",
    //       }
    //     }
    //     return {
    //       oauth_id: null,
    //       name: null,
    //       email: null,
    //       image: null,
    //       auth_key: null,
    //       domain:  null,
    //       ok: true,
    //       provider: 'google',
    //       success: "Failed logged in",
    //     };
    //   }
    // }),
    // Yandex({
    //   clientId: Env.YANDEX_CLIENT_ID,
    //   clientSecret: Env.YANDEX_CLIENT_SECRET,
    //   allowDangerousEmailAccountLinking: true,
    //   checks: ['pkce'],

    //   async profile (profile) {         
    //     if (profile) {

    //       return {
    //           oauth_id: profile.id ?? profile.client_id,
    //           name: profile.real_name,
    //           email: profile.default_email,
    //           image: profile.is_avatar_empty ? null : `https://avatars.yandex.net/get-yapic/${profile.default_avatar_id}/islands-200`,
    //           ok: true,
    //           provider: 'yandex',
    //           success: "Successfully logged in",
    //         }
    //     }
    //     return  {
    //       oauth_id: null,
    //       name: null,
    //       email: null,
    //       image: null,
    //       auth_key: null,
    //       domain:  null,
    //       ok: true,
    //       provider: 'yandex',
    //       success: "Failed logged in",
    //     };;
    //   },
    // }),
  ],    
};
