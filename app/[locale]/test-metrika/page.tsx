import { getYandexMetrikaCounterIds } from "@/lib/yandexMetrikaConfig";
import type { Metadata } from "next";
import TestMetrikaClient from "./test-metrika-client";

export const metadata: Metadata = {
  title: "Yandex Metrika Script Tester",
  description:
    "Страница для отладки нативного подключения счётчика и проверки отправки событий.",
  robots: "noindex, nofollow",
};

export default function TestMetrikaPage() {
  const counterIds = getYandexMetrikaCounterIds();

  return <TestMetrikaClient defaultCounters={counterIds} />;
}
