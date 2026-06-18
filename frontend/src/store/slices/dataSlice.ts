import type { StateCreator } from 'zustand';
import type { AppStore, DataState, DataActions } from '../types';
import type { ChainEvent, NotificationChannel, NotificationRule, WatchedContract } from '@/src/lib/mock-data';
import { channels as initialChannels, rules as initialRules, watchlist as initialWatchlist, events as initialEvents } from '@/src/lib/mock-data';

export const dataSlice: StateCreator<AppStore, [], [], DataState & DataActions> = (set) => ({
  // Initial state
  channels: initialChannels,
  rules: initialRules,
  watchlist: initialWatchlist,
  events: initialEvents,

  // Channels actions
  updateChannel: (id: string, updates: Partial<NotificationChannel>) =>
    set((state) => ({
      channels: state.channels.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),

  toggleChannel: (id: string) =>
    set((state) => ({
      channels: state.channels.map((c) =>
        c.id === id ? { ...c, connected: !c.connected } : c
      ),
    })),

  addChannel: (channel: NotificationChannel) =>
    set((state) => ({
      channels: [...state.channels, channel],
    })),

  removeChannel: (id: string) =>
    set((state) => ({
      channels: state.channels.filter((c) => c.id !== id),
    })),

  // Rules actions
  updateRule: (id: string, updates: Partial<NotificationRule>) =>
    set((state) => ({
      rules: state.rules.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    })),

  toggleRule: (id: string) =>
    set((state) => ({
      rules: state.rules.map((r) =>
        r.id === id
          ? { ...r, status: r.status === 'active' ? 'paused' : 'active' }
          : r
      ),
    })),

  addRule: (rule: NotificationRule) =>
    set((state) => ({
      rules: [...state.rules, rule],
    })),

  removeRule: (id: string) =>
    set((state) => ({
      rules: state.rules.filter((r) => r.id !== id),
    })),

  // Watchlist actions
  updateWatchlistItem: (id: string, updates: Partial<WatchedContract>) =>
    set((state) => ({
      watchlist: state.watchlist.map((w) =>
        w.id === id ? { ...w, ...updates } : w
      ),
    })),

  toggleWatchlistItem: (id: string) =>
    set((state) => ({
      watchlist: state.watchlist.map((w) =>
        w.id === id ? { ...w, active: !w.active } : w
      ),
    })),

  addWatchlistItem: (item: WatchedContract) =>
    set((state) => ({
      watchlist: [...state.watchlist, item],
    })),

  removeWatchlistItem: (id: string) =>
    set((state) => ({
      watchlist: state.watchlist.filter((w) => w.id !== id),
    })),

  // Events actions
  updateEvent: (id: string, updates: Partial<ChainEvent>) =>
    set((state) => ({
      events: state.events.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    })),

  // Mark a previously failed notification as re-delivered and clear its
  // failure reason. Used by the retry-notification modal once a retry succeeds.
  retryNotification: (id: string) =>
    set((state) => ({
      events: state.events.map((e) =>
        e.id === id
          ? { ...e, status: 'delivered', failureReason: undefined }
          : e
      ),
    })),

  resetData: () =>
    set(() => ({
      channels: initialChannels,
      rules: initialRules,
      watchlist: initialWatchlist,
      events: initialEvents,
    })),
});
