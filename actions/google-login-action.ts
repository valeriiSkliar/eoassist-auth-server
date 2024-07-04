"use server"

import { loger } from "@/lib/console-loger"
import { fetchDataAuth } from "@/lib/fetch-date-auth"
import { getSubdomain } from "@/lib/helper-functions"

export async function signInGoogle(credentials: any, referer: string) {

    try {
        const userData = await fetchDataAuth<{ auth_key: string; domain: string }>(`api/users/oauth`, 'POST', {
            oauth_id: credentials?.user?.oauth_id,
            email: credentials?.user?.email,
            headers: {
                Domain: getSubdomain(referer),
            }
        })
        
        return {
            user: {
                name: credentials?.user.name,
                email: credentials?.user?.email,
                image: credentials?.user?.image,
                oauth_id: userData?.auth_key,
                domain: userData?.domain,
            },
            ok: true,
            success: "Successfully logged in",
        }
    } catch (error) {
        loger.error('error - google', error)
        return {
            error: true,
            ok: false,
            success: false,
            errorObject: error,
            errorMessage: 'Wrong email or password',
        }
    }
}
