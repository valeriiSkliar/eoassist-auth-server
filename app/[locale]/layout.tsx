import SessionPovider from "@/components/auth/session-povider";
import MetricsProvider from "@/components/Metrics/MetricsProvider";
import { Env } from "@/lib/Env";
import GoogleTagManager from "@/Metrics/GoogleTagManager/GoogleTagManager";
import { AppConfig } from "@/utils/AppConfig";
import type { Metadata } from "next";
import { NextIntlClientProvider, useMessages } from "next-intl";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: Env.PAGE_TITLE,
  description: Env.PAGE_DESCRIPTION,
  robots: "noindex, nofollow",
};

export default function RootLayout(props: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const locale = props.params.locale ?? AppConfig.defaultLocale;
  const messages = useMessages();

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <GoogleTagManager gtmId={Env.GTM_ID} />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="flex flex-col justify-between w-full h-full min-h-screen">
            {/* <Header /> */}
            <main className="flex-auto w-full max-w-3xl px-4 py-4 mx-auto sm:px-6 md:py-6">
              <SessionPovider>{props.children}</SessionPovider>
            </main>
            {/* <Footer /> */}
          </div>
        </NextIntlClientProvider>

        {/* Metrics placed at the end of body for optimal performance */}
        <MetricsProvider />
      </body>
    </html>
  );
}
