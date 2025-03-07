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
        domain: process.env.NODE_ENV === "production" ? `.${Env.SHORT_DOMAIN}` : undefined
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
      return [
        "localhost",
        "127.0.0.1",
        "auth.eoassist.store",
        "eoassist.store",
        ".eoassist.store",
        `${Env.SHORT_DOMAIN}`
      ].includes(host);
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
