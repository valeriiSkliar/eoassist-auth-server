"use client";
import Fonts from "@/lib/fonts/font-cache";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState, type FC } from "react";
import { MdAlternateEmail } from "react-icons/md";
import {
  AgreementCheckbox,
  useDataAgreement,
} from "./provides/data-agreement-provider";
import { usePostMessages } from "./provides/postMessage-provider";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ResetPasswordDialog } from "./ui/ResetPasswordDialog";

interface LoginFormCredintialsProps {
  className?: string;
  originHost: string;
}

const LoginFormCredintials: FC<LoginFormCredintialsProps> = ({
  className,
  originHost,
}) => {
  // const [state, formAction] = useFormState<any, FormData>(credentialsFormAction, undefined);
  const {
    isLoading,
    error,
    handleSubmit,
    originHost: contextOriginHost,
    getResolvedOrigin,
  } = usePostMessages();
  const { isAgreed, highlightCheckbox } = useDataAgreement();
  const t = useTranslations("signIn");

  const formRef = useRef<HTMLFormElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Очистка полей из памяти при размонтировании компонента
  useEffect(() => {
    return () => {
      setEmail("");
      setPassword("");
    };
  }, []);

  const sanitizeCandidate = (candidate: string | null | undefined): string | null => {
    if (!candidate) {
      return null;
    }

    const normalize = (value: string): string | null => {
      try {
        return new URL(value).origin;
      } catch (error) {
        try {
          return new URL(`https://${value}`).origin;
        } catch (innerError) {
          return null;
        }
      }
    };

    const normalized = normalize(candidate);
    if (!normalized) {
      return null;
    }

    if (typeof window !== "undefined" && normalized === window.location.origin) {
      return null;
    }

    return normalized;
  };

  const resolvedOriginHost = useMemo(() => {
    const candidates: Array<string | null | undefined> = [
      getResolvedOrigin(),
      contextOriginHost,
      originHost,
    ];

    if (typeof document !== "undefined") {
      candidates.push(document.referrer);
    }

    if (typeof window !== "undefined") {
      try {
        candidates.push(sessionStorage.getItem("eoassist-parent-origin"));
      } catch (error) {
        // Ignore storage access issues
      }
    }

    for (const candidate of candidates) {
      const sanitized = sanitizeCandidate(candidate);
      if (sanitized) {
        return sanitized;
      }
    }

    return null;
  }, [getResolvedOrigin, contextOriginHost, originHost]);

  return (
    <>
      <form ref={formRef} className={`space-y-6 ${className}`}>
        <div className="space-y-2">
          <Label className={`${Fonts.roboto} text-fourth`} htmlFor="email">
            {t("email")}
          </Label>
          <Input
            disabled={isLoading}
            id="email"
            type="email"
            name="email"
            placeholder={t("emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label className={`${Fonts.roboto} text-fourth`} htmlFor="password">
            {t("password")}
          </Label>
          <Input
            disabled={isLoading}
            id="password"
            type="password"
            name="password"
            placeholder={t("passwordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <ResetPasswordDialog closeDelay={1000}>
            <Button variant="link" className="px-0">
              {t("forgotPassword")}
            </Button>
          </ResetPasswordDialog>
        </div>
        <input
          type="hidden"
          name="callbackUrl"
          value={resolvedOriginHost ?? ""}
        />

        <AgreementCheckbox />

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
          disabled={isLoading || !isAgreed || !email.trim() || !password.trim()}
          type="button"
          className="w-full bg-third"
        >
          <MdAlternateEmail className="mr-2 h-5 w-5" />
          {t("signInButton")}
        </Button>
        {error && <p className="text-destructive">{error}</p>}
      </form>
    </>
  );
};

export default LoginFormCredintials;
