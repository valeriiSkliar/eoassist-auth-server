import { auth } from "@/auth";
import GetAuthKey from "@/components/auth/get-auth-key";
import { Env } from "@/lib/Env";
import { loger } from "@/lib/console-loger";
import { headers } from "next/headers";

const NewUserPage = async ({searchParams}: {searchParams: {url?: string}}) => { 
    const session = await auth()
    const head = headers()

    const url = new URL('/api/start-session', Env.DOMAIN);

    if (session) {
        loger.info('session-new-user', session)
    // const response = await fetch(url.toString(), { method: 'POST', body: JSON.stringify({
    //     user: session,
    //     searchParams
    // })}).then(res => res.json()).then(data => {

    //     redirect(data.url)

    // })
    }   
    return (
        <div className="space-y-2">
            
            {/* <section>
                <h2 className="text-xl font-bold">New User</h2>
                <p>
                NewUserPage
                </p>
                <pre>
                    {JSON.stringify(session, null, 2)}
                </pre>
            </section> */}
                <GetAuthKey />
                  {/* {
                        session ? <pre>{JSON.stringify(session, null, 2)}</pre> : <pre>{JSON.stringify(head, null, 2)}</pre>
                    } */}
        </div>
    )
}

export default NewUserPage