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
  const { sendMessage, originHost: contextOriginHost } = usePostMessages();

  const t = useTranslations("signIn");
  const [isPending, setIsPending] = useState(false);

  const resolvedOriginHost = useMemo(() => {
    if (contextOriginHost) {
      return contextOriginHost;
    }
    if (originHost) {
      return originHost;
    }
    if (typeof document !== "undefined" && document.referrer) {
      try {
        return new URL(document.referrer).origin;
      } catch (error) {
        if (typeof window !== "undefined") {
          return window.location.origin;
        }
      }
    }
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return null;
  }, [contextOriginHost, originHost]);

  const startLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsPending(true);
    setAuthInProgress(true);
    sessionStorage.setItem("ongoingAuth", "yandex");
    const targetOrigin =
      resolvedOriginHost ??
      (typeof window !== "undefined" ? window.location.origin : "");
    sendMessage({ action: "startLogin", key: "yandex", value: targetOrigin });
    try {
      await signIn("yandex", {
        redirectTo: `${targetOrigin}/auth/callback/yandex`,
      });
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
      const redirectLink = resolvedOriginHost || window.location.origin;

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
