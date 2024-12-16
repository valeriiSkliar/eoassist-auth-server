"use client";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRef, useTransition, type FC } from "react";
import { MdAlternateEmail } from "react-icons/md";
import { useDataAgreement } from "./provides/data-agreement-provider";
import { usePostMessages } from "./provides/postMessage-provider";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { acariSans, nevermind } from "@/fonts/font-cache";

interface LoginFormCredintialsProps {
  className?: string;
  originHost: string;
}

const LoginFormCredintials: FC<LoginFormCredintialsProps> = ({
  className,
  originHost,
}) => {
  const serchparams = useSearchParams();
  const { isLoading, error, handleSubmit } = usePostMessages();
  const [isPending, startTransition] = useTransition();
  const { isAgreed, highlightCheckbox } = useDataAgreement();
  const t = useTranslations("signIn");

  const formRef = useRef<HTMLFormElement>(null);

  return (
    <>
      <form ref={formRef} className={`space-y-6 ${className}`}>
        <div className="space-y-2">
          <Label className={`${acariSans.className} text-fourth`} htmlFor="email">
            {t("email")}
          </Label>
          <Input
            disabled={isLoading}
            id="email"
            type="email"
            name="email"
            placeholder={t("emailPlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label className={`${acariSans.className} text-fourth`} htmlFor="password">
            {t("password")}
          </Label>
          <Input
            disabled={isLoading}
            id="password"
            type="password"
            name="password"
            placeholder={t("passwordPlaceholder")}
          />
        </div>
        <input type="hidden" name="callbackUrl" value={originHost} />

        <Button
          onClick={(e) => {
            if (!isAgreed) {
              highlightCheckbox();
              return;
            }
            e.preventDefault();
            if (formRef.current) {
              handleSubmit(formRef.current);
            }
          }}
          disabled={isLoading}
          type="button"
          className={`${acariSans.className} flex items-center justify-center w-full bg-third`}
        >
          <MdAlternateEmail className="mr-2 h-5 w-5" />
          {t("signInButton")}
        </Button>
        {error && (
          <p className={`${nevermind.className} text-destructive`}>{error}</p>
        )}
      </form>
    </>
  );
};

export default LoginFormCredintials;
