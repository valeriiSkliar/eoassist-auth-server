import { AdaptiveSpiner } from "@/components/adaptive-spiner";
import DeleteCookies from "@/components/delete-cookies";
import { DataAgreementProvider } from "@/components/provides/data-agreement-provider";
import { SignInComponent } from "@/components/sign-in-component";
import { loger } from "@/lib/console-loger";
import { Env } from "@/lib/Env";
import { AppConfig } from "@/utils/AppConfig";
import { auth } from "auth";
import { getLocale, getTranslations } from "next-intl/server";
import { headers } from "next/headers";

export default async function Index({
  searchParams: { originHost },
}: {
  searchParams: { originHost: string };
}) {
  const session = await auth();
  const head = headers().get("host") ?? "";
  const urlStartSession = new URL("/api/start-session", Env.DOMAIN);
  const locale = await getLocale();
  const t = await getTranslations({
    locale,
    namespace: "signIn",
  });

  loger.info('locales', AppConfig.locales)

  return (
    <>
      <AdaptiveSpiner />
      <DeleteCookies />
      <DataAgreementProvider>
        <SignInComponent
          translations={{
            title: t("title"),
            welcome: t("welcome"),
            orContinueWith: t("orContinueWith"),
            email_password: t("email_password"),
            login_options: t("login_options"),
            close: t("close"),
          }}
          originHost={originHost}
        />
      </DataAgreementProvider>
    </>
  );
}
