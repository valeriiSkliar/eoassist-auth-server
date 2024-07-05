import { SignInComponent } from "@/components/sign-in-component";
import { Env } from "@/lib/Env";
import { auth } from "auth";
import { headers } from "next/headers";

export default async function Index({searchParams: {originHost}}: {searchParams: {originHost: string}}) {
  const session = await auth()
  const head = headers().get('host') ?? ''
  // const referal = referer !== Env.NEXTAUTH_URL ? referer ?? '' : headers().get('referal-domain') ?? ''
  const urlStartSession = new URL('/api/start-session', Env.DOMAIN);

  // if(session && searchParams.originHost) {
  //   const  url = new URL('/api/authorization',searchParams.originHost);
  //   const response = fetch(url.toString(), {
  //     method: 'POST',
  //     body: JSON.stringify({
  //       email: session?.user?.email,
  //       name: session?.user?.name,
  //       id: session?.user?.id,
  //       image: session?.user?.image,
  //       domain: referal
  //     })
  //   }).then(res => res.json()).then(data => {
  //     loger.info('data', data)
  //     return data;
  //   })
  // }

  return (
    <>
      
      {/* {
        session ? <pre>{JSON.stringify(session, null, 2)}</pre> : <pre>{JSON.stringify(head, null, 2)}</pre>
      } */}
      {/* <LoginComponentClient /> */}
      {/* <pre>{JSON.stringify(headers().get('referal-domain'))}</pre> */}
      {/* <GetAuthKey host={head} referal={originHost} /> */}

      <SignInComponent originHost={originHost}/>

    </>
  )
}
