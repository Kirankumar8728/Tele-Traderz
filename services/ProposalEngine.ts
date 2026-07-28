// services/ProposalEngine.ts

import { ProposalService } from './ProposalService';
import { ProposalStore, ProposalState, ProposalStatus } from './ProposalStore';
import { ProposalCache } from './ProposalCache';
import { ProposalSubscriptionManager } from './ProposalSubscriptionManager';
import { ProposalCalculator } from './ProposalCalculator';
import { ProposalFormatter } from './ProposalFormatter';
import { Proposal } from '../types';

export class ProposalEngine {
  private static instance: ProposalEngine | null = null;
  private service = ProposalService.getInstance();
  private store = ProposalStore.getInstance();
  private cache = ProposalCache.getInstance();
  private subManager = ProposalSubscriptionManager.getInstance();

  private constructor() {
    if (import.meta.env.DEV) {
      console.log('[PROPOSAL_ENGINE] Initialized core modules.');
    }
  }

  public static getInstance(): ProposalEngine {
    if (!ProposalEngine.instance) {
      ProposalEngine.instance = new ProposalEngine();
    }
    return ProposalEngine.instance;
  }

  /**
   * Links the active WebSocket connections into the Proposal Engine.
   */
  public syncWebSockets(publicWs: WebSocket | null, authWs: WebSocket | null): void {
    this.service.setWebSockets(publicWs, authWs);
  }

  /**
   * Triggers a new live proposal request.
   */
  public requestProposal(params: {
    symbol: string;
    contract_type: string;
    amount: number;
    basis: 'stake' | 'payout';
    duration: number;
    duration_unit: string;
    barrier?: string;
    currency: string;
  }, type: 'stake' | 'barrier' | 'immediate' = 'immediate'): void {
    this.subManager.handleParamChange(params, type);
  }

  /**
   * Retrieves the current proposal state from the store.
   */
  public getState(): ProposalState {
    return this.store.getState();
  }

  /**
   * Subscribes to proposal state changes.
   */
  public subscribeToState(listener: (state: ProposalState) => void): () => void {
    return this.store.subscribe(listener);
  }

  /**
   * Manually sets connection statuses (e.g. connecting, reconnecting, unavailable)
   */
  public setStatus(status: ProposalStatus): void {
    this.store.setStatus(status);
  }

  /**
   * Resets and cleans up all active proposals and caches.
   */
  public reset(): void {
    this.subManager.cancelActiveSubscription();
    this.store.clear();
    this.cache.clear();
  }

  // Expose formatting and calculating as static/instance helpers for the UI
  public get formatter() {
    return ProposalFormatter;
  }

  public get calculator() {
    return ProposalCalculator;
  }
}

export default ProposalEngine;
