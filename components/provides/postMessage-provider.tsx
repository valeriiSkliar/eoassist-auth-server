"use client";
import { loger } from "@/lib/console-loger";
import { useSearchParams } from "next/navigation";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type FormDataType = {
  // values: {
  email: string;
  password: string;
  // },
  error: string | undefined | null;
  callbackUrl: string;
};

type MessageDataType = { action: string; key: string; value: any };
const initialState = {
  // values: {
  email: "",
  password: "",
  // },
  error: null,
  callbackUrl: "",
};
interface PostMessagesContextType {
  isLoading: boolean;
  isLogInSuccess: boolean;
  originHost: string | null;
  formState: FormDataType;
  error: string | null;
  close: boolean;
  setClose: (value: boolean) => void;
  setLogInSuccessHandler: (state: boolean) => void;
  sendMessage: (message: MessageDataType) => void;
  setIsLoading: (value: boolean) => void;
  handleSubmit: (form: HTMLFormElement) => Promise<void>;
  getResolvedOrigin: () => string | null;
  lastLogin: { provider: string; payload: any } | null;
  resetLastLogin: () => void;
}

const PostMessagesContext = createContext<PostMessagesContextType | undefined>(
  undefined
);

export const usePostMessages = () => {
  const context = useContext(PostMessagesContext);
  if (!context) {
    throw new Error(
      "usePostMessages must be used within a PostMessagesProvider"
    );
  }
  return context;
};

const normalizeOrigin = (value: string | null): string | null => {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch (error) {
    try {
      return new URL(`https://${value}`).origin;
    } catch (innerError) {
      loger.error("Unable to normalize origin", { value, error, innerError });
      return null;
    }
  }
};

const resolveCookie = (name: string): string | null => {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, "\\$1")}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
};
const getCurrentWindowOrigin = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.location.origin;
};

const isSameAsCurrentOrigin = (value: string | null): boolean => {
  const current = getCurrentWindowOrigin();
  if (!value || !current) {
    return false;
  }

  return value === current;
};

const sanitizeOrigin = (value: string | null): string | null => {
  const normalized = normalizeOrigin(value);
  if (!normalized) {
    return null;
  }

  if (isSameAsCurrentOrigin(normalized)) {
    return null;
  }

  return normalized;
};

const ORIGIN_STORAGE_KEY = "eoassist-parent-origin";
const AUTH_HOST_STORAGE_KEY = "eoassist-auth-host";
let hasWarnedAboutOpenerOrigin = false;

const ORIGIN_REQUEST_EVENT = "provide-origin";
const ORIGIN_REQUEST_MESSAGE = "request-origin";
const ORIGIN_HANDSHAKE_TIMEOUT = 1000;

const safeGetOpenerOrigin = (): string | null => {
  if (typeof window === "undefined" || !window.opener) {
    return null;
  }

  try {
    return window.opener.origin;
  } catch (error) {
    const isSecurityError =
      typeof DOMException !== "undefined" &&
      error instanceof DOMException &&
      error.name === "SecurityError";

    if (isSecurityError) {
      if (!hasWarnedAboutOpenerOrigin) {
        hasWarnedAboutOpenerOrigin = true;
        loger.warn(
          "Unable to access window.opener.origin due to cross-origin restrictions"
        );
      }
      return null;
    }

    loger.error("Unable to read opener origin", { error });
    return null;
  }
};

const readStoredOrigin = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return sessionStorage.getItem(ORIGIN_STORAGE_KEY);
  } catch (error) {
    loger.error("Unable to read stored origin", { error });
    return null;
  }
};

const persistOrigin = (value: string | null) => {
  if (!value || typeof window === "undefined") {
    return;
  }

  if (isSameAsCurrentOrigin(value)) {
    return;
  }

  try {
    sessionStorage.setItem(ORIGIN_STORAGE_KEY, value);
  } catch (error) {
    loger.error("Unable to persist origin", { error });
  }
};

const readStoredAuthHost = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return sessionStorage.getItem(AUTH_HOST_STORAGE_KEY);
  } catch (error) {
    loger.error("Unable to read stored auth host", { error });
    return null;
  }
};

const persistAuthHost = (value: string | null) => {
  if (!value || typeof window === "undefined") {
    return;
  }

  try {
    sessionStorage.setItem(AUTH_HOST_STORAGE_KEY, value);
  } catch (error) {
    loger.error("Unable to persist auth host", { error });
  }
};

const shouldRedirectToStoredHost = (desiredHost: string, currentHost: string) => {
  if (desiredHost === currentHost) {
    return false;
  }

  const mappings: Array<[string, string]> = [
    ["nutrioassist.ru", "nutrioassist.com"],
    ["eoassist.ru", "eoassist.com"],
  ];

  return mappings.some(([target, source]) =>
    desiredHost.endsWith(target) && currentHost.endsWith(source)
  );
};

const sanitizeHost = (value: string | null): string | null => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim().toLowerCase();
  const sanitized = trimmed.replace(/[^a-z0-9.-]/g, "");
  if (!sanitized) {
    return null;
  }

  return sanitized;
};

const PostMessagesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const serchparams = useSearchParams();
  const searchParamsSerial = serchparams.toString();
  const initialSearchOrigin = sanitizeOrigin(serchparams.get("originHost"));
  const initialRuProxyHost = sanitizeHost(serchparams.get("ruProxyHost"));
  const [originHost, setOriginHost] = useState<string | null>(
    initialSearchOrigin ?? sanitizeOrigin(readStoredOrigin())
  );
  const [formState, setFormState] = useState<FormDataType>(initialState);
  const [opener, setOpener] = useState<Window | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [close, setClose] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLogInSuccess, setIsLogInSuccess] = useState(false);
  const [lastLogin, setLastLogin] = useState<{ provider: string; payload: any } | null>(null);
  const originHandshakeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const requestOpenerOrigin = useCallback(() => {
    if (typeof window === "undefined" || !window.opener) {
      return;
    }

    try {
      window.opener.postMessage(
        {
          action: ORIGIN_REQUEST_MESSAGE,
          key: "post-messages-provider",
        },
        "*"
      );
    } catch (error) {
      loger.error("Failed to request opener origin", { error });
    }
  }, []);

  const ensureOriginHandshake = useCallback(() => {
    if (
      originHandshakeTimerRef.current ||
      originHost ||
      typeof window === "undefined" ||
      !window.opener
    ) {
      return;
    }

    requestOpenerOrigin();
    originHandshakeTimerRef.current = setInterval(() => {
      requestOpenerOrigin();
    }, ORIGIN_HANDSHAKE_TIMEOUT);
  }, [originHost, requestOpenerOrigin]);

  const stopOriginHandshake = useCallback(() => {
    if (originHandshakeTimerRef.current) {
      clearInterval(originHandshakeTimerRef.current);
      originHandshakeTimerRef.current = null;
    }
  }, []);

  const resolveTargetOrigin = useCallback((): string | null => {
    const candidates: Array<string | null> = [originHost];

    if (typeof window !== "undefined") {
      const openerOrigin = safeGetOpenerOrigin();
      if (openerOrigin) {
        candidates.push(openerOrigin);
      }
    }

    if (typeof document !== "undefined" && document.referrer) {
      candidates.push(document.referrer);
    }

    candidates.push(resolveCookie("origin-host"));
    candidates.push(readStoredOrigin());

    for (const candidate of candidates) {
      const sanitized = sanitizeOrigin(candidate);
      if (sanitized) {
        persistOrigin(sanitized);
        return sanitized;
      }
    }

    ensureOriginHandshake();
    return null;
  }, [originHost, ensureOriginHandshake]);

  useEffect(() => {
    const searchParams = new URLSearchParams(searchParamsSerial);
    const searchOrigin = sanitizeOrigin(searchParams.get("originHost"));
    const searchRuProxyHost = sanitizeHost(searchParams.get("ruProxyHost"));

    if (searchRuProxyHost) {
      persistAuthHost(searchRuProxyHost);
    }

    const targetOrigin = searchOrigin ?? resolveTargetOrigin();

    if (targetOrigin && targetOrigin !== originHost) {
      stopOriginHandshake();
      setOriginHost(targetOrigin);
      persistOrigin(targetOrigin);
    } else if (!targetOrigin) {
      ensureOriginHandshake();
    }
  }, [
    searchParamsSerial,
    resolveTargetOrigin,
    originHost,
    ensureOriginHandshake,
    stopOriginHandshake,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!readStoredAuthHost()) {
      persistAuthHost(window.location.host);
    }

    const desiredHost = readStoredAuthHost();
    if (
      desiredHost &&
      shouldRedirectToStoredHost(desiredHost, window.location.host)
    ) {
      const targetUrl = `${window.location.protocol}//${desiredHost}${window.location.pathname}${window.location.search}`;
      window.location.replace(targetUrl);
    }
  }, [initialRuProxyHost, searchParamsSerial]);

  const setLogInSuccessHandler = (state: boolean) => {
    setIsLogInSuccess(state);
  };

  const resetLastLogin = useCallback(() => {
    setLastLogin(null);
    setIsLogInSuccess(false);
  }, []);

  const sendMessageHandler = useCallback(
    (message: MessageDataType) => {
      if (typeof window === "undefined" || !window.opener) {
        loger.error("postMessage skipped: no opener window", { message });
        return;
      }

      const targetOrigin = resolveTargetOrigin();

      if (!targetOrigin) {
        loger.error("postMessage skipped: origin is not resolved", {
          message,
        });
        return;
      }

      window.opener.postMessage(message, targetOrigin);
    },
    [resolveTargetOrigin]
  );

  const credintialsFormSubminHendler = async (form: HTMLFormElement) => {
    const formData = new FormData(form);
    const callbackUrl = formData.get("callbackUrl")?.toString() ?? "";

    // Используем callbackUrl (который содержит originHost) как redirectLink
    const resolvedOrigin = resolveTargetOrigin();
    const redirectLink = callbackUrl || resolvedOrigin || "";

    setFormState({
      // values: {
      email: formData.get("email")?.toString() ?? "",
      password: formData.get("password")?.toString() ?? "",
      // },
      error: null,
      callbackUrl: callbackUrl,
    });
    // setError('something went wrong')
    sendMessageHandler({
      action: "login",
      key: "credintials",
      value: {
        // values: {
        email: formData.get("email")?.toString() ?? "",
        password: formData.get("password")?.toString() ?? "",
        // },
        error: null,
        callbackUrl: callbackUrl,
        redirectLink: redirectLink, // Добавляем redirectLink для правильного редиректа
      },
    });
  };
  const setIsLoadingHendler = (value: boolean) => {
    setIsLoading(value);
  };

  const handleParentMessages = (e: MessageEvent) => {
    const messageOrigin = sanitizeOrigin(e.origin);
    if (messageOrigin && messageOrigin !== originHost) {
      stopOriginHandshake();
      setOriginHost(messageOrigin);
      persistOrigin(messageOrigin);
    }

    const { action, key, value } = e.data;
    if (action === ORIGIN_REQUEST_MESSAGE) {
      if (e.source && typeof window !== "undefined") {
        try {
          (e.source as WindowProxy).postMessage(
            {
              action: ORIGIN_REQUEST_EVENT,
              key: "post-messages-provider",
              value: window.location.origin,
            },
            messageOrigin || "*"
          );
        } catch (error) {
          loger.error("Failed to respond with origin", { error });
        }
      }
      return;
    }

    if (action === ORIGIN_REQUEST_EVENT && typeof value === "string") {
      const providedOrigin = sanitizeOrigin(value);
      if (providedOrigin) {
        stopOriginHandshake();
        setOriginHost(providedOrigin);
        persistOrigin(providedOrigin);
      }
      return;
    }
    if (action === "start-answer") {
      setIsLoadingHendler(true);
      sendMessageHandler({
        action: "show-spinner",
        key: "credintials",
        value: null,
      });
    }

    if (action === "error") {
      setError(value);
    }
    if (action === "success") {
      setError(null);
      setIsLoadingHendler(false);
      setClose(true);
      setIsLogInSuccess(true);
      setLastLogin({ provider: key, payload: value });
    }

    if (action === "close-window") {
      setClose(true);
    }

    if (action === "login") {
      setError(null);
      setIsLoadingHendler(false);
      setClose(true);
      setIsLogInSuccess(true);
      setLastLogin({ provider: key, payload: value });
    }

    // Handle reset password related messages from parent
    if (action === "reset-password-response") {
      // Handle any response from parent about reset password
      if (key === "success") {
        setError(null);
        setIsLoadingHendler(false);
      } else if (key === "error") {
        setError(value);
      }
    }

    setTimeout(() => {
      setIsLoadingHendler(false);
    }, 3000);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      loger.info("window.opener", window.opener);
      if (window.opener) {
        setOpener(window.opener);
      }
      loger.info("set-addEventListener");
      window.addEventListener("message", handleParentMessages);
      if (close) {
        window.close();
      }

      return () => {
        stopOriginHandshake();
        window.removeEventListener("message", handleParentMessages);
      };
    }

    return () => undefined;
  }, [originHost, close, stopOriginHandshake]);

  return (
    <PostMessagesContext.Provider
      value={{
        isLoading,
        originHost,
        formState,
        error,
        isLogInSuccess,
        close,
        setClose,
        setLogInSuccessHandler,
        sendMessage: sendMessageHandler,
        setIsLoading: setIsLoadingHendler,
        handleSubmit: credintialsFormSubminHendler,
        getResolvedOrigin: resolveTargetOrigin,
        lastLogin,
        resetLastLogin,
      }}
    >
      {children}
    </PostMessagesContext.Provider>
  );
};

export default PostMessagesProvider;
