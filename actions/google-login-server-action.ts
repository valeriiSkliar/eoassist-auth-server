"use server"

import { signIn } from "@/auth"
import { loger } from "@/lib/console-loger"
import { redirect } from "next/navigation"

export async function signInGoogleServer( referer: string): Promise<any> {
    loger.info('signInGoogle-start', referer)
    //  const {session} = await auth()
    const session = await signIn("google", {
        redirect: false,
        redirectTo: referer,
        // callbackUrl: referer
    })

    loger.info('signInGoogle-end', session)

    redirect(session)
    // try {
    //     const userData = await fetchDataAuth<{ auth_key: string; domain: string }>(`api/users/oauth`, 'POST', {
    //         oauth_id: credentials?.oauth_id,
    //         email: credentials?.email,
    //         headers: {
    //             Domain: getSubdomain(referer),
    //         }
    //     })
    //     loger.info('signInGoogle-end', userData)

    //     return {
    //         user: {
    //             name: credentials?.user.name,
    //             email: credentials?.user?.email,
    //             image: credentials?.user?.image,
    //             oauth_id: userData?.auth_key,
    //             domain: userData?.domain,
    //         },
    //         ok: true,
    //         originHost: referer,
    //         provider: 'google',
    //         success: "Successfully logged in",
    //     }
    // } catch (error) {
    //     loger.error('error - googleSignIn', error)
    //     return {
    //         user: null,
    //         originHost: referer,
    //         provider: 'google',
    //         error: true,
    //         ok: false,
    //         success: false,
    //         errorObject: error,
    //         errorMessage: 'Wrong email or password',
    //     }
    // }
}
