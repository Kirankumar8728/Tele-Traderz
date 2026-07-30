// Fetch environment variables with fallbacks
// Note: In Vite, variables must be prefixed with VITE_ to be available on the client side.
export const OAUTH_CLIENT_ID = import.meta.env.VITE_DERIV_CLIENT_ID || '32FjINZV8sXfdKQcVvnZf';
const envAppId = import.meta.env.VITE_DERIV_APP_ID;
export const NEW_APP_ID = (envAppId && /^\d+$/.test(envAppId)) ? envAppId : '1089';
const AFFILIATE_ID = import.meta.env.VITE_DERIV_AFFILIATE_ID || import.meta.env.VITE_AFFILIATE_TOKEN;
export const OAUTH_SCOPE =
  import.meta.env.VITE_DERIV_SCOPE ||
  'trade account_manage';
const SIDC = import.meta.env.VITE_DERIV_SIDC;
const UTM_CAMPAIGN = import.meta.env.VITE_DERIV_UTM_CAMPAIGN;

/**
 * Dynamically determines the redirect URI based on current environment.
 */
export const getRedirectUri = () => {
  const configuredUri = import.meta.env.VITE_REDIRECT_URI;

  if (configuredUri) {
    return configuredUri;
  }

  if (typeof window !== 'undefined') {
    return `${window.location.origin}/callback`;
  }

  return 'http://localhost:3000/callback';
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
    if (import.meta.env.DEV) {
      console.error(`[AUTH SERVICE] Token exchange failed: ${errorMessage}`);
    }
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
  } catch (error: unknown) {
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch OTP');
  }
};

export interface DerivAccount {
  loginid: string;
  balance: number;
  currency: string;
  email: string;
  is_virtual: boolean;
}

export const getAccountsInfo = async (token: string): Promise<DerivAccount[]> => {
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
    return json.data.map((data: Record<string, unknown>) => ({
      loginid: String(data.account_id),
      balance: Number(data.balance),
      currency: String(data.currency),
      email: data.email ? String(data.email) : '', 
      is_virtual: data.account_type === 'demo',
    }));
  } catch (error: unknown) {
    throw new Error(error instanceof Error ? error.message : 'Network error fetching account info');
  }
};

export const resetDemoBalanceRest = async (accountId: string, token: string): Promise<Record<string, unknown>> => {
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
  } catch (error: unknown) {
    throw new Error(error instanceof Error ? error.message : 'Network error resetting balance');
  }
};

export const createRealAccountRest = async (
  token: string,
  params: { currency?: string; group?: string; account_type?: 'real' | 'demo' } = {}
): Promise<Record<string, unknown>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/trading/v1/options/accounts`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(token),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currency: params.currency || 'USD',
        group: params.group || 'row',
        account_type: params.account_type || 'real',
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      if (data.errors && data.errors.length > 0 && data.errors[0].message) {
        throw new Error(data.errors[0].message);
      }
      throw new Error(`Failed to create real account: ${response.status}`);
    }

    return await response.json();
  } catch (error: unknown) {
    throw new Error(error instanceof Error ? error.message : 'Network error creating real account');
  }
};

// ============================================================================
// Deriv Wallet Management (REST APIs)
// Specifications: https://staging-developers.deriv.com/llms/wallet-list.md
// and https://staging-developers.deriv.com/llms/wallet-transactions.md
// ============================================================================

export interface WalletCurrencyBalance {
  balance: string;
  input: string;
  output: string;
}

export interface WalletTotalBalance {
  converted_to: string;
  approximate_total_balance: string;
  approximate_total_input: string;
  approximate_total_output: string;
}

export interface Wallet {
  wallet_id: string;
  type: 'main' | 'p2p' | 'partner' | 'payment_agent' | string;
  balances: Record<string, WalletCurrencyBalance>;
  total_balance?: WalletTotalBalance;
}

export interface WalletListResponse {
  data: Wallet[];
}

export interface WalletTransactionMetadata {
  transaction_status: string;
  transaction_gross_amount: string;
  transaction_net_amount: string;
  transaction_currency: string;
  source_client_id?: string;
  source_wallet_type?: string;
  destination_client_id?: string;
  destination_wallet_type?: string;
}

export interface WalletTransaction {
  request_id: string;
  transaction_id: number;
  timestamp: string;
  category: 'deposit' | 'withdrawal' | string;
  channel: 'cashier' | 'payment_agent' | string;
  metadata: WalletTransactionMetadata;
}

export interface WalletTransactionsLinks {
  self: string | null;
  next: string | null;
  prev: string | null;
  first: string | null;
}

export interface WalletTransactionsResponse {
  data: WalletTransaction[];
  links?: WalletTransactionsLinks;
}

/**
 * Lists wallets for the authenticated client using GET /wallet/v1/wallets
 */
export const getWalletList = async (
  token: string,
  conversionCurrency?: string
): Promise<Wallet[]> => {
  try {
    const url = new URL(`${API_BASE_URL}/wallet/v1/wallets`);
    if (conversionCurrency) {
      url.searchParams.set('conversion_currency', conversionCurrency);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      if (data.errors && data.errors.length > 0 && data.errors[0].message) {
        throw new Error(data.errors[0].message);
      }
      throw new Error(`Failed to fetch wallet list: ${response.status}`);
    }

    const json: WalletListResponse = await response.json();
    return json.data || [];
  } catch (error: unknown) {
    throw new Error(error instanceof Error ? error.message : 'Network error fetching wallet list');
  }
};

/**
 * Lists transactions for a specific wallet type using GET /wallet/v1/transactions/{wallet_type}
 */
export const getWalletTransactions = async (
  token: string,
  walletType: string = 'main',
  params?: {
    request_id?: string;
    transaction_currency?: string;
    start_date_time?: string;
    end_date_time?: string;
    page_cursor?: string;
    limit?: number;
  }
): Promise<WalletTransactionsResponse> => {
  try {
    const url = new URL(`${API_BASE_URL}/wallet/v1/transactions/${walletType}`);
    if (params) {
      if (params.request_id) url.searchParams.set('request_id', params.request_id);
      if (params.transaction_currency) url.searchParams.set('transaction_currency', params.transaction_currency);
      if (params.start_date_time) url.searchParams.set('start_date_time', params.start_date_time);
      if (params.end_date_time) url.searchParams.set('end_date_time', params.end_date_time);
      if (params.page_cursor) url.searchParams.set('page_cursor', params.page_cursor);
      if (params.limit) url.searchParams.set('limit', params.limit.toString());
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      if (data.errors && data.errors.length > 0 && data.errors[0].message) {
        throw new Error(data.errors[0].message);
      }
      throw new Error(`Failed to fetch wallet transactions: ${response.status}`);
    }

    return await response.json();
  } catch (error: unknown) {
    throw new Error(error instanceof Error ? error.message : 'Network error fetching wallet transactions');
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
  
  // 1. URL strictly as per instructions and DerivApi.txt / AGENTS.md guidelines
  const url = new URL('https://auth.deriv.com/oauth2/auth');
  
  // 2. Set strict parameters using URLSearchParams
  const searchParams = new URLSearchParams({
    response_type: 'code',
    client_id: OAUTH_CLIENT_ID,
    app_id: OAUTH_CLIENT_ID,
    redirect_uri: finalRedirectUri,
    scope: OAUTH_SCOPE,
    state: params.state,
    code_challenge: params.codeChallenge,
    code_challenge_method: 'S256',
    utm_source: 'Bynex'
  });

  // 3. Add Signup specific parameters if needed
  if (params.action === 'signup') {
    // Open Deriv registration form
    searchParams.set('prompt', 'registration');

    // Official affiliate parameters
    if (AFFILIATE_ID) {
      searchParams.set('t', AFFILIATE_ID);
    }

    if (SIDC) {
      searchParams.set('sidi', SIDC);
      searchParams.set('sidc', SIDC);
    }

    searchParams.set('utm_medium', 'affiliate');

    // Optional campaign tracking
    const finalCampaignObj = import.meta.env.VITE_UTM_CAMPAIGN || UTM_CAMPAIGN;
    if (finalCampaignObj) {
      searchParams.set('utm_campaign', finalCampaignObj);
    }
  }

  url.search = searchParams.toString();
  return url.toString();
};

/**
 * Parses and validates the OAuth callback parameters from window.location.
 */
export const parseOAuthCallback = () => {
  const params = new URLSearchParams(window.location.search);

  const code = params.get('code');
  const state = params.get('state');
  const error = params.get('error');
  const errorDescription = params.get('error_description');

  return {
    code,
    state,
    error,
    errorDescription,
  };
};
