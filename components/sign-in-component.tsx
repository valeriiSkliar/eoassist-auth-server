"use client";
import AuthComponents from "@/app/[locale]/auth/login/auth-components copy";
import Fonts from "@/lib/fonts/font-cache";
import { useTranslations } from "next-intl";
import { AuthModeProvider, useAuthMode } from "./provides/auth-mode-provider";

const SignInComponentInner = ({ originHost }: { originHost: string }) => {
  const { isRegister } = useAuthMode();
  const tSignIn = useTranslations("signIn");
  const tSignUp = useTranslations("signUp");

  const title = isRegister ? tSignUp("title") : tSignIn("title");
  const welcome = isRegister ? tSignUp("welcome") : tSignIn("welcome");
  const orContinueWith = isRegister
    ? tSignUp("orContinueWith")
    : tSignIn("orContinueWith");

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md space-y-8">
        <div className="space-y-4 text-center">
          <LockIcon className="mx-auto h-12 w-12 text-muted-foreground text-third" />
          <h2
            className={`text-3xl font-bold tracking-tight text-fourth ${Fonts.raleway.className}`}
          >
            {title}
          </h2>
          <p
            className={`text-muted-foreground text-fourth ${Fonts.raleway.className}`}
          >
            {welcome}
          </p>
        </div>
        <AuthComponents
          t={{
            orContinueWith,
          }}
          originHost={originHost}
        />
      </div>
    </div>
  );
};

const SignInComponent = ({
  originHost,
}: {
  originHost: string;
  translations?: any;
}) => {
  return (
    <AuthModeProvider>
      <SignInComponentInner originHost={originHost} />
    </AuthModeProvider>
  );
};

export { SignInComponent };

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
  );
}
