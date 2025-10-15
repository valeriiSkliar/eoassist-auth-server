import { GoogleAnalytics } from "@next/third-parties/google";
import { Env } from "@/lib/Env";
import TgMiniAppAnalytics from "./TgMiniAppAnalytics/TgMiniAppAnalytics";
import YandexMetrika from "./YandexMetrika/YandexMetrika";

export default function MetricsProvider() {
  const isProdServer =
    Env.IS_TEST_SERVER === "false" && process.env.NODE_ENV === "production";

  if (isProdServer) {
    return (
      <>
        <YandexMetrika accounts={Env.NEXT_PUBLIC_YANDEX_METRIKA_ACCOUNTS_ID} />
        {Env.GA_ID && <GoogleAnalytics gaId={Env.GA_ID} />}
        <TgMiniAppAnalytics
          token={Env.TG_MINI_APP_ANALYTICS_TOKEN}
          identifier={Env.TG_MINI_APP_ANALYTICS_IDENTIFIER}
        />
      </>
    );
  }

  return null;
}
