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

// Generate PKCE code verifier and challenge safely
const generateRandomString = (length: number) => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let randomString = '';
  try {
    if (typeof window !== 'undefined' && window.crypto && typeof window.crypto.getRandomValues === 'function') {
      const randomValues = new Uint8Array(length);
      window.crypto.getRandomValues(randomValues);
      for (let i = 0; i < length; i++) {
        randomString += charset[randomValues[i] % charset.length];
      }
      return randomString;
    }
  } catch (e) {
    console.warn('[Auth Service] crypto.getRandomValues failed, using Math.random fallback', e);
  }
  
  // Math.random fallback
  randomString = '';
  for (let i = 0; i < length; i++) {
    randomString += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return randomString;
};

const base64UrlEncode = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

// Pure JS SHA-256 implementation for environments where window.crypto.subtle is unavailable (e.g. inside iframes)
function sha256Pure(ascii: string): ArrayBuffer {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  const lengthProperty = 'length';
  let i, j;
  const result: any[] = [];

  const words: any[] = [];
  const asciiLength = ascii[lengthProperty];
  for (let index = 0; index < asciiLength; index++) {
    const code = ascii.charCodeAt(index);
    if (code > 255) {
      throw new Error("Only ASCII characters are supported");
    }
    words[index >> 2] |= code << (24 - (index % 4) * 8);
  }

  // Pre-computed constants
  const hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];
  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  // Append padding
  words[asciiLength >> 2] |= 0x80 << (24 - (asciiLength % 4) * 8);
  const totalWords = ((asciiLength + 8) >> 6) * 16 + 14;
  words[totalWords] = asciiLength * 8;

  for (let chunkOffset = 0; chunkOffset < words.length; chunkOffset += 16) {
    const w = new Array(64);
    for (i = 0; i < 16; i++) {
      w[i] = words[chunkOffset + i] | 0;
    }
    for (i = 16; i < 64; i++) {
      const s0 = rightRotate(w[i - 15], 7) ^ rightRotate(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rightRotate(w[i - 2], 17) ^ rightRotate(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }

    let a = hash[0];
    let b = hash[1];
    let c = hash[2];
    let d = hash[3];
    let e = hash[4];
    let f = hash[5];
    let g = hash[6];
    let h = hash[7];

    for (i = 0; i < 64; i++) {
      const S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + k[i] + w[i]) | 0;
      const S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    hash[0] = (hash[0] + a) | 0;
    hash[1] = (hash[1] + b) | 0;
    hash[2] = (hash[2] + c) | 0;
    hash[3] = (hash[3] + d) | 0;
    hash[4] = (hash[4] + e) | 0;
    hash[5] = (hash[5] + f) | 0;
    hash[6] = (hash[6] + g) | 0;
    hash[7] = (hash[7] + h) | 0;
  }

  const buffer = new ArrayBuffer(32);
  const view = new DataView(buffer);
  for (i = 0; i < 8; i++) {
    view.setInt32(i * 4, hash[i], false);
  }
  return buffer;
}

const generateCodeChallenge = async (verifier: string) => {
  try {
    if (window.crypto && window.crypto.subtle && typeof window.crypto.subtle.digest === 'function') {
      const encoder = new TextEncoder();
      const data = encoder.encode(verifier);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      return base64UrlEncode(hashBuffer);
    }
  } catch (e) {
    console.warn('[Auth Service] Subtle crypto failed, using pure JS fallback', e);
  }

  const hashBuffer = sha256Pure(verifier);
  return base64UrlEncode(hashBuffer);
};
// -- Resilient Storage Configuration & Helpers with In-Memory fallback for Iframes --
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

// In-Memory cache fallback when third-party iframe cookie/storage restrictions are active
const memoryCache: Record<string, string> = {};

const safeStorage = {
  getItem(key: string): string | null {
    try {
      return sessionStorage.getItem(key) || localStorage.getItem(key) || memoryCache[key] || null;
    } catch (e) {
      return memoryCache[key] || null;
    }
  },
  setItem(key: string, value: string) {
    try {
      sessionStorage.setItem(key, value);
    } catch (e) {
      // Ignore security block
    }
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      // Ignore security block
    }
    memoryCache[key] = value;
  },
  removeItem(key: string) {
    try {
      sessionStorage.removeItem(key);
    } catch (e) {
      // Ignore security block
    }
    try {
      localStorage.removeItem(key);
    } catch (e) {
      // Ignore security block
    }
    delete memoryCache[key];
  }
};

const getValidStoredItem = (key: string, storageName: 'sessionStorage' | 'localStorage' | 'memory'): StoredItem | null => {
  const itemStr = safeStorage.getItem(key);
  if (!itemStr) return null;

  try {
    const item = JSON.parse(itemStr);
    
    // Defensive Validation
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
      safeStorage.removeItem(key);
    }
  } catch (e) {
    logDev(`corrupted storage removed: ${key} in ${storageName}`);
    safeStorage.removeItem(key);
  }
  return null;
};

export const saveOAuthState = (verifier: string, state: string) => {
  const now = Date.now();
  const stateItem: StoredItem = { value: state, createdAt: now };
  const verifierItem: StoredItem = { value: verifier, createdAt: now };

  const stateStr = JSON.stringify(stateItem);
  const verifierStr = JSON.stringify(verifierItem);

  safeStorage.setItem('oauth_state', stateStr);
  safeStorage.setItem('pkce_code_verifier', verifierStr);

  logDev('OAuth state generated: ' + (state ? `${state.substring(0, 6)}...` : 'none'));
};

export const loadOAuthState = (): { verifier: string | null; state: string | null; expired: boolean } => {
  const stateItem = getValidStoredItem('oauth_state', 'sessionStorage');
  const verifierItem = getValidStoredItem('pkce_code_verifier', 'sessionStorage');

  if (!stateItem || !verifierItem) {
    return { verifier: null, state: null, expired: false };
  }

  // Expiration check (15 minutes limit)
  const now = Date.now();
  const isStateExpired = (now - stateItem.createdAt) > EXPIRATION_MS;
  const isVerifierExpired = (now - verifierItem.createdAt) > EXPIRATION_MS;

  if (isStateExpired || isVerifierExpired) {
    logDev('expired storage removed');
    clearOAuthState();
    return { verifier: null, state: null, expired: true };
  }

  return {
    verifier: verifierItem.value,
    state: stateItem.value,
    expired: false
  };
};

export const clearOAuthState = () => {
  safeStorage.removeItem('oauth_state');
  safeStorage.removeItem('pkce_code_verifier');
  safeStorage.removeItem('auth_return_to');
  logDev('OAuth cleanup completed');
};

export const initiateOAuthFlow = async (action: 'login' | 'signup') => {
  try {
    const verifier = generateRandomString(128);
    const challenge = await generateCodeChallenge(verifier);
    const state = generateRandomString(32);

    // Save state using resilient helper (with memory fallback)
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
    safeStorage.setItem('auth_return_to', returnTo);

    const redirectUri = getRedirectUri();

    const authUrl = generateAuthUrl({
      codeChallenge: challenge,
      state: state,
      redirectUri: redirectUri,
      action: action
    });

    // Check if running inside an iframe (e.g. AI Studio preview)
    const isIframe = window.self !== window.top;

    if (isIframe) {
      console.log('[Auth Service] Inside iframe context. Initiating popup-based OAuth.');
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      const popup = window.open(
        authUrl,
        'deriv_oauth_popup',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,status=no`
      );

      if (!popup) {
        console.warn('[Auth Service] Popup blocked by browser. Falling back to top window redirect.');
        window.top!.location.href = authUrl;
      }
    } else {
      // Full-page redirect for standalone top window
      window.location.href = authUrl;
    }
    
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
