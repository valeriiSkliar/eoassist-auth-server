import ym from "react-yandex-metrika";
import { getYandexMetrikaCounterIds } from "@/lib/yandexMetrikaConfig";

declare global {
  interface Window {
    ym?: (...args: Array<number | string | Record<string, any>>) => void;
  }
}

/**
 * Отправляет событие достижения цели в Яндекс.Метрику
 *
 * @param goalId - Идентификатор цели (например, 'authorization')
 * @param params - Дополнительные параметры события
 *
 * @example
 * // Отправка простого события
 * trackYandexGoal('authorization');
 *
 * @example
 * // Отправка события с параметрами
 * trackYandexGoal('authorization', { provider: 'google' });
 */
export const trackYandexGoal = (
  goalId: string,
  params?: Record<string, any>
) => {
  // Проверяем, что метрика доступна и настроена
  const accountIds = getYandexMetrikaCounterIds();
  const hasAccounts = accountIds.length > 0;

  if (!hasAccounts) {
    // В development режиме выводим информацию в консоль
    if (process.env.NODE_ENV === "development") {
      console.log(
        "%c[YandexMetrika](reachGoal)",
        "color: orange; font-weight: bold",
        goalId,
        params || ""
      );
    }
    return;
  }

  try {
    let sentViaGlobalYm = false;

    if (typeof window !== "undefined" && typeof window.ym === "function") {
      accountIds.forEach((accountId) => {
        const args = params
          ? ([accountId, "reachGoal", goalId, params] as const)
          : ([accountId, "reachGoal", goalId] as const);

        window.ym?.(...args);
      });

      sentViaGlobalYm = true;
    }

    // Отправляем событие во все настроенные счетчики (fallback)
    if (!sentViaGlobalYm) {
      ym("reachGoal", goalId, params);
    }

    // Логируем в development режиме
    if (process.env.NODE_ENV === "development") {
      console.log(
        "%c[YandexMetrika](reachGoal) sent",
        "color: green; font-weight: bold",
        goalId,
        params || "",
        `[counters: ${accountIds.join(", ")}]`
      );
    }
  } catch (error) {
    console.error("Error tracking Yandex Metrika goal:", error);
  }
};

/**
 * Типы событий авторизации для типобезопасности
 */
export const AuthGoals = {
  AUTHORIZATION: "authorization",
  AUTHORIZATION_GOOGLE: "authorization_google",
  AUTHORIZATION_YANDEX: "authorization_yandex",
  AUTHORIZATION_EMAIL: "authorization_email",
  AUTHORIZATION_TELEGRAM: "authorization_telegram",
} as const;

export type AuthGoal = (typeof AuthGoals)[keyof typeof AuthGoals];
