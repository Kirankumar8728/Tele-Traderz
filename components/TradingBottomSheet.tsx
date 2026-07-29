import React, { useEffect, useRef } from 'react';
import TradeForm from './TradeForm';
import { X, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GestureManager } from '../services/GestureManager';

interface TradingBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  // TradeForm props proxy
  underlying_symbol: string;
  onTrade: (params: any) => void;
  proposals: any;
  subscribeProposal: (params: any) => void;
  clearProposals: () => void;
  clearError: () => void;
  isTrading: boolean;
  balance: number;
  error: string | null;
  isAuthenticated: boolean;
  onLogin: () => void;
  onShowLoginModal: () => void;
  barrier: string;
  onBarrierChange: (barrier: string) => void;
  lastPrice: number;
  tradeType: any;
  onTradeTypeChange: (type: any) => void;
  proposalTrigger?: number;
  currency?: string;
  isConnected?: boolean;
}

export const TradingBottomSheet: React.FC<TradingBottomSheetProps> = ({
  isOpen,
  onClose,
  underlying_symbol,
  onTrade,
  proposals,
  subscribeProposal,
  clearProposals,
  clearError,
  isTrading,
  balance,
  error,
  isAuthenticated,
  onLogin,
  onShowLoginModal,
  barrier,
  onBarrierChange,
  lastPrice,
  tradeType,
  onTradeTypeChange,
  proposalTrigger = 0,
  currency = 'USD',
  isConnected = false,
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && sheetRef.current) {
      const cleanup = GestureManager.getInstance().registerSwipeDown(sheetRef.current, onClose, 80);
      return cleanup;
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[140] flex items-end justify-center select-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        <motion.div
          ref={sheetRef}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="w-full max-w-md bg-[#141922] border-t border-white/10 rounded-t-[2rem] p-4 max-h-[90vh] flex flex-col z-[150] shadow-[0_-8px_32px_rgba(0,0,0,0.5)]"
          style={{ paddingBottom: 'calc(var(--safe-bottom) + 24px)' }}
        >
          {/* Draggable drag indicator handle */}
          <div className="w-12 h-1.5 bg-white/15 rounded-full mx-auto mb-4 cursor-grab active:cursor-grabbing flex-shrink-0" />

          {/* Header */}
          <div className="flex items-center justify-between px-3 mb-2 flex-shrink-0">
            <div>
              <h3 className="text-md font-black italic uppercase tracking-tight text-white flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-red-500" />
                Place Option Order
              </h3>
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-0.5">
                {underlying_symbol} • Spot: {lastPrice.toFixed(4)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white/5 rounded-full hover:bg-white/10 active:scale-95 transition-all"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Scrollable Form Area */}
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <TradeForm
              underlying_symbol={underlying_symbol}
              onTrade={(params) => {
                onTrade(params);
                // Auto close on trade execution success
                setTimeout(() => {
                  if (!error) onClose();
                }, 800);
              }}
              proposals={proposals}
              subscribeProposal={subscribeProposal}
              clearProposals={clearProposals}
              clearError={clearError}
              isTrading={isTrading}
              balance={balance}
              error={error}
              isAuthenticated={isAuthenticated}
              onLogin={onLogin}
              onShowLoginModal={onShowLoginModal}
              barrier={barrier}
              onBarrierChange={onBarrierChange}
              lastPrice={lastPrice}
              tradeType={tradeType}
              onTradeTypeChange={onTradeTypeChange}
              proposalTrigger={proposalTrigger}
              currency={currency}
              isConnected={isConnected}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
export default TradingBottomSheet;
