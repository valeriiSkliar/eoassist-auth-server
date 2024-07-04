import GetAuthKey from "@/components/auth/get-auth-key";
import { SignInComponent } from "@/components/sign-in-component";
import { Env } from "@/lib/Env";
import { loger } from "@/lib/console-loger";
import { auth } from "auth";
import { headers } from "next/headers";

export default async function Index({searchParams}: {searchParams: {callbackUrl?: string}}) {
  const session = await auth()
  const head = headers().get('host') ?? ''
  const referer = headers().get('referer') ?? ''
  const referal = referer !== Env.NEXTAUTH_URL ? referer ?? '' : headers().get('referal-domain') ?? ''
  const urlStartSession = new URL('/api/start-session', Env.DOMAIN);
  loger.info('referal', referal)
  loger.info('referal - headers', headers().get('referal-domain'))

  if(session) {
    loger.info('session-main-page', session)
      // const url = new URL('/auth/authorization',searchParams?.callbackUrl ?? '/');
      // const response = await fetch(urlStartSession.toString(), { method: 'POST', body: JSON.stringify({
      //     user: session,
      //     searchParams:{
      //         callbackUrl: url.toString()
      //     }
      // })}).then(res => res.json()).then(data => {
      //     redirect(data.url)
  
      // })
  }
  return (
    <>
      
      {/* {
        session ? <pre>{JSON.stringify(session, null, 2)}</pre> : <pre>{JSON.stringify(head, null, 2)}</pre>
      } */}
      {/* <LoginComponentClient /> */}
      <GetAuthKey host={head} referal={referer} />

      <SignInComponent/>

    </>
  )
}
