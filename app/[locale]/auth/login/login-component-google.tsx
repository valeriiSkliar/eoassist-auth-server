"use client";

import { useAuthMode } from "@/components/provides/auth-mode-provider";
import { useDataAgreement } from "@/components/provides/data-agreement-provider";
import { usePostMessages } from "@/components/provides/postMessage-provider";
import { Button } from "@/components/ui/button";
import Fonts from "@/lib/fonts/font-cache";
import { trackYandexGoal, AuthGoals } from "@/lib/analytics";
import { signIn, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState, useTransition } from "react";
import { FaGoogle } from "react-icons/fa";
declare module "next-auth" {
  interface User {
    provider?: string;
    // Add other properties as needed
  }
}
export const LoginWithGoogle = ({
  originHost,
  setAuthInProgress,
}: {
  originHost: string;
  setAuthInProgress?: CallableFunction;
}) => {
  const { data: session } = useSession();
  const {
    sendMessage,
    originHost: contextOriginHost,
    getResolvedOrigin,
  } = usePostMessages();
  const { isAgreed, highlightCheckbox } = useDataAgreement();
  const { isRegister } = useAuthMode();

  const tSignIn = useTranslations("signIn");
  const tSignUp = useTranslations("signUp");
  const [, startTransition] = useTransition();
  const [isPendingState, setIsPendingState] = useState(false);

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

  const startLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!isAgreed) {
      highlightCheckbox();
      return;
    }
    setIsPendingState(true);
    setAuthInProgress?.(true);
    sessionStorage.setItem("ongoingAuth", "yandex");

    // Отправляем событие в Яндекс.Метрику
    trackYandexGoal(AuthGoals.AUTHORIZATION, { provider: "google" });
    trackYandexGoal(AuthGoals.AUTHORIZATION_GOOGLE);

    startTransition(async () => {
      const targetOrigin = resolvedOriginHost ?? null;
      sendMessage({
        action: "startLogin",
        key: "google",
        value: targetOrigin,
      });
      const redirectOptions = targetOrigin
        ? {
            redirectTo: targetOrigin,
          }
        : undefined;
      const response = await signIn("google", redirectOptions);
    });
  };
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (session && window.opener && session.user?.provider === "google") {
      // Формируем redirectLink на основе originHost
      const redirectLink =
        resolvedOriginHost || (typeof window !== "undefined"
          ? window.location.origin
          : undefined);

      sendMessage({
        action: "login",
        key: "google",
        value: {
          ...session.user,
          redirectLink: redirectLink, // Добавляем redirectLink для правильного редиректа
        },
      });
      setAuthInProgress?.(false);
      sessionStorage.removeItem("ongoingAuth");
      window.close();
    }
  }, [session, sendMessage, setAuthInProgress, resolvedOriginHost]);

  const buttonText = isRegister
    ? tSignUp("signUpWithGoogle")
    : tSignIn("signInWithGoogle");

  return (
    <Button
      type="button"
      disabled={isPendingState || !isAgreed}
      onClick={startLogin}
      variant="outline"
      className={`w-full text-fourth ${Fonts.raleway}`}
    >
      <FaGoogle className="mr-2 h-5 w-5" />
      {buttonText}
    </Button>
  );
};
