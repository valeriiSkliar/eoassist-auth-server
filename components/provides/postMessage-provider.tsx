"use client";
import { loger } from "@/lib/console-loger";
import { useSearchParams } from "next/navigation";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
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

const PostMessagesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const serchparams = useSearchParams();
  const searchParamsSerial = serchparams.toString();
  const initialSearchOrigin = sanitizeOrigin(serchparams.get("originHost"));
  const [originHost, setOriginHost] = useState<string | null>(
    initialSearchOrigin ?? sanitizeOrigin(readStoredOrigin())
  );
  const [formState, setFormState] = useState<FormDataType>(initialState);
  const [opener, setOpener] = useState<Window | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [close, setClose] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLogInSuccess, setIsLogInSuccess] = useState(false);

  const resolveTargetOrigin = useCallback((): string | null => {
    const candidates: Array<string | null> = [originHost];

    if (typeof window !== "undefined") {
      try {
        candidates.push(window.opener?.origin ?? null);
      } catch (error) {
        loger.error("Unable to read opener origin", { error });
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

    return null;
  }, [originHost]);

  useEffect(() => {
    const searchParams = new URLSearchParams(searchParamsSerial);
    const searchOrigin = sanitizeOrigin(searchParams.get("originHost"));
    const targetOrigin = searchOrigin ?? resolveTargetOrigin();

    if (targetOrigin && targetOrigin !== originHost) {
      setOriginHost(targetOrigin);
      persistOrigin(targetOrigin);
    }
  }, [searchParamsSerial, resolveTargetOrigin, originHost]);

  const setLogInSuccessHandler = (state: boolean) => {
    setIsLogInSuccess(state);
  };

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
      setOriginHost(messageOrigin);
      persistOrigin(messageOrigin);
    }

    const { action, key, value } = e.data;
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
    }

    if (action === "close-window") {
      setClose(true);
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

      return () => window.removeEventListener("message", handleParentMessages);
    }

    return () => undefined;
  }, [originHost, close]);

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
      }}
    >
      {children}
    </PostMessagesContext.Provider>
  );
};

export default PostMessagesProvider;
