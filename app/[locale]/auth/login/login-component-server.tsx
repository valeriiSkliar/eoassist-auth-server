// 'use client'
// import { signIn } from "next-auth/react"
// import { useRouter, useSearchParams } from "next/navigation";
// @ts-nocheck
import { logInAction } from "./server-login";

const LoginComponentServer = ({ searchParams}: any) => {

    return (
<div>Login Page
        <br />
        <form action={async () => {
            "use server"
            await logInAction({
                searchParams
            },
                 searchParams.referrer
            )
        }
        }>
        <button type="submit" 
        >Google SERVER button</button>
        </form>
    </div>
    )
}

export default LoginComponentServer 