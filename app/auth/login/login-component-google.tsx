'use client'
import { signInGoogle } from "@/actions/google-login-action";
import { Button } from "@/components/ui/button";
import { loger } from "@/lib/console-loger";
import { signIn, useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { FaGoogle } from "react-icons/fa";

export const LoginWithGoogle = () => {
    const serchparams = useSearchParams()
    const [refeterLink, setRefeterLink] = useState('')
    const [isPending, startTransition] = useTransition();
    const referer = useMemo(() => sessionStorage.getItem('referer'), []);

    const callbackUrl = serchparams.get('otimizer')
    const {data : session} = useSession()


    // const sendMessage = (message: any) => {
    //   if (window.opener) {
    //     // const targetOrigin = sessionStorage.getItem('referer');
    //     window.opener.postMessage(message, referer);
    //   }
    // }

    const sendMessage = useCallback((message: {action: string; key: string; value: any}) => {
      if (window?.opener) {
        window?.opener?.postMessage(message, referer);
      }
    }, [referer]);

    const startLogin = async () => {
      await signIn("google", { callbackUrl: callbackUrl ?? '' })
      // if(window.opener && window?.opener?.postMessage && refeterLink) {
        // const referer = sessionStorage.getItem('referer');
        sendMessage({action: 'startLogin', key: 'google', value: referer});
      // }
    };
    useEffect(() => {
      const getAuthKeyForBackend = async (session: any, referer: string) => {
        const response = await signInGoogle(session, referer);
        return response
      };
      if(session && window?.opener) {
        // const referer = sessionStorage.getItem('referer');
        setRefeterLink(referer ?? '');
        startTransition( async () => {
          try {
            const data = await getAuthKeyForBackend(session, referer ?? '');
          loger.info('getAuthKeyForBackend-data', data)
          if (data.ok) {
            sendMessage({ action: 'login', key: 'userData', value: { ...data.user } });
            sendMessage({ action: 'close', key: 'message', value: data?.success });
            sessionStorage.clear();
          }
          } catch (error) {
            loger.error('error',error);

          } finally {
            window.close();
          }
        })
        // getAuthKeyForBackend(session, referer ?? '').then((data) => {
        //   loger.info('data', data)
        //   return data;
        // })
        // .then((data) => {
        //   if(window?.opener?.postMessage) {

        //   if(data.ok) {
        //     window?.opener?.postMessage({action: 'login', key: 'userData', value: {...data.user}}, referer);
        //     window?.opener?.postMessage({action: 'close', key: 'message', value: data?.success}, referer);
        //     sessionStorage.clear();
        //   }
        //   }
        // })
        // .catch((error) => {
        //   loger.error(error);
        // })
        // .finally(() => {
        //   window.close();
        // })
  
      }
    }, [session])
    
    return (
      <Button
          onClick={startLogin}
          disabled={isPending}
          variant="outline" 
          className="w-full"
        >
            {isPending ? 'Loading...' : (
              <>
                <FaGoogle className="mr-2 h-5 w-5" />
                Sign in with Google
              </>
            )}
        </Button>
    )
}
