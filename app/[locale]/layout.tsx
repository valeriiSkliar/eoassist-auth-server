import SessionPovider from "@/components/auth/session-povider";
import { AppConfig } from "@/utils/AppConfig";
import type { Metadata } from "next";
import { NextIntlClientProvider, useMessages } from "next-intl";
import "./globals.css";
import { acariSans, nevermind } from '@/fonts/font-cache';

export const metadata: Metadata = {
  title: "LiviAssist authentication",
  description: "This is an page for authentication on LiviAssist.com",
  robots: "noindex, nofollow"
};

export default function RootLayout(props: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const locale = props.params.locale ?? AppConfig.defaultLocale;
  const messages = useMessages();

  return (
    <html className={`${acariSans.variable} ${nevermind.variable} font-sans`}
    lang={locale}>
      <body className={acariSans.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="flex flex-col justify-between w-full h-full min-h-screen">
            {/* <Header /> */}
            <main className="flex-auto w-full max-w-3xl px-4 py-4 mx-auto sm:px-6 md:py-6">
              <SessionPovider>{props.children}</SessionPovider>
            </main>
            {/* <Footer /> */}
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
