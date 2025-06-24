import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type { User } from 'firebase/auth';
import { authRepository } from '../../infrastructure/repositories';
import type { AuthCredentials, AuthResponse } from '../../domain/interfaces/services/auth.service';

type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
};

type AuthContextType = AuthState & {
  signIn: (credentials: AuthCredentials) => Promise<AuthResponse>;
  signUp: (credentials: AuthCredentials) => Promise<AuthResponse>;
  signInWithGoogle: () => Promise<AuthResponse>;
  signInWithFacebook: () => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState: AuthState = {
  user: null,
  loading: true,
  error: null,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);
  const { user, loading, error } = state;

  // Clear any auth errors
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Set up auth state listener
  useEffect(() => {
    let isMounted = true;
    
    const onUserChanged = (currentUser: User | null) => {
      if (isMounted) {
        setState({
          user: currentUser,
          loading: false,
          error: null,
        });
      }
    };

    const unsubscribe = authRepository.onAuthStateChanged(onUserChanged);

    // Cleanup function
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleAuthResponse = useCallback(async (
    authPromise: Promise<AuthResponse>
  ): Promise<AuthResponse> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await authPromise;
      
      if (result.error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: result.error || null,
        }));
        return result;
      }
      
      setState(prev => ({
        ...prev,
        user: result.user,
        loading: false,
        error: null,
      }));
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      
      return { user: null, error: errorMessage };
    }
  }, []);

  const signIn = useCallback((credentials: AuthCredentials): Promise<AuthResponse> => {
    return handleAuthResponse(authRepository.signInWithEmail(credentials));
  }, [handleAuthResponse]);

  const signUp = useCallback((credentials: AuthCredentials): Promise<AuthResponse> => {
    return handleAuthResponse(authRepository.signUpWithEmail(credentials));
  }, [handleAuthResponse]);

  const signInWithGoogle = useCallback((): Promise<AuthResponse> => {
    return handleAuthResponse(authRepository.signInWithGoogle());
  }, [handleAuthResponse]);

  const signInWithFacebook = useCallback((): Promise<AuthResponse> => {
    return handleAuthResponse(authRepository.signInWithFacebook());
  }, [handleAuthResponse]);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      await authRepository.signOut();
      setState({
        user: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Error al cerrar sesión. Por favor, inténtalo de nuevo.',
      }));
    }
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo<AuthContextType>(() => ({
    user,
    loading,
    error,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithFacebook,
    signOut,
    clearError,
  }), [
    user,
    loading,
    error,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithFacebook,
    signOut,
    clearError,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
