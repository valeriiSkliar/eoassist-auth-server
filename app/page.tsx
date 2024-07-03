import { SignInComponent } from "@/components/sign-in-component";
import { Env } from "@/lib/Env";
import { loger } from "@/lib/console-loger";
import { auth } from "auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Index({searchParams}: {searchParams: {callbackUrl?: string}}) {
  const session = await auth()
  const head = headers()
  const urlStartSession = new URL('/api/start-session', Env.DOMAIN);
  loger.info('urlStartSession', urlStartSession)

  if(session) {
    loger.info('session-main-page', session)
      const url = new URL('/auth/authorization',searchParams?.callbackUrl ?? '/');
      const response = await fetch(urlStartSession.toString(), { method: 'POST', body: JSON.stringify({
          user: session,
          searchParams:{
              callbackUrl: url.toString()
          }
      })}).then(res => res.json()).then(data => {
          redirect(data.url)
  
      })
  }
  return (
    <>
      {/* <pre>{JSON.stringify(session, null, 2)}</pre> */}
      {/* <LoginComponentClient /> */}
      <SignInComponent/>

    </>
  )
}
