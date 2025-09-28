"use client";

import { usePostMessages } from "@/components/provides/postMessage-provider";
import { Button } from "@/components/ui/button";
import { signIn, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { FaYandex } from "react-icons/fa";

export const LoginWithYandex = ({
  originHost,
  setAuthInProgress,
}: {
  originHost: string;
  setAuthInProgress: CallableFunction;
}) => {
  const { data: session } = useSession();
  const {
    sendMessage,
    originHost: contextOriginHost,
    getResolvedOrigin,
  } = usePostMessages();

  const t = useTranslations("signIn");
  const [isPending, setIsPending] = useState(false);

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
    setIsPending(true);
    setAuthInProgress(true);
    sessionStorage.setItem("ongoingAuth", "yandex");
    const targetOrigin = resolvedOriginHost ?? null;
    sendMessage({ action: "startLogin", key: "yandex", value: targetOrigin });
    try {
      const redirectOptions = targetOrigin
        ? {
            redirectTo: `${targetOrigin}/auth/callback/yandex`,
          }
        : undefined;
      await signIn("yandex", redirectOptions);
    } finally {
      setIsPending(false);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (session && window?.opener && session.user?.provider === "yandex") {
      // Формируем redirectLink на основе originHost
      const redirectLink =
        resolvedOriginHost || window.location.origin;

      sendMessage({
        action: "login",
        key: "yandex",
        value: {
          ...session.user,
          redirectLink: redirectLink, // Добавляем redirectLink для правильного редиректа
        },
      });
      setAuthInProgress(false);
      sessionStorage.removeItem("ongoingAuth");
      window.close();
    }
  }, [session, sendMessage, setAuthInProgress, resolvedOriginHost]);

  return (
    <Button
      disabled={isPending}
      type="button"
      onClick={startLogin}
      variant="outline"
      className="w-full"
    >
      <FaYandex className="mr-2 h-5 w-5" />
      {t("signInWithYandex")}
    </Button>
  );
};
