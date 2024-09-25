"use client";
import { useDataAgreement } from "@/components/provides/data-agreement-provider";
import { Button } from "@/components/ui/button";
import Fonts from "@/lib/fonts/font-cache";
import { signIn, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
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
  const serchparams = useSearchParams();
  const { data: session } = useSession();
  const { isAgreed, highlightCheckbox } = useDataAgreement();
  const t = useTranslations("signIn");
  const [isPending, startTransition] = useTransition();
  const [isPendingState, setIsPendingState] = useState(false);

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
    setIsPendingState(true);
    setAuthInProgress(true);
    sessionStorage.setItem("ongoingAuth", "yandex");
    startTransition(async () => {
      sendMessage({ action: "startLogin", key: "google", value: originHost });
      const response = await signIn("google", {
        redirectTo: originHost,
      });
    });
  };
  useEffect(() => {
    if (session && window?.opener) {
      sendMessage({
        action: "login",
        key: "google",
        value: {
          ...session.user,
        },
      });
      setAuthInProgress(false);
      sessionStorage.removeItem("ongoingAuth");
      window.close();
    }
  }, [session]);

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
