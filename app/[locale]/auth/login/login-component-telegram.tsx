'use client'
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { FaTelegram } from 'react-icons/fa';
export const LoginWithTelegram = ({originHost}: {originHost: string}) => {
    const serchparams = useSearchParams()
    const [isPending, startTransition] = useTransition();
    const {data : session} = useSession()
    const [telegramLink, setTelegramLink] = useState<string | null>(null)
    const [error, setError] = useState(null)
    const t = useTranslations('signIn');

    const sendMessage = useCallback((message: {action: string; key: string; value: any}) => {
      if (window?.opener) {
        window?.opener?.postMessage(message, originHost);
      }
    }, [originHost])
    // const { isAgreed, highlightCheckbox} = useDataAgreement();


    const startLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    //   if (!isAgreed) {
    //   highlightCheckbox();
    //   return;
    // }
      e.preventDefault();
      if (!originHost) {
        sendMessage({action: 'error', key: 'originHost', value: {
          message: t('errors.originHostNotDefined')
        }})
      }
      sendMessage({action: 'startLogin', key: 'telegram', value: originHost});
    const telegramLinkResponse = await fetch(`/api/get-telegram-auth-link?origin=${originHost ?? ''}`)
        .then(res => res.json())
        if (telegramLinkResponse.success) {
        setTelegramLink(telegramLinkResponse.data)
        }

  };
  useEffect(() => {
    if( telegramLink && window?.opener) {
      sendMessage({ action: 'login', key: 'telegram', value: {
        telegramLink
      }});
    window.close();
    } else if ( error && window?.opener) {
      sendMessage({ action: 'error', key: 'telegram', value: {
        error
      }});
      window.close();
    }
    


  }, [session, telegramLink])
    return (
        <Button
          disabled={isPending}
          type="button"
          onClick={startLogin}
          variant="outline" 
          className="w-full"
        >
            <FaTelegram className="mr-2 h-5 w-5" />
            {t('signInWithTelegram')}
          </Button>

    )
}
