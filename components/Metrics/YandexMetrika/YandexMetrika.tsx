"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";
import ym, { YMInitializer } from "react-yandex-metrika";
import { usePathname } from "@/lib/i18nNavigation";

interface YandexMetrikaProps {
  accounts?: number[];
}

export default function YandexMetrika({ accounts = [] }: YandexMetrikaProps) {
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const hasAccount = accounts.length > 0;

  const hit = useCallback(
    (url: string) => {
      if (hasAccount) {
        ym("hit", url);
      } else {
        console.log(`%c[YandexMetrika](HIT)`, `color: orange`, url);
      }
    },
    [hasAccount]
  );

  useEffect(() => {
    hit(window.location.href);
  }, [pathName, searchParams, hit]);

  if (hasAccount) {
    return (
      <YMInitializer
        accounts={accounts}
        options={{
          defer: true,
          clickmap: true,
          trackLinks: true,
          accurateTrackBounce: true,
          webvisor: true,
        }}
        version="2"
      />
    );
  }
  return null;
}
