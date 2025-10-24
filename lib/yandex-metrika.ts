import { Env } from './Env';

/**
 * Send a goal event to all configured Yandex Metrika accounts
 * @param goal - Goal name to track
 * @param params - Optional parameters for the goal
 */
export function trackYandexMetrikaGoal(
  goal: string,
  params?: Record<string, any>
): void {
  if (typeof window === 'undefined' || !window.ym) {
    return;
  }

  const accountIds = Env.NEXT_PUBLIC_YANDEX_METRIKA_ACCOUNTS_ID;

  if (!Array.isArray(accountIds) || accountIds.length === 0) {
    return;
  }

  accountIds.forEach((accountId) => {
    try {
      if (params) {
        window.ym(accountId, 'reachGoal', goal, params);
      } else {
        window.ym(accountId, 'reachGoal', goal);
      }
    } catch (error) {
      console.error(`Failed to send Yandex Metrika goal for account ${accountId}:`, error);
    }
  });
}
