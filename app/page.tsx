import { redirectAction } from "@/actions/redirect-action";
import { SignInComponent } from "@/components/sign-in-component";
import { Env } from "@/lib/Env";
import { loger } from "@/lib/console-loger";
import { generateApiKey } from "@/lib/generate-api-key";
import { getSubdomain } from "@/middleware";
import { auth } from "auth";

export default async function Index({searchParams}: {searchParams: {redirect?: string}}) {
  const session = await auth()
  const urlStartSession = new URL('/api/start-session', Env.NEXTAUTH_URL);
  loger.info('searchParams', searchParams)
  if(session) {
    loger.info('session-main-page', session)
      const url = new URL('/auth/authorization',searchParams?.redirect ?? Env.DOMAIN);
      const response = await fetch(urlStartSession.toString(), { 
        method: 'POST', 
        headers: {
          Authorization: `Bearer ${generateApiKey()}`,
            Domain: getSubdomain(String(searchParams?.redirect))
        },
        body: JSON.stringify({
          user: session,
          searchParams:{
              callbackUrl: url.toString()
          }
      })})
      .then(res => res.json())
      .then(data => {
        redirectAction(data.url)
      })
      .catch((error) => {
        // TODO show error tost
        loger.error('error-main-page', {
          message: error.message,
          stack: error.stack
        })
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
