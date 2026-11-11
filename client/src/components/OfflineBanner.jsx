import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

export const OfflineBanner = () => {
  const { isOnline, syncStatus } = useAccessibility();

  if (isOnline && syncStatus === 'idle') {
    return null;
  }

  return (
    <div style={{
      backgroundColor: !isOnline ? '#fff1f2' : '#f0fdf4',
      borderBottom: `2px solid ${!isOnline ? '#f43f5e' : '#10b981'}`,
      color: !isOnline ? '#9f1239' : '#065f46',
      padding: '0.65rem 1rem',
      fontSize: '0.92rem',
      fontWeight: 600,
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.65rem',
      zIndex: 90
    }}>
      {!isOnline && (
        <>
          <WifiOff size={18} color="#e11d48" />
          <span>
            <strong>Offline Mode Active:</strong> You can view all saved routines and mark completed items. Changes will automatically synchronize when connection returns.
          </span>
        </>
      )}

      {isOnline && syncStatus === 'syncing' && (
        <>
          <RefreshCw size={18} className="animate-spin" color="#059669" />
          <span>Internet connection restored! Synchronizing offline updates with caregiver...</span>
        </>
      )}

      {isOnline && syncStatus === 'synced' && (
        <>
          <CheckCircle2 size={18} color="#059669" />
          <span>All offline activities successfully synchronized with backend database!</span>
        </>
      )}
    </div>
  );
};
