'use client'
import { useDataAgreement } from "@/components/provides/data-agreement-provider";
import { Button } from "@/components/ui/button";
import Fonts from "@/lib/fonts/font-cache";
import { signIn, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useTransition } from "react";
import { FaGoogle } from "react-icons/fa";
declare module 'next-auth' {
  interface User {
    provider?: string;
    // Add other properties as needed
  }
}
export const LoginWithGoogle = ({originHost}: {originHost: string}) => {
    const serchparams = useSearchParams()
    const [isPending, startTransition] = useTransition();
      const { isAgreed } = useDataAgreement();
      const t = useTranslations('signIn');


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
      if(session 
        // && session?.user?.provider == 'google' 
        && window?.opener) {
        sendMessage({ action: 'login', key: 'google', value: {
          ...session.user
        }});
      window.close();
      } 


    }, [session])
    
    return (
      <Button
          type="button"
          disabled={!isAgreed}
          onClick={startLogin}
          variant="outline" 
          className={`w-full text-fourth ${Fonts.raleway}`}
        >
              <>
                <FaGoogle className="mr-2 h-5 w-5" />
                {t('signInWithGoogle')}
              </>
        </Button>
    )
}
