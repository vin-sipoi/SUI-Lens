"use client";

import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import "@mysten/dapp-kit/dist/index.css";
import { UserProvider } from "./landing/UserContext";

// Initialize QueryClient
const queryClient = new QueryClient();

// Define Sui networks
const networks = {
  devnet: { url: getFullnodeUrl("devnet") },
  mainnet: { url: getFullnodeUrl("mainnet") },
  testnet: { url: getFullnodeUrl("testnet") },
};

import { useEffect, useState } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState("system");

  useEffect(() => {
    const body = window.document.body;

    const initialTheme = localStorage.getItem("suilens-theme") || "system";
    setTheme(initialTheme);

    const applyTheme = (themeValue: string) => {
      if (themeValue === "light") {
        body.classList.add("theme-light");
        body.classList.remove("theme-dark");
      } else if (themeValue === "dark") {
        body.classList.add("theme-dark");
        body.classList.remove("theme-light");
      } else {
        // system
        body.classList.remove("theme-light");
        body.classList.remove("theme-dark");
      }
    };

    applyTheme(initialTheme);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === "system") {
        if (e.matches) {
          body.classList.add("theme-dark");
          body.classList.remove("theme-light");
        } else {
          body.classList.add("theme-light");
          body.classList.remove("theme-dark");
        }
      }
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [theme]);

  return (
    <UserProvider>
      <QueryClientProvider client={queryClient}>
        <SuiClientProvider networks={networks} defaultNetwork="testnet">
          <WalletProvider>{children}</WalletProvider>
        </SuiClientProvider>
      </QueryClientProvider>
    </UserProvider>
  );
}
