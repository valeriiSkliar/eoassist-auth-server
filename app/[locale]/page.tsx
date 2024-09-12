import { AdaptiveSpiner } from "@/components/adaptive-spiner";
import DeleteCookies from "@/components/delete-cookies";
import { DataAgreementProvider } from "@/components/provides/data-agreement-provider";
import { SignInComponent } from "@/components/sign-in-component";
import { Env } from "@/lib/Env";
import { auth } from "auth";
import { getLocale, getTranslations } from "next-intl/server";
import { headers } from "next/headers";

export default async function Index({searchParams: {originHost}}: {searchParams: {originHost: string}}) {
  const session = await auth()
  const head = headers().get('host') ?? ''
  const urlStartSession = new URL('/api/start-session', Env.DOMAIN);
  const locale = await getLocale();
  const t = await getTranslations({
    locale,
    namespace: 'signIn'
  })
    //  if (session) {
    //       signOut({ redirect: false });
    //   };
  return (
    <>
      {/* <PostMessagesListener/> */}
      <AdaptiveSpiner />
      <DeleteCookies />
      <DataAgreementProvider >
        <SignInComponent translations={{
          title: t('title'),
          welcome: t('welcome'),
          orContinueWith: t('orContinueWith')
        }} originHost={originHost}/>
      </DataAgreementProvider>

    </>
  )
}
