import { useEffect, useState, useCallback } from 'react';
import { dbManager } from '@/lib/indexeddb';

interface SyncStatus {
  isOnline: boolean;
  pendingEvents: number;
  isSyncing: boolean;
  lastSyncTime: number | null;
}

export function useOfflineSync() {
  const [status, setStatus] = useState<SyncStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    pendingEvents: 0,
    isSyncing: false,
    lastSyncTime: null,
  });

  // Проверка онлайн статуса
  useEffect(() => {
    const handleOnline = () => {
      setStatus((prev) => ({ ...prev, isOnline: true }));
      syncEvents();
    };

    const handleOffline = () => {
      setStatus((prev) => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Загрузка количества несинхронизированных событий
  const updatePendingCount = useCallback(async () => {
    try {
      const events = await dbManager.getUnsyncedEvents();
      setStatus((prev) => ({ ...prev, pendingEvents: events.length }));
    } catch (error) {
      console.error('Error updating pending count:', error);
    }
  }, []);

  // Синхронизация событий
  const syncEvents = useCallback(async () => {
    if (status.isSyncing || !status.isOnline) return;

    setStatus((prev) => ({ ...prev, isSyncing: true }));

    try {
      const events = await dbManager.getUnsyncedEvents();
      
      if (events.length === 0) {
        setStatus((prev) => ({
          ...prev,
          isSyncing: false,
          pendingEvents: 0,
        }));
        return;
      }

      // Синхронизация каждого события
      for (const event of events) {
        try {
          let success = false;

          switch (event.type) {
            case 'dhikr_tap':
              const tapResponse = await fetch('/api/v1/counter/tap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(event.data),
              });
              success = tapResponse.ok;
              break;

            case 'goal_update':
              const goalResponse = await fetch('/api/v1/goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(event.data),
              });
              success = goalResponse.ok;
              break;

            case 'prayer_debt_update':
              const debtResponse = await fetch('/api/prayer-debt/progress', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(event.data),
              });
              success = debtResponse.ok;
              break;
          }

          if (success) {
            await dbManager.markEventAsSynced(event.id);
          } else {
            await dbManager.incrementRetryCount(event.id);
            // Если слишком много попыток, пропускаем
            if (event.retry_count >= 5) {
              await dbManager.markEventAsSynced(event.id); // Помечаем как синхронизированное, чтобы не блокировать очередь
            }
          }
        } catch (error) {
          console.error('Error syncing event:', error);
          await dbManager.incrementRetryCount(event.id);
        }
      }

      await updatePendingCount();
      setStatus((prev) => ({
        ...prev,
        isSyncing: false,
        lastSyncTime: Date.now(),
      }));
    } catch (error) {
      console.error('Error during sync:', error);
      setStatus((prev) => ({ ...prev, isSyncing: false }));
    }
  }, [status.isOnline, status.isSyncing, updatePendingCount]);

  // Автоматическая синхронизация при восстановлении связи
  useEffect(() => {
    if (status.isOnline && status.pendingEvents > 0) {
      syncEvents();
    }
  }, [status.isOnline, status.pendingEvents, syncEvents]);

  // Периодическая синхронизация (каждые 30 секунд)
  useEffect(() => {
    const interval = setInterval(() => {
      if (status.isOnline && status.pendingEvents > 0) {
        syncEvents();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [status.isOnline, status.pendingEvents, syncEvents]);

  // Инициализация и загрузка количества событий
  useEffect(() => {
    dbManager.init().then(() => {
      updatePendingCount();
      // Очистка старых событий
      dbManager.cleanupOldEvents();
    });
  }, [updatePendingCount]);

  return {
    ...status,
    syncEvents,
    updatePendingCount,
  };
}

