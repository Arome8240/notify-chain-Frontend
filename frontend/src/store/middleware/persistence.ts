/**
 * Persistence Middleware
 * Handles persisting and hydrating state from browser storage
 */

import { PersistOptions } from 'zustand/middleware';
import type { AppStore } from '../types';
import { DEFAULT_UI_STATE } from '../defaults';
import { DEFAULT_PREFERENCES } from '../defaults';
import { logger } from '@/src/lib/logger';

/**
 * Custom persistence configuration
 * - UI state persists to sessionStorage (cleared on browser close)
 * - Preferences persist to localStorage (long-term storage)
 */
export const persistenceConfig: PersistOptions<AppStore, Partial<AppStore>> = {
  name: 'notify-chain-store',
  version: 2,
  merge: (persistedState, currentState) => {
    try {
      const merged = { ...currentState, ...(persistedState as Partial<AppStore>) };
      return {
        ...merged,
        sidebarOpen: merged.sidebarOpen !== undefined ? merged.sidebarOpen : DEFAULT_UI_STATE.sidebarOpen,
        activeModal: merged.activeModal !== undefined ? merged.activeModal : DEFAULT_UI_STATE.activeModal,
        viewMode: merged.viewMode || DEFAULT_UI_STATE.viewMode,
        theme: merged.theme || DEFAULT_UI_STATE.theme,
        dashboardChainFilter: merged.dashboardChainFilter !== undefined ? merged.dashboardChainFilter : DEFAULT_UI_STATE.dashboardChainFilter,
        dashboardSearchQuery: merged.dashboardSearchQuery !== undefined ? merged.dashboardSearchQuery : DEFAULT_UI_STATE.dashboardSearchQuery,
        dashboardFilterPresets: Array.isArray(merged.dashboardFilterPresets) ? merged.dashboardFilterPresets : DEFAULT_UI_STATE.dashboardFilterPresets,
        language: merged.language || DEFAULT_PREFERENCES.language,
        currencyDisplay: merged.currencyDisplay || DEFAULT_PREFERENCES.currencyDisplay,
        notificationsEnabled: merged.notificationsEnabled !== undefined ? merged.notificationsEnabled : DEFAULT_PREFERENCES.notificationsEnabled,
        soundEnabled: merged.soundEnabled !== undefined ? merged.soundEnabled : DEFAULT_PREFERENCES.soundEnabled,
        columnVisibility: merged.columnVisibility || DEFAULT_PREFERENCES.columnVisibility,
      } as AppStore;
    } catch (error) {
      logger.error('Error merging persisted state', error);
      return currentState;
    }
  },
  partialize: (state): Partial<AppStore> => ({
    sidebarOpen: state.sidebarOpen,
    viewMode: state.viewMode,
    theme: state.theme,
    dashboardChainFilter: state.dashboardChainFilter,
    dashboardSearchQuery: state.dashboardSearchQuery,
    dashboardFilterPresets: state.dashboardFilterPresets,
    language: state.language,
    currencyDisplay: state.currencyDisplay,
    notificationsEnabled: state.notificationsEnabled,
    soundEnabled: state.soundEnabled,
    columnVisibility: state.columnVisibility,
  }),
};

/**
 * Hydration function to safely load state from storage
 */
export function hydrateStore(): Partial<AppStore> {
  try {
    if (typeof window === 'undefined') {
      return {};
    }

    const stored = localStorage.getItem('notify-chain-store');
    if (!stored) {
      return {};
    }

    const parsed = JSON.parse(stored);
    if (!parsed.state) {
      return {};
    }

    return parsed.state;
  } catch (error) {
    logger.error('Error hydrating store', error);
    return {};
  }
}

/**
 * Clear all persisted state from storage
 */
export function clearPersistedState(): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('notify-chain-store');
    }
  } catch (error) {
    logger.error('Error clearing persisted state', error);
  }
}
