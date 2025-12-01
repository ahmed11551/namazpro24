/**
 * IndexedDB wrapper для офлайн-режима
 */

const DB_NAME = 'NamazPro24';
const DB_VERSION = 1;

export interface OfflineEvent {
  id: string;
  type: 'dhikr_tap' | 'goal_update' | 'prayer_debt_update';
  data: any;
  timestamp: number;
  synced: boolean;
  retry_count: number;
}

class IndexedDBManager {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store для офлайн событий
        if (!db.objectStoreNames.contains('offline_events')) {
          const eventsStore = db.createObjectStore('offline_events', {
            keyPath: 'id',
            autoIncrement: true,
          });
          eventsStore.createIndex('synced', 'synced', { unique: false });
          eventsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Store для кеша целей
        if (!db.objectStoreNames.contains('goals_cache')) {
          const goalsStore = db.createObjectStore('goals_cache', {
            keyPath: 'id',
          });
          goalsStore.createIndex('user_id', 'user_id', { unique: false });
          goalsStore.createIndex('status', 'status', { unique: false });
        }

        // Store для кеша тасбиха
        if (!db.objectStoreNames.contains('tasbih_sessions')) {
          db.createObjectStore('tasbih_sessions', {
            keyPath: 'id',
          });
        }

        // Store для кеша долга по намазам
        if (!db.objectStoreNames.contains('prayer_debt_cache')) {
          db.createObjectStore('prayer_debt_cache', {
            keyPath: 'user_id',
          });
        }
      };
    });
  }

  /**
   * Сохранение офлайн события
   */
  async saveOfflineEvent(event: Omit<OfflineEvent, 'id' | 'synced' | 'retry_count'>): Promise<string> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offline_events'], 'readwrite');
      const store = transaction.objectStore('offline_events');
      
      const eventData: OfflineEvent = {
        ...event,
        id: crypto.randomUUID(),
        synced: false,
        retry_count: 0,
      };

      const request = store.add(eventData);

      request.onsuccess = () => resolve(eventData.id);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Получение всех несинхронизированных событий
   */
  async getUnsyncedEvents(): Promise<OfflineEvent[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offline_events'], 'readonly');
      const store = transaction.objectStore('offline_events');
      const index = store.index('synced');
      const request = index.getAll(false);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Отметить событие как синхронизированное
   */
  async markEventAsSynced(eventId: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offline_events'], 'readwrite');
      const store = transaction.objectStore('offline_events');
      const getRequest = store.get(eventId);

      getRequest.onsuccess = () => {
        const event = getRequest.result;
        if (event) {
          event.synced = true;
          const updateRequest = store.put(event);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  /**
   * Увеличить счетчик попыток синхронизации
   */
  async incrementRetryCount(eventId: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offline_events'], 'readwrite');
      const store = transaction.objectStore('offline_events');
      const getRequest = store.get(eventId);

      getRequest.onsuccess = () => {
        const event = getRequest.result;
        if (event) {
          event.retry_count += 1;
          const updateRequest = store.put(event);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  /**
   * Удаление старых синхронизированных событий (старше 30 дней)
   */
  async cleanupOldEvents(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offline_events'], 'readwrite');
      const store = transaction.objectStore('offline_events');
      const index = store.index('timestamp');
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const range = IDBKeyRange.upperBound(thirtyDaysAgo);
      const request = index.openCursor(range);

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Кеширование целей
   */
  async cacheGoals(goals: any[]): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['goals_cache'], 'readwrite');
      const store = transaction.objectStore('goals_cache');
      
      // Очистить старые данные
      store.clear();
      
      // Добавить новые
      goals.forEach((goal) => {
        store.put({ ...goal, cached_at: Date.now() });
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  /**
   * Получение закешированных целей
   */
  async getCachedGoals(): Promise<any[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['goals_cache'], 'readonly');
      const store = transaction.objectStore('goals_cache');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Кеширование сессии тасбиха
   */
  async saveTasbihSession(session: any): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['tasbih_sessions'], 'readwrite');
      const store = transaction.objectStore('tasbih_sessions');
      const request = store.put({ ...session, saved_at: Date.now() });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Получение последней сессии тасбиха
   */
  async getLastTasbihSession(): Promise<any | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['tasbih_sessions'], 'readonly');
      const store = transaction.objectStore('tasbih_sessions');
      const request = store.getAll();

      request.onsuccess = () => {
        const sessions = request.result;
        if (sessions.length > 0) {
          // Вернуть последнюю сессию
          sessions.sort((a, b) => (b.saved_at || 0) - (a.saved_at || 0));
          resolve(sessions[0]);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
}

export const dbManager = new IndexedDBManager();

