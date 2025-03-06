import { signInGoogleServer } from "@/actions/google-login-server-action";
import { auth } from "@/auth";
import { loger } from "@/lib/console-loger";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "./ui/button";

const SignInComponentServer = async () => {
    const referer =  headers().get('referer') ?? '';
    const session = await auth()

    loger.info('client-side', session)

    return (
        <>
            <form action={ async () => {
                "use server"
                const sessionlll = await signInGoogleServer(referer)
                loger.info('client-side after submit', session)
                if(session) {
                    redirect(sessionlll.googleRedirectUrl)
                }
            }} method="post">
                <Button type='submit' className='w-full'>Sign in with Google</Button>
            </form>
        </>
    )
}

export default SignInComponentServer