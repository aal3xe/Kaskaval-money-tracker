import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { RoomDatabaseEmulator } from '../data/roomDatabase';

export interface LocalGuestUser {
  uid: string;
  email: null;
  displayName: string;
  photoURL: null;
  isAnonymous: true;
}

export type ActiveUser = User | LocalGuestUser;

interface AuthContextType {
  user: ActiveUser | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  lastSyncTime: Date | null;
  syncNow: () => Promise<void>;
}

const LOCAL_GUEST_KEY = 'money_tracker_guest_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ActiveUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    // Check if a local guest session was active previously
    const savedGuest = localStorage.getItem(LOCAL_GUEST_KEY);
    if (savedGuest) {
      try {
        const guestData = JSON.parse(savedGuest);
        setUser(guestData);
      } catch (e) {
        localStorage.removeItem(LOCAL_GUEST_KEY);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Real authenticated Firebase user takes precedence over guest mode
        localStorage.removeItem(LOCAL_GUEST_KEY);
        setUser(currentUser);
        performSync(currentUser.uid);
      } else {
        // If not logged into Firebase, check if local guest mode is active
        const existingGuest = localStorage.getItem(LOCAL_GUEST_KEY);
        if (existingGuest) {
          try {
            setUser(JSON.parse(existingGuest));
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const performSync = async (uid: string) => {
    try {
      setSyncStatus('syncing');
      const room = RoomDatabaseEmulator.getInstance();
      await room.syncWithFirebase(uid);
      setSyncStatus('synced');
      setLastSyncTime(new Date());
      setTimeout(() => setSyncStatus('idle'), 4000);
    } catch (err) {
      console.warn('Sync failed:', err);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 5000);
    }
  };

  const loginWithGoogle = async () => {
    try {
      // Clear guest session
      localStorage.removeItem(LOCAL_GUEST_KEY);
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Firebase Auth sign-in failed', err);
      throw err;
    }
  };

  const loginAsGuest = () => {
    // Local offline-first guest mode without requiring Firebase Anonymous provider enablement
    const guestUser: LocalGuestUser = {
      uid: 'guest_local_user',
      email: null,
      displayName: 'Utilizator Local (Oaspete)',
      photoURL: null,
      isAnonymous: true,
    };
    localStorage.setItem(LOCAL_GUEST_KEY, JSON.stringify(guestUser));
    setUser(guestUser);
  };

  const logout = async () => {
    localStorage.removeItem(LOCAL_GUEST_KEY);
    setUser(null);
    if (auth.currentUser) {
      await signOut(auth);
    }
  };

  const syncNow = async () => {
    if (user && !user.isAnonymous) {
      await performSync(user.uid);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithGoogle,
        loginAsGuest,
        logout,
        syncStatus,
        lastSyncTime,
        syncNow,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
