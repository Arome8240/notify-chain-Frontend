import type { StateCreator } from 'zustand';
import type { AppStore, PreferencesState, PreferencesActions, Language, CurrencyDisplay, ColumnVisibility } from '../types';
import { DEFAULT_PREFERENCES, DEFAULT_COLUMN_VISIBILITY } from '../defaults';

export const preferencesSlice: StateCreator<AppStore, [], [], PreferencesState & PreferencesActions> = (set) => ({
  // Initial state
  ...DEFAULT_PREFERENCES,

  // Actions
  setLanguage: (language: Language) =>
    set(() => ({
      language,
    })),

  setCurrencyDisplay: (currency: CurrencyDisplay) =>
    set(() => ({
      currencyDisplay: currency,
    })),

  toggleNotifications: () =>
    set((state) => ({
      notificationsEnabled: !state.notificationsEnabled,
    })),

  toggleSound: () =>
    set((state) => ({
      soundEnabled: !state.soundEnabled,
    })),

  resetPreferences: () =>
    set(() => DEFAULT_PREFERENCES),

  setColumnVisibility: (table, visibility) =>
    set((state) => ({
      columnVisibility: {
        ...state.columnVisibility,
        [table]: visibility,
      },
    })),

  toggleColumn: (table, column) =>
    set((state) => ({
      columnVisibility: {
        ...state.columnVisibility,
        [table]: {
          ...state.columnVisibility[table],
          [column]: !state.columnVisibility[table][column as keyof typeof state.columnVisibility[typeof table]],
        },
      },
    })),

  resetColumnVisibility: (table) =>
    set((state) => ({
      columnVisibility: table
        ? { ...state.columnVisibility, [table]: DEFAULT_COLUMN_VISIBILITY[table] }
        : DEFAULT_COLUMN_VISIBILITY,
    })),
});
