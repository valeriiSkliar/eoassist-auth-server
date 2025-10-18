import { Env } from "@/lib/Env";

const isProduction =
  typeof process !== "undefined" && process.env.NODE_ENV === "production";

/**
 * Returns the list of Yandex.Metrika counter IDs that must receive goal events.
 * Ensures the mandatory counters are present on production even if the environment variable is empty.
 */
export const getYandexMetrikaCounterIds = (): number[] => {
  const envIds = Env.NEXT_PUBLIC_YANDEX_METRIKA_ACCOUNTS_ID ?? [];
  const merged = isProduction
    ? [...envIds]
    : envIds;

  return Array.from(new Set(merged)).filter(
    (id): id is number => typeof id === "number" && Number.isFinite(id)
  );
};
