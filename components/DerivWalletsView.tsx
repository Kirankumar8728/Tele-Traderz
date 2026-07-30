import React, { useState, useEffect } from 'react';
import { 
  Wallet as WalletIcon, 
  RefreshCw, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft, 
  Layers,
  Building2,
  Globe,
  Coins,
  ShieldCheck,
  CreditCard,
  ExternalLink
} from 'lucide-react';
import { useDeriv } from '../hooks/useDeriv';
import { Wallet, WalletTransaction, WalletTransactionsLinks } from '../src/services/derivApiService';

interface DerivWalletsViewProps {
  setCustomAlert?: (msg: string) => void;
}

export const DerivWalletsView: React.FC<DerivWalletsViewProps> = ({ setCustomAlert }) => {
  const { 
    account, 
    wallets, 
    walletTransactions, 
    isWalletsLoading, 
    fetchWallets, 
    fetchWalletTransactions 
  } = useDeriv();

  const [conversionCurrency, setConversionCurrency] = useState<string>('USD');
  const [selectedWalletType, setSelectedWalletType] = useState<string>('main');
  const [activeTab, setActiveTab] = useState<'wallets' | 'transactions'>('wallets');
  
  // Transaction Filters
  const [requestIdFilter, setRequestIdFilter] = useState<string>('');
  const [currencyFilter, setCurrencyFilter] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  // Pagination
  const [paginationLinks, setPaginationLinks] = useState<WalletTransactionsLinks | null>(null);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState<boolean>(false);

  // Initial load
  useEffect(() => {
    fetchWallets(conversionCurrency);
  }, [conversionCurrency, fetchWallets]);

  useEffect(() => {
    if (activeTab === 'transactions') {
      loadTransactions();
    }
  }, [activeTab, selectedWalletType]);

  const loadTransactions = async (cursor?: string) => {
    setIsTransactionsLoading(true);
    try {
      const params: any = {};
      if (requestIdFilter) params.request_id = requestIdFilter;
      if (currencyFilter) params.transaction_currency = currencyFilter.toUpperCase();
      if (startDate) params.start_date_time = new Date(startDate).toISOString();
      if (endDate) params.end_date_time = new Date(endDate).toISOString();
      if (cursor) params.page_cursor = cursor;

      const res = await fetchWalletTransactions(selectedWalletType, params);
      if (res?.links) {
        setPaginationLinks(res.links);
      }
    } catch (e: any) {
      console.error('Failed to load wallet transactions:', e);
      if (setCustomAlert) setCustomAlert(e.message || 'Failed to load wallet transactions');
    } finally {
      setIsTransactionsLoading(false);
    }
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadTransactions();
  };

  const getWalletTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'main':
        return { label: 'Main Wallet', bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: WalletIcon };
      case 'p2p':
        return { label: 'P2P Wallet', bg: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Globe };
      case 'partner':
        return { label: 'Partner Wallet', bg: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: Layers };
      case 'payment_agent':
        return { label: 'Payment Agent Wallet', bg: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: Building2 };
      default:
        return { label: `${type.toUpperCase()} Wallet`, bg: 'bg-gray-500/20 text-gray-300 border-gray-500/30', icon: Coins };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2 bg-[#141922] p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab('wallets')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'wallets'
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <WalletIcon className="w-4 h-4" />
            Wallets List
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'transactions'
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Clock className="w-4 h-4" />
            Wallet Transactions
          </button>
        </div>

        {activeTab === 'wallets' && (
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href="https://home.deriv.com/dashboard/deposit?from=portfolio&currency=USD"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
              title="Open Official Deriv Deposit Portal"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>External Deposit ↗</span>
            </a>
            <span className="text-xs text-gray-400">Conversion Currency:</span>
            <select
              value={conversionCurrency}
              onChange={(e) => setConversionCurrency(e.target.value)}
              className="bg-[#141922] border border-white/10 text-white rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-emerald-500"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="AUD">AUD ($)</option>
            </select>
            <button
              onClick={() => fetchWallets(conversionCurrency)}
              disabled={isWalletsLoading}
              className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 hover:text-white transition-colors"
              title="Refresh Wallets"
            >
              <RefreshCw className={`w-4 h-4 ${isWalletsLoading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>
        )}
      </div>

      {/* WALLETS LIST VIEW */}
      {activeTab === 'wallets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Your Deriv Multi-Currency Wallets
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Overview of native currency balances, deposits, withdrawals, and approximate aggregate totals.
              </p>
            </div>
          </div>

          {isWalletsLoading ? (
            <div className="flex flex-col items-center justify-center py-12 bg-[#141922] border border-white/10 rounded-2xl">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
              <p className="text-sm text-gray-400">Loading Deriv Wallets...</p>
            </div>
          ) : wallets.length === 0 ? (
            <div className="bg-[#141922] border border-white/10 rounded-2xl p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <WalletIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-white">No Wallets Found or Authorization Required</h4>
                <p className="text-xs text-gray-400 max-w-md mx-auto mt-1">
                  Ensure you are logged in with your Deriv account with payment access permissions to view official client wallets.
                </p>
              </div>
              <button
                onClick={() => fetchWallets(conversionCurrency)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs rounded-xl transition-all shadow-lg shadow-emerald-500/20"
              >
                Fetch Wallets
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {wallets.map((wallet) => {
                const badge = getWalletTypeBadge(wallet.type);
                const BadgeIcon = badge.icon;

                return (
                  <div
                    key={wallet.wallet_id}
                    className="bg-[#141922] border border-white/10 hover:border-emerald-500/40 transition-all rounded-2xl p-5 space-y-4 relative group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400">
                          <BadgeIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                            {badge.label}
                          </span>
                          <p className="text-[11px] font-mono text-gray-400 mt-1 truncate max-w-[200px]" title={wallet.wallet_id}>
                            ID: {wallet.wallet_id}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedWalletType(wallet.type);
                          setActiveTab('transactions');
                        }}
                        className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg border border-emerald-500/30 transition-all"
                      >
                        Transactions
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Native Balances */}
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                        Native Currency Balances
                      </p>
                      {Object.entries(wallet.balances || {}).map(([currency, bal]) => (
                        <div key={currency} className="bg-[#0b0e14] border border-white/5 rounded-xl p-3 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-gray-300">{currency}</span>
                            <div className="flex items-center gap-3 text-[10px] text-gray-400 mt-0.5">
                              <span className="text-emerald-400">In: +{bal.input}</span>
                              <span className="text-red-400">Out: -{bal.output}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-base font-bold text-white font-mono">
                              {Number(bal.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-[10px] text-gray-400 block">{currency}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Converted Total Balance */}
                    {wallet.total_balance && (
                      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-emerald-400">
                            Approx. Total ({wallet.total_balance.converted_to})
                          </span>
                          <p className="text-[10px] text-gray-400">
                            Converted as of window
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-extrabold text-emerald-400 font-mono">
                            {Number(wallet.total_balance.approximate_total_balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-[10px] text-emerald-400/70 block">
                            {wallet.total_balance.converted_to}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* WALLET TRANSACTIONS VIEW */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-400" />
                Deriv Wallet Transactions Log
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Cursor-paginated transaction history for chosen wallet type.
              </p>
            </div>

            {/* Wallet Type Selection Selector */}
            <div className="flex items-center gap-2 bg-[#141922] p-1 rounded-xl border border-white/10">
              {['main', 'p2p', 'partner', 'payment_agent'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedWalletType(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    selectedWalletType === type
                      ? 'bg-emerald-500 text-black shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {type.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Bar */}
          <form onSubmit={handleFilterSubmit} className="bg-[#141922] border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">
                  Request ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search UUID..."
                    value={requestIdFilter}
                    onChange={(e) => setRequestIdFilter(e.target.value)}
                    className="w-full bg-[#0b0e14] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <Search className="w-3.5 h-3.5 text-gray-500 absolute right-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">
                  Currency
                </label>
                <input
                  type="text"
                  placeholder="e.g. USD, EUR"
                  value={currencyFilter}
                  onChange={(e) => setCurrencyFilter(e.target.value)}
                  className="w-full bg-[#0b0e14] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 font-mono uppercase"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[#0b0e14] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-[#0b0e14] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1 border-t border-white/5">
              <button
                type="button"
                onClick={() => {
                  setRequestIdFilter('');
                  setCurrencyFilter('');
                  setStartDate('');
                  setEndDate('');
                  loadTransactions();
                }}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 text-xs rounded-xl transition-colors"
              >
                Reset Filters
              </button>
              <button
                type="submit"
                disabled={isTransactionsLoading}
                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5"
              >
                {isTransactionsLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Filter className="w-3.5 h-3.5" />
                )}
                Apply Filter
              </button>
            </div>
          </form>

          {/* Transactions List */}
          {isTransactionsLoading ? (
            <div className="flex flex-col items-center justify-center py-12 bg-[#141922] border border-white/10 rounded-2xl">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
              <p className="text-sm text-gray-400">Loading {selectedWalletType} wallet transactions...</p>
            </div>
          ) : walletTransactions.length === 0 ? (
            <div className="bg-[#141922] border border-white/10 rounded-2xl p-8 text-center space-y-3">
              <Clock className="w-8 h-8 text-gray-500 mx-auto" />
              <h4 className="text-sm font-semibold text-white">No Transactions Found</h4>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                No recent transactions recorded for the <span className="text-emerald-400 font-semibold">{selectedWalletType}</span> wallet under selected parameters.
              </p>
            </div>
          ) : (
            <div className="bg-[#141922] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-[#0b0e14] text-gray-400 font-mono text-[10px] uppercase tracking-wider border-b border-white/10">
                    <tr>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Channel</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3">Request ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-sans">
                    {walletTransactions.map((tx) => {
                      const isDeposit = tx.category.toLowerCase() === 'deposit';
                      const statusComplete = tx.metadata.transaction_status?.toLowerCase() === 'complete';

                      return (
                        <tr key={tx.transaction_id || tx.request_id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              isDeposit 
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                                : 'bg-red-500/20 text-red-400 border-red-500/30'
                            }`}>
                              {isDeposit ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                              {tx.category.toUpperCase()}
                            </span>
                          </td>

                          <td className="px-4 py-3 font-mono font-bold text-white">
                            <span className={isDeposit ? 'text-emerald-400' : 'text-red-400'}>
                              {isDeposit ? '+' : '-'}{tx.metadata.transaction_net_amount} {tx.metadata.transaction_currency}
                            </span>
                          </td>

                          <td className="px-4 py-3 capitalize font-medium text-gray-300">
                            {tx.channel.replace('_', ' ')}
                          </td>

                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${
                              statusComplete ? 'text-emerald-400' : 'text-amber-400'
                            }`}>
                              {statusComplete ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                              {tx.metadata.transaction_status || 'Pending'}
                            </span>
                          </td>

                          <td className="px-4 py-3 font-mono text-[11px] text-gray-400">
                            {new Date(tx.timestamp).toLocaleString()}
                          </td>

                          <td className="px-4 py-3 font-mono text-[10px] text-gray-500 max-w-[120px] truncate" title={tx.request_id}>
                            {tx.request_id}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Cursor Pagination Links */}
              {paginationLinks && (paginationLinks.next || paginationLinks.prev || paginationLinks.first) && (
                <div className="bg-[#0b0e14] px-4 py-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-gray-400 text-[11px]">
                    Cursor Pagination Navigation
                  </span>
                  <div className="flex items-center gap-2">
                    {paginationLinks.first && (
                      <button
                        onClick={() => {
                          const url = new URL(paginationLinks.first!, 'https://dummy.org');
                          const cursor = url.searchParams.get('page_cursor');
                          if (cursor) loadTransactions(cursor);
                        }}
                        className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-[11px]"
                      >
                        First Page
                      </button>
                    )}
                    {paginationLinks.prev && (
                      <button
                        onClick={() => {
                          const url = new URL(paginationLinks.prev!, 'https://dummy.org');
                          const cursor = url.searchParams.get('page_cursor');
                          if (cursor) loadTransactions(cursor);
                        }}
                        className="px-3 py-1 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-xs flex items-center gap-1"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        Previous
                      </button>
                    )}
                    {paginationLinks.next && (
                      <button
                        onClick={() => {
                          const url = new URL(paginationLinks.next!, 'https://dummy.org');
                          const cursor = url.searchParams.get('page_cursor');
                          if (cursor) loadTransactions(cursor);
                        }}
                        className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs flex items-center gap-1 font-semibold"
                      >
                        Next
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
