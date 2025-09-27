"use client";
import { usePostMessages } from "@/components/provides/postMessage-provider";
import { Button } from "@/components/ui/button";
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
  const t = useTranslations("signIn");
  const { sendMessage, originHost: contextOriginHost } = usePostMessages();

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
        return window.location.origin;
      }
    }
    return window.location.origin;
  }, [contextOriginHost, originHost]);
  // const { isAgreed, highlightCheckbox} = useDataAgreement();

  const startLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    //   if (!isAgreed) {
    //   highlightCheckbox();
    //   return;
    // }
    e.preventDefault();
    if (!resolvedOriginHost) {
      sendMessage({
        action: "error",
        key: "originHost",
        value: {
          message: t("errors.originHostNotDefined"),
        },
      });
    }
    setIsPending(true);
    try {
      sendMessage({
        action: "startLogin",
        key: "telegram",
        value: resolvedOriginHost,
      });
      const response = await fetch(
        `/api/get-telegram-auth-link?origin=${encodeURIComponent(
          resolvedOriginHost
        )}&domainZone=${domainZone}`
      );
      const telegramLinkResponse = await response.json();

      if (telegramLinkResponse.success) {
        setTelegramLink(telegramLinkResponse.data);
        setError(null);
      } else {
        setError(telegramLinkResponse.error ?? t("errors.general"));
      }
    } catch (fetchError) {
      setError(t("errors.general"));
    } finally {
      setIsPending(false);
    }
  };
  useEffect(() => {
    if (telegramLink && window?.opener) {
      sendMessage({
        action: "login",
        key: "telegram",
        value: {
          telegramLink,
        },
      });
      window.close();
    } else if (error && window?.opener) {
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
  return (
    <Button
      disabled={isPending}
      type="button"
      onClick={startLogin}
      variant="outline"
      className="w-full"
    >
      <FaTelegram className="mr-2 h-5 w-5" />
      {t("signInWithTelegram")}
    </Button>
  );
};
