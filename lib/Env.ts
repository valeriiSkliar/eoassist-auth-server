import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

// Don't add NODE_ENV into T3 Env, it changes the tree-shaking behavior
export const Env = createEnv({
  server: {
    AUTH_SECRET: z.string().min(1),
    NEXTAUTH_SECRET: z.string().min(1),
    
    // Credentials for .ru zone
    AUTH_GOOGLE_ID_RU: z.string().min(1).optional(),
    AUTH_GOOGLE_SECRET_RU: z.string().min(1).optional(),
    YANDEX_CLIENT_ID_RU: z.string().min(1).optional(),
    YANDEX_CLIENT_SECRET_RU: z.string().min(1).optional(),
    
    // Credentials for .com zone (default)
    AUTH_GOOGLE_ID: z.string().min(1),
    AUTH_GOOGLE_SECRET: z.string().min(1),
    YANDEX_CLIENT_ID: z.string().min(1),
    YANDEX_CLIENT_SECRET: z.string().min(1),
    
    API_KEY: z.string().min(1),
    DOMAIN: z.string().min(1),
    NEXTAUTH_URL: z.string().min(1),
    NEXTAUTH_URL_RU: z.string().min(1).optional(),
    API_SERVER_URL: z.string().min(1),
    SHORT_DOMAIN: z.string().min(1),
    DATABASE_URL: z.string().min(1),
        // Analytics
    GA_ID: z.string().min(1).optional().default(""),
    TG_MINI_APP_ANALYTICS_TOKEN: z.string().min(1).optional().default(""),
    TG_MINI_APP_ANALYTICS_IDENTIFIER: z.string().min(1).optional().default(""),
    IS_TEST_SERVER: z.string().min(1).optional().default("false"),
  },
  client: {
    // AUTH_SECRET: z.string().min(1),
    // NEXTAUTH_SECRET: z.string().min(1),
    // AUTH_GOOGLE_ID: z.string().min(1),
    // AUTH_GOOGLE_SECRET: z.string().min(1),

    // Yandex Metrika (client-side, array of counter IDs)
    NEXT_PUBLIC_YANDEX_METRIKA_ACCOUNTS_ID: z.preprocess(
      () =>
        JSON.parse(
          process.env.NEXT_PUBLIC_YANDEX_METRIKA_ACCOUNTS_ID || "[]"
        ) as number[],
      z.array(z.number()).default([])
    ),
  },
  // You need to destructure all the keys manually
  runtimeEnv: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    
    // RU zone credentials
    AUTH_GOOGLE_ID_RU: process.env.AUTH_GOOGLE_ID_RU,
    AUTH_GOOGLE_SECRET_RU: process.env.AUTH_GOOGLE_SECRET_RU,
    YANDEX_CLIENT_ID_RU: process.env.YANDEX_CLIENT_ID_RU,
    YANDEX_CLIENT_SECRET_RU: process.env.YANDEX_CLIENT_SECRET_RU,
    
    // COM zone credentials (default)
    AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
    YANDEX_CLIENT_ID: process.env.YANDEX_CLIENT_ID,
    YANDEX_CLIENT_SECRET: process.env.YANDEX_CLIENT_SECRET,
    
    API_KEY: process.env.API_KEY,
    DOMAIN: process.env.DOMAIN,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_URL_RU: process.env.NEXTAUTH_URL_RU,
    API_SERVER_URL: process.env.API_SERVER_URL,
    SHORT_DOMAIN: process.env.SHORT_DOMAIN,
    DATABASE_URL: process.env.DATABASE_URL,
    GA_ID: process.env.GA_ID,
    NEXT_PUBLIC_YANDEX_METRIKA_ACCOUNTS_ID:
      process.env.NEXT_PUBLIC_YANDEX_METRIKA_ACCOUNTS_ID,
    TG_MINI_APP_ANALYTICS_TOKEN: process.env.TG_MINI_APP_ANALYTICS_TOKEN,
    TG_MINI_APP_ANALYTICS_IDENTIFIER:
      process.env.TG_MINI_APP_ANALYTICS_IDENTIFIER,
    IS_TEST_SERVER: process.env.IS_TEST_SERVER,
  },
});
