import { Platform } from 'react-native';
import { api, getBaseUrl } from './client';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Cache the VAPID key after first fetch
let cachedVapidKey: string | null = null;

async function getVapidKey(): Promise<string | null> {
  // Try env var first (baked at build time)
  const envKey = process.env.EXPO_PUBLIC_VAPID_PUBLIC_KEY;
  if (envKey) return envKey;

  // Fall back to API endpoint
  if (cachedVapidKey) return cachedVapidKey;
  try {
    const res = await fetch(`${getBaseUrl()}/push/vapid-public-key`);
    if (!res.ok) return null;
    const data = await res.json();
    cachedVapidKey = data.key || null;
    return cachedVapidKey;
  } catch (e) {
    console.error('[Push] Failed to fetch VAPID key:', e);
    return null;
  }
}

export function isPushSupported(): boolean {
  if (Platform.OS !== 'web') return false;
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export function getPushPermission(): NotificationPermission | null {
  if (!isPushSupported()) return null;
  return Notification.permission;
}

export async function subscribeToPush(): Promise<boolean> {
  if (!isPushSupported()) return false;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.warn('[Push] Permission not granted:', permission);
    return false;
  }

  const vapidKey = await getVapidKey();
  if (!vapidKey) {
    console.error('[Push] No VAPID key available (env var and API both failed)');
    return false;
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidKey),
  });

  const subJson = subscription.toJSON();
  await api.post('/push/subscribe', {
    endpoint: subJson.endpoint,
    keys: {
      p256dh: subJson.keys?.p256dh,
      auth: subJson.keys?.auth,
    },
  });

  return true;
}

export async function unsubscribeFromPush(): Promise<boolean> {
  if (!isPushSupported()) return false;

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return true;

  const subJson = subscription.toJSON();
  await api.post('/push/unsubscribe', { endpoint: subJson.endpoint });
  await subscription.unsubscribe();

  return true;
}

export async function isSubscribedToPush(): Promise<boolean> {
  if (!isPushSupported()) return false;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  return !!subscription;
}
