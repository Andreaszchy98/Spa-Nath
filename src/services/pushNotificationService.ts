import { AppNotification, PushPreferences } from '../types';

const STORAGE_KEY_PREFS = 'bl_push_notification_preferences';

export const DEFAULT_PUSH_PREFERENCES: PushPreferences = {
  enabled: true,
  notifyAppointments: true,
  notifyOrders: true,
  notifyCancellations: true,
  soundEnabled: true,
};

// Play a pleasant, soft notification chime using Web Audio API
export function playNotificationSound(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // Two-tone chime (E5 -> G#5)
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now); // E5
    osc1.frequency.exponentialRampToValueAtTime(830.61, now + 0.12); // G#5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1318.5, now); // Harmonic E6
    osc2.frequency.exponentialRampToValueAtTime(1661.2, now + 0.12);

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.2, now + 0.04);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.45);
    osc2.stop(now + 0.45);
  } catch (err) {
    // Non-critical if audio context is blocked
    console.debug('Audio chime skipped:', err);
  }
}

// Register service worker if available
export async function registerPushServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }
  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    return reg;
  } catch (err) {
    console.warn('Service Worker registration failed:', err);
    return null;
  }
}

// Check push notifications support
export function isPushNotificationSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'Notification' in window;
}

// Request permission for push notifications
export async function requestPushPermission(): Promise<NotificationPermission> {
  if (!isPushNotificationSupported()) return 'denied';
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await registerPushServiceWorker();
    }
    return permission;
  } catch (err) {
    console.error('Error requesting push permission:', err);
    return 'denied';
  }
}

// Get current push permission status
export function getPushPermission(): NotificationPermission {
  if (!isPushNotificationSupported()) return 'denied';
  return Notification.permission;
}

// Load user push preferences
export function loadPushPreferences(): PushPreferences {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PREFS);
    if (saved) {
      return { ...DEFAULT_PUSH_PREFERENCES, ...JSON.parse(saved) };
    }
  } catch (e) {}
  return DEFAULT_PUSH_PREFERENCES;
}

// Save user push preferences
export function savePushPreferences(prefs: PushPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(prefs));
  } catch (e) {}
}

// Display real push notification on device
export async function triggerDevicePushNotification(
  notification: Pick<AppNotification, 'title' | 'message' | 'type' | 'linkTab'>,
  prefs?: PushPreferences
): Promise<boolean> {
  const currentPrefs = prefs || loadPushPreferences();

  // Filter based on preferences
  if (!currentPrefs.enabled) return false;
  if (notification.type === 'appointment_created' && !currentPrefs.notifyAppointments) return false;
  if (notification.type === 'appointment_cancelled' && !currentPrefs.notifyCancellations) return false;
  if (notification.type === 'order_created' && !currentPrefs.notifyOrders) return false;

  // Sound feedback
  if (currentPrefs.soundEnabled) {
    playNotificationSound();
  }

  // Device vibration if supported
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([150, 80, 150]);
    } catch (_) {}
  }

  // Check if browser notifications are allowed
  if (!isPushNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  const iconUrl = 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=192';
  const tag = `spanath-${notification.type}-${Date.now()}`;

  // Try showing via service worker first (proper PWA background display)
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration && 'showNotification' in registration) {
        await registration.showNotification(notification.title, {
          body: notification.message,
          icon: iconUrl,
          badge: iconUrl,
          tag,
          vibrate: [150, 80, 150],
          data: {
            linkTab: notification.linkTab,
            type: notification.type,
          },
        } as any);
        return true;
      }
    } catch (swErr) {
      console.debug('SW push notification fallback:', swErr);
    }
  }

  // Fallback to standard Notification API
  try {
    const notif = new Notification(notification.title, {
      body: notification.message,
      icon: iconUrl,
      tag,
    });
    notif.onclick = () => {
      window.focus();
      notif.close();
    };
    return true;
  } catch (err) {
    console.debug('Notification API failed:', err);
    return false;
  }
}
