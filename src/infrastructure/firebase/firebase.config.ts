import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyA_V8tte9garBYhzlGnjApuWXcaeGxPcp8",
  authDomain: "desarrollo-en-la-nube-5ecf8.firebaseapp.com",
  projectId: "desarrollo-en-la-nube-5ecf8",
  storageBucket: "desarrollo-en-la-nube-5ecf8.firebasestorage.app",
  messagingSenderId: "498716084799",
  appId: "1:498716084799:web:8c99b9c8c3eba0bd6e068a"
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);

// Export types that will be used across the application
export type { User } from 'firebase/auth';
