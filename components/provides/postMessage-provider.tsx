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

const PostMessagesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const serchparams = useSearchParams();
  const searchParamsSerial = serchparams.toString();
  const [originHost, setOriginHost] = useState<string | null>(() =>
    normalizeOrigin(serchparams.get("originHost"))
  );
  const [formState, setFormState] = useState<FormDataType>(initialState);
  const [opener, setOpener] = useState<Window | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [close, setClose] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLogInSuccess, setIsLogInSuccess] = useState(false);

  const resolveTargetOrigin = useCallback((): string | null => {
    const normalizedState = normalizeOrigin(originHost);
    if (normalizedState) {
      return normalizedState;
    }

    try {
      const openerOrigin = window?.opener?.origin;
      const normalizedOpener = normalizeOrigin(openerOrigin ?? null);
      if (normalizedOpener) {
        return normalizedOpener;
      }
    } catch (error) {
      loger.error("Unable to read opener origin", { error });
    }

    if (typeof document !== "undefined" && document.referrer) {
      const referrerOrigin = normalizeOrigin(document.referrer);
      if (referrerOrigin) {
        return referrerOrigin;
      }
    }

    const cookieOrigin = normalizeOrigin(resolveCookie("origin-host"));
    if (cookieOrigin) {
      return cookieOrigin;
    }

    return null;
  }, [originHost]);

  useEffect(() => {
    const searchParams = new URLSearchParams(searchParamsSerial);
    const searchOrigin = normalizeOrigin(searchParams.get("originHost"));
    const targetOrigin = searchOrigin ?? resolveTargetOrigin();

    if (targetOrigin && targetOrigin !== originHost) {
      setOriginHost(targetOrigin);
    }
  }, [searchParamsSerial, resolveTargetOrigin, originHost]);

  const setLogInSuccessHandler = (state: boolean) => {
    setIsLogInSuccess(state);
  };

  const sendMessageHandler = useCallback(
    (message: MessageDataType) => {
      if (!window?.opener) {
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
    const redirectLink = callbackUrl || originHost || window.location.origin;

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
    loger.info("window?.opener", window?.opener);
    if (window?.opener) {
      setOpener(window?.opener);
    }
    if (window) {
      loger.info("set-addEventListener");
      window.addEventListener("message", handleParentMessages);
    }
    if (close) {
      window.close();
    }

    return () => window.removeEventListener("message", handleParentMessages);
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
      }}
    >
      {children}
    </PostMessagesContext.Provider>
  );
};

export default PostMessagesProvider;
