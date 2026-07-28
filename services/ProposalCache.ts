// services/ProposalCache.ts

import { Proposal } from '../types';

export interface ProposalCacheKey {
  symbol: string;
  contract_type: string;
  amount: number;
  basis: 'stake' | 'payout';
  barrier?: string;
  currency: string;
  duration: number;
  duration_unit: string;
}

export interface ProposalCacheEntry {
  proposal: Proposal;
  timestamp: number;
  expiresAt: number;
}

export class ProposalCache {
  private static instance: ProposalCache | null = null;
  private cache = new Map<string, ProposalCacheEntry>();
  private defaultTTL = 3000; // 3 seconds TTL as a standard midpoint between 2-5s

  private constructor() {}

  public static getInstance(): ProposalCache {
    if (!ProposalCache.instance) {
      ProposalCache.instance = new ProposalCache();
    }
    return ProposalCache.instance;
  }

  public serializeKey(key: ProposalCacheKey): string {
    return [
      key.symbol.toLowerCase(),
      key.contract_type.toUpperCase(),
      key.amount.toFixed(2),
      key.basis.toLowerCase(),
      (key.barrier || '').trim(),
      key.currency.toUpperCase(),
      key.duration,
      key.duration_unit.toLowerCase()
    ].join('|');
  }

  public get(key: ProposalCacheKey): Proposal | null {
    const serialized = this.serializeKey(key);
    const entry = this.cache.get(serialized);

    if (!entry) return null;

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(serialized);
      return null;
    }

    return entry.proposal;
  }

  public set(key: ProposalCacheKey, proposal: Proposal, ttl: number = this.defaultTTL): void {
    const serialized = this.serializeKey(key);
    const now = Date.now();
    this.cache.set(serialized, {
      proposal,
      timestamp: now,
      expiresAt: now + ttl
    });
  }

  public invalidate(key: ProposalCacheKey): void {
    const serialized = this.serializeKey(key);
    this.cache.delete(serialized);
  }

  public clear(): void {
    this.cache.clear();
  }

  // Cleanup expired items to prevent memory leaks
  public prune(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

export default ProposalCache;
