'use client'
import { Button } from "@/components/ui/button";
import { signIn, useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useTransition } from "react";
import { FaYandex } from 'react-icons/fa';
export const LoginWithYandex = ({originHost}: {originHost: string}) => {
    const serchparams = useSearchParams()
    const [isPending, startTransition] = useTransition();
    const {data : session} = useSession()

    const sendMessage = useCallback((message: {action: string; key: string; value: any}) => {
      if (window?.opener) {
        window?.opener?.postMessage(message, originHost);
      }
    }, [originHost])

    const startLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      sendMessage({action: 'startLogin', key: 'yandex', value: originHost});
      const response = await signIn("yandex", {
        redirectTo: originHost,
      })

  };
  useEffect(() => {
    if(session && window?.opener) {
      sendMessage({ action: 'login', key: 'yandex', value: {
        ...session.user
      }});
    window.close();
    } 


  }, [session])
    return (
        <Button
          onClick={startLogin}
          variant="outline" 
          className="w-full"
        >
            <FaYandex className="mr-2 h-5 w-5" />
            Sign in with Yandex
          </Button>

    )
}
