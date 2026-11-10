import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          photoURL: firebaseUser.photoURL,
          // Role is determined by email — staff emails get "staff" role
          role: isStaffEmail(firebaseUser.email) ? 'staff' : 'guest'
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  function isStaffEmail(email) {
    // Whitelisted commander/staff emails
    const staffEmails = [
      'senguptakrishnendu103@gmail.com',
      'staff@resqnet.com', 
      'admin@resqnet.com'
    ];
    const staffDomains = ['staff.resqnet.com'];
    if (!email) return false;
    const cleanEmail = email.trim().toLowerCase();
    if (staffEmails.includes(cleanEmail)) return true;
    const domain = cleanEmail.split('@')[1];
    if (staffDomains.includes(domain)) return true;
    // Also allow any email containing "staff" for demo purposes
    if (cleanEmail.includes('staff')) return true;
    return false;
  }

  async function login(email, password) {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(getErrorMessage(err.code));
      throw err;
    }
  }

  async function signup(email, password, displayName) {
    setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(cred.user, { displayName });
      }
    } catch (err) {
      setError(getErrorMessage(err.code));
      throw err;
    }
  }

  async function loginWithGoogle() {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      setError(getErrorMessage(err.code));
      throw err;
    }
  }

  async function logout() {
    setError(null);
    await signOut(auth);
  }

  function clearError() {
    setError(null);
  }

  function getErrorMessage(code) {
    const messages = {
      'auth/invalid-email': 'Invalid email address.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/email-already-in-use': 'An account already exists with this email.',
      'auth/weak-password': 'Password must be at least 6 characters.',
      'auth/popup-closed-by-user': 'Sign-in popup was closed.',
      'auth/cancelled-popup-request': 'Sign-in popup was cancelled.',
      'auth/popup-blocked': 'Sign-in popup was blocked by browser. Please allow popups for this site.',
      'auth/unauthorized-domain': 'This domain is not authorized in Firebase Console (Authentication > Settings > Authorized domains).',
      'auth/network-request-failed': 'Network request failed. Please check your internet connection.',
      'auth/invalid-credential': 'Invalid credentials. Please check and try again.',
    };
    return messages[code] || `Authentication failed (${code || 'unknown'}). Please try again.`;
  }

  const value = { user, loading, error, login, signup, loginWithGoogle, logout, clearError };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
