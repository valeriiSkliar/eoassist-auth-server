import { auth } from "@/auth";
import { Env } from "@/lib/Env";
import { redirect } from "next/navigation";

const NewUserPage = async ({searchParams}: {searchParams: {url?: string}}) => { 
    const session = await auth()
    const url = new URL('/api/start-session', Env.DOMAIN);

    if (session) {
    const response = await fetch(url.toString(), { method: 'POST', body: JSON.stringify({
        user: session,
        searchParams
    })}).then(res => res.json()).then(data => {

        redirect(data.url)

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