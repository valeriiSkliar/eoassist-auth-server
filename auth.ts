import NextAuth from "next-auth"
import "next-auth/jwt"

import { UnstorageAdapter } from "@auth/unstorage-adapter"
import type { NextAuthConfig } from "next-auth"

import { createStorage } from "unstorage"
import memoryDriver from "unstorage/drivers/memory"
import vercelKVDriver from "unstorage/drivers/vercel-kv"
import { authConfig } from "./auth.config"
import { Env } from "./lib/Env"

const storage = createStorage({
  driver: process.env.VERCEL
    ? vercelKVDriver({
        url: process.env.AUTH_KV_REST_API_URL,
        token: process.env.AUTH_KV_REST_API_TOKEN,
        env: false,
      })
    : memoryDriver(),
})

const config = {
  pages: {
    signIn: "/",
    // newUser: '/auth/new-user' 
},
  trustHost: true,
  // Define trusted hosts explicitly
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: true,
        // Динамическая установка domain на основе запроса
        // Будет переопределяться в callbacks для поддержки мультидоменов
        domain: process.env.NODE_ENV === "production" ? `.${Env.SHORT_DOMAIN}` : undefined
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: true,
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: true,
      },
    },
  },
  theme: { logo: "https://authjs.dev/img/logo-sm.png" },
  adapter: UnstorageAdapter(storage),
  basePath: "/api/auth",
  // debug: process.env.NODE_ENV !== "production" ? true : false,
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...config, 
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    authorized({ request }) {
      const { host } = request.nextUrl;
      
      // Разрешенные домены и поддомены
      const allowedDomains = [
        "localhost",
        "127.0.0.1",
        "auth.eoassist.store",
        "eoassist.store",
        ".eoassist.store",
        "auth.eoassist.com",
        "eoassist.com",
        ".eoassist.com",
        "auth.eoassist.ru",
        "eoassist.ru",
        ".eoassist.ru",
        `${Env.SHORT_DOMAIN}`
      ];
      
      // Проверяем прямое совпадение
      if (allowedDomains.includes(host)) {
        return true;
      }
      
      // Проверяем, является ли хост поддоменом разрешенных доменов
      const allowedBaseDomains = ["eoassist.store", "eoassist.com", "eoassist.ru"];
      return allowedBaseDomains.some(domain => 
        host === domain || host.endsWith(`.${domain}`)
      );
    }
  }
})

declare module "next-auth" {
  interface Session {
    accessToken?: string,
    provider: string;

  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
  }
}
