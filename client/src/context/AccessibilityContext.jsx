import React, { createContext, useContext, useState, useEffect } from 'react';
import { speakText, stopSpeech, isTTSSupported } from '../utils/tts';
import { getOfflineQueue, clearOfflineQueue } from '../utils/offlineStorage';
import { apiRequest } from '../utils/api';

const AccessibilityContext = createContext();

export const AccessibilityProvider = ({ children }) => {
  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem('cog_font_size') || 'normal';
  });

  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem('cog_high_contrast') === 'true';
  });

  const [ttsEnabled, setTtsEnabled] = useState(() => {
    const val = localStorage.getItem('cog_tts_enabled');
    return val === null ? true : val === 'true'; // Default ON for cognitive accessibility
  });

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'synced'

  // Apply font size scale
  useEffect(() => {
    localStorage.setItem('cog_font_size', fontSize);
    const root = document.documentElement;
    if (fontSize === 'xlarge') {
      root.style.setProperty('--font-scale', '1.35');
    } else if (fontSize === 'large') {
      root.style.setProperty('--font-scale', '1.18');
    } else {
      root.style.setProperty('--font-scale', '1');
    }
  }, [fontSize]);

  // Apply High Contrast class
  useEffect(() => {
    localStorage.setItem('cog_high_contrast', highContrast);
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [highContrast]);

  // Handle Online / Offline events & Auto-sync
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      // Auto-sync queued offline actions
      const queue = getOfflineQueue();
      if (queue.length > 0) {
        setSyncStatus('syncing');
        try {
          await apiRequest('/reminders/sync', {
            method: 'POST',
            body: JSON.stringify({ offlineUpdates: queue }),
          });
          clearOfflineQueue();
          setSyncStatus('synced');
          setTimeout(() => setSyncStatus('idle'), 4000);
        } catch (err) {
          console.error('Offline sync failed:', err);
          setSyncStatus('idle');
        }
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const triggerSpeak = (text) => {
    if (ttsEnabled) {
      speakText(text);
    }
  };

  return (
    <AccessibilityContext.Provider
      value={{
        fontSize,
        setFontSize,
        highContrast,
        setHighContrast,
        ttsEnabled,
        setTtsEnabled,
        isOnline,
        syncStatus,
        speak: triggerSpeak,
        stopSpeech,
        isTTSSupported: isTTSSupported(),
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => useContext(AccessibilityContext);
