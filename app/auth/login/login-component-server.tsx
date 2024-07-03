// 'use client'
// import { signIn } from "next-auth/react"
// import { useRouter, useSearchParams } from "next/navigation";

import { logInAction } from "./server-login";

const LoginComponentServer = ({ searchParams}) => {
    // loger.info('Credentials-LoginComponentServer', { searchParams})

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