/**
 * Default state values for the global store
 */

import type { UIState, PreferencesState } from './types';

export const DEFAULT_UI_STATE: UIState = {
  sidebarOpen: true,
  activeModal: null,
  viewMode: 'grid',
  theme: 'system',
  dashboardChainFilter: 'All',
  dashboardSearchQuery: '',
  dashboardStatusFilters: [],
  dashboardFilterPresets: [],
  exportJobs: [],
};

export const DEFAULT_PREFERENCES: PreferencesState = {
  language: 'en',
  currencyDisplay: 'USD',
  notificationsEnabled: true,
  soundEnabled: true,
};
