// services/ProposalSubscriptionManager.ts

import { ProposalService } from './ProposalService';
import { ProposalStore } from './ProposalStore';
import { ProposalCache, ProposalCacheKey } from './ProposalCache';
import { Proposal } from '../types';

export class ProposalSubscriptionManager {
  private static instance: ProposalSubscriptionManager | null = null;
  private service = ProposalService.getInstance();
  private store = ProposalStore.getInstance();
  private cache = ProposalCache.getInstance();

  private activeSubscriptionId: string | null = null;
  private activeSubscriptionType: string | null = null;
  private activeParams: any = null;
  
  private lastSentReqId = 0;
  private currentActiveReqId = 0;

  // Timers for input debouncing
  private stakeDebounceTimer: NodeJS.Timeout | null = null;
  private barrierDebounceTimer: NodeJS.Timeout | null = null;

  private cleanupCallback: (() => void) | null = null;

  private constructor() {
    this.cleanupCallback = this.service.registerCallback(this.handleWsMessage.bind(this));
  }

  public static getInstance(): ProposalSubscriptionManager {
    if (!ProposalSubscriptionManager.instance) {
      ProposalSubscriptionManager.instance = new ProposalSubscriptionManager();
    }
    return ProposalSubscriptionManager.instance;
  }

  /**
   * Automatically requests a new proposal when any parameter changes, with optimal input debouncing.
   */
  public handleParamChange(params: {
    symbol: string;
    contract_type: string;
    amount: number;
    basis: 'stake' | 'payout';
    duration: number;
    duration_unit: string;
    barrier?: string;
    currency: string;
  }, changedParam: 'stake' | 'barrier' | 'immediate') {
    
    // Clear existing debouncing timers
    if (this.stakeDebounceTimer) {
      clearTimeout(this.stakeDebounceTimer);
      this.stakeDebounceTimer = null;
    }
    if (this.barrierDebounceTimer) {
      clearTimeout(this.barrierDebounceTimer);
      this.barrierDebounceTimer = null;
    }

    if (changedParam === 'stake') {
      // Stake changes are debounced for 350ms to allow typing
      this.stakeDebounceTimer = setTimeout(() => {
        this.executeSubscription(params);
      }, 350);
    } else if (changedParam === 'barrier') {
      // Barrier changes are debounced for 300ms
      this.barrierDebounceTimer = setTimeout(() => {
        this.executeSubscription(params);
      }, 300);
    } else {
      // All other parameter changes (Duration, Contract, Market, Currency, Basis) are immediate
      this.executeSubscription(params);
    }
  }

  /**
   * Executes the proposal subscription, handling caching and old subscription cancellation.
   */
  private executeSubscription(params: {
    symbol: string;
    contract_type: string;
    amount: number;
    basis: 'stake' | 'payout';
    duration: number;
    duration_unit: string;
    barrier?: string;
    currency: string;
  }) {
    // Check cache first to see if we have a fresh layout
    const cacheKey: ProposalCacheKey = {
      symbol: params.symbol,
      contract_type: params.contract_type,
      amount: params.amount,
      basis: params.basis,
      barrier: params.barrier,
      currency: params.currency,
      duration: params.duration,
      duration_unit: params.duration_unit
    };

    const cached = this.cache.get(cacheKey);
    if (cached) {
      if (import.meta.env.DEV) {
        console.log('[SUBSCRIPTION_MANAGER] Serving proposal from cache:', cached);
      }
      this.store.setProposal(cached, params);
      return;
    }

    // Check if parameters are identical to the active subscription to prevent duplicate subscription spam
    const isSameParams = this.activeParams && JSON.stringify(this.activeParams) === JSON.stringify(params);
    if (isSameParams && this.activeSubscriptionId) {
      return;
    }

    // Set loading state in the store
    this.store.setStatus('loading');

    // Clean up previous subscription before opening a new one
    this.cancelActiveSubscription();

    // Generate a fresh unique request ID for tracking
    const reqId = ++this.lastSentReqId;
    this.currentActiveReqId = reqId;
    this.activeParams = params;

    // Build payload conforming to Deriv API specification
    const payload: any = {
      proposal: 1,
      subscribe: 1,
      amount: params.amount,
      basis: params.basis,
      contract_type: params.contract_type.toUpperCase(),
      currency: params.currency || 'USD',
      duration: params.duration,
      duration_unit: params.duration_unit,
      req_id: reqId
    };

    // Use underlying_symbol for live prod endpoints
    payload.underlying_symbol = params.symbol;

    if (params.barrier) {
      payload.barrier = params.barrier;
    }

    if (import.meta.env.DEV) {
      console.log('[SUBSCRIPTION_MANAGER] Initiating proposal subscription:', payload);
    }

    const sent = this.service.send(payload);
    if (!sent) {
      this.store.setError('WebSocket is disconnected. Reconnecting...');
      this.store.setStatus('connecting');
    }
  }

  /**
   * Unsubscribes from the active contract stream using Deriv's forget mechanism.
   */
  public cancelActiveSubscription() {
    if (this.activeSubscriptionId) {
      if (import.meta.env.DEV) {
        console.log('[SUBSCRIPTION_MANAGER] Forgetting subscription:', this.activeSubscriptionId);
      }
      this.service.forget(this.activeSubscriptionId);
      this.activeSubscriptionId = null;
    }
    this.activeParams = null;
  }

  /**
   * Processes incoming proposal updates.
   */
  private handleWsMessage(data: any) {
    const isOurReq = data.echo_req?.req_id === this.currentActiveReqId;

    if (data.msg_type === 'proposal') {
      // 1. Check if the response matches our active request to ignore outdated or cancelled responses
      if (!isOurReq && this.currentActiveReqId !== 0) {
        if (import.meta.env.DEV) {
          console.warn('[SUBSCRIPTION_MANAGER] Ignoring outdated proposal response:', data.echo_req?.req_id);
        }
        return;
      }

      if (data.error) {
        this.store.setError(data.error.message || 'Error fetching proposal');
        return;
      }

      const p = data.proposal;
      if (!p) return;

      // Update active subscription details
      this.activeSubscriptionId = p.id;
      this.activeSubscriptionType = data.echo_req?.contract_type;

      const proposalResult: Proposal = {
        id: p.id,
        ask_price: p.ask_price,
        payout: p.payout,
        display_value: p.display_value || p.ask_price,
        spot: p.spot,
        barrier: p.barrier
      };

      // Store in Cache
      if (this.activeParams) {
        const cacheKey: ProposalCacheKey = {
          symbol: this.activeParams.symbol,
          contract_type: this.activeParams.contract_type,
          amount: this.activeParams.amount,
          basis: this.activeParams.basis,
          barrier: this.activeParams.barrier,
          currency: this.activeParams.currency,
          duration: this.activeParams.duration,
          duration_unit: this.activeParams.duration_unit
        };
        this.cache.set(cacheKey, proposalResult);
      }

      // Update global Proposal Store
      this.store.setProposal(proposalResult, this.activeParams);
    } 
    else if (data.error && data.echo_req?.proposal === 1) {
      if (!isOurReq) return;
      this.store.setError(data.error.message || 'Pricing Unavailable');
    }
  }

  public destroy() {
    if (this.cleanupCallback) {
      this.cleanupCallback();
    }
    if (this.stakeDebounceTimer) clearTimeout(this.stakeDebounceTimer);
    if (this.barrierDebounceTimer) clearTimeout(this.barrierDebounceTimer);
    this.cancelActiveSubscription();
    this.activeParams = null;
    this.currentActiveReqId = 0;
  }
}

export default ProposalSubscriptionManager;
