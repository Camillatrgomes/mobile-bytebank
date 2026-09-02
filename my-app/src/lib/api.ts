import { storage } from './storage';

import { Platform } from 'react-native';

// Use 10.0.2.2 for Android emulator, localhost for Web/iOS
// Change to your machine's IP (e.g. 192.168.1.X) for physical device testing
const isAndroid = Platform.OS === 'android';
export const BASE_URL = isAndroid ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  token?: string | null;
};

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, token } = options;

  // Get token from secure store if not explicitly provided
  const authToken = token !== undefined ? token : await storage.getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let errorMessage = `HTTP ${res.status}`;
    try {
      const errorBody = await res.json();
      errorMessage = errorBody.message || errorBody.error || errorMessage;
    } catch {
      // ignore parse errors
    }
    throw new Error(errorMessage);
  }

  // Handle empty responses (204 No Content)
  const text = await res.text();
  if (!text) return undefined as T;

  return JSON.parse(text) as T;
}
