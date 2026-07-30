import React, { useState } from 'react';
import { 
  CreditCard, 
  Coins, 
  Building2, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Wallet, 
  Zap
} from 'lucide-react';
import { DerivAccount } from '../types';
import { useDeriv } from '../hooks/useDeriv';

interface CashierHubProps {
  account: DerivAccount | null;
  send: (payload: Record<string, unknown>) => void;
  onNavigateToP2P: () => void;
  setCustomAlert?: (msg: string) => void;
}

export const CashierHub: React.FC<CashierHubProps> = ({
  account,
  setCustomAlert
}) => {
  const { availableAccounts, switchAccount, createNewRealAccount, signup } = useDeriv();
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [isCreatingAccount, setIsCreatingAccount] = useState<boolean>(false);

  const realAccount = availableAccounts.find(a => !a.is_virtual);

  const handleCreateRealAccount = async () => {
    setIsCreatingAccount(true);
    try {
      await createNewRealAccount('USD');
      if (setCustomAlert) setCustomAlert('Real account successfully created!');
    } catch (e: any) {
      console.warn('Real account creation failed:', e);
      if (setCustomAlert) setCustomAlert(e.message || 'Redirecting to Deriv registration portal...');
      signup();
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const handleBoxClick = (url: string) => {
    // If user is currently on Demo mode, but has a real account, switch to real account
    if (account?.is_virtual && realAccount) {
      switchAccount(realAccount.loginid);
      if (setCustomAlert) {
        setCustomAlert(`Switched to Real Account (${realAccount.loginid}) for Cashier operation.`);
      }
    }

    // Open link directly in external browser window
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const depositBoxes = [
    {
      id: 'deposit_usd',
      title: 'Deposit USD',
      tag: 'Cards, Bank Wire & E-Wallets',
      description: 'Fund your account instantly using Visa, Mastercard, Skrill, Neteller, or local bank transfers.',
      url: 'https://home.deriv.com/dashboard/deposit?from=portfolio&currency=USD',
      icon: CreditCard,
      textColor: 'text-emerald-400',
      badge: 'POPULAR',
      gradient: 'from-emerald-950/80 via-[#141922] to-emerald-900/40 border-emerald-500/40 hover:border-emerald-500/80'
    },
    {
      id: 'p2p_buy',
      title: 'P2P',
      tag: 'Peer-to-Peer Exchange',
      description: 'Buy USD directly from local verified traders using UPI, Bank Transfer, M-Pesa, or GPay.',
      url: 'https://dp2p.deriv.com/?operation=buy&lang=en&currency=USD',
      icon: Users,
      textColor: 'text-cyan-400',
      badge: '0% FEE',
      gradient: 'from-cyan-950/80 via-[#141922] to-blue-900/40 border-cyan-500/40 hover:border-cyan-500/80'
    },
    {
      id: 'deposit_crypto',
      title: 'Deposit Crypto',
      tag: 'Blockchain Transfers',
      description: 'Deposit cryptocurrency directly: USDT (TRC20/ERC20), BTC, ETH, LTC, BUSD or USDC.',
      url: 'https://home.deriv.com/dashboard/deposit?from=portfolio&flow=crypto',
      icon: Coins,
      textColor: 'text-amber-400',
      badge: 'INSTANT',
      gradient: 'from-amber-950/80 via-[#141922] to-orange-900/40 border-amber-500/40 hover:border-amber-500/80'
    },
    {
      id: 'payment_agent_deposit',
      title: 'Payment Agent',
      tag: 'Authorized Local Agents',
      description: 'Deposit cash through certified Deriv payment agents operating in your local currency.',
      url: 'https://home.deriv.com/dashboard/deposit/payment-agent?from=portfolio',
      icon: Building2,
      textColor: 'text-purple-400',
      badge: 'LOCAL CASH',
      gradient: 'from-purple-950/80 via-[#141922] to-indigo-900/40 border-purple-500/40 hover:border-purple-500/80'
    }
  ];

  const withdrawBoxes = [
    {
      id: 'withdraw_usd',
      title: 'Withdraw USD',
      tag: 'Bank & E-Wallet Payout',
      description: 'Withdraw funds back directly to your verified bank account, credit card, or e-wallet.',
      url: 'https://home.deriv.com/dashboard/withdraw?from=portfolio&currency=USD',
      icon: ArrowUpRight,
      textColor: 'text-rose-400',
      badge: 'FAST PAYOUT',
      gradient: 'from-rose-950/80 via-[#141922] to-red-900/40 border-rose-500/40 hover:border-rose-500/80'
    },
    {
      id: 'p2p_sell',
      title: 'P2P',
      tag: 'Sell to Local Buyers',
      description: 'Sell your USD balance to local buyers and receive payment straight into your local bank or UPI.',
      url: 'https://dp2p.deriv.com/?operation=sell&lang=en&currency=USD',
      icon: Users,
      textColor: 'text-cyan-400',
      badge: 'HIGH RATES',
      gradient: 'from-cyan-950/80 via-[#141922] to-blue-900/40 border-cyan-500/40 hover:border-cyan-500/80'
    },
    {
      id: 'withdraw_crypto',
      title: 'Withdraw Crypto',
      tag: 'Blockchain Withdrawal',
      description: 'Send crypto funds directly from your account to your external personal crypto wallet.',
      url: 'https://home.deriv.com/dashboard/withdraw?from=portfolio&flow=crypto',
      icon: Coins,
      textColor: 'text-amber-400',
      badge: 'SECURE',
      gradient: 'from-amber-950/80 via-[#141922] to-orange-900/40 border-amber-500/40 hover:border-amber-500/80'
    },
    {
      id: 'payment_agent_withdraw',
      title: 'Payment Agent',
      tag: 'Cash Out via Agent',
      description: 'Withdraw funds through authorized payment agents and receive cash in local currency.',
      url: 'https://home.deriv.com/dashboard/withdraw/payment-agent?from=portfolio',
      icon: Building2,
      textColor: 'text-purple-400',
      badge: 'LOCAL CASH',
      gradient: 'from-purple-950/80 via-[#141922] to-indigo-900/40 border-purple-500/40 hover:border-purple-500/80'
    }
  ];

  const currentBoxes = activeTab === 'deposit' ? depositBoxes : withdrawBoxes;

  return (
    <div className="w-full max-w-7xl mx-auto p-2 sm:p-4 space-y-5 text-white animate-in fade-in duration-300">
      
      {/* HEADER BAR & ACCOUNT BALANCE */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#141922]/90 border border-white/10 p-4 sm:p-5 rounded-2xl shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
              Deriv Cashier Portal
            </h2>
            <p className="text-xs text-gray-400">
              Official payment gateways & peer-to-peer exchanges
            </p>
          </div>
        </div>

        {/* Balance Badge */}
        <div className="flex items-center gap-3 bg-black/50 border border-white/10 px-4 py-2 rounded-xl w-full sm:w-auto justify-between sm:justify-end shadow-inner">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>Account ID:</span>
              <span className="text-white font-mono font-bold">{account?.loginid || 'Guest'}</span>
            </p>
            <p className={`text-base font-black leading-tight ${account?.is_virtual ? 'text-amber-400' : 'text-emerald-400'}`}>
              {account?.currency || 'USD'} {account?.balance?.toFixed(2) || '0.00'}
            </p>
          </div>
          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
            account?.is_virtual ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
          }`}>
            {account?.is_virtual ? 'DEMO' : 'REAL'}
          </span>
        </div>
      </div>

      {/* REAL ACCOUNT DEMO NOTICE & SWITCH / CREATE OPTION */}
      {account?.is_virtual && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-300 shadow-lg">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-2">
                Currently on Demo Account ({account.loginid})
              </p>
              <p className="text-[11px] text-amber-300/80 mt-0.5">
                Deriv Cashier deposits and withdrawals operate on Real accounts.
                {realAccount ? (
                  <> Real account <span className="font-mono font-bold text-white">{realAccount.loginid}</span> is available.</>
                ) : (
                  <> No Real account connected yet.</>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            {realAccount ? (
              <button
                onClick={() => switchAccount(realAccount.loginid)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Switch to Real Account ({realAccount.loginid})
              </button>
            ) : (
              <>
                <button
                  onClick={handleCreateRealAccount}
                  disabled={isCreatingAccount}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
                >
                  {isCreatingAccount ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
                  Add Real Account ($ USD)
                </button>
                <button
                  onClick={() => signup()}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-1.5"
                  title="Open Deriv Registration"
                >
                  <span>Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* TOP DEPOSIT | WITHDRAW TABS */}
      <div className="bg-[#141922] p-1.5 rounded-2xl border border-white/10 flex items-center gap-2 shadow-lg">
        <button
          onClick={() => setActiveTab('deposit')}
          className={`flex-1 py-3 px-4 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
            activeTab === 'deposit'
              ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 scale-[1.01]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ArrowDownRight className="w-4 h-4" />
          <span>Deposit</span>
        </button>

        <button
          onClick={() => setActiveTab('withdraw')}
          className={`flex-1 py-3 px-4 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
            activeTab === 'withdraw'
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20 scale-[1.01]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Withdraw</span>
        </button>
      </div>

      {/* 4 BOXES GRID FOR DEPOSIT / WITHDRAW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
        {currentBoxes.map((box) => {
          const BoxIcon = box.icon;
          return (
            <div
              key={box.id}
              onClick={() => handleBoxClick(box.url)}
              className={`bg-gradient-to-b ${box.gradient} border rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden hover:scale-[1.02] active:scale-[0.98]`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none group-hover:bg-white/10 transition-all" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <BoxIcon className={`w-6 h-6 ${box.textColor}`} />
                  </div>
                  <span className="px-2.5 py-1 bg-black/50 border border-white/10 text-white rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm">
                    {box.badge}
                  </span>
                </div>

                <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2 group-hover:text-emerald-300 transition-colors">
                  {box.title}
                </h3>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mt-0.5">
                  {box.tag}
                </p>

                <p className="text-xs text-gray-300/90 mt-2.5 leading-relaxed">
                  {box.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-white/90 group-hover:text-white">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Open Gateway</span>
                </span>
                <ExternalLink className="w-4 h-4 opacity-75 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
