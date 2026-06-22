"use client";

/**
 * WalletProvider initializes @creit.tech/stellar-wallets-kit once on the
 * client and subscribes to kit events so the Zustand wallet slice stays in
 * sync with the user's real connection state.
 *
 * Must be rendered inside a browser environment only — Next.js SSR is handled
 * by the dynamic import in the root layout.
 */

import { useEffect } from "react";
import { useWallet } from "@/src/store";

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { setWalletAddress, disconnectWallet } = useWallet();

  useEffect(() => {
    let unsubState: (() => void) | undefined;
    let unsubDisconnect: (() => void) | undefined;

    async function init() {
      // Dynamic import so the kit (which uses Web Components / DOM APIs) is
      // never evaluated during SSR.
      const { StellarWalletsKit } = await import(
        "@creit.tech/stellar-wallets-kit"
      );
      const { defaultModules } = await import(
        "@creit.tech/stellar-wallets-kit/modules/utils"
      );
      const { KitEventType } = await import(
        "@creit.tech/stellar-wallets-kit/types"
      );

      // Init is idempotent — safe to call more than once.
      StellarWalletsKit.init({ modules: defaultModules() });

      // Restore address if the kit already has one from a previous session.
      try {
        const { address } = await StellarWalletsKit.getAddress();
        if (address) setWalletAddress(address);
      } catch {
        // No active wallet — that's fine.
      }

      // Subscribe to future changes.
      unsubState = StellarWalletsKit.on(
        KitEventType.STATE_UPDATED,
        (event: { payload: { address: string | undefined } }) => {
          setWalletAddress(event.payload.address ?? null);
        }
      );

      unsubDisconnect = StellarWalletsKit.on(
        KitEventType.DISCONNECT,
        () => {
          disconnectWallet();
        }
      );
    }

    init();

    return () => {
      unsubState?.();
      unsubDisconnect?.();
    };
  }, [setWalletAddress, disconnectWallet]);

  return <>{children}</>;
}
