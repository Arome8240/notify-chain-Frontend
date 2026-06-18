/**
 * Type definitions for the global state management store
 */

import type { ChainEvent, NotificationChannel, NotificationRule, WatchedContract } from '@/src/lib/mock-data';

// UI State Types
export type ViewMode = 'grid' | 'list';
export type Theme = 'light' | 'dark' | 'system';

export interface UIState {
  sidebarOpen: boolean;
  activeModal: string | null;
  viewMode: ViewMode;
  theme: Theme;
  // Dashboard filters
  dashboardChainFilter: string;
  dashboardSearchQuery: string;
}

export interface UIActions {
  toggleSidebar: () => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  setViewMode: (mode: ViewMode) => void;
  setTheme: (theme: Theme) => void;
  setDashboardChainFilter: (chain: string) => void;
  setDashboardSearchQuery: (query: string) => void;
  resetUIState: () => void;
}

// Preferences State Types
export type Language = 'en' | 'es' | 'fr' | 'de';
export type CurrencyDisplay = 'USD' | 'EUR' | 'GBP' | 'JPY';

export interface PreferencesState {
  language: Language;
  currencyDisplay: CurrencyDisplay;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
}

export interface PreferencesActions {
  setLanguage: (language: Language) => void;
  setCurrencyDisplay: (currency: CurrencyDisplay) => void;
  toggleNotifications: () => void;
  toggleSound: () => void;
  resetPreferences: () => void;
}

// Data State Types
export interface DataState {
  channels: NotificationChannel[];
  rules: NotificationRule[];
  watchlist: WatchedContract[];
  events: ChainEvent[];
}

export interface DataActions {
  // Channels actions
  updateChannel: (id: string, updates: Partial<NotificationChannel>) => void;
  toggleChannel: (id: string) => void;
  addChannel: (channel: NotificationChannel) => void;
  removeChannel: (id: string) => void;
  
  // Rules actions
  updateRule: (id: string, updates: Partial<NotificationRule>) => void;
  toggleRule: (id: string) => void;
  addRule: (rule: NotificationRule) => void;
  removeRule: (id: string) => void;
  
  // Watchlist actions
  updateWatchlistItem: (id: string, updates: Partial<WatchedContract>) => void;
  toggleWatchlistItem: (id: string) => void;
  addWatchlistItem: (item: WatchedContract) => void;
  removeWatchlistItem: (id: string) => void;

  // Events actions
  updateEvent: (id: string, updates: Partial<ChainEvent>) => void;
  retryNotification: (id: string) => void;

  // Reset actions
  resetData: () => void;
}

// Combined Store Types
export interface AppStoreState extends UIState, PreferencesState, DataState {}

export interface AppStore extends AppStoreState, UIActions, PreferencesActions, DataActions {}

// Persistence Config
export interface PersistenceConfig {
  key: string;
  storage: Storage;
  version: number;
}
