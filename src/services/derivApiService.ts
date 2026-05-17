// Fetch environment variables with fallbacks
// Note: In Vite, variables must be prefixed with VITE_ to be available on the client side.
export const OAUTH_CLIENT_ID = import.meta.env.VITE_DERIV_CLIENT_ID || '32FjINZV8sXfdKQcVvnZf';
export const NEW_APP_ID = import.meta.env.VITE_DERIV_APP_ID || '32FjINZV8sXfdKQcVvnZf';
const AFFILIATE_ID = import.meta.env.VITE_AFFILIATE_TOKEN || 'ryvn0GECp3Koq-Eo5YYlgWNd7ZgqdRLk';

/**
 * Dynamically determines the redirect URI based on current environment.
 * Priority: 
 * 1. Explicit VITE_DERIV_REDIRECT_URI environment variable
 * 2. Current window origin + /callback
 */
export const getRedirectUri = () => {
  // 1. Force the exact whitelisted URI provided by the user
  // This ensures no dynamic resolution (which might pick up ais-dev or ais-pre domains)
  // causes a mismatch with Deriv's registered redirect URLs.
  return 'https://bynex-trader-359926978192.us-west1.run.app/callback';
};

const API_BASE_URL = 'https://api.derivws.com';

// ============================================================================
// Types
// ============================================================================
export interface DerivTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

// ============================================================================
// Internal Helpers
// ============================================================================
export const getAuthHeaders = (token: string) => ({
  'Deriv-App-ID': NEW_APP_ID,
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
});

// ============================================================================
// OAuth Flow (Backend Exchange)
// ============================================================================

/**
 * Exchanges an authorization code for an access token using the backend API.
 * This is performed server-side to protect sensitive data like the code_verifier.
 */
export const exchangeCodeForToken = async (code: string, codeVerifier: string): Promise<DerivTokenResponse> => {
  // Use the same redirect URI used to get the authorization code
  const redirectUri = getRedirectUri();
  
  console.log(`[AUTH SERVICE] Exchanging code with redirect_uri: ${redirectUri}`);

  const response = await fetch('/api/deriv/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code,
      code_verifier: codeVerifier,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error || errorData.message || 'Failed to exchange token';
    console.error(`[AUTH SERVICE] Token exchange failed: ${errorMessage}`);
    throw new Error(errorMessage);
  }

  return response.json();
};

// ============================================================================
// Account Management (REST APIs)
// ============================================================================
export const getOtpUrl = async (accountId: string, token: string): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/trading/v1/options/accounts/${accountId}/otp`, {
      method: 'POST',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      if (data.errors && data.errors.length > 0 && data.errors[0].message) {
        throw new Error(data.errors[0].message);
      }
      throw new Error(`Failed to get OTP for WebSocket: ${response.status}`);
    }

    const data = await response.json();
    return data.data.url; 
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch OTP');
  }
};

export const getAccountsInfo = async (token: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/trading/v1/options/accounts`, { 
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      if (data.errors && data.errors.length > 0 && data.errors[0].message) {
        throw new Error(data.errors[0].message);
      }
      throw new Error(`Failed to fetch account info: ${response.status}`);
    }

    const json = await response.json();
    if (!json.data || json.data.length === 0) {
      throw new Error('No accounts found');
    }

    // Map to the shape expected by useDeriv
    return json.data.map((data: any) => ({
      loginid: data.account_id,
      balance: data.balance,
      currency: data.currency,
      email: data.email || '', 
      is_virtual: data.account_type === 'demo',
    }));
  } catch (error: any) {
    throw new Error(error.message || 'Network error fetching account info');
  }
};

export const resetDemoBalanceRest = async (accountId: string, token: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/trading/v1/options/accounts/${accountId}/reset-demo-balance`, {
      method: 'POST',
      headers: getAuthHeaders(token),
    });
    
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      if (data.errors && data.errors.length > 0 && data.errors[0].message) {
        throw new Error(data.errors[0].message);
      }
      throw new Error(`Failed to reset demo balance: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    throw new Error(error.message || 'Network error resetting balance');
  }
};

// ============================================================================
// URL Builders
// ============================================================================
export const generateAuthUrl = (params: {
  codeChallenge: string;
  state: string;
  redirectUri?: string;
  action?: 'login' | 'signup';
}) => {
  // Use the explicitly required redirect URI from user configuration
  const finalRedirectUri = params.redirectUri || getRedirectUri();
  
  // 1. URL strictly as per instructions and DerivApi.txt
  const url = new URL('https://auth.deriv.com/oauth2/auth');
  
  // 2. Set strict parameters using URLSearchParams
  const searchParams = new URLSearchParams({
    response_type: 'code',
    client_id: OAUTH_CLIENT_ID,
    redirect_uri: finalRedirectUri,
    scope: 'trade',
    state: params.state,
    code_challenge: params.codeChallenge,
    code_challenge_method: 'S256'
  });

  // 3. Add Signup specific parameters if needed
  if (params.action === 'signup') {
    searchParams.set('prompt', 'registration');
    // sidc, utm_source, utm_medium, utm_campaign as per "Sign Up" section of docs
    if (AFFILIATE_ID) {
      searchParams.set('sidc', AFFILIATE_ID);
      searchParams.set('utm_source', AFFILIATE_ID);
    }
    searchParams.set('utm_medium', 'affiliate');
    searchParams.set('utm_campaign', 'myaffiliates');
  }

  url.search = searchParams.toString();
  const finalUrl = url.toString();
  
  console.log(`[DERIV AUTH] Generating Redirect. 
    Endpoint: ${url.origin}${url.pathname}
    Mode: ${params.action === 'signup' ? 'SIGNUP' : 'LOGIN'}
    Redirect URI: ${finalRedirectUri}
    State: ${params.state}`);

  return finalUrl;
};
