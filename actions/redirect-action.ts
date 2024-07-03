'use server'

import { permanentRedirect } from "next/navigation"

export const  redirectAction =  (url: string) => {
    permanentRedirect(url)
}