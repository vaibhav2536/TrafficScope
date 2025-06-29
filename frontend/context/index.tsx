"use client";

import AppProvider from "./app-provider";

interface ContextProviderProps {
  children: React.ReactNode;
}

const ContextProviders: React.FC<ContextProviderProps> = ({ children }) => {
  return (
      <AppProvider>{children}</AppProvider>
  );
};

export default ContextProviders;
