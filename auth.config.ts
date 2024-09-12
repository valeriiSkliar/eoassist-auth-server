import type { NextAuthConfig } from 'next-auth';
import Google from "next-auth/providers/google";
import Yandex from "next-auth/providers/yandex";
import { Env } from "./lib/Env";
import { loger } from './lib/console-loger';

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
            const origin = new URL(url)
            if( origin.searchParams.has('originHost')) return origin.toString();
            // loger.info('redirect', {url, baseUrl})
            if(url.startsWith(baseUrl)) return baseUrl;
            const baseWithOriginHost = new URL(baseUrl);
            baseWithOriginHost.searchParams.set('originHost', url)            
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
      clientId: Env.YANDEX_CLIENT_ID,
      clientSecret: Env.YANDEX_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
      checks: ['pkce'],

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
