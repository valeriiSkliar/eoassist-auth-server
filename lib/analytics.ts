import ym from "react-yandex-metrika";
import { Env } from "@/lib/Env";

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
  const hasAccounts =
    Env.NEXT_PUBLIC_YANDEX_METRIKA_ACCOUNTS_ID &&
    Env.NEXT_PUBLIC_YANDEX_METRIKA_ACCOUNTS_ID.length > 0;

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
    // Отправляем событие во все настроенные счетчики
    ym("reachGoal", goalId, params);

    // Логируем в development режиме
    if (process.env.NODE_ENV === "development") {
      console.log(
        "%c[YandexMetrika](reachGoal) sent",
        "color: green; font-weight: bold",
        goalId,
        params || ""
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
