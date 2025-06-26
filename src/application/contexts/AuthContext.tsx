import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type { User } from 'firebase/auth';
import { authRepository, db } from '../../infrastructure/repositories';
import { doc, getDoc } from 'firebase/firestore';
import type { AuthCredentials, AuthResponse } from '../../domain/interfaces/services/auth.service';

type UserData = {
  uid: string;
  email: string;
  username?: string;
  displayName?: string;
  // Add other user fields as needed
};

type AuthState = {
  user: User | null;
  userData: UserData | null;
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
  userData: null,
  loading: true,
  error: null,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);
  const { user, userData, loading, error } = state;

  const fetchUserData = useCallback(async (user: User): Promise<UserData | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          uid: user.uid,
          email: data.email || user.email || '',
          username: data.username,
          displayName: data.displayName || user.displayName || undefined,
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }, []);

  // Clear any auth errors
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Set up auth state listener
  useEffect(() => {
    let isMounted = true;
    
    const onUserChanged = async (currentUser: User | null) => {
      if (!isMounted) return;
      
      if (currentUser) {
        try {
          const userData = await fetchUserData(currentUser);
          if (isMounted) {
            setState({
              user: currentUser,
              userData,
              loading: false,
              error: null,
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          if (isMounted) {
            setState({
              user: currentUser,
              userData: null,
              loading: false,
              error: 'Error al cargar los datos del usuario',
            });
          }
        }
      } else {
        if (isMounted) {
          setState({
            user: null,
            userData: null,
            loading: false,
            error: null,
          });
        }
      }
    };

    const unsubscribe = authRepository.onAuthStateChanged(onUserChanged);

    // Cleanup function
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [fetchUserData]);

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
      
      if (result.user) {
        try {
          const userData = await fetchUserData(result.user);
          setState(prev => ({
            ...prev,
            user: result.user,
            userData,
            loading: false,
          }));
          return result;
        } catch (error) {
          console.error('Error fetching user data:', error);
          setState(prev => ({
            ...prev,
            user: result.user,
            userData: null,
            loading: false,
            error: 'Error al cargar los datos del usuario',
          }));
          return result;
        }
      }
      
      setState(prev => ({ ...prev, loading: false }));
      return result;
    } catch (error) {
      console.error('Auth error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error de autenticación';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, [fetchUserData]);

  const signIn = useCallback((credentials: AuthCredentials) => 
    handleAuthResponse(authRepository.signInWithEmail(credentials)),
    [handleAuthResponse]
  );

  const signUp = useCallback((credentials: AuthCredentials) => 
    handleAuthResponse(authRepository.signUpWithEmail(credentials)),
    [handleAuthResponse]
  );

  const signInWithGoogle = useCallback(
    () => handleAuthResponse(authRepository.signInWithGoogle()),
    [handleAuthResponse]
  );

  const signInWithFacebook = useCallback(
    () => handleAuthResponse(authRepository.signInWithFacebook()),
    [handleAuthResponse]
  );

  const signOut = useCallback(async () => {
    try {
      await authRepository.signOut();
      setState({
        user: null,
        userData: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error signing out:', error);
      setState(prev => ({
        ...prev,
        error: 'Error al cerrar sesión',
      }));
    }
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    userData,
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
    userData,
    loading,
    error,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithFacebook,
    signOut,
    clearError,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
