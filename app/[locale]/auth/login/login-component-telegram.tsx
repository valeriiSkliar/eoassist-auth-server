"use client";
import { useAuthMode } from "@/components/provides/auth-mode-provider";
import { useDataAgreement } from "@/components/provides/data-agreement-provider";
import { usePostMessages } from "@/components/provides/postMessage-provider";
import { Button } from "@/components/ui/button";
import { trackYandexGoal, AuthGoals } from "@/lib/analytics";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { FaTelegram } from "react-icons/fa";
export const LoginWithTelegram = ({
  originHost,
  domainZone,
}: {
  originHost: string;
  domainZone: string;
}) => {
  const [isPending, setIsPending] = useState(false);
  const { data: session } = useSession();
  const [telegramLink, setTelegramLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const tSignIn = useTranslations("signIn");
  const tSignUp = useTranslations("signUp");
  const {
    sendMessage,
    originHost: contextOriginHost,
    getResolvedOrigin,
  } = usePostMessages();
  const { isAgreed, highlightCheckbox } = useDataAgreement();
  const { isRegister } = useAuthMode();

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
    if (!resolvedOriginHost) {
      sendMessage({
        action: "error",
        key: "originHost",
        value: {
          message: tSignIn("errors.originHostNotDefined"),
        },
      });
      return;
    }

    // Отправляем событие в Яндекс.Метрику
    trackYandexGoal(AuthGoals.AUTHORIZATION, { provider: "telegram" });
    trackYandexGoal(AuthGoals.AUTHORIZATION_TELEGRAM);

    setIsPending(true);
    try {
      const targetOrigin = resolvedOriginHost;
      sendMessage({
        action: "startLogin",
        key: "telegram",
        value: targetOrigin,
      });
      const response = await fetch(
        `/api/get-telegram-auth-link?origin=${encodeURIComponent(
          targetOrigin
        )}&domainZone=${domainZone}`
      );
      const telegramLinkResponse = await response.json();

      if (telegramLinkResponse.success) {
        setTelegramLink(telegramLinkResponse.data);
        setError(null);
      } else {
        setError(telegramLinkResponse.error ?? tSignIn("errors.general"));
      }
    } catch (fetchError) {
      setError(tSignIn("errors.general"));
    } finally {
      setIsPending(false);
    }
  };
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (telegramLink && window.opener) {
      sendMessage({
        action: "login",
        key: "telegram",
        value: {
          telegramLink,
        },
      });
      window.close();
    } else if (error && window.opener) {
      sendMessage({
        action: "error",
        key: "telegram",
        value: {
          error,
        },
      });
      window.close();
    }
  }, [session, telegramLink, error, sendMessage]);
  const buttonText = isRegister
    ? tSignUp("signUpWithTelegram")
    : tSignIn("signInWithTelegram");

  return (
    <Button
      disabled={isPending || !isAgreed}
      type="button"
      onClick={startLogin}
      variant="outline"
      className="w-full"
    >
      <FaTelegram className="mr-2 h-5 w-5" />
      {buttonText}
    </Button>
  );
};
