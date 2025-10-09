import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/auth.slice';
import notificationReducer from './slices/notification.slice';
import uiReducer from './slices/ui.slice';
import receiptReducer from './slices/receipt.slice';
import categoryReducer from './slices/category.slice';
import quotaReducer from './slices/quota.slice';

const rootReducer = combineReducers({
  auth: authReducer,
  notification: notificationReducer,
  ui: uiReducer,
  receipts: receiptReducer,
  categories: categoryReducer,
  quota: quotaReducer,
});

export default rootReducer;
