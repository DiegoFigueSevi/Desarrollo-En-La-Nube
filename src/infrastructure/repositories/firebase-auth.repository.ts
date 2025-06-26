import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged as onFirebaseAuthStateChanged,
  type User,
  type AuthError
} from 'firebase/auth';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseApp, db } from '../firebase/firebase.config';
import type { UserData } from '../../domain/interfaces/services/auth.service';
import type { IAuthService, AuthCredentials, AuthResponse } from '../../domain/interfaces/services/auth.service';

export class FirebaseAuthRepository implements IAuthService {
  private auth = getAuth(firebaseApp);
  private googleProvider = new GoogleAuthProvider();
  private facebookProvider = new FacebookAuthProvider();

  async signInWithEmail({ email, password }: AuthCredentials): Promise<AuthResponse> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      return { user: userCredential.user };
    } catch (error: unknown) {
      const authError = error as AuthError;
      return { user: null, error: this.getErrorMessage(authError.code) };
    }
  }

  async signUpWithEmail(credentials: AuthCredentials): Promise<AuthResponse> {
    try {
      const { email, password, username, age, cellphone } = credentials;
      
      // Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const { user } = userCredential;
      
      // Create user data in Firestore
      await this.createUserData({
        email,
        username,
        age,
        cellphone
      }, user.uid);
      
      return { user };
    } catch (error: unknown) {
      const authError = error as AuthError;
      return { user: null, error: this.getErrorMessage(authError.code) };
    }
  }
  
  async createUserData(userData: Omit<UserData, 'uid' | 'createdAt' | 'updatedAt'>, uid: string): Promise<void> {
    try {
      const userRef = doc(collection(db, 'users'), uid);
      const now = serverTimestamp();
      
      await setDoc(userRef, {
        ...userData,
        uid,
        createdAt: now,
        updatedAt: now,
      }, { merge: true });
    } catch (error) {
      console.error('Error creating user data:', error);
      throw new Error('Error al guardar los datos del usuario');
    }
  }

  async signInWithGoogle(): Promise<AuthResponse> {
    try {
      const result = await signInWithPopup(this.auth, this.googleProvider);
      return { user: result.user };
    } catch (error: unknown) {
      const authError = error as AuthError;
      return { user: null, error: this.getErrorMessage(authError.code) };
    }
  }

  async signInWithFacebook(): Promise<AuthResponse> {
    try {
      const result = await signInWithPopup(this.auth, this.facebookProvider);
      return { user: result.user };
    } catch (error: unknown) {
      const authError = error as AuthError;
      return { user: null, error: this.getErrorMessage(authError.code) };
    }
  }

  async signOut(): Promise<void> {
    await firebaseSignOut(this.auth);
  }

  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onFirebaseAuthStateChanged(this.auth, callback);
  }

  private getErrorMessage(errorCode: string): string {
    // Common error messages
    const errorMessages: Record<string, string> = {
      'auth/email-already-in-use': 'El correo ya está en uso',
      'auth/invalid-email': 'Correo electrónico inválido',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
      'auth/user-not-found': 'Usuario no encontrado',
      'auth/wrong-password': 'Correo o contraseña incorrectos',
      'auth/account-exists-with-different-credential': 'Ya existe una cuenta con el mismo correo pero con credenciales diferentes',
      'auth/popup-closed-by-user': 'La ventana de autenticación se cerró antes de completar el inicio de sesión',
      'auth/cancelled-popup-request': 'Solo se permite una solicitud de ventana emergente a la vez',
      'auth/popup-blocked': 'El navegador bloqueó la ventana emergente. Por favor, permite las ventanas emergentes para este sitio',
      'auth/operation-not-allowed': 'Este método de autenticación no está habilitado',
    };

    return errorMessages[errorCode] || 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
  }
}

// Export a singleton instance
export const authRepository = new FirebaseAuthRepository();
