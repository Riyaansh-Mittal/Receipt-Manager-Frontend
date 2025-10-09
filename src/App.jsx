import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import store from './store';
import AppRouter from './routes';
import Toast from './components/ui/Toast';
import ErrorBoundary from './components/feedback/ErrorBoundary';
import { tabSyncManager, TabSyncEvents } from './utils/tabSync';
import { syncFromOtherTab } from './store/slices/auth.slice';
import './styles/index.css';

/**
 * Tab Sync Component - Listens to other tabs
 */
const TabSyncListener = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Subscribe to all tab sync events
    const unsubscribeLogout = tabSyncManager.subscribe(
      TabSyncEvents.LOGOUT,
      () => {
        dispatch(syncFromOtherTab({ type: TabSyncEvents.LOGOUT }));
      }
    );

    const unsubscribeLogin = tabSyncManager.subscribe(
      TabSyncEvents.LOGIN,
      (payload) => {
        dispatch(syncFromOtherTab({ type: TabSyncEvents.LOGIN, payload }));
      }
    );

    const unsubscribeProfileUpdate = tabSyncManager.subscribe(
      TabSyncEvents.PROFILE_UPDATED,
      (payload) => {
        dispatch(syncFromOtherTab({ type: TabSyncEvents.PROFILE_UPDATED, payload }));
      }
    );

    const unsubscribeEmailUpdate = tabSyncManager.subscribe(
      TabSyncEvents.EMAIL_UPDATED,
      (payload) => {
        dispatch(syncFromOtherTab({ type: TabSyncEvents.EMAIL_UPDATED, payload }));
      }
    );

    const unsubscribeTokenRefresh = tabSyncManager.subscribe(
      TabSyncEvents.TOKEN_REFRESHED,
      (payload) => {
        dispatch(syncFromOtherTab({ type: TabSyncEvents.TOKEN_REFRESHED, payload }));
      }
    );

    // Cleanup on unmount
    return () => {
      unsubscribeLogout();
      unsubscribeLogin();
      unsubscribeProfileUpdate();
      unsubscribeEmailUpdate();
      unsubscribeTokenRefresh();
    };
  }, [dispatch]);

  return null;
};

/**
 * Main App Component
 */
function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <TabSyncListener />
        <BrowserRouter>
          <AppRouter />
          <Toast />
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
