"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type LogType = "info" | "success" | "error";

interface LogEntry {
  id: number;
  type: LogType;
  message: string;
}

interface TestMetrikaClientProps {
  defaultCounters: number[];
}

type YmArguments = (string | number | Record<string, any>)[];
type YmFunction = ((...args: YmArguments) => void) & {
  a?: YmArguments[];
  l?: number;
};
type YmWindow = Window & { ym?: YmFunction };

const YM_SCRIPT_SRC = "https://mc.yandex.ru/metrika/tag.js";

const INIT_OPTIONS = {
  defer: true,
  clickmap: true,
  trackLinks: true,
  accurateTrackBounce: true,
  webvisor: true,
} as const;

const LOG_COLORS: Record<LogType, string> = {
  info: "text-slate-600",
  success: "text-emerald-600",
  error: "text-red-600",
};

let metrikaReadyPromise: Promise<void> | null = null;

const getYm = (): YmFunction | undefined =>
  typeof window === "undefined" ? undefined : (window as YmWindow).ym;

const hasRealYm = (ym?: YmFunction): boolean =>
  !!ym && typeof ym.a === "undefined";

const ensureYmStub = (): YmFunction | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }

  const ymWindow = window as YmWindow;
  const current = ymWindow.ym;

  if (current) {
    if (typeof current.a !== "undefined") {
      current.a = current.a || [];
      current.l = current.l || new Date().getTime();
    }
    return current;
  }

  const stub = (function ymStub(...args: YmArguments) {
    const target = ymStub as YmFunction;
    (target.a = target.a || []).push(args);
  }) as YmFunction;

  stub.a = [];
  stub.l = new Date().getTime();
  ymWindow.ym = stub;
  return stub;
};

interface InjectResult {
  script: HTMLScriptElement | null;
  isNew: boolean;
}

const appendScriptElement = (script: HTMLScriptElement) => {
  const append = () => {
    if (document.head) {
      document.head.appendChild(script);
      return;
    }

    if (document.body) {
      document.body.appendChild(script);
      return;
    }

    throw new Error(
      "Документ ещё не готов: отсутствуют head и body для подключения скрипта."
    );
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", append, { once: true });
  } else {
    append();
  }
};

const injectYmSnippet = (): InjectResult => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return { script: null, isNew: false };
  }

  const ymWindow = window as YmWindow;
  const current = ymWindow.ym;

  if (current && hasRealYm(current)) {
    return { script: null, isNew: false };
  }

  ensureYmStub();

  const existingScript = document.querySelector<HTMLScriptElement>(
    `script[src="${YM_SCRIPT_SRC}"]`
  );
  if (existingScript) {
    return { script: existingScript, isNew: false };
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = YM_SCRIPT_SRC;
  return { script, isNew: true };
};

const loadMetrikaScript = async () => {
  if (typeof window === "undefined") {
    throw new Error("Yandex Metrika доступна только в браузере");
  }

  if (hasRealYm(getYm())) {
    return;
  }

  if (!metrikaReadyPromise) {
    metrikaReadyPromise = new Promise<void>((resolve, reject) => {
      try {
        const { script, isNew } = injectYmSnippet();

        if (!script && hasRealYm(getYm())) {
          resolve();
          return;
        }

        let rafId = -1;
        let timeoutId: number | undefined;
        let didFinish = false;

        const cleanup = () => {
          if (timeoutId !== undefined) {
            window.clearTimeout(timeoutId);
          }
          if (rafId >= 0) {
            cancelAnimationFrame(rafId);
          }
          script?.removeEventListener("load", onScriptLoad);
          script?.removeEventListener("error", onScriptError);
        };

        const finish = () => {
          if (didFinish) return;
          didFinish = true;
          cleanup();
          resolve();
        };

        const fail = (message: string) => {
          if (didFinish) return;
          didFinish = true;
          cleanup();
          reject(new Error(message));
        };

        const checkReady = () => {
          if (hasRealYm(getYm())) {
            finish();
            return;
          }
          rafId = requestAnimationFrame(checkReady);
        };

        const onScriptLoad = () => finish();
        const onScriptError = () =>
          fail(
            "Не удалось загрузить скрипт Yandex Metrika. Проверьте блокировщики или сетевое подключение."
          );

        timeoutId = window.setTimeout(() => {
          fail(
            "Yandex Metrika не успела загрузиться за 15 секунд. Возможно, скрипт заблокирован."
          );
        }, 15000);

        if (script) {
          script.addEventListener("load", onScriptLoad, { once: true });
          script.addEventListener("error", onScriptError, { once: true });
          if (isNew) {
            appendScriptElement(script);
          }
        }

        checkReady();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : String(error);
        metrikaReadyPromise = null;
        reject(new Error(message));
      }
    });
  }

  try {
    await metrikaReadyPromise;
  } catch (error) {
    metrikaReadyPromise = null;
    throw error;
  }
};

export default function TestMetrikaClient({
  defaultCounters,
}: TestMetrikaClientProps) {
  const [counterInput, setCounterInput] = useState(() =>
    defaultCounters[0] ? String(defaultCounters[0]) : ""
  );
  const [activeCounter, setActiveCounter] = useState<number | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [hitUrl, setHitUrl] = useState("");
  const [goalName, setGoalName] = useState("testGoal");
  const [goalPayload, setGoalPayload] = useState("{}");
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logId = useRef(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHitUrl(window.location.href);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const ym = getYm();
      if (hasRealYm(ym)) {
        setScriptReady(true);
      }
    }
  }, []);

  useEffect(() => {
    const nextCounter = defaultCounters[0] ? String(defaultCounters[0]) : "";
    setCounterInput(nextCounter);
  }, [defaultCounters]);

  const appendLog = useCallback((type: LogType, message: string) => {
    logId.current += 1;
    setLogs((prev) =>
      [{ id: logId.current, type, message }, ...prev].slice(0, 20)
    );
  }, []);

  const initCounter = useCallback(async () => {
    const parsedId = Number(counterInput.trim());
    if (!Number.isFinite(parsedId)) {
      appendLog("error", "Укажите корректный числовой ID счётчика.");
      return;
    }

    setIsLoading(true);
    try {
      await loadMetrikaScript();
      setScriptReady(true);
      const ym = getYm();
      if (!ym) {
        throw new Error(
          "Скрипт загружен, но глобальная функция ym недоступна."
        );
      }
      ym(parsedId, "init", INIT_OPTIONS);
      setActiveCounter(parsedId);
      appendLog(
        "success",
        `Счётчик ${parsedId} инициализирован через нативный скрипт.`
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Неизвестная ошибка загрузки скрипта.";
      appendLog("error", message);
    } finally {
      setIsLoading(false);
    }
  }, [appendLog, counterInput]);

  const sendHit = useCallback(() => {
    if (!activeCounter) {
      appendLog("error", "Сначала нужно инициализировать счётчик.");
      return;
    }

    const ym = getYm();
    if (!ym) {
      appendLog("error", "Функция ym недоступна. Проверьте загрузку скрипта.");
      return;
    }

    const targetUrl = hitUrl.trim() || window.location.href;
    ym(activeCounter, "hit", targetUrl);
    appendLog("info", `HIT ${targetUrl}`);
  }, [activeCounter, appendLog, hitUrl]);

  const sendGoal = useCallback(() => {
    if (!activeCounter) {
      appendLog("error", "Сначала нужно инициализировать счётчик.");
      return;
    }

    const ym = getYm();
    if (!ym) {
      appendLog("error", "Функция ym недоступна. Проверьте загрузку скрипта.");
      return;
    }

    const trimmedName = goalName.trim();
    if (!trimmedName) {
      appendLog("error", "Название цели не может быть пустым.");
      return;
    }

    let payload: Record<string, unknown> | undefined;
    const trimmedPayload = goalPayload.trim();
    if (trimmedPayload) {
      try {
        payload = JSON.parse(trimmedPayload);
      } catch (error) {
        appendLog(
          "error",
          `Payload не распарсен как JSON: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
        return;
      }
    }

    if (payload !== undefined) {
      ym(
        activeCounter,
        "reachGoal",
        trimmedName,
        payload as Record<string, any>
      );
    } else {
      ym(activeCounter, "reachGoal", trimmedName);
    }
    appendLog(
      "success",
      `reachGoal ${trimmedName}${
        payload ? ` с параметрами ${JSON.stringify(payload)}` : ""
      }`
    );
  }, [activeCounter, appendLog, goalName, goalPayload]);

  const resetState = useCallback(() => {
    setActiveCounter(null);
    logId.current = 1;
    setLogs([
      {
        id: 1,
        type: "info",
        message:
          "Состояние сброшено. Скрипт останется подключённым, если он уже загружен.",
      },
    ]);
  }, []);

  const currentYm = getYm();
  const isYmReady = scriptReady || hasRealYm(currentYm);

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold">
          Тестирование нативной интеграции Яндекс.Метрики
        </h1>
        <p className="text-slate-600">
          Эта страница загружает оригинальный скрипт{" "}
          <code>mc.yandex.ru/metrika/tag.js</code> без сторонних React-пакетов.
          Вы можете инициализировать счётчик, отправить <code>hit</code> и{" "}
          <code>reachGoal</code>, чтобы убедиться, что события доходят до
          нужного счётчика.
        </p>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-medium">1. Инициализация счётчика</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex-1">
            <span className="text-sm font-medium text-slate-700">
              ID счётчика
            </span>
            <input
              type="text"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              value={counterInput}
              onChange={(event) => setCounterInput(event.target.value)}
              placeholder="Например, 12345678"
            />
          </label>
          <button
            type="button"
            className="h-11 rounded-md bg-slate-900 px-4 font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            onClick={initCounter}
            disabled={isLoading}
          >
            {isLoading ? "Загрузка..." : "Инициализировать"}
          </button>
          <button
            type="button"
            className="h-11 rounded-md border border-slate-300 px-4 font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={resetState}
            disabled={isLoading}
          >
            Сбросить
          </button>
        </div>
        <p className="text-sm text-slate-600">
          <strong>Статус скрипта:</strong>{" "}
          {isYmReady ? "скрипт загружен" : "ожидает загрузки"}
          {activeCounter ? ` · активный счётчик: ${activeCounter}` : ""}
        </p>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-medium">2. Отправка событий</h2>
        <div className="space-y-3">
          <label>
            <span className="text-sm font-medium text-slate-700">
              URL для hit
            </span>
            <input
              type="text"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              value={hitUrl}
              onChange={(event) => setHitUrl(event.target.value)}
            />
          </label>
          <button
            type="button"
            className="rounded-md bg-emerald-600 px-4 py-2 font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
            onClick={sendHit}
            disabled={!activeCounter}
          >
            Отправить hit
          </button>
        </div>

        <div className="space-y-3">
          <label>
            <span className="text-sm font-medium text-slate-700">
              Название цели (reachGoal)
            </span>
            <input
              type="text"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              value={goalName}
              onChange={(event) => setGoalName(event.target.value)}
            />
          </label>
          <label>
            <span className="text-sm font-medium text-slate-700">
              Payload (JSON, опционально)
            </span>
            <textarea
              className="mt-1 h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              value={goalPayload}
              onChange={(event) => setGoalPayload(event.target.value)}
              placeholder='Например, {"orderId": "123", "value": 1500}'
            />
          </label>
          <button
            type="button"
            className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
            onClick={sendGoal}
            disabled={!activeCounter}
          >
            Отправить reachGoal
          </button>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-medium">3. Логи взаимодействия</h2>
        {logs.length === 0 ? (
          <p className="text-sm text-slate-500">
            Здесь появятся сообщения об инициализации, hit и reachGoal.
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {logs.map((log) => (
              <li key={log.id} className={LOG_COLORS[log.type]}>
                <span className="font-medium uppercase">{log.type}</span>:{" "}
                {log.message}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
