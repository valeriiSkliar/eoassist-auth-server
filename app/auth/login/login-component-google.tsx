'use client'
import { Button } from "@/components/ui/button";
import Fonts from "@/lib/fonts/font-cache";
import { signIn, useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useTransition } from "react";
import { FaGoogle } from "react-icons/fa";

export const LoginWithGoogle = ({originHost}: {originHost: string}) => {
    const serchparams = useSearchParams()
    const [isPending, startTransition] = useTransition();

    const {data : session} = useSession()

    const sendMessage = useCallback((message: {action: string; key: string; value: any}) => {
      if (window?.opener) {
        window?.opener?.postMessage(message, originHost);
      }
    }, [originHost]);

    const startLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
       startTransition(async () => {
        sendMessage({action: 'startLogin', key: 'google', value: originHost});
        const response = await signIn("google", {
          redirectTo: originHost,
        })

    })}
    useEffect(() => {
      if(session && window?.opener) {
        sendMessage({ action: 'login', key: 'google', value: {
          ...session.user
        }});
      window.close();
      } 


    }, [session])
    
    return (
      <Button
          onClick={startLogin}
          variant="outline" 
          className={`w-full text-fourth ${Fonts.raleway}`}
        >
              <>
                <FaGoogle className="mr-2 h-5 w-5" />
                Sign in with Google
              </>
        </Button>
    )
}
