import type { User } from 'firebase/auth';

export interface AuthCredentials {
  email: string;
  password: string;
  username: string;
  age: number;
  cellphone: string;
}

export interface UserData {
  uid: string;
  email: string;
  username: string;
  age: number;
  cellphone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: User | null;
  error?: string;
}

export interface IAuthService {
  // Email/Password Authentication
  signInWithEmail(credentials: AuthCredentials): Promise<AuthResponse>;
  signUpWithEmail(credentials: AuthCredentials): Promise<AuthResponse>;
  createUserData(userData: Omit<UserData, 'uid' | 'createdAt' | 'updatedAt'>, uid: string): Promise<void>;
  
  // Social Authentication
  signInWithGoogle(): Promise<AuthResponse>;
  signInWithFacebook(): Promise<AuthResponse>;
  
  // Session Management
  signOut(): Promise<void>;
  getCurrentUser(): User | null;
  
  // Auth State Changes
  onAuthStateChanged(callback: (user: User | null) => void): () => void;
}
