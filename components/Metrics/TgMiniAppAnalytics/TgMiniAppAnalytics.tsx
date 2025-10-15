"use client";

import WebApp from "@twa-dev/sdk";
import Script from "next/script";
import { useEffect } from "react";

interface TgMiniAppAnalyticsProps {
  token?: string;
  identifier?: string;
}

declare global {
  interface Window {
    telegramAnalytics: {
      init: (config: { token: string; appName: string; env?: string }) => void;
    };
  }
}

export default function TgMiniAppAnalytics({
  token,
  identifier,
}: TgMiniAppAnalyticsProps) {
  const initAnalytics = () => {
    if (!token || !identifier) {
      console.log(
        "%ctg-mini-app-analytics%cSkipped (missing token/identifier)",
        `background-color: #229ED9; color: #fff; padding: 2px 0 2px 2px;`,
        "background-color: yellow; color: #000; padding: 2px"
      );
      return;
    }

    try {
      if (
        typeof window !== "undefined" &&
        window.telegramAnalytics &&
        WebApp.initData
      ) {
        window.telegramAnalytics.init({
          token,
          appName: identifier,
        });
        console.log(
          "%ctg-mini-app-analytics%cInitialized",
          `background-color: #229ED9; color: #fff; padding: 2px 0 2px 2px;`,
          "background-color: green; color: #fff; padding: 2px"
        );
      } else {
        console.log(
          "%ctg-mini-app-analytics%cSkipped (telegramAnalytics not available)",
          `background-color: #229ED9; color: #fff; padding: 2px 0 2px 2px;`,
          "background-color: orange; color: #fff; padding: 2px"
        );
      }
    } catch (error) {
      console.error("Error initializing Telegram analytics:", error);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.telegramAnalytics) {
      initAnalytics();
    }
  }, [token, identifier]);

  return (
    <Script
      async
      id="telegram-analytics-script"
      src="https://tganalytics.xyz/index.js"
      onLoad={initAnalytics}
    />
  );
}
