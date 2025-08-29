"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { ReactNode, useState } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  // Ensure only 1 QueryClient exists
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider
        networks={{ 
            testnet: { url: "https://fullnode.testnet.sui.io" } 
        }}
        defaultNetwork="testnet"
      >
        <WalletProvider>
          {children}
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
