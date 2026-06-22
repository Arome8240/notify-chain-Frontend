"use client";

/**
 * WalletButton
 *
 * - When no wallet is connected: shows "Connect Wallet" and opens the kit's
 *   auth modal on click.
 * - When connected: shows the truncated public key and opens the kit's profile
 *   modal (which lets the user disconnect or switch wallets).
 */

import { useState, useCallback } from "react";
import { Wallet, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useWallet } from "@/src/store";
import { cn } from "@/src/lib/utils";

function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function WalletButton({ className }: { className?: string }) {
  const { walletAddress, isWalletConnected } = useWallet();
  const [loading, setLoading] = useState(false);

  const handleClick = useCallback(async () => {
    setLoading(true);
    try {
      const { StellarWalletsKit } = await import(
        "@creit.tech/stellar-wallets-kit"
      );

      if (isWalletConnected) {
        // Show the profile modal — the kit handles disconnect from there.
        await StellarWalletsKit.profileModal();
      } else {
        // Open the auth modal; the WalletProvider listener will pick up the
        // address via STATE_UPDATED and update the store.
        await StellarWalletsKit.authModal();
      }
    } catch {
      // User dismissed the modal — no action needed.
    } finally {
      setLoading(false);
    }
  }, [isWalletConnected]);

  if (isWalletConnected && walletAddress) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={loading}
        className={cn("gap-1.5 font-mono text-xs", className)}
        aria-label={`Wallet connected: ${walletAddress}. Click to manage.`}
      >
        {loading ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <span className="flex size-2 rounded-full bg-primary" aria-hidden="true" />
        )}
        {truncateAddress(walletAddress)}
      </Button>
    );
  }

  return (
    <Button
      variant="default"
      size="sm"
      onClick={handleClick}
      disabled={loading}
      className={cn("gap-1.5", className)}
      aria-label="Connect your Stellar wallet"
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Wallet className="size-4" />
      )}
      Connect Wallet
    </Button>
  );
}
