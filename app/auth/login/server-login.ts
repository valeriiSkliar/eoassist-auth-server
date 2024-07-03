'use server'

import { signIn } from "@/auth";

export const logInAction = async (
    credentials: {referrer?: string},
    callbackUrl: string
) => {
    // const redirect = new URL('/api/start', 'http://localhost:4000');
    // redirect.searchParams.set('referrer', credentials.referrer ?? '');
    // loger.info('redirect', redirect.toString())
    await signIn('google', { callbackUrl: credentials.referrer })
}