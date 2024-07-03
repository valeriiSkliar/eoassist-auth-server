// @ts-nocheck
import type { NextAuthConfig } from 'next-auth';
import Google from "next-auth/providers/google";
import Yandex from "next-auth/providers/yandex";
import { Env } from "./lib/Env";
import { loger } from "./lib/console-loger";

export const authConfig: NextAuthConfig = {
    callbacks: {
        // async signIn({ user, account, profile, email, credentials }) {
        //   // loger.info('signIn', { user, account })
        //   // if (account?.provider === "yandex") {
        //   //   loger.info('signIn-yandex', { user, account })
        //   //   return true
        //   // }
        //   return true
        // },
        async jwt({token, user, account, profile}) {
            return token;
        },
        async session({session, token,}) {
        // loger.info('session', {  session,  token })
        return session;
        },  
        async redirect({url, baseUrl}) {
        const redirectUrl = new URL('/auth/authorization', url);
        // loger.info('redirectUrl', redirectUrl)
        return redirectUrl.toString();
        },

        async authorized({ request, auth }) {

        const { pathname } = request.nextUrl
        if (pathname === "/middleware-example") return !!auth
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
          return {
            // user: {
              oauth_id: profile.sub,
              name: profile.name,
              email: profile.email,
              image: profile.picture
            // }
          }
        }
        return profile;
      }
    }),
    Yandex({
      clientId: Env.YANDEX_CLIENT_ID,
      clientSecret: Env.YANDEX_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
      checks: ['pkce'],

      async profile (profile) {
        loger.info('profile', { profile })
        if (profile) {
          return {
            // user: {
              oauth_id: profile.id ?? profile.client_id,
              name: profile.real_name,
              email: profile.default_email,
              image: profile.is_avatar_empty ? null : `https://avatars.yandex.net/get-yapic/${profile.default_avatar_id}/islands-200`
            // }
          }
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
