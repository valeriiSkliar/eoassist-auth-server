'use server'

import { signIn } from "@/auth";

export const logInAction = async (
    credentials: {referrer?: string},
    callbackUrl: string
) => {
    await signIn('google', { callbackUrl: credentials.referrer })
}