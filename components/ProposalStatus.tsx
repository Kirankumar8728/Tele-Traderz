// components/ProposalStatus.tsx

import React from 'react';
import { ProposalStatus as StatusType } from '../services/ProposalStore';

interface ProposalStatusProps {
  status: StatusType;
}

export const ProposalStatus: React.FC<ProposalStatusProps> = ({ status }) => {
  const config = {
    connecting: {
      text: 'Connecting...',
      dotClass: 'bg-yellow-500 animate-pulse',
      badgeClass: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/10'
    },
    loading: {
      text: 'Loading Proposal...',
      dotClass: 'bg-blue-500 animate-pulse',
      badgeClass: 'bg-blue-500/10 text-blue-500 border-blue-500/10'
    },
    receiving: {
      text: 'Receiving Live Price...',
      dotClass: 'bg-indigo-500 animate-pulse',
      badgeClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/10'
    },
    live: {
      text: 'Live',
      dotClass: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15'
    },
    reconnecting: {
      text: 'Reconnecting...',
      dotClass: 'bg-orange-500 animate-pulse',
      badgeClass: 'bg-orange-500/10 text-orange-500 border-orange-500/10'
    },
    unavailable: {
      text: 'Pricing Unavailable',
      dotClass: 'bg-red-500',
      badgeClass: 'bg-red-500/10 text-red-500 border-red-500/10'
    }
  };

  const active = config[status] || config.unavailable;

  return (
    <div 
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-wider transition-all duration-300 ${active.badgeClass}`}
      id="proposal-status-badge"
    >
      <span className={`w-1.5 h-1.5 rounded-full ${active.dotClass}`} />
      <span>{active.text}</span>
    </div>
  );
};

export default ProposalStatus;
