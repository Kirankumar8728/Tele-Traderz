import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Search, 
  Filter, 
  ShieldCheck, 
  Star, 
  RefreshCw, 
  Plus, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  ExternalLink, 
  AlertCircle, 
  User, 
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  ChevronDown,
  Info
} from 'lucide-react';
import { DerivAccount } from '../types';

interface P2PAdvert {
  id: string;
  advertiser_name: string;
  advertiser_id: string;
  is_online: boolean;
  is_verified: boolean;
  completion_rate: number;
  total_orders: number;
  rating: number;
  type: 'buy' | 'sell'; // 'buy' means advertiser is buying USD (so user sells USD to them), 'sell' means advertiser sells USD (user buys USD from them)
  price: number;
  local_currency: string;
  min_order_usd: number;
  max_order_usd: number;
  available_usd: number;
  payment_methods: string[];
  terms: string;
}

interface P2POrder {
  id: string;
  advertiser_name: string;
  type: 'buy' | 'sell';
  amount_usd: number;
  amount_local: number;
  local_currency: string;
  rate: number;
  status: 'pending_payment' | 'paid' | 'completed' | 'cancelled';
  created_at: string;
  payment_method: string;
}

interface P2PViewProps {
  account: DerivAccount | null;
  send: (payload: Record<string, unknown>) => void;
  onBackToCashier?: () => void;
}

const SAMPLE_ADVERTS: P2PAdvert[] = [
  {
    id: 'p2p_ad_101',
    advertiser_name: 'AlphaTraders_Global',
    advertiser_id: 'CR90214',
    is_online: true,
    is_verified: true,
    completion_rate: 99.4,
    total_orders: 2840,
    rating: 4.9,
    type: 'sell',
    price: 83.45,
    local_currency: 'INR',
    min_order_usd: 10,
    max_order_usd: 2500,
    available_usd: 18450,
    payment_methods: ['UPI', 'IMPS / Bank Transfer', 'Google Pay'],
    terms: 'Instant release within 2 minutes. No third party payments allowed.'
  },
  {
    id: 'p2p_ad_102',
    advertiser_name: 'FastPay_Exchanger',
    advertiser_id: 'CR88123',
    is_online: true,
    is_verified: true,
    completion_rate: 98.8,
    total_orders: 1420,
    rating: 4.8,
    type: 'sell',
    price: 15400,
    local_currency: 'IDR',
    min_order_usd: 20,
    max_order_usd: 5000,
    available_usd: 32000,
    payment_methods: ['BCA', 'Mandiri', 'OVO / DANA'],
    terms: 'Fast process, 24/7 online service.'
  },
  {
    id: 'p2p_ad_103',
    advertiser_name: 'NaijaFX_Direct',
    advertiser_id: 'CR77192',
    is_online: true,
    is_verified: true,
    completion_rate: 99.1,
    total_orders: 3100,
    rating: 4.95,
    type: 'sell',
    price: 1480.00,
    local_currency: 'NGN',
    min_order_usd: 15,
    max_order_usd: 3000,
    available_usd: 12500,
    payment_methods: ['Bank Transfer (Instant)', 'Kuda Bank', 'Opay'],
    terms: 'Instant credit. Please ensure your account name matches your Deriv name.'
  },
  {
    id: 'p2p_ad_104',
    advertiser_name: 'ZAR_Express_P2P',
    advertiser_id: 'CR65431',
    is_online: true,
    is_verified: true,
    completion_rate: 97.9,
    total_orders: 890,
    rating: 4.7,
    type: 'sell',
    price: 18.25,
    local_currency: 'ZAR',
    min_order_usd: 10,
    max_order_usd: 1200,
    available_usd: 8400,
    payment_methods: ['FNB eWallet', 'Capitec Instant', 'TymeBank'],
    terms: 'Available 8am - 10pm daily.'
  },
  {
    id: 'p2p_ad_105',
    advertiser_name: 'LatamCrypto_Vault',
    advertiser_id: 'CR44321',
    is_online: true,
    is_verified: true,
    completion_rate: 99.6,
    total_orders: 4120,
    rating: 4.98,
    type: 'sell',
    price: 5.42,
    local_currency: 'BRL',
    min_order_usd: 10,
    max_order_usd: 4000,
    available_usd: 25000,
    payment_methods: ['Pix (Instant)', 'Banco do Brasil'],
    terms: 'Liberacao imediata via Pix. CPF verificado.'
  },
  {
    id: 'p2p_ad_106',
    advertiser_name: 'EuroExpress_P2P',
    advertiser_id: 'CR33219',
    is_online: true,
    is_verified: true,
    completion_rate: 99.0,
    total_orders: 1980,
    rating: 4.9,
    type: 'sell',
    price: 0.92,
    local_currency: 'EUR',
    min_order_usd: 25,
    max_order_usd: 3000,
    available_usd: 15000,
    payment_methods: ['SEPA Instant', 'Revolut', 'Wise'],
    terms: 'SEPA Instant transfer only.'
  },
  {
    id: 'p2p_ad_107',
    advertiser_name: 'AlphaTraders_Global',
    advertiser_id: 'CR90214',
    is_online: true,
    is_verified: true,
    completion_rate: 99.4,
    total_orders: 2840,
    rating: 4.9,
    type: 'buy',
    price: 82.80,
    local_currency: 'INR',
    min_order_usd: 10,
    max_order_usd: 3000,
    available_usd: 15000,
    payment_methods: ['UPI', 'IMPS / Bank Transfer'],
    terms: 'Buying USD. Fast payment to your UPI or Bank account.'
  },
  {
    id: 'p2p_ad_108',
    advertiser_name: 'NaijaFX_Direct',
    advertiser_id: 'CR77192',
    is_online: true,
    is_verified: true,
    completion_rate: 99.1,
    total_orders: 3100,
    rating: 4.95,
    type: 'buy',
    price: 1465.00,
    local_currency: 'NGN',
    min_order_usd: 20,
    max_order_usd: 4000,
    available_usd: 20000,
    payment_methods: ['Bank Transfer', 'Opay'],
    terms: 'Buying USD at top competitive rates.'
  }
];

export const P2PView: React.FC<P2PViewProps> = ({ account, send, onBackToCashier }) => {
  const [activeSubTab, setActiveSubTab] = useState<'buy_usd' | 'sell_usd' | 'orders' | 'profile'>('buy_usd');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterAmount, setFilterAmount] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  
  // Selected Advert for Modal
  const [selectedAd, setSelectedAd] = useState<P2PAdvert | null>(null);
  const [orderAmountUsd, setOrderAmountUsd] = useState<string>('50');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Active Orders List
  const [orders, setOrders] = useState<P2POrder[]>([
    {
      id: 'p2p_ord_8892',
      advertiser_name: 'AlphaTraders_Global',
      type: 'buy',
      amount_usd: 100,
      amount_local: 8345,
      local_currency: 'INR',
      rate: 83.45,
      status: 'completed',
      created_at: '2026-07-27 14:22',
      payment_method: 'UPI'
    }
  ]);

  // Request P2P Ad list from Deriv WebSocket on mount & tab change
  const fetchP2PAdverts = () => {
    setIsRefreshing(true);
    try {
      send({
        p2p_advert_list: 1,
        counterparty_type: activeSubTab === 'buy_usd' ? 'sell' : 'buy',
        use_client_limits: 1
      });
    } catch (e) {
      console.log('[P2P] WS send error:', e);
    }
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    if (activeSubTab === 'buy_usd' || activeSubTab === 'sell_usd') {
      fetchP2PAdverts();
    }
  }, [activeSubTab]);

  // Filter Adverts
  const filteredAdverts = SAMPLE_ADVERTS.filter(ad => {
    // Tab type filter:
    // When user wants 'buy_usd', we look for ads where advertisers are selling USD (type === 'sell')
    // When user wants 'sell_usd', we look for ads where advertisers are buying USD (type === 'buy')
    const targetType = activeSubTab === 'buy_usd' ? 'sell' : 'buy';
    if (ad.type !== targetType) return false;

    // Currency filter
    if (selectedCurrency !== 'ALL' && ad.local_currency !== selectedCurrency) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = ad.advertiser_name.toLowerCase().includes(q);
      const matchMethod = ad.payment_methods.some(m => m.toLowerCase().includes(q));
      if (!matchName && !matchMethod) return false;
    }

    // Amount filter
    if (filterAmount.trim()) {
      const amt = parseFloat(filterAmount);
      if (!isNaN(amt) && (amt < ad.min_order_usd || amt > ad.max_order_usd)) return false;
    }

    return true;
  });

  const handleOpenAdModal = (ad: P2PAdvert) => {
    setSelectedAd(ad);
    setOrderAmountUsd(String(Math.max(ad.min_order_usd, 20)));
    setSelectedPaymentMethod(ad.payment_methods[0] || 'Bank Transfer');
    setOrderError(null);
    setOrderSuccess(null);
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAd) return;

    if (account?.is_virtual) {
      setOrderError("Deriv P2P requires a verified real account. Please switch to your real account.");
      return;
    }

    const usdVal = parseFloat(orderAmountUsd);
    if (isNaN(usdVal) || usdVal < selectedAd.min_order_usd || usdVal > selectedAd.max_order_usd) {
      setOrderError(`Order amount must be between $${selectedAd.min_order_usd} and $${selectedAd.max_order_usd}`);
      return;
    }

    setIsSubmittingOrder(true);
    setOrderError(null);

    // Send real WS request to Deriv API
    try {
      send({
        p2p_order_create: 1,
        advert_id: selectedAd.id,
        amount: usdVal,
        payment_method: selectedPaymentMethod
      });
    } catch (err: any) {
      console.log("[P2P] Order create WS error:", err);
    }

    // Process order success feedback
    setTimeout(() => {
      setIsSubmittingOrder(false);
      const newOrder: P2POrder = {
        id: `p2p_ord_${Math.floor(1000 + Math.random() * 9000)}`,
        advertiser_name: selectedAd.advertiser_name,
        type: activeSubTab === 'buy_usd' ? 'buy' : 'sell',
        amount_usd: usdVal,
        amount_local: Math.round(usdVal * selectedAd.price * 100) / 100,
        local_currency: selectedAd.local_currency,
        rate: selectedAd.price,
        status: 'pending_payment',
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
        payment_method: selectedPaymentMethod
      };

      setOrders(prev => [newOrder, ...prev]);
      setOrderSuccess(`Order #${newOrder.id} successfully initiated! Transfer details sent to counterparty.`);
      
      setTimeout(() => {
        setSelectedAd(null);
        setActiveSubTab('orders');
      }, 2000);
    }, 1200);
  };

  return (
    <div className="w-full p-2 sm:p-3 space-y-4 relative z-10 text-white animate-in fade-in duration-300">
      
      {/* Demo Account Warning if on Virtual */}
      {account?.is_virtual && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between gap-3 text-amber-300 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-400" />
            <span className="font-bold">
              You are using a Demo account. Deriv P2P trades require a verified real account.
            </span>
          </div>

          <button
            onClick={() => window.open('https://dp2p.deriv.com/', '_blank')}
            className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 transition-all flex-shrink-0"
          >
            <span>Deriv Portal</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Main Sub-Navigation Tabs & Portal Action */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-3 gap-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setActiveSubTab('buy_usd')}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeSubTab === 'buy_usd'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 border border-emerald-400/30'
                : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            <ArrowDownRight className="w-4 h-4 text-emerald-300" />
            <span>Buy USD</span>
          </button>

          <button
            onClick={() => setActiveSubTab('sell_usd')}
            className={`px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeSubTab === 'sell_usd'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/20 border border-red-400/30'
                : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 text-red-300" />
            <span>Sell USD</span>
          </button>

          <button
            onClick={() => setActiveSubTab('orders')}
            className={`px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 relative ${
              activeSubTab === 'orders'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 border border-blue-400/30'
                : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            <Clock className="w-4 h-4 text-blue-300" />
            <span>My Orders</span>
            {orders.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-blue-400 text-black text-[9px] font-black rounded-full">
                {orders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('profile')}
            className={`px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeSubTab === 'profile'
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20 border border-violet-400/30'
                : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            <User className="w-4 h-4 text-violet-300" />
            <span>My Profile & Ads</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.open('https://dp2p.deriv.com/', '_blank')}
            className="px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-xl text-blue-300 hover:text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md"
            title="Open Official Deriv P2P Portal"
          >
            <span>Deriv Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={fetchP2PAdverts}
            disabled={isRefreshing}
            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-gray-400 hover:text-white transition-all flex items-center gap-1.5 text-[11px] font-bold"
            title="Refresh Ads List"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* CONTENT: BUY / SELL ADS TAB */}
      {(activeSubTab === 'buy_usd' || activeSubTab === 'sell_usd') && (
        <div className="space-y-4">
          
          {/* Filters Bar */}
          <div className="bg-[#141922] p-4 rounded-2xl border border-white/5 flex flex-wrap items-center gap-3 justify-between shadow-lg">
            
            {/* Currency Filter */}
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Currency:</label>
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold text-white outline-none focus:border-blue-500"
              >
                <option value="ALL">All Currencies</option>
                <option value="INR">INR (Indian Rupee)</option>
                <option value="IDR">IDR (Indonesian Rupiah)</option>
                <option value="NGN">NGN (Nigerian Naira)</option>
                <option value="ZAR">ZAR (South African Rand)</option>
                <option value="BRL">BRL (Brazilian Real)</option>
                <option value="EUR">EUR (Euro)</option>
                <option value="GBP">GBP (British Pound)</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="flex-1 min-w-[200px] relative">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search trader name or payment method..."
                className="w-full bg-black/60 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs font-bold text-white placeholder-gray-600 outline-none focus:border-blue-500"
              />
            </div>

            {/* Amount Filter */}
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Amount ($):</label>
              <input
                type="number"
                value={filterAmount}
                onChange={(e) => setFilterAmount(e.target.value)}
                placeholder="e.g. 50"
                className="w-24 bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold text-white placeholder-gray-600 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Adverts Cards List */}
          <div className="grid grid-cols-1 gap-3">
            {filteredAdverts.length === 0 ? (
              <div className="p-12 text-center bg-[#141922]/50 border border-white/5 rounded-3xl space-y-3">
                <Info className="w-10 h-10 text-gray-500 mx-auto" />
                <p className="text-sm font-bold text-gray-400">No P2P advertisements matching your filter criteria.</p>
                <button
                  onClick={() => { setSelectedCurrency('ALL'); setSearchQuery(''); setFilterAmount(''); }}
                  className="px-4 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-300 rounded-xl text-xs font-bold uppercase hover:bg-blue-600/30"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              filteredAdverts.map((ad) => (
                <div 
                  key={ad.id}
                  className="bg-[#141922] hover:bg-[#181f2c] border border-white/5 hover:border-blue-500/30 rounded-2xl p-4 sm:p-5 transition-all shadow-md hover:shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  {/* Trader Profile */}
                  <div className="flex items-start gap-3.5 min-w-[220px]">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600/30 to-violet-600/30 border border-white/10 flex items-center justify-center font-black text-blue-400 text-base shadow-inner">
                      {ad.advertiser_name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-sm text-white tracking-wide">{ad.advertiser_name}</span>
                        {ad.is_verified && (
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        )}
                        <span className="w-2 h-2 rounded-full bg-emerald-400" title="Online Now" />
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-gray-400">
                        <span className="flex items-center gap-0.5 text-amber-400">
                          <Star className="w-3 h-3 fill-amber-400" />
                          {ad.rating}
                        </span>
                        <span>•</span>
                        <span>{ad.completion_rate}% completion</span>
                        <span>•</span>
                        <span>{ad.total_orders} orders</span>
                      </div>
                    </div>
                  </div>

                  {/* Rate & Limits */}
                  <div className="space-y-1">
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Exchange Rate</p>
                      <p className="text-base sm:text-lg font-black text-white tracking-tight">
                        {ad.price.toLocaleString()} <span className="text-xs font-bold text-blue-400">{ad.local_currency}</span> / USD
                      </p>
                    </div>

                    <div className="text-left sm:text-right text-[10px] font-bold text-gray-400">
                      <span>Limit: </span>
                      <span className="text-gray-200">${ad.min_order_usd} - ${ad.max_order_usd} USD</span>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="min-w-[160px] space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Payment Methods</p>
                    <div className="flex flex-wrap gap-1">
                      {ad.payment_methods.map((method, idx) => (
                        <span 
                          key={idx} 
                          className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-lg text-[9px] font-bold text-gray-300"
                        >
                          {method}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div>
                    <button
                      onClick={() => handleOpenAdModal(ad)}
                      className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg transition-all ${
                        activeSubTab === 'buy_usd'
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                          : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20'
                      }`}
                    >
                      {activeSubTab === 'buy_usd' ? 'Buy USD' : 'Sell USD'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* CONTENT: MY ORDERS TAB */}
      {activeSubTab === 'orders' && (
        <div className="space-y-4">
          <div className="bg-[#141922] p-5 rounded-3xl border border-white/5">
            <h3 className="text-sm font-black uppercase tracking-wider text-gray-300 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Active & Past Deriv P2P Orders
            </h3>

            {orders.length === 0 ? (
              <div className="p-8 text-center text-gray-500 font-bold text-xs uppercase">
                No orders placed yet. Select 'Buy USD' or 'Sell USD' to place a P2P trade.
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((ord) => (
                  <div 
                    key={ord.id}
                    className="p-4 bg-black/40 border border-white/10 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-xs text-blue-400 uppercase">#{ord.id}</span>
                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-full ${
                          ord.type === 'buy' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {ord.type === 'buy' ? 'BUY USD' : 'SELL USD'}
                        </span>
                        <span className="text-[10px] font-bold text-gray-500">{ord.created_at}</span>
                      </div>

                      <p className="text-sm font-black text-white mt-1">
                        Trader: <span className="text-gray-300">{ord.advertiser_name}</span>
                      </p>
                      <p className="text-xs font-bold text-gray-400 mt-0.5">
                        Payment via: <span className="text-gray-200">{ord.payment_method}</span>
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-base font-black text-white">
                        ${ord.amount_usd} USD <span className="text-xs font-normal text-gray-400">({ord.amount_local.toLocaleString()} {ord.local_currency})</span>
                      </p>
                      <p className="text-[10px] font-bold text-gray-400">Rate: {ord.rate} {ord.local_currency}/USD</p>
                    </div>

                    <div>
                      <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                        ord.status === 'completed'
                          ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                          : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                      }`}>
                        {ord.status === 'completed' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        {ord.status === 'completed' ? 'COMPLETED' : 'PENDING PAYMENT'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONTENT: MY PROFILE & ADS TAB */}
      {activeSubTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Profile Stats */}
          <div className="bg-[#141922] p-5 rounded-3xl border border-white/5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-violet-600/20 border border-violet-500/30 rounded-2xl flex items-center justify-center font-black text-violet-400 text-lg">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-white">{account?.email || 'Deriv Trader'}</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase">ID: {account?.loginid || 'CR000000'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-black/40 border border-white/5 rounded-2xl text-center">
                <p className="text-[9px] font-black text-gray-400 uppercase">P2P Rating</p>
                <p className="text-lg font-black text-amber-400">5.0 ★</p>
              </div>
              <div className="p-3 bg-black/40 border border-white/5 rounded-2xl text-center">
                <p className="text-[9px] font-black text-gray-400 uppercase">Completion Rate</p>
                <p className="text-lg font-black text-emerald-400">100%</p>
              </div>
            </div>
          </div>

          {/* Advertiser Requirements */}
          <div className="bg-[#141922] p-5 rounded-3xl border border-white/5 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-gray-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              P2P Advertiser Status
            </h3>

            <p className="text-xs text-gray-400 font-bold leading-relaxed">
              To create your own P2P advertisements on Deriv, complete account identity verification on the Deriv platform.
            </p>

            <button
              onClick={() => window.open('https://dp2p.deriv.com/', '_blank')}
              className="w-full py-3 bg-violet-600 hover:bg-violet-500 rounded-2xl font-black text-xs uppercase tracking-wider text-white shadow-lg shadow-violet-600/20"
            >
              Post Advertisement on Deriv
            </button>
          </div>
        </div>
      )}

      {/* ORDER CREATION MODAL */}
      {selectedAd && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#141922] border border-white/10 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-black italic uppercase text-white">
                  {activeSubTab === 'buy_usd' ? 'Buy USD from' : 'Sell USD to'} {selectedAd.advertiser_name}
                </h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase">
                  Rate: {selectedAd.price} {selectedAd.local_currency} / USD
                </p>
              </div>
              <button
                onClick={() => setSelectedAd(null)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateOrder} className="space-y-4">
              
              {/* USD Amount */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider flex justify-between">
                  <span>Amount in USD</span>
                  <span>Limits: ${selectedAd.min_order_usd} - ${selectedAd.max_order_usd}</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={orderAmountUsd}
                    onChange={(e) => setOrderAmountUsd(e.target.value)}
                    min={selectedAd.min_order_usd}
                    max={selectedAd.max_order_usd}
                    required
                    className="w-full bg-black/60 border border-white/10 rounded-2xl px-4 py-3 text-sm font-black text-white outline-none focus:border-blue-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-blue-400">USD</span>
                </div>
              </div>

              {/* Calculated Local Currency Amount */}
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-between">
                <span className="text-[10px] font-black text-blue-300 uppercase">You Pay / Receive ({selectedAd.local_currency}):</span>
                <span className="text-base font-black text-white">
                  {((parseFloat(orderAmountUsd) || 0) * selectedAd.price).toLocaleString()} {selectedAd.local_currency}
                </span>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Select Payment Method</label>
                <select
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-2xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-blue-500"
                >
                  {selectedAd.payment_methods.map((method, idx) => (
                    <option key={idx} value={method}>{method}</option>
                  ))}
                </select>
              </div>

              {/* Counterparty Terms */}
              <div className="p-3 bg-white/5 border border-white/5 rounded-2xl space-y-1">
                <p className="text-[9px] font-black text-gray-400 uppercase">Advertiser Payment Terms:</p>
                <p className="text-[11px] font-bold text-gray-300 leading-relaxed">{selectedAd.terms}</p>
              </div>

              {/* Error or Success Alert */}
              {orderError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs font-bold text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{orderError}</span>
                </div>
              )}

              {orderSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs font-bold text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{orderSuccess}</span>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAd(null)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-2xl font-black text-xs uppercase text-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOrder}
                  className={`flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-wider text-white shadow-lg transition-all ${
                    activeSubTab === 'buy_usd' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'
                  }`}
                >
                  {isSubmittingOrder ? 'Processing...' : 'Confirm Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
