"use client";
import { AuthGoals, trackYandexGoal } from "@/lib/analytics";
import Fonts from "@/lib/fonts/font-cache";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState, type FC } from "react";
import { useAuthMode } from "./provides/auth-mode-provider";
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
  const { isRegister, toggleMode } = useAuthMode();
  const tSignIn = useTranslations("signIn");
  const tSignUp = useTranslations("signUp");

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

  const sanitizeCandidate = (
    candidate: string | null | undefined
  ): string | null => {
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

    if (
      typeof window !== "undefined" &&
      normalized === window.location.origin
    ) {
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

  const buttonText = isRegister
    ? tSignUp("signUpButton")
    : tSignIn("signInButton");

  return (
    <>
      <form ref={formRef} className={`space-y-6 ${className}`}>
        <div className="space-y-2">
          <Label className={`${Fonts.roboto} text-fourth`} htmlFor="email">
            {tSignIn("email")}
          </Label>
          <Input
            disabled={isLoading}
            id="email"
            type="email"
            name="email"
            placeholder={tSignIn("emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label className={`${Fonts.roboto} text-fourth`} htmlFor="password">
            {tSignIn("password")}
          </Label>
          <Input
            disabled={isLoading}
            id="password"
            type="password"
            name="password"
            placeholder={tSignIn("passwordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {!isRegister && (
            <ResetPasswordDialog closeDelay={1000}>
              <Button variant="link" className="px-0">
                {tSignIn("forgotPassword")}
              </Button>
            </ResetPasswordDialog>
          )}
        </div>
        <input
          type="hidden"
          name="callbackUrl"
          value={resolvedOriginHost ?? ""}
        />
        {/* Чекбокс согласия с политикой конфиденциальности */}
        <AgreementCheckbox />

        <Button
          onClick={(e) => {
            if (!isAgreed) {
              highlightCheckbox();
              return;
            }
            e.preventDefault();

            // Отправляем событие в Яндекс.Метрику
            trackYandexGoal(AuthGoals.AUTHORIZATION, { provider: "email" });
            trackYandexGoal(AuthGoals.AUTHORIZATION_EMAIL);

            if (formRef.current) {
              handleSubmit(formRef.current);
            }
          }}
          disabled={isLoading || !isAgreed || !email.trim() || !password.trim()}
          type="button"
          className="w-full bg-third"
        >
          {buttonText}
        </Button>
        {error && <p className="text-destructive">{error}</p>}

        {/* Ссылка переключения режима */}
        <div className="text-center text-sm">
          <span className="text-muted-foreground">
            {isRegister ? tSignUp("hasAccount") : tSignIn("noAccount")}{" "}
          </span>
          <button
            type="button"
            onClick={toggleMode}
            className="text-third hover:underline font-medium"
          >
            {isRegister ? tSignUp("login") : tSignIn("register")}
          </button>
        </div>
      </form>
    </>
  );
};

export default LoginFormCredintials;
