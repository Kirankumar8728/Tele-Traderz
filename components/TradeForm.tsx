import React, { useState, useEffect, useRef } from 'react';
import { TradeType, Timeframe, Proposal } from '../types';
import { TrendingUp, TrendingDown, Target, ShieldAlert, ChevronDown, Settings, Loader2 } from 'lucide-react';
import { getCurrencyConfig } from '../constants';
import { ProposalCard } from './ProposalCard';

interface TradeFormProps {
  underlying_symbol: string;
  onTrade: (params: any) => void;
  proposals: Record<string, Proposal>;
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
  tradeType: TradeType;
  onTradeTypeChange: (type: TradeType) => void;
  proposalTrigger?: number;
  currency?: string;
  isConnected?: boolean;
  compact?: boolean;
}

const TradeForm: React.FC<TradeFormProps> = ({ 
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
  compact = false
}) => {
  const [stake, setStake] = useState(10);
  const [basis, setBasis] = useState<'stake' | 'payout'>('stake');
  const [duration, setDuration] = useState(2);
  const [durationUnit, setDurationUnit] = useState<'t' | 's' | 'm' | 'h' | 'd'>('m');
  const config = getCurrencyConfig(currency);

  // Auto-close error message after 6 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  // Subscribe to live proposals with "forget-then-subscribe" logic
  // Deriv automatically deducts the dashboard markup from the payout for this App ID
  useEffect(() => {
    // Reset last ID ref when inputs change to allow fresh trades
    lastIdRef.current = null;

    // Subscribe even when not authenticated to show public payout preview
    if (!isConnected) return;
    
    const getTypes = () => {
      if (tradeType === 'CALL') return ['CALL', 'PUT'];
      if (tradeType === 'HIGHER') return ['HIGHER', 'LOWER'];
      if (tradeType === 'TOUCH') return ['ONETOUCH', 'NOTOUCH'];
      return [tradeType];
    };

    const fetchProposals = () => {
      const types = getTypes();
      types.forEach(type => {
        const params: any = {
          symbol: underlying_symbol,
          contract_type: type,
          amount: stake,
          basis,
          duration,
          duration_unit: durationUnit,
        };

        if (['HIGHER', 'LOWER', 'TOUCH', 'NOTOUCH', 'ONETOUCH'].includes(type) && barrier) {
          params.barrier = barrier;
        }

        subscribeProposal(params);
      });
    };

    // If it's a trigger from a trade, do it faster
    const isManualTrigger = proposalTrigger > 0;
    const delay = isManualTrigger ? 50 : 200;

    const timer = setTimeout(fetchProposals, delay);
    return () => clearTimeout(timer);
  }, [underlying_symbol, tradeType, stake, basis, duration, durationUnit, barrier, proposalTrigger, isConnected, isAuthenticated]);

  const [buyingTypes, setBuyingTypes] = useState<Set<string>>(new Set());
  const lastIdRef = useRef<string | null>(null);

  const handleTrade = (type: string) => {
    if (!isAuthenticated) {
      onShowLoginModal();
      return;
    }
    clearError();
    const proposal = proposals[type];
    
    // Prevent multiple clicks on the same proposal ID or while still sending previous one
    if (!proposal?.id || proposal.id === lastIdRef.current || buyingTypes.has(type)) {
      return;
    }

    lastIdRef.current = proposal.id;
    setBuyingTypes(prev => {
      const next = new Set(prev);
      next.add(type);
      return next;
    });
    
    onTrade({
      buy: proposal.id,
      price: parseFloat(proposal.ask_price.toString()),
      passthrough: { manual: true, type }
    });
  };

  // Clear buying state when isTrading becomes false
  useEffect(() => {
    if (!isTrading) {
      setBuyingTypes(new Set());
    }
  }, [isTrading]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    }).format(val);
  };

  // Note: The payout displayed here is fetched directly from Deriv. 
  // Any markup (commission) configured in the Deriv Developer Dashboard for this App ID 
  // is automatically applied by the Deriv API to the payout and ask_price returned.
  
  const getProfitSummary = (proposal: Proposal | undefined) => {
    if (!proposal || !proposal.payout || !proposal.ask_price) return null;
    try {
      const payout = parseFloat(proposal.payout.toString());
      const askPrice = parseFloat(proposal.ask_price.toString());
      if (askPrice === 0) return null;
      
      const netProfit = payout - askPrice;
      const percentage = ((netProfit / askPrice) * 100).toFixed(0);
      
      return {
        amount: formatCurrency(netProfit),
        percentage: `${percentage}%`
      };
    } catch (e) {
      return null;
    }
  };

  const calculatePayout = (proposal: Proposal | undefined) => {
    if (!proposal || !proposal.payout || !proposal.ask_price) return '--';
    try {
      const payout = parseFloat(proposal.payout.toString());
      const askPrice = parseFloat(proposal.ask_price.toString());
      if (askPrice === 0) return '--';
      
      const netProfit = payout - askPrice;
      const percentage = ((netProfit / askPrice) * 100).toFixed(2);
      
      return `${formatCurrency(netProfit)} (+${percentage}%)`;
    } catch (e) {
      return '--';
    }
  };

  const getReturnPercentage = (proposal: Proposal | undefined) => {
    if (!proposal || !proposal.payout || !proposal.ask_price) return null;
    try {
      const payout = parseFloat(proposal.payout.toString());
      const askPrice = parseFloat(proposal.ask_price.toString());
      if (askPrice === 0) return null;

      const netProfit = payout - askPrice;
      return ((netProfit / askPrice) * 100).toFixed(0);
    } catch (e) {
      return null;
    }
  };

  const getButtonData = (side: 'up' | 'down') => {
    if (tradeType === 'CALL') {
      const type = side === 'up' ? 'CALL' : 'PUT';
      return {
        type,
        label: side === 'up' ? 'Rise' : 'Fall',
        proposal: proposals[type]
      };
    }
    if (tradeType === 'HIGHER') {
      const type = side === 'up' ? 'HIGHER' : 'LOWER';
      return {
        type,
        label: side === 'up' ? 'Higher' : 'Lower',
        proposal: proposals[type]
      };
    }
    if (tradeType === 'TOUCH') {
      const type = side === 'up' ? 'ONETOUCH' : 'NOTOUCH';
      return {
        type,
        label: side === 'up' ? 'Touch' : 'No Touch',
        proposal: proposals[type]
      };
    }
    return { type: tradeType, label: tradeType, proposal: proposals[tradeType] };
  };

  const upData = getButtonData('up');
  const downData = getButtonData('down');

  const [previewType, setPreviewType] = useState<string>('');

  useEffect(() => {
    if (upData?.type) {
      setPreviewType(upData.type);
    }
  }, [tradeType, upData?.type]);

  return (
    <div className={`z-30 ${compact ? 'space-y-2 p-0.5' : 'space-y-5 p-2.5 bg-[#0c0f17] rounded-3xl border border-white/5 shadow-2xl'}`}>
      {/* Trading Error Display (Moved Above Form) */}
      {error && (
        <div 
          id="table-error-msg" 
          className="bg-rose-500/10 text-rose-400 border border-rose-500/15 p-2.5 rounded-xl text-xs text-center font-bold animate-in fade-in slide-in-from-top-1 duration-300"
        >
          {error}
        </div>
      )}

      {/* Trade Type Selector */}
      <div className={`flex ${compact ? 'gap-1' : 'gap-1.5'} overflow-x-auto no-scrollbar pb-0.5`}>
        {[
          { id: 'CALL', label: 'Rise/Fall', icon: <TrendingUp className={compact ? "w-3 h-3" : "w-3.5 h-3.5"} /> },
          { id: 'HIGHER', label: 'Higher/Lower', icon: <TrendingUp className={compact ? "w-3 h-3" : "w-3.5 h-3.5"} /> },
          { id: 'TOUCH', label: 'Touch/No Touch', icon: <Target className={compact ? "w-3 h-3" : "w-3.5 h-3.5"} /> },
        ].map(type => (
          <button
            key={type.id}
            onClick={() => onTradeTypeChange(type.id as TradeType)}
            className={`flex items-center ${compact ? 'gap-1 px-3 py-1.5 text-[9px]' : 'gap-1.5 px-4 py-2.5 text-[10.5px]'} rounded-full font-black uppercase whitespace-nowrap transition-all border ${
              tradeType === type.id
                ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/15' 
                : 'bg-white/[0.03] border-white/5 text-gray-400 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            {type.icon}
            {type.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {/* Stake / Payout Input */}
        <div className={`bg-white/[0.02] hover:bg-white/[0.04] ${compact ? 'rounded-xl p-2' : 'rounded-2xl p-3'} border border-white/5 flex flex-col justify-between transition-colors`}>
          <div className="flex justify-between items-center mb-1">
            <span className={`block ${compact ? 'text-[7.5px]' : 'text-[8.5px]'} font-black text-gray-500 uppercase tracking-widest`}>
              STAKE ({currency})
            </span>
            <button
              onClick={() => setBasis(b => b === 'stake' ? 'payout' : 'stake')}
              className={`${compact ? 'text-[7.5px] px-2 py-0.5' : 'text-[8.5px] px-2.5 py-0.5'} font-black text-red-500 hover:text-red-400 uppercase tracking-wide bg-red-500/10 hover:bg-red-500/20 rounded-full transition-all`}
            >
              Set {basis === 'stake' ? 'Payout' : 'Stake'}
            </button>
          </div>
          <input 
            type="number" 
            min={config.min}
            step={config.step}
            value={stake} 
            onChange={(e) => setStake(Math.max(0, parseFloat(e.target.value) || 0))}
            className={`w-full bg-transparent ${compact ? 'text-xs' : 'text-sm'} font-mono font-extrabold text-white outline-none mt-1`} 
          />
        </div>

        {/* Duration Input */}
        <div className={`bg-white/[0.02] hover:bg-white/[0.04] ${compact ? 'rounded-xl p-2' : 'rounded-2xl p-3'} border border-white/5 flex justify-between items-center transition-colors`}>
          <div className="flex-1">
            <span className={`block ${compact ? 'text-[7.5px]' : 'text-[8.5px]'} font-black text-gray-400 uppercase mb-1 tracking-widest`}>DURATION</span>
            <input 
              type="number" 
              min="1"
              value={duration} 
              onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
              className={`w-full bg-transparent ${compact ? 'text-xs' : 'text-sm'} font-mono font-extrabold text-white outline-none mt-1`} 
            />
          </div>
          <div className="relative flex items-center gap-1">
            <select 
              value={durationUnit}
              onChange={(e) => setDurationUnit(e.target.value as any)}
              className={`bg-transparent ${compact ? 'text-[9px]' : 'text-[10px]'} font-black text-red-500 uppercase outline-none cursor-pointer pr-4 appearance-none text-right select-none`}
            >
              <option value="t" className="bg-[#0c0f17]">TICKS</option>
              <option value="s" className="bg-[#0c0f17]">SEC</option>
              <option value="m" className="bg-[#0c0f17]">MIN</option>
              <option value="h" className="bg-[#0c0f17]">HOURS</option>
              <option value="d" className="bg-[#0c0f17]">DAYS</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-red-500 absolute right-0 pointer-events-none stroke-[3px]" />
          </div>
        </div>

        {/* Barrier Input (Conditional) */}
        {['HIGHER', 'LOWER', 'TOUCH', 'NOTOUCH', 'ONETOUCH'].includes(tradeType) && (
          <div className={`col-span-2 bg-white/[0.02] hover:bg-white/[0.04] ${compact ? 'rounded-xl p-2' : 'rounded-2xl p-3'} border border-white/5 flex flex-col justify-between transition-colors`}>
            <div className="flex justify-between items-center mb-1">
              <span className={`text-[8.5px] ${compact ? 'text-[7.5px]' : ''} font-black text-gray-500 uppercase tracking-widest`}>
                Barrier {barrier.match(/^[+-]/) ? 'Offset' : 'Level'}
              </span>
              <span className="text-[9px] font-mono font-bold text-gray-400 bg-white/5 px-2 py-0.5 rounded-lg border border-white/5">
                Spot: {lastPrice.toFixed(4)}
              </span>
            </div>
            <div className="relative flex items-center">
              <input 
                type="text" 
                value={barrier} 
                onChange={(e) => onBarrierChange(e.target.value)}
                className={`w-full bg-transparent ${compact ? 'text-xs' : 'text-sm'} font-mono font-extrabold text-white outline-none placeholder-gray-700`} 
                placeholder="+0.00 or 1234.56"
              />
              {/* Calculated Level Display */}
              {barrier.match(/^[+-]/) && lastPrice > 0 && !isNaN(parseFloat(barrier)) && (
                <div className="text-[9px] font-mono font-extrabold text-gray-400 ml-2 whitespace-nowrap bg-red-600/10 border border-red-500/10 px-2 py-0.5 rounded-lg">
                  = {(lastPrice + parseFloat(barrier)).toFixed(4)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Trade Buttons & Details Layout */}
      <div className={`flex ${compact ? 'gap-2' : 'gap-4'}`}>
        {/* RISE (Call) Column */}
        <div className={`flex-1 flex flex-col ${compact ? 'gap-1' : 'gap-2.5'}`}>
          {/* Estimate Details */}
          <div className="grid grid-cols-2 gap-1 px-1 text-[9px] font-bold text-gray-400">
            <div className="flex flex-col text-left">
              <span className={`${compact ? 'text-[7px]' : 'text-[7.5px]'} text-gray-500 uppercase tracking-widest font-black`}>Est. Payout</span>
              <span className={`${compact ? 'text-[10px]' : 'text-[11px]'} font-mono font-extrabold text-emerald-400 mt-0.5`}>
                {basis === 'stake' 
                  ? (upData.proposal?.payout ? formatCurrency(parseFloat(upData.proposal.payout.toString())) : '--')
                  : (upData.proposal?.ask_price ? formatCurrency(parseFloat(upData.proposal.ask_price.toString())) : '--')}
              </span>
            </div>
            <div className="flex flex-col text-right">
              <span className={`${compact ? 'text-[7px]' : 'text-[7.5px]'} text-gray-500 uppercase tracking-widest font-black`}>Net Profit</span>
              <span className={`${compact ? 'text-[10px]' : 'text-[11px]'} font-mono font-extrabold text-emerald-400 mt-0.5`}>
                {getProfitSummary(upData.proposal) 
                  ? `+${getProfitSummary(upData.proposal)?.amount} (${getProfitSummary(upData.proposal)?.percentage})` 
                  : '--'}
              </span>
            </div>
          </div>
          
          <button 
            disabled={!upData.proposal || buyingTypes.has(upData.type)}
            onClick={() => handleTrade(upData.type)} 
            className={`${compact ? 'h-10 rounded-xl' : 'h-14 rounded-2xl'} bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] transition-all flex items-center justify-center px-3 shadow-lg shadow-emerald-500/10 disabled:opacity-50 border border-white/5 relative overflow-hidden group green-glow cursor-pointer`}
          >
            <div className="flex items-center gap-2">
              {buyingTypes.has(upData.type) ? (
                <Loader2 className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-white animate-spin`} />
              ) : (
                <TrendingUp className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-white stroke-[3px]`} />
              )}
              <span className={`${compact ? 'text-xs' : 'text-sm'} font-extrabold text-white tracking-widest uppercase truncate`}>
                {upData.label}
              </span>
            </div>
          </button>
        </div>

        {/* FALL (Put) Column */}
        <div className={`flex-1 flex flex-col ${compact ? 'gap-1' : 'gap-2.5'}`}>
          {/* Estimate Details */}
          <div className="grid grid-cols-2 gap-1 px-1 text-[9px] font-bold text-gray-400">
            <div className="flex flex-col text-left">
              <span className={`${compact ? 'text-[7px]' : 'text-[7.5px]'} text-gray-500 uppercase tracking-widest font-black`}>Est. Payout</span>
              <span className={`${compact ? 'text-[10px]' : 'text-[11px]'} font-mono font-extrabold text-rose-400 mt-0.5`}>
                {basis === 'stake' 
                  ? (downData.proposal?.payout ? formatCurrency(parseFloat(downData.proposal.payout.toString())) : '--')
                  : (downData.proposal?.ask_price ? formatCurrency(parseFloat(downData.proposal.ask_price.toString())) : '--')}
              </span>
            </div>
            <div className="flex flex-col text-right">
              <span className={`${compact ? 'text-[7px]' : 'text-[7.5px]'} text-gray-500 uppercase tracking-widest font-black`}>Net Profit</span>
              <span className={`${compact ? 'text-[10px]' : 'text-[11px]'} font-mono font-extrabold text-rose-400 mt-0.5`}>
                {getProfitSummary(downData.proposal) 
                  ? `+${getProfitSummary(downData.proposal)?.amount} (${getProfitSummary(downData.proposal)?.percentage})` 
                  : '--'}
              </span>
            </div>
          </div>

          <button 
            disabled={!downData.proposal || buyingTypes.has(downData.type)}
            onClick={() => handleTrade(downData.type)} 
            className={`${compact ? 'h-10 rounded-xl' : 'h-14 rounded-2xl'} bg-rose-600 hover:bg-rose-500 active:scale-[0.98] transition-all flex items-center justify-center px-3 shadow-lg shadow-rose-600/10 disabled:opacity-50 border border-white/5 relative overflow-hidden group red-glow cursor-pointer`}
          >
            <div className="flex items-center gap-2">
              {buyingTypes.has(downData.type) ? (
                <Loader2 className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-white animate-spin`} />
              ) : (
                <TrendingDown className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-white stroke-[3px]`} />
              )}
              <span className={`${compact ? 'text-xs' : 'text-sm'} font-extrabold text-white tracking-widest uppercase truncate`}>
                {downData.label}
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(TradeForm);
