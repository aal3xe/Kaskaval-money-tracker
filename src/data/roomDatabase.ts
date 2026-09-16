import { Transaction } from '../types';
import { INITIAL_ROOM_TRANSACTIONS } from '../data/initialData';
import { db, auth } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  writeBatch
} from 'firebase/firestore';

const ROOM_STORAGE_KEY = 'money_tracker_room_db_v1';

export class RoomDatabaseEmulator {
  private static instance: RoomDatabaseEmulator;
  private memoryCache: Transaction[] = [];
  private listeners: Array<() => void> = [];

  private constructor() {
    this.loadFromLocalStorage();
  }

  public static getInstance(): RoomDatabaseEmulator {
    if (!RoomDatabaseEmulator.instance) {
      RoomDatabaseEmulator.instance = new RoomDatabaseEmulator();
    }
    return RoomDatabaseEmulator.instance;
  }

  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem(ROOM_STORAGE_KEY);
      if (stored) {
        this.memoryCache = JSON.parse(stored);
      } else {
        this.memoryCache = [...INITIAL_ROOM_TRANSACTIONS];
        this.persist();
      }
    } catch (e) {
      console.warn('LocalStorage unavailable, using in-memory SQLite store', e);
      this.memoryCache = [...INITIAL_ROOM_TRANSACTIONS];
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(ROOM_STORAGE_KEY, JSON.stringify(this.memoryCache));
    } catch (e) {
      console.error('Failed to save to local Room store', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(fn => fn());
  }

  // Room DAO Operations:
  public getAll(): Transaction[] {
    return [...this.memoryCache].sort((a, b) => b.timestamp - a.timestamp);
  }

  public async insert(tx: Transaction): Promise<void> {
    const existingIndex = this.memoryCache.findIndex(t => t.id === tx.id);
    if (existingIndex >= 0) {
      this.memoryCache[existingIndex] = tx;
    } else {
      this.memoryCache.unshift(tx);
    }
    this.persist();

    // Auto sync to Firestore if user logged in
    const user = auth.currentUser;
    if (user && !user.isAnonymous) {
      try {
        const txDocRef = doc(db, 'users', user.uid, 'transactions', tx.id);
        await setDoc(txDocRef, { ...tx, syncedToCloud: true });
        // Mark synced in local store
        const idx = this.memoryCache.findIndex(t => t.id === tx.id);
        if (idx >= 0) {
          this.memoryCache[idx].syncedToCloud = true;
          this.persist();
        }
      } catch (err) {
        console.warn('Firestore sync failed (offline-first fallback active):', err);
      }
    }
  }

  public async delete(id: string): Promise<void> {
    this.memoryCache = this.memoryCache.filter(t => t.id !== id);
    this.persist();

    const user = auth.currentUser;
    if (user && !user.isAnonymous) {
      try {
        const txDocRef = doc(db, 'users', user.uid, 'transactions', id);
        await deleteDoc(txDocRef);
      } catch (err) {
        console.warn('Firestore delete failed:', err);
      }
    }
  }

  public async syncWithFirebase(userId: string): Promise<{ pushed: number; pulled: number }> {
    let pushed = 0;
    let pulled = 0;

    try {
      const colRef = collection(db, 'users', userId, 'transactions');
      const snapshot = await getDocs(colRef);
      
      const remoteTransactions: Record<string, Transaction> = {};
      snapshot.forEach(docSnap => {
        remoteTransactions[docSnap.id] = docSnap.data() as Transaction;
      });

      // Push unsynced local to remote
      const batch = writeBatch(db);
      let batchCount = 0;

      for (const localTx of this.memoryCache) {
        if (!remoteTransactions[localTx.id]) {
          const docRef = doc(db, 'users', userId, 'transactions', localTx.id);
          batch.set(docRef, { ...localTx, syncedToCloud: true, userId });
          batchCount++;
          pushed++;
        }
      }

      if (batchCount > 0) {
        await batch.commit();
      }

      // Merge remote items into local
      for (const [id, remoteTx] of Object.entries(remoteTransactions)) {
        const localIdx = this.memoryCache.findIndex(t => t.id === id);
        if (localIdx === -1) {
          this.memoryCache.push({ ...remoteTx, syncedToCloud: true });
          pulled++;
        } else {
          this.memoryCache[localIdx] = { ...remoteTx, syncedToCloud: true };
        }
      }

      // Mark all local as synced
      this.memoryCache.forEach(t => (t.syncedToCloud = true));
      this.persist();

      return { pushed, pulled };
    } catch (e) {
      console.error('Sync error:', e);
      throw e;
    }
  }

  public clearAll(): void {
    this.memoryCache = [];
    this.persist();
  }

  public resetSampleData(): void {
    this.memoryCache = [...INITIAL_ROOM_TRANSACTIONS];
    this.persist();
  }
}
