import SessionPovider from "@/components/auth/session-povider";
import { Env } from "@/lib/Env";
import { AppConfig } from "@/utils/AppConfig";
import type { Metadata } from "next";
import { NextIntlClientProvider, useMessages } from "next-intl";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Eoassist authentication",
  description: "This is an page for authentication on Eoassist.com",
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
        {/* Yandex Metrika */}
        {Env.NEXT_PUBLIC_YANDEX_METRIKA_ACCOUNTS_ID.map((id) => (
          <>
            <Script id={`yandex-metrika-${id}`} strategy="afterInteractive">
              {`
            (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
            (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

            ym(103284779, "init", {
                 clickmap:true,
                 trackLinks:true,
                 accurateTrackBounce:true,
                 webvisor:true
            });
          `}
            </Script>
            <noscript
              dangerouslySetInnerHTML={{
                __html: `<div><img src="https://mc.yandex.ru/watch/${id}" style="position:absolute; left:-9999px;" alt="" /></div>`,
              }}
            />
          </>
        ))}
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
