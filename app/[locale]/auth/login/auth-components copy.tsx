"use client";
import LoginFormCredintials from "@/components/loginFormCredintials";
import { AgreementCheckbox } from "@/components/provides/data-agreement-provider";
import Fonts from "@/lib/fonts/font-cache";
import React, { useEffect, useRef, useState } from "react";
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
      <LoginWithTelegram originHost={originHost} />

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
              className="bg-white p-6 rounded-lg shadow-lg max-h-[80vh] overflow-y-auto"
            >
              <div className="pb-4">
                <LoginWithGoogle
                  originHost={originHost}
                  setAuthInProgress={setAuthInProgress}
                />
              </div>
              <div className="pb-4">
                <LoginWithYandex
                  originHost={originHost}
                  setAuthInProgress={setAuthInProgress}
                />
              </div>
              <div className="pb-4">
                <LoginFormCredintials originHost={originHost} />
              </div>
              <AgreementCheckbox />
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
