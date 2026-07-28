import React from 'react';
import { DerivAccount } from '../types';
import { User, Wallet } from 'lucide-react';
import { getCurrencyConfig } from '../constants';

interface MobileHeaderProps {
  account: DerivAccount | null;
  isConnected: boolean;
  isReconnecting: boolean;
  onAccountMenuOpen: () => void;
  onLoginClick: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  account,
  isConnected,
  isReconnecting,
  onAccountMenuOpen,
  onLoginClick,
}) => {
  return (
    <header className="h-[3.75rem] pt-[env(safe-area-inset-top)] bg-[#141922] border-b border-white/5 px-3 flex items-center justify-between z-[100] flex-shrink-0 w-full select-none">
      {/* Brand & Connection Status Logo */}
      <div className="flex flex-col text-left">
        <h1 className="text-xs font-black italic tracking-tighter text-red-500 leading-none">BYNEX TRADER</h1>
        <div className="flex items-center gap-1 mt-1">
          <div className={`w-1.5 h-1.5 rounded-full ${
            isConnected ? 'bg-green-500 animate-pulse' : 
            isReconnecting ? 'bg-yellow-500 animate-bounce' : 
            'bg-red-500'
          }`} />
          <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest leading-none">
            {isConnected ? 'Terminal' : isReconnecting ? 'Reconnecting' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Center of header is intentionally left empty for minimal design */}
      <div />

      {/* Account Info, Wallet and Profile button */}
      <div className="flex items-center gap-2">
        {account ? (
          <div
            onClick={onAccountMenuOpen}
            className="flex items-center gap-1.5 bg-[#0b0e14]/50 border border-white/5 px-2 py-1 rounded-xl cursor-pointer hover:border-red-500/30 transition-all"
          >
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-mono font-black text-white tabular-nums leading-none">
                {Number(account.balance).toFixed(getCurrencyConfig(account.currency).decimals)}{' '}
                {account.currency}
              </span>
              <span className="text-[7px] font-black text-gray-500 uppercase mt-0.5 leading-none">
                {account.is_virtual ? 'Demo' : 'Real'}
              </span>
            </div>
            <div className="w-6 h-6 rounded-lg bg-red-600/10 flex items-center justify-center border border-red-500/15">
              <Wallet className="w-3.5 h-3.5 text-red-500" />
            </div>
          </div>
        ) : (
          <button
            onClick={onLoginClick}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 rounded-xl text-[9px] font-black uppercase tracking-wider shadow-lg shadow-red-900/15 active:scale-95 transition-all"
          >
            Login
          </button>
        )}

        <button
          onClick={onAccountMenuOpen}
          className="w-8.5 h-8.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:border-red-500/50 transition-all"
        >
          <User className="w-4 h-4 text-gray-300" />
        </button>
      </div>
    </header>
  );
};
export default MobileHeader;
