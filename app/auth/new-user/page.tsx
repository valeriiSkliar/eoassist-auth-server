import { auth } from "@/auth";
import { Env } from "@/lib/Env";
import { loger } from "@/lib/console-loger";
import { redirect } from "next/navigation";

const NewUserPage = async ({searchParams}: {searchParams: {callbackUrl?: string}}) => { 
    const session = await auth()
    const urlStartSession = new URL('/api/start-session', Env.NEXTAUTH_URL);
    loger.info('url', searchParams)

    const url = new URL('/auth/authorization',searchParams?.callbackUrl ?? Env.DOMAIN);
    if (session) {
        loger.info('session-new-user-page', session)
        const url = new URL('/auth/authorization',searchParams?.callbackUrl ?? Env.DOMAIN);

            const response = await fetch(
                urlStartSession.toString(), 
                { 
                        method: 'POST', body: JSON.stringify({
                        user: session,
                        searchParams
                    })
                })
                    .then(res => res.json()).then(data => {

                        redirect(data.url)

                })
                    .catch((error) => {
                        loger.error('error-main-page', error)
                    })
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
        </div>
    )
}

export default NewUserPage