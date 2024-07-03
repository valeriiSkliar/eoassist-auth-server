'use client'
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaYandex } from 'react-icons/fa';
export const LoginWithYandex = () => {
    const serchparams = useSearchParams()
    const router = useRouter()
    const callbackUrl = serchparams.get('callbackUrl')
    console.log(serchparams.get('callbackUrl'));
    
    return (
<Button
  onClick={ async () => {
    await signIn("yandex", { callbackUrl: callbackUrl ?? '' })
  }}
variant="outline" className="w-full">
            <FaYandex className="mr-2 h-5 w-5" />
            Sign in with Yandex
          </Button>

    )
}
