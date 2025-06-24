import type { User } from 'firebase/auth';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User | null;
  error?: string;
}

export interface IAuthService {
  // Email/Password Authentication
  signInWithEmail(credentials: AuthCredentials): Promise<AuthResponse>;
  signUpWithEmail(credentials: AuthCredentials): Promise<AuthResponse>;
  
  // Social Authentication
  signInWithGoogle(): Promise<AuthResponse>;
  signInWithFacebook(): Promise<AuthResponse>;
  
  // Session Management
  signOut(): Promise<void>;
  getCurrentUser(): User | null;
  
  // Auth State Changes
  onAuthStateChanged(callback: (user: User | null) => void): () => void;
}
