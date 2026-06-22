import type { StateCreator } from 'zustand';
import type { AppStore, WalletState, WalletActions } from '../types';

export const walletSlice: StateCreator<AppStore, [], [], WalletState & WalletActions> = (set) => ({
  // Initial state
  walletAddress: null,
  isWalletConnected: false,

  // Actions
  setWalletAddress: (address: string | null) =>
    set(() => ({
      walletAddress: address,
      isWalletConnected: address !== null,
    })),

  disconnectWallet: () =>
    set(() => ({
      walletAddress: null,
      isWalletConnected: false,
    })),
});
