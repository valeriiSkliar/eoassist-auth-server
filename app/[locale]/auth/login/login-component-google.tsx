"use client";

import { usePostMessages } from "@/components/provides/postMessage-provider";
import { Button } from "@/components/ui/button";
import Fonts from "@/lib/fonts/font-cache";
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
  setAuthInProgress: CallableFunction;
}) => {
  const { data: session } = useSession();
  const { sendMessage, originHost: contextOriginHost } = usePostMessages();

  const t = useTranslations("signIn");
  const [isPending, startTransition] = useTransition();
  const [isPendingState, setIsPendingState] = useState(false);

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
    setIsPendingState(true);
    setAuthInProgress(true);
    sessionStorage.setItem("ongoingAuth", "yandex");
    startTransition(async () => {
      const targetOrigin =
        resolvedOriginHost ??
        (typeof window !== "undefined" ? window.location.origin : "");
      sendMessage({
        action: "startLogin",
        key: "google",
        value: targetOrigin,
      });
      const response = await signIn("google", {
        redirectTo: targetOrigin,
      });
    });
  };
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (session && window.opener && session.user?.provider === "google") {
      // Формируем redirectLink на основе originHost
      const redirectLink = resolvedOriginHost || window.location.origin;

      sendMessage({
        action: "login",
        key: "google",
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
      type="button"
      disabled={isPendingState}
      onClick={startLogin}
      variant="outline"
      className={`w-full text-fourth ${Fonts.raleway}`}
    >
      <>
        <FaGoogle className="mr-2 h-5 w-5" />
        {t("signInWithGoogle")}
      </>
    </Button>
  );
};
