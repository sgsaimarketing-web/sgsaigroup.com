/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Robust Dual-Tier Browser Storage for SGS CMS (IndexedDB + LocalStorage)
 * Eliminates QuotaExceededError by leveraging IndexedDB for large media payloads.
 */

const DB_NAME = 'SGS_CMS_DATABASE';
const DB_VERSION = 1;
const STORE_NAME = 'site_content_store';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Saves draft data to IndexedDB (handles payloads > 5MB seamlessly).
 */
export async function saveToIndexedDB<T>(key: string, value: T): Promise<boolean> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(value, key);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('IndexedDB write warning:', err);
    return false;
  }
}

/**
 * Retrieves draft data from IndexedDB.
 */
export async function loadFromIndexedDB<T>(key: string): Promise<T | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => resolve((request.result as T) || null);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('IndexedDB read warning:', err);
    return null;
  }
}

/**
 * Removes a key from IndexedDB.
 */
export async function removeFromIndexedDB(key: string): Promise<boolean> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(key);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return false;
  }
}

/**
 * Safe LocalStorage setter that never throws QuotaExceededError.
 * If quota is exceeded, gracefully clears older cache and ignores.
 */
export function safeSetLocalStorage(key: string, value: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err: any) {
    // Quota exceeded: clean up old temporary cache keys
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k !== key && (k.startsWith('sgs_temp') || k.startsWith('vite'))) {
          localStorage.removeItem(k);
        }
      }
      // Retry once after cleanup
      localStorage.setItem(key, value);
      return true;
    } catch {
      // If still exceeding 5MB, rely on IndexedDB safely without throwing
      return false;
    }
  }
}
