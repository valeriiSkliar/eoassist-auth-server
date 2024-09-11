import { auth } from "@/auth"
import { Env } from "@/lib/Env"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { LoginWithGoogle } from "./login-component-google"


const LoginPage = async ({searchParams}: {searchParams: {callbackUrl?: string}}) => {
    const head = headers()
    const session = await auth()
    const url = new URL('/api/start-session', Env.DOMAIN);

    if(session) {
        const url = new URL('/auth/authorization',searchParams?.callbackUrl ?? Env.DOMAIN);
        const response = await fetch(url.toString(), { method: 'POST', body: JSON.stringify({
            user: session,
            searchParams:{
                callbackUrl: url.toString()
            }
        })}).then(res => res.json()).then(data => {
    
            redirect(data.url)
    
        })
    }
   
 
    return      <LoginWithGoogle originHost={'head.get()'}/>
}

export default LoginPage