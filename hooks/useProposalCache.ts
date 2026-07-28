// hooks/useProposalCache.ts

import { useCallback, useRef } from 'react';
import { ProposalCache, ProposalCacheKey } from '../services/ProposalCache';
import { Proposal } from '../types';

export const useProposalCache = () => {
  const cache = useRef(ProposalCache.getInstance());

  const getCachedProposal = useCallback((key: ProposalCacheKey): Proposal | null => {
    return cache.current.get(key);
  }, []);

  const setCachedProposal = useCallback((key: ProposalCacheKey, proposal: Proposal, ttl?: number): void => {
    cache.current.set(key, proposal, ttl);
  }, []);

  const invalidateCache = useCallback((key: ProposalCacheKey): void => {
    cache.current.invalidate(key);
  }, []);

  const clearCache = useCallback((): void => {
    cache.current.clear();
  }, []);

  return {
    getCachedProposal,
    setCachedProposal,
    invalidateCache,
    clearCache
  };
};

export default useProposalCache;
