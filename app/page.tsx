import { SignInComponent } from "@/components/sign-in-component";
import { Env } from "@/lib/Env";
import { loger } from "@/lib/console-loger";
import { generateApiKey } from "@/lib/generate-api-key";
import { getSubdomain } from "@/middleware";
import { auth } from "auth";
import { redirect } from "next/navigation";

export default async function Index({searchParams}: {searchParams: {callbackUrl?: string}}) {
  const session = await auth()
  const urlStartSession = new URL('/api/start-session', Env.NEXTAUTH_URL);

  if(session) {
    loger.info('session-main-page', session)
      const url = new URL('/auth/authorization',searchParams?.callbackUrl ?? '/');
      const response = await fetch(urlStartSession.toString(), { 
        method: 'POST', 
        headers: {
          Authorization: `Bearer ${generateApiKey()}`,
            Domain: getSubdomain(String(searchParams?.callbackUrl))
        },
        body: JSON.stringify({
          user: session,
          searchParams:{
              callbackUrl: url.toString()
          }
      })}).then(res => res.json()).then(data => {
          redirect(data.url)
  
      })
      .catch((error) => {
        loger.error('error-main-page', error)
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
