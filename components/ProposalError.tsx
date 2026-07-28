// components/ProposalError.tsx

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ProposalErrorProps {
  message: string;
}

export const ProposalError: React.FC<ProposalErrorProps> = ({ message }) => {
  return (
    <div 
      className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/5 border border-red-500/10 text-red-400 transition-all duration-300" 
      id="proposal-error-banner"
    >
      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
      <div className="space-y-0.5">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-red-500">Pricing Unavailable</h4>
        <p className="text-[10px] font-medium leading-relaxed text-gray-400 uppercase">
          {message}
        </p>
      </div>
    </div>
  );
};

export default ProposalError;
