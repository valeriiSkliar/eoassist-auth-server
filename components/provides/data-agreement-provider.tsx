"use client";
import { useTranslations } from "next-intl";
import Link from "next/link";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Checkbox } from "../ui/checkbox";

interface DataAgreementContextType {
  isAgreed: boolean;
  setIsAgreed: React.Dispatch<React.SetStateAction<boolean>>;
  highlightCheckbox: () => void;
  isHighlighted: boolean;
}

const DataAgreementContext = createContext<
  DataAgreementContextType | undefined
>(undefined);

export const useDataAgreement = () => {
  const context = useContext(DataAgreementContext);
  if (context === undefined) {
    throw new Error(
      "useDataAgreement must be used within a DataAgreementProvider"
    );
  }
  return context;
};

export const DataAgreementProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAgreed, setIsAgreed] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("privacyPolicyAgreed");
    if (stored === "true") {
      setIsAgreed(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("privacyPolicyAgreed", isAgreed.toString());
  }, [isAgreed]);

  const highlightCheckbox = useCallback(() => {
    setIsHighlighted(true);
    setTimeout(() => setIsHighlighted(false), 2000);
  }, []);

  const contextValue = {
    isAgreed,
    setIsAgreed,
    highlightCheckbox,
    isHighlighted,
  };

  return (
    <DataAgreementContext.Provider value={contextValue}>
      {children}
    </DataAgreementContext.Provider>
  );
};

export const AgreementCheckbox: React.FC = () => {
  const { isAgreed, setIsAgreed, highlightCheckbox, isHighlighted } =
    useDataAgreement();

  const t = useTranslations("signIn");

  return (
    <div
      className={`p-4 border-l-4 ${
        isHighlighted ? "bg-yellow-50 border-yellow-400" : ""
      } ${
        isAgreed ? "bg-green-50 border-green-300" : ""
      } transition-all duration-300`}
    >
      <div className="flex items-center space-x-3">
        <div
          className={`flex-shrink-0 ${
            isHighlighted ? "text-yellow-400" : "text-gray-400"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="flex-1">
          <Checkbox
            id="terms"
            checked={isAgreed}
            onCheckedChange={(checked) => setIsAgreed(checked as boolean)}
          />
          <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
            {t("agreement.checkbox")}
            <Link
              target="_blank"
              href="https://eoassist.com/privacy-policy"
              className="text-yellow-600 hover:underline ml-1"
            >
              {t("agreement.policy")}
            </Link>
          </label>
        </div>
      </div>
    </div>
  );
};
