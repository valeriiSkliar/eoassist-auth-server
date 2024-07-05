import type { NextAuthConfig } from 'next-auth';
import Google from "next-auth/providers/google";
import Yandex from "next-auth/providers/yandex";
import { headers } from 'next/headers';
import { signInGoogle } from './actions/google-login-action';
import { Env } from "./lib/Env";
import { loger } from "./lib/console-loger";

export const authConfig: NextAuthConfig = {
    callbacks: {
        async signIn({ user, account, profile, email, credentials }) {

            // loger.info('signIn', {user, account, profile, email, credentials})
          return true
        },
        async redirect({ url, baseUrl }) {
            const origin = new URL(url)
            if( origin.searchParams.has('originHost')) return origin.toString();
            loger.info('redirect', {url, baseUrl})
            if(url.startsWith(baseUrl)) return baseUrl;
            const baseWithOriginHost = new URL(baseUrl);
            baseWithOriginHost.searchParams.set('originHost', url)            
            return baseWithOriginHost.toString();
        },
        async jwt({token, user, account, profile}) {
            return token;
        },
        async session({session, token,}) {
        return session;
        }, 
        async authorized({ request, auth }) {
          loger.info('authorized', {auth})

        // const { pathname } = request.nextUrl
        // if (pathname === "/middleware-example") return !!auth
        return true
        },
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
        //   const userData = await fetchDataAuth<{ auth_key: string; domain: string }>(`api/users/oauth`, 'POST', {
        //     oauth_id: profile?.sub,
        //     email: profile?.email,
        //     headers: {
        //         Domain: getSubdomain(refererCookie),
        //     }
        // })
          return {
              oauth_id: profile.sub,
              name: profile.name,
              email: profile.email,
              image: profile.picture,
              // auth_key: userData?.auth_key,
              // domain: userData?.domain,
              ok: false,
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
      clientId: Env.YANDEX_CLIENT_ID,
      clientSecret: Env.YANDEX_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
      checks: ['pkce'],

      async profile (profile) {
        const referer = headers().get('referer')?.toString() ?? ''
         
        if (profile) {
        loger.info('profile-referer', referer)
        loger.info('profile', profile)


          const userData = await signInGoogle(
            {
              oauth_id: profile.id ?? profile.client_id,
              email: profile.default_email,
            },
             referer
            );
          return {
              oauth_id: profile.id ?? profile.client_id,
              name: profile.real_name,
              email: profile.default_email,
              image: profile.is_avatar_empty ? null : `https://avatars.yandex.net/get-yapic/${profile.default_avatar_id}/islands-200`,
              auth_key: userData?.auth_key, 
              domain: userData?.domain,}
        }
        return profile;
      },
    }),
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
    // Google({
    //     clientId: Env.AUTH_GOOGLE_ID,
    //     clientSecret: Env.AUTH_GOOGLE_SECRET,
    //     allowDangerousEmailAccountLinking: true,
    //     checks: ['pkce'],    
    //   async profile (profile) {
    //     if (profile) {
    //       return {
    //         // user: {
    //           oauth_id: profile.sub,
    //           name: profile.name,
    //           email: profile.email,
    //           image: profile.picture
    //         // }
    //       }
    //     }
    //     return profile;
    //   }
    // }),
    // YandexProvider({
    //   clientId: process.env.YANDEX_CLIENT_sID ?? '',
    //   clientSecret: process.env.YANDEX_CLIENT_SECRET ?? '',
    //   allowDangerousEmailAccountLinking: true,
    //   checks: ['pkce'],
    //   async profile(profile) {
    //     // loger.info('yandex-profile', profile);
    //     return { profile };
    //   },
    // }),
    // Credentials({
    //   name: 'Credentials',
    //   async authorize(
    //     credentials,
    //     // request,
    //   ): Promise<
    //     (User & { auth_key: string; Authorization: string; id: never }) | null
    //   > {
    //     const user = await fetchDataAuth<AdapterUser>(
    //       `api/users/auth`,
    //       'POST',
    //       {
    //         email: credentials.email,
    //         password: credentials.password,
    //       },
    //     );
    //     loger.info('Credentials-user', user);
    //     if (user) {
    //       return {
    //         id: user.auth_key,
    //         name: user.fio ?? user.email ?? 'no-info',
    //         auth_key: user.auth_key,
    //         domain: user.domain,
    //       };
    //     }

    //     return null;
    //   },
    // }),
    // Credentials({
    //   id: 'telegram',
    //   name: 'telegram',
    //   credentials: {
    //     authKey: {
    //       name: 'authKey',
    //       label: 'authKey',
    //       type: 'text',
    //     },
    //   },
    //   async authorize(
    //     credentials,
    //     // request,
    //   ): Promise<
    //     (User & { auth_key: string; Authorization: string; id: never }) | null
    //   > {
    //     return {
    //       id: 11111,
    //       name: 'test_user',
    //       email: 'test_user@test_user.com',
    //       image: null,
    //       auth_key: credentials.authKey,
    //     };
    //   },
    // }),
  ],    
//   basePath: '/',
};
