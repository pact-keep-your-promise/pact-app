import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export class ApiError extends Error {
  status: number;
  field?: string;
  constructor(message: string, status: number, field?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.field = field;
  }
}

export class NetworkError extends Error {
  constructor(message = 'Network error. Please check your connection.') {
    super(message);
    this.name = 'NetworkError';
  }
}

export const getBaseUrl = () => {
  // EXPO_PUBLIC_API_URL takes priority (set for mobile/tunnel mode)
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    // On Lightning AI, use the proxy URL pattern for port 3000
    const currentUrl = window.location.href;
    if (currentUrl.includes('lightning.ai')) {
      const url = new URL(currentUrl);
      url.searchParams.set('port', '3000');
      url.hash = '';
      return url.toString();
    }
    return 'http://localhost:3000';
  }
  // For iOS simulator
  if (Platform.OS === 'ios') {
    return 'http://localhost:3000';
  }
  // For Android emulator
  return 'http://10.0.2.2:3000';
};

const BASE_URL = getBaseUrl();
const TOKEN_KEY = 'pact_auth_token';

let cachedToken: string | null = null;

export async function getToken(): Promise<string | null> {
  if (cachedToken) return cachedToken;
  cachedToken = await AsyncStorage.getItem(TOKEN_KEY);
  return cachedToken;
}

export async function setToken(token: string): Promise<void> {
  cachedToken = token;
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  cachedToken = null;
  await AsyncStorage.removeItem(TOKEN_KEY);
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
    'Bypass-Tunnel-Reminder': 'true',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Abort after 30 seconds
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
  } catch (err: any) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      throw new NetworkError('Request timed out. Please try again.');
    }
    throw new NetworkError();
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new ApiError(body.error || `HTTP ${res.status}`, res.status, body.field);
  }

  return res.json();
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body?: any) =>
    apiFetch<T>(path, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: <T>(path: string, body?: any) =>
    apiFetch<T>(path, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  del: <T>(path: string) =>
    apiFetch<T>(path, { method: 'DELETE' }),
};
