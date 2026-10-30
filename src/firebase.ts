import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyDIpbnR8vz74j8Xfkju8Fi6w01EbeRkPh4',
  authDomain: 'sk-bridal-studio.firebaseapp.com',
  projectId: 'sk-bridal-studio',
  storageBucket: 'sk-bridal-studio.firebasestorage.app',
  messagingSenderId: '1017973539220',
  appId: '1:1017973539220:web:2bb5d8e989cbace9898f81',
  measurementId: 'G-6NX2X6FXYS',
};

export const app = initializeApp(firebaseConfig);

// Analytics is unavailable in some browsers (e.g. with cookies blocked), so only start it where supported.
isSupported().then((supported) => {
  if (supported) getAnalytics(app);
});
