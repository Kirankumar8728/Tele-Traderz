// hooks/useProposal.ts

import { useState, useEffect, useMemo, useRef } from 'react';
import { ProposalEngine } from '../services/ProposalEngine';
import { ProposalState } from '../services/ProposalStore';

export interface UseProposalParams {
  symbol: string;
  contract_type: string;
  amount: number;
  basis: 'stake' | 'payout';
  duration: number;
  duration_unit: string;
  barrier?: string;
  currency: string;
}

export const useProposal = (params: UseProposalParams) => {
  const engine = useRef(ProposalEngine.getInstance());
  const [state, setState] = useState<ProposalState>(engine.current.getState());

  // Subscribe to ProposalEngine state changes
  useEffect(() => {
    const unsubscribe = engine.current.subscribeToState((newState) => {
      setState(newState);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Track the previous inputs to detect which parameter changed and apply the appropriate debounce
  const prevParamsRef = useRef<UseProposalParams | null>(null);

  useEffect(() => {
    const prev = prevParamsRef.current;
    prevParamsRef.current = params;

    if (!params.symbol || !params.contract_type || !params.amount) {
      return;
    }

    let changeType: 'stake' | 'barrier' | 'immediate' = 'immediate';

    if (prev) {
      const stakeChanged = prev.amount !== params.amount;
      const barrierChanged = prev.barrier !== params.barrier;
      
      if (stakeChanged) {
        changeType = 'stake';
      } else if (barrierChanged) {
        changeType = 'barrier';
      }
    }

    // Trigger proposal update in the engine
    engine.current.requestProposal(params, changeType);

  }, [
    params.symbol,
    params.contract_type,
    params.amount,
    params.basis,
    params.duration,
    params.duration_unit,
    params.barrier,
    params.currency
  ]);

  // Cleanup subscription on unmount
  useEffect(() => {
    return () => {
      engine.current.reset();
    };
  }, []);

  // Calculated values using memoization to prevent rendering calculations from running unnecessarily
  const calculations = useMemo(() => {
    if (!state.proposal) {
      return {
        profit: 0,
        returnPercentage: 0,
        formattedProfit: '--',
        formattedPayout: '--',
        formattedReturnPercentage: '--%',
      };
    }

    const { payout, ask_price } = state.proposal;
    const stake = params.amount;

    const profit = engine.current.calculator.calculateProfit(payout, stake);
    const returnPercentage = engine.current.calculator.calculateReturnPercentage(payout, stake);

    return {
      profit,
      returnPercentage,
      formattedProfit: engine.current.formatter.formatProfit(profit, params.currency),
      formattedPayout: engine.current.formatter.formatCurrency(payout, params.currency),
      formattedReturnPercentage: engine.current.formatter.formatPercentage(returnPercentage),
    };
  }, [state.proposal, params.amount, params.currency]);

  // State mapping for simple consumption
  return {
    proposal: state.proposal,
    status: state.status,
    error: state.error,
    lastUpdated: state.lastUpdated,
    ...calculations,
    formattedLastUpdated: state.lastUpdated ? engine.current.formatter.formatTimestamp(state.lastUpdated) : 'Never',
    engine: engine.current
  };
};

export default useProposal;
