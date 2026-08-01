
import React from 'react';

export enum AppView {
  TRADE = 'TRADE',
  HISTORY = 'HISTORY',
  CASHIER = 'CASHIER',
  P2P = 'P2P',
  WITHDRAW = 'WITHDRAW',
  REFER = 'REFER',
  PROFILE = 'PROFILE',
  MARKETS = 'MARKETS',
  DASHBOARD = 'DASHBOARD',
  ADMIN = 'ADMIN',
  PRIVACY = 'PRIVACY',
  TERMS = 'TERMS',
  DISCLAIMER = 'DISCLAIMER',
  CONTACT = 'CONTACT'
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  method: string;
  details: string;
  status: 'pending' | 'paid' | 'rejected';
  timestamp: number;
  rejectionReason?: string;
}

export type TradeType = 'CALL' | 'PUT' | 'HIGHER' | 'LOWER' | 'TOUCH' | 'NOTOUCH' | 'ONETOUCH';

export type Timeframe = '1t' | '1m' | '2m' | '3m' | '5m' | '10m' | '15m' | '30m' | '1h' | '2h' | '4h' | '8h' | '24h';

export interface Market {
  underlying_symbol: string;
  underlying_symbol_name: string;
  market: string;
  market_display_name?: string;
  submarket: string;
  submarket_display_name?: string;
}

export interface Proposal {
  ask_price: number | string;
  payout: number | string;
  display_value?: string;
  id: string;
  spot?: number | string;
  barrier?: string;
}

export interface DerivAccount {
  balance: number;
  currency: string;
  loginid: string;
  email: string;
  is_virtual: boolean;
}

export interface StatementTransaction {
  action_type: string;
  amount: number;
  balance_after: number;
  contract_id?: number;
  display_name?: string;
  longcode?: string;
  shortcode?: string;
  transaction_id: number;
  transaction_time: number;
}

export interface DerivTick {
  underlying_symbol: string;
  quote: number;
  epoch: number;
  change?: number;
}

export interface TradeHistory {
  contract_id: number;
  underlying_symbol: string;
  buy_price: number;
  sell_price?: number;
  bid_price?: number;
  status: 'open' | 'won' | 'lost' | 'sold' | 'draw' | 'expired' | string;
  type: string;
  entry_tick?: number;
  exit_tick?: number;
  entry_time: number;
  exit_time?: number;
  profit?: number;
  app_id?: number;
  shortcode?: string;
  longcode?: string;
  is_valid_to_sell?: boolean | number;
  isValidToSell?: boolean;
  is_sold?: boolean | number;
  isSold?: boolean;
  is_expired?: boolean | number;
  isExpired?: boolean;
}

export function canSellContract(contract: any): boolean {
  if (!contract) return false;

  // 1. status == "open"
  const status = String(contract.status || '').toLowerCase();
  if (status !== 'open') return false;

  // 2. is_sold == false
  const isSold = contract.is_sold === 1 || contract.is_sold === true || contract.is_sold === '1' || contract.isSold === true;
  if (isSold) return false;

  // 3. is_valid_to_sell == true
  const isValidToSell = contract.is_valid_to_sell === 1 || contract.is_valid_to_sell === true || contract.is_valid_to_sell === '1' || contract.isValidToSell === true;
  if (!isValidToSell) return false;

  // 4. is_expired == false
  const isExpired = contract.is_expired === 1 || contract.is_expired === true || contract.is_expired === '1' || contract.isExpired === true;
  if (isExpired) return false;

  return true;
}

export interface DocLink {
  name: string;
  url: string;
  description: string;
}

export interface DocCategory {
  title: string;
  links: DocLink[];
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  view: AppView;
}

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        showAlert: (message: string) => void;
        isVersionAtLeast: (version: string) => boolean;
        initDataUnsafe: {
          start_param?: string;
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
          };
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
        };
      };
    };
  }
}
