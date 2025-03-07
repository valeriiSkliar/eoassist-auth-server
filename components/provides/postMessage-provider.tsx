'use client'
import { loger } from '@/lib/console-loger';
import { useSearchParams } from 'next/navigation';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';


type FormDataType = {
    // values: {
        email: string;
        password:  string;
    // },
    error: string | undefined | null;
    callbackUrl: string;
}

type MessageDataType = {action: string; key: string; value: any};
const initialState = {
    // values: {
        email: '',
        password: '',
    // },
    error: null,
    callbackUrl: ''
}
interface PostMessagesContextType {
    isLoading: boolean;
    isLogInSuccess: boolean
    originHost: string | null
    formState: FormDataType;
    error: string | null;
    close: boolean;
    setClose: (value: boolean) => void;
    setLogInSuccessHandler:(state: boolean) => void;
    sendMessage: (message: MessageDataType) => void
    setIsLoading: (value: boolean) => void;
    handleSubmit: (form: HTMLFormElement) => Promise<void>
  }

  const PostMessagesContext = createContext<PostMessagesContextType | undefined>(undefined);


  export const usePostMessages = () => {
    const context = useContext(PostMessagesContext);
    if (!context) {
      throw new Error('usePostMessages must be used within a PostMessagesProvider');
    }
    return context;
  };

  const PostMessagesProvider: React.FC<{ children: React.ReactNode }> = ({
    children
  }) => {
    const serchparams = useSearchParams()
    const [originHost, setOriginHost] = useState(serchparams.get('originHost'))
    const [formState, setFormState] = useState<FormDataType>(initialState);
    const [opener, setOpener] = useState<Window | null>(null)
    const [isLoading, setIsLoading] = useState(false);
    const [close, setClose] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLogInSuccess, setIsLogInSuccess] = useState(false);

    const setLogInSuccessHandler = (state: boolean) => {
        setIsLogInSuccess(state);
    }
 

    const sendMessageHandler = useCallback((message: MessageDataType) => {
        if (window?.opener) {
          window?.opener?.postMessage(message, originHost);
        }
      }, [originHost]);

    const credintialsFormSubminHendler = async (form: HTMLFormElement) => {
        const formData = new FormData(form);
        setFormState({
            // values: {
                email: formData.get('email')?.toString() ?? '',
                password: formData.get('password')?.toString() ?? '',
            // },
            error: null,
            callbackUrl: formData.get('callbackUrl')?.toString() ?? ''
        })
        // setError('something went wrong')
        sendMessageHandler({action: 'login', key: 'credintials', value: {
            // values: {
                email: formData.get('email')?.toString() ?? '',
                password: formData.get('password')?.toString() ?? '',
            // },
            error: null,
            callbackUrl: formData.get('callbackUrl')?.toString() ?? ''
        }})
    }
    const setIsLoadingHendler = (value: boolean) => {
        setIsLoading(value)
    } 


    const handleParentMessages = (e:MessageEvent) => {
        const {action, key, value} = e.data;
        if (action === 'start-answer') {
            setIsLoadingHendler(true)
            sendMessageHandler({action: 'show-spinner', key: 'credintials', value: null})
        }

        if (action === 'error') {
            setError(value)
        }
        if (action === 'success') {
            setError(null)
            setIsLoadingHendler(false)
            setClose(true)
        }

        if (action === 'close-window') {
            setClose(true)
        }
        
        // Handle reset password related messages from parent
        if (action === 'reset-password-response') {
            // Handle any response from parent about reset password
            if (key === 'success') {
                setError(null)
                setIsLoadingHendler(false)
            } else if (key === 'error') {
                setError(value)
            }
        }

        setTimeout(() => {
            setIsLoadingHendler(false)
        }, 3000)
    }

    useEffect(() => {
        loger.info('window?.opener',window?.opener)
        if (window?.opener) {
            setOpener(window?.opener)
        }
        if (window) {
            loger.info('set-addEventListener')
            window.addEventListener('message', handleParentMessages)
        }
        if(close) {
            window.close()
        }

        return () => window.removeEventListener(
            'message', handleParentMessages
        )
    },[originHost, close])

    return (
        <PostMessagesContext.Provider value={{
            isLoading,
            originHost,
            formState,
            error,
            isLogInSuccess,
            close,
            setClose,
            setLogInSuccessHandler,
            sendMessage: sendMessageHandler,
            setIsLoading: setIsLoadingHendler,
            handleSubmit: credintialsFormSubminHendler,
        }}>
            {children}
        </PostMessagesContext.Provider>
    )
  }

  export default PostMessagesProvider;