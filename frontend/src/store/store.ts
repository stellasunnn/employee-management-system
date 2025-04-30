import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import onboardingReducer from './slices/onboardingSlice';
import visaReducer from './slices/visaSlice';
import uploadDocumentReducer from './slices/uploadDocumentSlice';
import hrReducer from './slices/hrSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    onboarding: onboardingReducer,
    uploadDocument: uploadDocumentReducer,
    visa: visaReducer,
    hr: hrReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
