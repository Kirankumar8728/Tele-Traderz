// components/ProposalLoader.tsx

import React from 'react';
import { motion } from 'framer-motion';

export const ProposalLoader: React.FC = () => {
  return (
    <div className="space-y-3.5 animate-pulse" id="proposal-loader">
      <div className="flex items-center justify-between">
        <div className="h-3.5 w-16 bg-white/10 rounded-md" />
        <div className="h-4 w-24 bg-white/10 rounded-md" />
      </div>
      <div className="flex items-center justify-between">
        <div className="h-3.5 w-20 bg-white/10 rounded-md" />
        <div className="h-4 w-28 bg-white/10 rounded-md" />
      </div>
      <div className="h-px bg-white/5" />
      <div className="flex items-center justify-between">
        <div className="h-3 w-14 bg-white/5 rounded-md" />
        <div className="h-3 w-20 bg-white/5 rounded-md" />
      </div>
      <div className="flex items-center justify-between">
        <div className="h-3 w-16 bg-white/5 rounded-md" />
        <div className="h-3 w-16 bg-white/5 rounded-md" />
      </div>
    </div>
  );
};

export default ProposalLoader;
