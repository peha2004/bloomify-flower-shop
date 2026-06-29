import { initializeApp } from "firebase/app";
// @ts-ignore
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_ApiKey,
  authDomain: process.env.EXPO_PUBLIC_AuthDomain,
  projectId: process.env.EXPO_PUBLIC_ProjectId,
  storageBucket: process.env.EXPO_PUBLIC_StorageBucket,
  messagingSenderId: process.env.EXPO_PUBLIC_MessagingSenderId,
  appId: process.env.EXPO_PUBLIC_AppId,
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;