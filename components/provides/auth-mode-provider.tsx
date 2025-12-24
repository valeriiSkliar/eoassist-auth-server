"use client";
import React, { createContext, useContext, useState } from "react";

type AuthMode = "login" | "register";

interface AuthModeContextType {
  mode: AuthMode;
  setMode: React.Dispatch<React.SetStateAction<AuthMode>>;
  isRegister: boolean;
  toggleMode: () => void;
}

const AuthModeContext = createContext<AuthModeContextType | undefined>(
  undefined
);

export const useAuthMode = () => {
  const context = useContext(AuthModeContext);
  if (context === undefined) {
    throw new Error("useAuthMode must be used within an AuthModeProvider");
  }
  return context;
};

export const AuthModeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mode, setMode] = useState<AuthMode>("login");

  const isRegister = mode === "register";

  const toggleMode = () => {
    setMode((prev) => (prev === "login" ? "register" : "login"));
  };

  const contextValue = {
    mode,
    setMode,
    isRegister,
    toggleMode,
  };

  return (
    <AuthModeContext.Provider value={contextValue}>
      {children}
    </AuthModeContext.Provider>
  );
};
