// services/ProposalStore.ts

import { Proposal } from '../types';

export type ProposalStatus = 
  | 'connecting' 
  | 'loading' 
  | 'receiving' 
  | 'live' 
  | 'reconnecting' 
  | 'unavailable';

export interface ProposalState {
  proposal: Proposal | null;
  status: ProposalStatus;
  error: string | null;
  lastUpdated: number | null;
  params: any | null;
}

export type ProposalStoreListener = (state: ProposalState) => void;

export class ProposalStore {
  private static instance: ProposalStore | null = null;
  private state: ProposalState = {
    proposal: null,
    status: 'connecting',
    error: null,
    lastUpdated: null,
    params: null
  };
  private listeners = new Set<ProposalStoreListener>();

  private constructor() {}

  public static getInstance(): ProposalStore {
    if (!ProposalStore.instance) {
      ProposalStore.instance = new ProposalStore();
    }
    return ProposalStore.instance;
  }

  public getState(): ProposalState {
    return { ...this.state };
  }

  public updateState(updates: Partial<ProposalState>): void {
    this.state = {
      ...this.state,
      ...updates
    };
    this.notify();
  }

  public setProposal(proposal: Proposal | null, params: any): void {
    this.updateState({
      proposal,
      params,
      status: proposal ? 'live' : 'unavailable',
      error: null,
      lastUpdated: proposal ? Date.now() : null
    });
  }

  public setStatus(status: ProposalStatus): void {
    this.updateState({ status });
  }

  public setError(error: string | null): void {
    this.updateState({
      error,
      status: error ? 'unavailable' : this.state.status
    });
  }

  public subscribe(listener: ProposalStoreListener): () => void {
    this.listeners.add(listener);
    // Emit current state immediately on subscription
    listener({ ...this.state });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const currentState = { ...this.state };
    this.listeners.forEach(listener => {
      try {
        listener(currentState);
      } catch (e) {
        console.error('Error notifying ProposalStore listener:', e);
      }
    });
  }

  public clear(): void {
    this.state = {
      proposal: null,
      status: 'connecting',
      error: null,
      lastUpdated: null,
      params: null
    };
    this.notify();
  }
}

export default ProposalStore;
