// components/ProposalCard.tsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { useProposal, UseProposalParams } from '../hooks/useProposal';
import { ProposalStatus } from './ProposalStatus';
import { ProposalLoader } from './ProposalLoader';
import { ProposalError } from './ProposalError';
import { ProposalSummary } from './ProposalSummary';
import { ProposalFormatter } from '../services/ProposalFormatter';

interface ProposalCardProps extends UseProposalParams {}

export const ProposalCard: React.FC<ProposalCardProps> = ({
  symbol,
  contract_type,
  amount,
  basis,
  duration,
  duration_unit,
  barrier,
  currency
}) => {
  const {
    proposal,
    status,
    error,
    lastUpdated,
    profit,
    returnPercentage,
    formattedProfit,
    formattedPayout,
    formattedReturnPercentage,
    formattedLastUpdated
  } = useProposal({
    symbol,
    contract_type,
    amount,
    basis,
    duration,
    duration_unit,
    barrier,
    currency
  });

  // Decide visual flavor (upward/positive vs. downward/negative contracts)
  const isUpward = ['CALL', 'HIGHER', 'TOUCH', 'ONETOUCH'].includes(contract_type.toUpperCase());
  const headerText = `BUY ${isUpward ? 'RISE' : 'FALL'}`;

  return (
    <div 
      className="bg-[#0e121a]/90 border border-white/5 rounded-2xl p-4 space-y-4 shadow-xl relative overflow-hidden" 
      id="proposal-pricing-card"
    >
      {/* Visual Accent Top Bar */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] ${isUpward ? 'bg-emerald-500' : 'bg-red-500'}`} />

      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${isUpward ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            {isUpward ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          </div>
          <span className={`text-xs font-black uppercase tracking-widest ${isUpward ? 'text-emerald-400' : 'text-red-400'}`}>
            {headerText}
          </span>
        </div>
        <ProposalStatus status={status} />
      </div>

      <AnimatePresence mode="wait">
        {status === 'loading' && !proposal ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
          >
            <ProposalLoader />
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="space-y-3"
          >
            <ProposalError message={error} />
            <ProposalSummary 
              proposal={proposal} 
              params={{ symbol, contract_type, amount, basis, duration, duration_unit, barrier, currency }}
              lastUpdated={lastUpdated}
              formattedLastUpdated={formattedLastUpdated}
            />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="space-y-4"
          >
            {/* Primary Pricing Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-gray-500 block">Stake</span>
                <span className="text-sm font-black text-white font-mono">
                  {ProposalFormatter.formatCurrency(amount, currency)}
                </span>
              </div>

              <div className="space-y-1 text-right">
                <span className="text-[10px] font-bold uppercase text-gray-500 block">Estimated Payout</span>
                <span className="text-sm font-black text-white font-mono">
                  {formattedPayout}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-gray-500 block">Estimated Profit</span>
                <span className={`text-sm font-black font-mono ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formattedProfit}
                </span>
              </div>

              <div className="space-y-1 text-right">
                <span className="text-[10px] font-bold uppercase text-gray-500 block">Return</span>
                <span className="text-sm font-black text-emerald-400 font-mono">
                  {formattedReturnPercentage}
                </span>
              </div>
            </div>

            {/* Parameter & Quote Details */}
            <ProposalSummary 
              proposal={proposal} 
              params={{ symbol, contract_type, amount, basis, duration, duration_unit, barrier, currency }}
              lastUpdated={lastUpdated}
              formattedLastUpdated={formattedLastUpdated}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProposalCard;
