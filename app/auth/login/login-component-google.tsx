'use client'
import { signInGoogle } from "@/actions/google-login-action";
import { Button } from "@/components/ui/button";
import { loger } from "@/lib/console-loger";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaGoogle } from "react-icons/fa";

export const LoginWithGoogle = () => {
    const serchparams = useSearchParams()
    const router = useRouter()
    const [refeterLink, setRefeterLink] = useState('')
    const callbackUrl = serchparams.get('otimizer')
    const {data : session} = useSession()

    const getAuthKeyForBackend = async (session: any, referer: string) => {
      const response = await signInGoogle(session, referer);
      return response
    };

    const sendMessage = (message: any) => {
      if (window.opener) {
        const targetOrigin = sessionStorage.getItem('referer');
        window.opener.postMessage(message, targetOrigin);
      }
    }

    useEffect(() => {
      if(session && window?.opener?.postMessage) {
        const referer = sessionStorage.getItem('referer');
        setRefeterLink(referer ?? '');
        getAuthKeyForBackend(session, referer ?? '').then((data) => {
          loger.info('data', data)
          return data;
        })
        .then((data) => {
          if(window?.opener?.postMessage) {

          if(data.ok) {
            window?.opener?.postMessage({action: 'login', key: 'userData', value: {...data.user}}, referer);
            window?.opener?.postMessage({action: 'close', key: 'message', value: data?.success}, referer);
            sessionStorage.clear();
          }
          }
        })
        .catch((error) => {
          loger.error(error);
        })
        .finally(() => {
          window.close();
        })
  
      }
    }, [session])
    
    return (
      <Button
          onClick={ async () => {
            if(window.opener && window?.opener?.postMessage && refeterLink) {
              window?.opener?.postMessage({action: 'start login'}, refeterLink);
            }
            await signIn("google", { callbackUrl: callbackUrl ?? '' })
            sendMessage({action: 'startLogin', key: 'google', value: refeterLink});
          }}
            variant="outline" className="w-full">
         <FaGoogle className="mr-2 h-5 w-5" />
            Sign in with Google
        </Button>

    )
}
