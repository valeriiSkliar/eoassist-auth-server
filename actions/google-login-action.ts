"use server"

import { signIn } from "@/auth"
import { loger } from "@/lib/console-loger"
import { fetchDataAuth } from "@/lib/fetch-date-auth"
import { getSubdomain } from "@/lib/helper-functions"

export async function signInGoogle(credentials: any, referer: string): Promise<any> {

    const response = await signIn("google", {
        // redirect: false,
        redirectTo: referer,
      })
      loger.info('signIn-start', response)

    try {
        const userData = await fetchDataAuth<{ auth_key: string; domain: string }>(`api/users/oauth`, 'POST', {
            oauth_id: credentials?.oauth_id,
            email: credentials?.email,
            headers: {
                Domain: getSubdomain(referer),
            }
        })
        loger.info('signInGoogle-end', userData)

        return {
            user: {
                name: credentials?.user.name,
                email: credentials?.user?.email,
                image: credentials?.user?.image,
                oauth_id: userData?.auth_key,
                domain: userData?.domain,
            },
            ok: true,
            originHost: referer,
            provider: 'google',
            success: "Successfully logged in",
        }
    } catch (error) {
        return {
            user: null,
            originHost: referer,
            provider: 'google',
            error: true,
            ok: false,
            success: false,
            errorObject: error,
            errorMessage: 'Wrong email or password',
        }
    }
}
