"use client";

import { usePostMessages } from "@/components/provides/postMessage-provider";
import { Button } from "@/components/ui/button";
import { trackYandexGoal, AuthGoals } from "@/lib/analytics";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { FaYandex } from "react-icons/fa";

export const LoginWithYandex = ({
  originHost,
  setAuthInProgress,
}: {
  originHost: string;
  setAuthInProgress: CallableFunction;
}) => {
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

    // Отправляем событие в Яндекс.Метрику
    trackYandexGoal(AuthGoals.AUTHORIZATION, { provider: "yandex" });
    trackYandexGoal(AuthGoals.AUTHORIZATION_YANDEX);

    const targetOrigin = resolvedOriginHost ?? null;
    sendMessage({ action: "startLogin", key: "yandex", value: targetOrigin });
    try {
      const searchParams = new URLSearchParams();
      if (targetOrigin) {
        searchParams.set("originHost", targetOrigin);
      }

      const response = await fetch(
        `/api/lucia/yandex/login${searchParams.size ? `?${searchParams.toString()}` : ""}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({ error: "Request failed" }));
        const message = errorPayload?.error ?? t("errors.general");
        throw new Error(message);
      }

      const data = (await response.json()) as { authorizationUrl?: string };
      if (!data?.authorizationUrl) {
        throw new Error("Authorization URL is missing");
      }

      window.location.assign(data.authorizationUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : t("errors.general");
      sendMessage({
        action: "error",
        key: "yandex",
        value: { message },
      });
      setAuthInProgress(false);
    } finally {
      setIsPending(false);
    }
  };

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
