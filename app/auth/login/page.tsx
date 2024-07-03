import { auth } from "@/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { LoginWithGoogle } from "./login-component-google"


const LoginPage = async ({searchParams}: {searchParams: {callbackUrl?: string}}) => {
    const head = headers()
    const session = await auth()
    if(session) {
        const url = new URL('/auth/authorization',searchParams?.callbackUrl ?? '/');
        const response = await fetch("http://auth.eoassist.hu/api/start-session", { method: 'POST', body: JSON.stringify({
            user: session,
            searchParams:{
                callbackUrl: url.toString()
            }
        })}).then(res => res.json()).then(data => {
    
            redirect(data.url)
    
        })
    }
   
 
    return      <LoginWithGoogle />
}

export default LoginPage