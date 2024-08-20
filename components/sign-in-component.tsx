
import { LoginWithGoogle } from "@/app/auth/login/login-component-google";
import { LoginWithTelegram } from "@/app/auth/login/login-component-telegram";
import { LoginWithYandex } from "@/app/auth/login/login-component-yandex";
import Fonts from '@/lib/fonts/font-cache';
import LoginFormCredintials from "./loginFormCredintials";

export function 
SignInComponent({originHost}: {originHost: string}) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md space-y-8">
        <div className="space-y-4 text-center">
          <LockIcon className="mx-auto h-12 w-12 text-muted-foreground text-third" />
          <h2 className={`text-3xl font-bold tracking-tight text-fourth ${Fonts.raleway.className}`}>Sign in to your account</h2>
          <p className={`text-muted-foreground text-fourth ${Fonts.raleway.className}`}>Welcome back! Please enter your details to continue.</p>
        </div>
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
              <span className={`bg-background px-2 text-muted-foreground text-fourth ${Fonts.raleway.className}`}>Or continue with</span>
            </div>
          </div>
          <LoginFormCredintials originHost={originHost}/>
        </div>
      </div>
    </div>
  )
}




function LockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}
