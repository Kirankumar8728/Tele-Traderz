// ============================================================================
// Auth Service
// Centralized authentication logic for Deriv OAuth and Firebase
// ============================================================================

import { getRedirectUri, generateAuthUrl, exchangeCodeForToken } from './derivApiService';

// -- Type Definitions --
export interface DerivAuthState {
  accessToken: string | null;
  expiresAt: number | null;
}

import { sha256 } from 'js-sha256';

// Generate PKCE code verifier and challenge
const getRandomValues = (array: Uint8Array): Uint8Array => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    return window.crypto.getRandomValues(array);
  }
  for (let i = 0; i < array.length; i++) {
    array[i] = Math.floor(Math.random() * 256);
  }
  return array;
};

const generateRandomString = (length: number) => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let randomString = '';
  const randomValues = getRandomValues(new Uint8Array(length));
  for (let i = 0; i < length; i++) {
    randomString += charset[randomValues[i] % charset.length];
  }
  return randomString;
};

const generateCodeChallenge = async (verifier: string) => {
  const hash = (sha256 as any).array(verifier);
  return btoa(String.fromCharCode(...hash))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};
// -- Resilient Storage Configuration & Helpers --
interface StoredItem {
  value: string;
  createdAt: number;
}

const EXPIRATION_MS = 15 * 60 * 1000; // 15 minutes
const isDev = process.env.NODE_ENV !== 'production';

const logDev = (message: string, ...args: any[]) => {
  if (isDev) {
    console.log(`[OAuth Dev] ${message}`, ...args);
  }
};

const getValidStoredItem = (key: string, storage: Storage, storageName: 'sessionStorage' | 'localStorage'): StoredItem | null => {
  const itemStr = storage.getItem(key);
  if (!itemStr) return null;

  try {
    const item = JSON.parse(itemStr);
    
    // 5. Defensive Validation
    if (
      item &&
      typeof item === 'object' &&
      typeof item.value === 'string' &&
      item.value.trim() !== '' &&
      typeof item.createdAt === 'number' &&
      !isNaN(item.createdAt) &&
      item.createdAt > 0
    ) {
      return item;
    } else {
      logDev(`corrupted storage removed: ${key} in ${storageName}`);
      storage.removeItem(key);
    }
  } catch (e) {
    logDev(`corrupted storage removed: ${key} in ${storageName}`);
    storage.removeItem(key);
  }
  return null;
};

export const saveOAuthState = (verifier: string, state: string) => {
  const now = Date.now();
  const stateItem: StoredItem = { value: state, createdAt: now };
  const verifierItem: StoredItem = { value: verifier, createdAt: now };

  const stateStr = JSON.stringify(stateItem);
  const verifierStr = JSON.stringify(verifierItem);

  sessionStorage.setItem('oauth_state', stateStr);
  sessionStorage.setItem('pkce_code_verifier', verifierStr);

  localStorage.setItem('oauth_state', stateStr);
  localStorage.setItem('pkce_code_verifier', verifierStr);

  logDev('OAuth state generated: ' + (state ? `${state.substring(0, 6)}...` : 'none'));
};

export const loadOAuthState = (): { verifier: string | null; state: string | null; expired: boolean } => {
  let stateItem: StoredItem | null = null;
  let verifierItem: StoredItem | null = null;
  let source: 'sessionStorage' | 'localStorage' | null = null;

  // 1. Attempt retrieval from sessionStorage
  stateItem = getValidStoredItem('oauth_state', sessionStorage, 'sessionStorage');
  verifierItem = getValidStoredItem('pkce_code_verifier', sessionStorage, 'sessionStorage');

  if (stateItem && verifierItem) {
    source = 'sessionStorage';
  } else {
    // Clear potentially incomplete/malformed storage in sessionStorage
    sessionStorage.removeItem('oauth_state');
    sessionStorage.removeItem('pkce_code_verifier');
    stateItem = null;
    verifierItem = null;
  }

  // 2. Attempt retrieval from localStorage if sessionStorage is empty/invalid
  if (!stateItem || !verifierItem) {
    stateItem = getValidStoredItem('oauth_state', localStorage, 'localStorage');
    verifierItem = getValidStoredItem('pkce_code_verifier', localStorage, 'localStorage');

    if (stateItem && verifierItem) {
      source = 'localStorage';
    } else {
      // Clear potentially incomplete/malformed storage in localStorage
      localStorage.removeItem('oauth_state');
      localStorage.removeItem('pkce_code_verifier');
      stateItem = null;
      verifierItem = null;
    }
  }

  if (!stateItem || !verifierItem) {
    return { verifier: null, state: null, expired: false };
  }

  // 3. Expiration check (15 minutes limit)
  const now = Date.now();
  const isStateExpired = (now - stateItem.createdAt) > EXPIRATION_MS;
  const isVerifierExpired = (now - verifierItem.createdAt) > EXPIRATION_MS;

  if (isStateExpired || isVerifierExpired) {
    logDev('expired storage removed');
    clearOAuthState();
    return { verifier: null, state: null, expired: true };
  }

  // 4. Storage Synchronization
  if (source === 'localStorage') {
    logDev('OAuth state restored: localStorage');
    sessionStorage.setItem('oauth_state', JSON.stringify(stateItem));
    sessionStorage.setItem('pkce_code_verifier', JSON.stringify(verifierItem));
    logDev('storage synchronization completed');
  } else if (source === 'sessionStorage') {
    logDev('OAuth state restored: sessionStorage');
  }

  return {
    verifier: verifierItem.value,
    state: stateItem.value,
    expired: false
  };
};

export const clearOAuthState = () => {
  sessionStorage.removeItem('oauth_state');
  sessionStorage.removeItem('pkce_code_verifier');
  localStorage.removeItem('oauth_state');
  localStorage.removeItem('pkce_code_verifier');
  sessionStorage.removeItem('auth_return_to');
  logDev('OAuth cleanup completed');
};

export const initiateOAuthFlow = async (action: 'login' | 'signup') => {
  try {
    const verifier = generateRandomString(128);
    const challenge = await generateCodeChallenge(verifier);
    const state = generateRandomString(32);

    // Save state using resilient helper (sessionStorage + localStorage)
    saveOAuthState(verifier, state);

    // Sanitize returnTo
    const currentUrl = new URL(window.location.href);
    const returnParams = new URLSearchParams(currentUrl.search);
    returnParams.delete('code');
    returnParams.delete('state');
    returnParams.delete('error');
    returnParams.delete('error_description');
    
    const sanitizedSearch = returnParams.toString() ? `?${returnParams.toString()}` : '';
    let returnTo = currentUrl.pathname + sanitizedSearch;

    if (returnTo.startsWith('/callback')) {
      returnTo = '/';
    }
    sessionStorage.setItem('auth_return_to', returnTo);

    const redirectUri = getRedirectUri();

    const authUrl = generateAuthUrl({
      codeChallenge: challenge,
      state: state,
      redirectUri: redirectUri,
      action: action
    });

    // Full-page redirect
    window.location.href = authUrl;
    
    return true;
  } catch (error) {
    console.error(`[Auth Service] Could not initiate ${action}`, error);
    throw error;
  }
};

export const handleOAuthCallback = async (
  code: string | null,
  state: string | null,
  errorParam?: string | null
): Promise<{ token: string; expiresAt: number; returnTo: string }> => {
  logDev('Callback URL: ' + window.location.origin + window.location.pathname);
  logDev('Received code: ' + (code ? `${code.substring(0, 6)}...` : 'none'));
  logDev('Received state: ' + (state ? `${state.substring(0, 6)}...` : 'none'));

  if (errorParam) {
    clearOAuthState();
    throw new Error('Authentication cancelled.');
  }

  // 1. Validate authorization code exists
  if (!code) {
    clearOAuthState();
    throw new Error('Missing authorization code.');
  }

  // 2. Validate returned state exists
  if (!state) {
    clearOAuthState();
    throw new Error('Missing OAuth state.');
  }

  // 3. Load stored state and verifier
  const { verifier: codeVerifier, state: storedState, expired } = loadOAuthState();

  if (expired) {
    // loadOAuthState already calls clearOAuthState() if expired
    throw new Error('Your login session has expired. Please try again.');
  }

  // 4. Validate stored state exists
  if (!storedState || !codeVerifier) {
    clearOAuthState();
    throw new Error('Authentication session expired.');
  }

  // 5. Validate returned state == stored state
  if (state !== storedState) {
    logDev('State mismatch', `Received: ${state ? `${state.substring(0, 6)}...` : 'none'}, Stored: ${storedState ? `${storedState.substring(0, 6)}...` : 'none'}`);
    clearOAuthState();
    throw new Error('Invalid authentication state.');
  }

  logDev('OAuth validation passed');

  try {
    logDev('Token exchange started');
    // 6. Exchange code for token via backend
    const tokenData = await exchangeCodeForToken(code, codeVerifier);
    logDev('Token exchange completed');
    
    let returnTo = sessionStorage.getItem('auth_return_to') || '/';
    
    // 7. Clean up PKCE session data ONLY AFTER successful token exchange
    clearOAuthState();
    
    // Strict sanitization for final redirect destination
    try {
      const parsedReturnTo = new URL(returnTo, window.location.origin);
      if (parsedReturnTo.pathname.startsWith('/callback')) {
          returnTo = '/';
      } else {
          returnTo = parsedReturnTo.pathname + parsedReturnTo.search;
      }
    } catch {
      returnTo = '/';
    }
    
    const expiresAt = Date.now() + (tokenData.expires_in - 60) * 1000;

    return {
      token: tokenData.access_token,
      expiresAt,
      returnTo
    };
  } catch (err) {
    // If exchangeCodeForToken() throws an error or returns an unsuccessful response,
    // preserve the PKCE verifier and state while the current authentication attempt
    // is still recoverable, so do NOT call clearOAuthState() here.
    throw err;
  }
};

// We will keep tokens in memory via React context/hook, but if we need a global getter/setter:
let inMemoryToken: string | null = null;
let inMemoryExpiresAt: number | null = null;

export const setInMemoryToken = (token: string, expiresAt: number) => {
  inMemoryToken = token;
  inMemoryExpiresAt = expiresAt;
};

export const getInMemoryToken = () => {
    return {
        accessToken: inMemoryToken,
        expiresAt: inMemoryExpiresAt
    }
};

export const clearInMemoryToken = () => {
  inMemoryToken = null;
  inMemoryExpiresAt = null;
};

// ============================================================================
// Secure Session Recovery
// ============================================================================
export const recoverSession = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/deriv/session', {
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (response.ok) {
      const data = await response.json();
      if (data.access_token && data.expires_at > Date.now()) {
        setInMemoryToken(data.access_token, data.expires_at);
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
};

export const performLogout = async () => {
  clearInMemoryToken();
  const activeAcc = localStorage.getItem('deriv_active_account');
  if (activeAcc) localStorage.removeItem('deriv_active_account');
  
  try {
    await fetch('/api/deriv/logout', { method: 'POST' });
  } catch {
    // Ignore network errors on logout
  }
};
