// components/ProposalSummary.tsx

import React from 'react';
import { Proposal } from '../types';
import { ProposalFormatter } from '../services/ProposalFormatter';

interface ProposalSummaryProps {
  proposal: Proposal | null;
  params: {
    symbol: string;
    contract_type: string;
    amount: number;
    basis: 'stake' | 'payout';
    duration: number;
    duration_unit: string;
    barrier?: string;
    currency: string;
  } | null;
  lastUpdated: number | null;
  formattedLastUpdated: string;
}

export const ProposalSummary: React.FC<ProposalSummaryProps> = ({
  proposal,
  params,
  lastUpdated,
  formattedLastUpdated
}) => {
  if (!params) return null;

  // Pretty print contract types
  const getContractName = (type: string) => {
    switch (type.toUpperCase()) {
      case 'CALL': return 'Rise';
      case 'PUT': return 'Fall';
      case 'HIGHER': return 'Higher';
      case 'LOWER': return 'Lower';
      case 'TOUCH': return 'Touch';
      case 'NOTOUCH': return 'No Touch';
      case 'ONETOUCH': return 'One Touch';
      default: return type;
    }
  };

  const getDurationUnitName = (unit: string, qty: number) => {
    const isPlural = qty !== 1;
    switch (unit.toLowerCase()) {
      case 't': return isPlural ? 'Ticks' : 'Tick';
      case 'm': return isPlural ? 'Minutes' : 'Minute';
      case 'h': return isPlural ? 'Hours' : 'Hour';
      case 'd': return isPlural ? 'Days' : 'Day';
      default: return unit;
    }
  };

  return (
    <div className="space-y-2 border-t border-white/5 pt-3 text-[10px] uppercase font-bold text-gray-500" id="proposal-summary-grid">
      <div className="grid grid-cols-2 gap-y-2">
        <div className="flex justify-between pr-2.5 border-r border-white/5">
          <span>Contract</span>
          <span className="text-white font-black">{getContractName(params.contract_type)}</span>
        </div>
        <div className="flex justify-between pl-2.5">
          <span>Duration</span>
          <span className="text-white font-black">
            {params.duration} {getDurationUnitName(params.duration_unit, params.duration)}
          </span>
        </div>

        {params.barrier && (
          <div className="flex justify-between pr-2.5 border-r border-white/5">
            <span>Barrier</span>
            <span className="text-white font-black">{params.barrier}</span>
          </div>
        )}

        <div className={`flex justify-between ${params.barrier ? 'pl-2.5' : 'pr-2.5 border-r border-white/5'}`}>
          <span>Currency</span>
          <span className="text-white font-black">{params.currency || 'USD'}</span>
        </div>

        {proposal?.spot && (
          <div className={`flex justify-between ${params.barrier ? 'col-span-2 border-t border-white/5 pt-2' : 'pl-2.5'}`}>
            <span>Current Quote</span>
            <span className="text-white font-black font-mono">
              {parseFloat(proposal.spot.toString()).toLocaleString('en-US', {
                minimumFractionDigits: 4,
                maximumFractionDigits: 5
              })}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[9px] text-gray-600 font-bold border-t border-white/5 pt-2">
        <span>Last Updated</span>
        <span>{formattedLastUpdated}</span>
      </div>
    </div>
  );
};

export default ProposalSummary;
