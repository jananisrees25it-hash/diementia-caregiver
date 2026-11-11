// Local offline cache and sync queue manager

const REMINDERS_KEY = 'cog_offline_reminders';
const QUEUE_KEY = 'cog_offline_sync_queue';
const ACTIVITY_KEY = 'cog_offline_activity';

export const saveRemindersOffline = (reminders) => {
  try {
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
  } catch (e) {
    console.warn('Failed to cache reminders offline:', e);
  }
};

export const getRemindersOffline = () => {
  try {
    const raw = localStorage.getItem(REMINDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const queueOfflineAction = (action) => {
  try {
    const currentQueue = getOfflineQueue();
    currentQueue.push({
      ...action,
      queuedAt: new Date().toISOString()
    });
    localStorage.setItem(QUEUE_KEY, JSON.stringify(currentQueue));
  } catch (e) {
    console.warn('Failed to queue offline action:', e);
  }
};

export const getOfflineQueue = () => {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const clearOfflineQueue = () => {
  try {
    localStorage.removeItem(QUEUE_KEY);
  } catch (e) {
    console.warn('Failed to clear sync queue:', e);
  }
};

export const saveActivityOffline = (activity) => {
  try {
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activity));
  } catch (e) {
    console.warn('Failed to cache activity offline:', e);
  }
};

export const getActivityOffline = () => {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};
