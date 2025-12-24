"use client";
import LoginFormCredintials from "@/components/loginFormCredintials";
import { useDomainInfo } from "@/hooks/use-domain-info";

import { usePostMessages } from "@/components/provides/postMessage-provider";
import Fonts from "@/lib/fonts/font-cache";
import React from "react";
import { LoginWithGoogle } from "./login-component-google";
import { LoginWithTelegram } from "./login-component-telegram";
import { LoginWithYandex } from "./login-component-yandex";

interface AuthComponentsProps {
  originHost: string;
  t: any;
}

const AuthComponents: React.FC<AuthComponentsProps> = ({ originHost, t }) => {
  const {
    originHost: contextOriginHost,
    lastLogin,
    resetLastLogin,
  } = usePostMessages();

  const effectiveOriginHost = contextOriginHost ?? originHost;

  // Определение доменной зоны для показа соответствующих методов авторизации
  const domainInfo = useDomainInfo();

  return (
    <div id="auth-options" className="space-y-6">
      {lastLogin && lastLogin.provider === "yandex" && (
        <div className="rounded-md border border-green-500 bg-green-50 p-3 text-sm text-green-900 flex items-center justify-between">
          <span>
            ✅ Yandex login succeeded
            {lastLogin.payload?.user?.email
              ? ` (${lastLogin.payload.user.email})`
              : ""}
          </span>
          <button
            type="button"
            onClick={resetLastLogin}
            className="ml-4 text-green-900 underline"
          >
            Скрыть
          </button>
        </div>
      )}

      {/* Telegram авторизация */}
      <LoginWithTelegram
        domainZone={domainInfo.zone}
        originHost={effectiveOriginHost ?? ""}
      />

      {/* Google авторизация для зоны COM, STORE или UNKNOWN */}
      {(domainInfo.zone === "com" ||
        domainInfo.zone === "store" ||
        domainInfo.zone === "unknown") && (
        <LoginWithGoogle originHost={effectiveOriginHost ?? ""} />
      )}

      {/* Yandex авторизация для зоны RU */}
      {domainInfo.zone === "ru" && (
        <LoginWithYandex originHost={effectiveOriginHost ?? ""} />
      )}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span
            className={`bg-background px-2 text-muted-foreground text-fourth ${Fonts.raleway.className}`}
          >
            {t.orContinueWith}
          </span>
        </div>
      </div>

      {/* Форма email/пароль */}
      <LoginFormCredintials originHost={effectiveOriginHost ?? ""} />
    </div>
  );
};

export default AuthComponents;
