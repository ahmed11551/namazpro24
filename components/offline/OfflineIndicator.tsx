'use client';

import { useOfflineSync } from '@/hooks/useOfflineSync';
import Badge from '@/components/ui/Badge';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export default function OfflineIndicator() {
  const { isOnline, pendingEvents, isSyncing } = useOfflineSync();

  if (isOnline && pendingEvents === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-fadeIn">
      <Badge
        variant={isOnline ? 'warning' : 'danger'}
        className="flex items-center gap-2 shadow-lg"
      >
        {isOnline ? (
          <>
            {isSyncing ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                Синхронизация...
              </>
            ) : (
              <>
                <Wifi size={14} />
                {pendingEvents > 0 && `${pendingEvents} событий в очереди`}
              </>
            )}
          </>
        ) : (
          <>
            <WifiOff size={14} />
            Офлайн режим
          </>
        )}
      </Badge>
    </div>
  );
}

