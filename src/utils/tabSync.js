/**
 * Tab Synchronization Manager
 * Syncs auth state across multiple tabs using localStorage events
 */

const TAB_SYNC_KEY = 'auth_sync_event';

export const TabSyncEvents = {
  LOGOUT: 'logout',
  LOGIN: 'login',
  EMAIL_UPDATED: 'email_updated',
  PROFILE_UPDATED: 'profile_updated',
  TOKEN_REFRESHED: 'token_refreshed',
};

class TabSyncManager {
  constructor() {
    this.listeners = new Map();
    this.setupStorageListener();
  }

  setupStorageListener() {
    // Listen for storage events from other tabs
    window.addEventListener('storage', (event) => {
      if (event.key === TAB_SYNC_KEY && event.newValue) {
        try {
          const data = JSON.parse(event.newValue);
          this.notifyListeners(data);
        } catch (error) {
          console.error('Failed to parse sync event:', error);
        }
      }
    });
  }

  // Broadcast event to all other tabs
  broadcast(eventType, payload = {}) {
    const event = {
      type: eventType,
      payload,
      timestamp: Date.now(),
      tabId: this.getTabId(),
    };

    // This will trigger 'storage' event in OTHER tabs only
    localStorage.setItem(TAB_SYNC_KEY, JSON.stringify(event));
    
    // Clean up immediately to allow future broadcasts
    setTimeout(() => {
      localStorage.removeItem(TAB_SYNC_KEY);
    }, 100);
  }

  // Subscribe to sync events
  subscribe(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(eventType);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  notifyListeners(event) {
    const { type, payload } = event;
    const callbacks = this.listeners.get(type) || [];
    callbacks.forEach((callback) => callback(payload));
  }

  getTabId() {
    if (!sessionStorage.getItem('tab_id')) {
      sessionStorage.setItem('tab_id', `tab_${Date.now()}_${Math.random()}`);
    }
    return sessionStorage.getItem('tab_id');
  }
}

export const tabSyncManager = new TabSyncManager();
