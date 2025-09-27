"use client";
import LoginFormCredintials from "@/components/loginFormCredintials";
import { useDomainInfo } from "@/hooks/use-domain-info";

import Fonts from "@/lib/fonts/font-cache";
import React, { useEffect, useRef, useState } from "react";
import { usePostMessages } from "@/components/provides/postMessage-provider";
import { LoginWithGoogle } from "./login-component-google";
import { LoginWithTelegram } from "./login-component-telegram";
import { LoginWithYandex } from "./login-component-yandex";

interface AuthComponentsProps {
  originHost: string;
  t: any;
}

const AuthComponents: React.FC<AuthComponentsProps> = ({ originHost, t }) => {
  const [optionsIsOpen, setOptionsIsOpen] = useState(false);
  const [authInProgress, setAuthInProgress] = useState(false);
  const authOptionsRef = useRef<HTMLDivElement>(null);
  const { originHost: contextOriginHost } = usePostMessages();

  const effectiveOriginHost = contextOriginHost ?? originHost;

  // Демонстрация работы новой системы определения доменной зоны
  const domainInfo = useDomainInfo();

  useEffect(() => {
    const ongoingAuth = sessionStorage.getItem("ongoingAuth");
    if (ongoingAuth) {
      setAuthInProgress(true);
      setOptionsIsOpen(true);
      sessionStorage.removeItem("ongoingAuth");
    }
  }, []);

  useEffect(() => {
    if (optionsIsOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [optionsIsOpen]);

  const toggleOptions = () => {
    setOptionsIsOpen(!optionsIsOpen);
  };
  return (
    <div id="auth-options" className="space-y-6">
      {/* Индикатор зоны и доступных методов авторизации */}
      <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
        {/* <div>
          <strong>Зона:</strong> {domainInfo.zone} |<strong> Домен:</strong>{" "}
          {domainInfo.fullDomain} |<strong> Базовый:</strong>{" "}
          {domainInfo.baseDomain}
          {domainInfo.subdomain && (
            <span>
              {" "}
              | <strong>Поддомен:</strong> {domainInfo.subdomain}
            </span>
          )}
        </div> */}
        <div className="mt-1">
          <strong>Доступные методы:</strong> Telegram, Email +
          {domainInfo.zone === "com" && " Google"}
          {domainInfo.zone === "ru" && " Yandex"}
          {(domainInfo.zone === "store" || domainInfo.zone === "unknown") &&
            " Google (по умолчанию)"}
        </div>
      </div>

      <LoginWithTelegram
        domainZone={domainInfo.zone}
        originHost={effectiveOriginHost ?? ""}
      />

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

      <div className="custom-dropdown">
        <button onClick={toggleOptions} className="dropdown-toggle">
          {t.login_options}
        </button>
        {optionsIsOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex gap-4 items-center justify-center z-50">
            <div
              ref={authOptionsRef}
              className="bg-white p-6 rounded-lg shadow-lg max-h-[80vh] max-w-[80%] overflow-y-auto"
            >
              {/* Google авторизация только для зоны COM */}
              {domainInfo.zone === "com" && (
                <div className="pb-4">
                  <LoginWithGoogle
                    originHost={effectiveOriginHost ?? ""}
                    setAuthInProgress={setAuthInProgress}
                  />
                </div>
              )}

              {/* Yandex авторизация только для зоны RU */}
              {domainInfo.zone === "ru" && (
                <div className="pb-4">
                  <LoginWithYandex
                    originHost={effectiveOriginHost ?? ""}
                    setAuthInProgress={setAuthInProgress}
                  />
                </div>
              )}

              {/* Для зоны STORE или UNKNOWN показываем Google по умолчанию */}
              {(domainInfo.zone === "store" ||
                domainInfo.zone === "unknown") && (
                <div className="pb-4">
                  <LoginWithGoogle
                    originHost={effectiveOriginHost ?? ""}
                    setAuthInProgress={setAuthInProgress}
                  />
                </div>
              )}

              <div className="pb-4">
                <LoginFormCredintials originHost={effectiveOriginHost ?? ""} />
              </div>
              <button
                onClick={toggleOptions}
                className="mt-4 w-full bg-gray-200 hover:bg-gray-300 py-4 rounded"
              >
                {t.close}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthComponents;
