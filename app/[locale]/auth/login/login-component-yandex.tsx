"use client";
import { useDataAgreement } from "@/components/provides/data-agreement-provider";
import { Button } from "@/components/ui/button";
import { signIn, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FaYandex } from "react-icons/fa";

export const LoginWithYandex = ({
  originHost,
  setAuthInProgress,
}: {
  originHost: string;
  setAuthInProgress: CallableFunction;
}) => {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { isAgreed, highlightCheckbox } = useDataAgreement();
  const t = useTranslations("signIn");
  const [isPending, setIsPending] = useState(false);

  const sendMessage = useCallback(
    (message: { action: string; key: string; value: any }) => {
      if (window?.opener) {
        window?.opener?.postMessage(message, originHost);
      }
    },
    [originHost]
  );

  const startLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isAgreed) {
      highlightCheckbox();
      return;
    }

    e.preventDefault();
    setIsPending(true);
    setAuthInProgress(true);
    sessionStorage.setItem("ongoingAuth", "yandex");
    sendMessage({ action: "startLogin", key: "yandex", value: originHost });
    await signIn("yandex", {
      redirectTo: `${originHost}/auth/callback/yandex`,
    });
  };

  useEffect(() => {
    if (session && window?.opener) {
      sendMessage({
        action: "login",
        key: "yandex",
        value: {
          ...session.user,
        },
      });
      setAuthInProgress(false);
      sessionStorage.removeItem("ongoingAuth");
      window.close();
    }
  }, [session, sendMessage, setAuthInProgress]);

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
