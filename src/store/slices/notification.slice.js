import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
};

let notificationId = 0;

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    showNotification: (state, action) => {
      const { type = 'info', message, duration = 5000 } = action.payload;
      const id = ++notificationId;
      
      state.notifications.push({
        id,
        type,
        message,
        duration,
        timestamp: Date.now(),
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const { showNotification, removeNotification, clearNotifications } =
  notificationSlice.actions;

export const selectNotifications = (state) => state.notification.notifications;

export default notificationSlice.reducer;
