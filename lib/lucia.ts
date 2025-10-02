import { Lucia } from "lucia";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";

import { Env } from "./Env";
import prisma from "./prisma";

const adapter = new PrismaAdapter(prisma.session, prisma.user);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    name: "lucia_session",
    attributes: {
      path: "/",
      sameSite: "lax",
      secure: true,
      domain: process.env.NODE_ENV === "production" ? `.${Env.SHORT_DOMAIN}` : undefined,
    },
  },
  getUserAttributes: (attributes) => ({
    email: attributes.email,
    name: attributes.name,
    image: attributes.image,
    provider: attributes.provider,
  }),
});

type Provider = "google" | "yandex" | "telegram";

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: {
      email: string | null;
      name: string | null;
      image: string | null;
      provider: Provider;
    };
    DatabaseSessionAttributes: Record<string, never>;
  }
}
