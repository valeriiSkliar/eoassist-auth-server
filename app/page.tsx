import { AdaptiveSpiner } from "@/components/adaptive-spiner";
import { SignInComponent } from "@/components/sign-in-component";
import { Env } from "@/lib/Env";
import { auth } from "auth";
import { headers } from "next/headers";

export default async function Index({searchParams: {originHost}}: {searchParams: {originHost: string}}) {
  const session = await auth()
  const head = headers().get('host') ?? ''
  const urlStartSession = new URL('/api/start-session', Env.DOMAIN);

  return (
    <>
      {/* <PostMessagesListener/> */}
      <AdaptiveSpiner />
      <SignInComponent originHost={originHost}/>
    </>
  )
}
