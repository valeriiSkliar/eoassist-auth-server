import LoginFormCredintials from '@/components/loginFormCredintials';
import Fonts from '@/lib/fonts/font-cache';
import type { FC } from 'react';
import { LoginWithGoogle } from './login-component-google';
import { LoginWithTelegram } from './login-component-telegram';
import { LoginWithYandex } from './login-component-yandex';

interface AuthComponentsProps  {
   originHost: string 
   t: string | any
}

const AuthComponents: FC<AuthComponentsProps> = ({originHost, t}) => {

  return (
       <div className="space-y-6">
          <LoginWithGoogle originHost={originHost} /> 
          {/* <SignInComponentServer />  */}

          <LoginWithYandex originHost={originHost} /> 

          <LoginWithTelegram originHost={originHost} />
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className={`bg-background px-2 text-muted-foreground text-fourth ${Fonts.raleway.className}`}>{t.orContinueWith}</span>
            </div>
          </div>
          <LoginFormCredintials originHost={originHost}/>
        </div>
  );
};

export default AuthComponents;
