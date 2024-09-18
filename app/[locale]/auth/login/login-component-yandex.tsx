'use client'
import { useDataAgreement } from "@/components/provides/data-agreement-provider";
import { Button } from "@/components/ui/button";
import { loger } from "@/lib/console-loger";
import { signIn, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useTransition } from "react";
import { FaYandex } from 'react-icons/fa';
declare module 'next-auth' {
  interface User {
    provider?: string;
    // Add other properties as needed
  }
}
export const LoginWithYandex = ({originHost}: {originHost: string}) => {
    const serchparams = useSearchParams()
    const [isPending, startTransition] = useTransition();
    const {data : session} = useSession()
  const { isAgreed, setIsAgreed, highlightCheckbox } = useDataAgreement();
    const t = useTranslations('signIn');

    const sendMessage = useCallback((message: {action: string; key: string; value: any}) => {
      if (window?.opener) {
        window?.opener?.postMessage(message, originHost);
      }
    }, [originHost])

    const startLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {

      if (!isAgreed) {
      highlightCheckbox();
      return;
    }

      e.preventDefault();
      sendMessage({action: 'startLogin', key: 'yandex', value: originHost});
      const response = await signIn("yandex", {
        redirectTo: originHost,
      })


  };
  useEffect(() => {
 

    const user = session?.user ?? {};
    if(session 
        && window?.opener) {
          loger.info('condition with yandex', session)
      sendMessage({ action: 'login', key: 'yandex', value: {
        ...session.user
      }});
    window.close();
    } 


  }, [session])
    return (
        <Button
          disabled={isPending}
          type="button"
          onClick={startLogin}
          variant="outline" 
          className="w-full"
        >
            <FaYandex className="mr-2 h-5 w-5" />
            {t('signInWithYandex')}
          </Button>

    )
}
