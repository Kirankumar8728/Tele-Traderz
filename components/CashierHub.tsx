import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Globe, 
  CreditCard, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownRight, 
  Coins, 
  Building2, 
  RefreshCw, 
  Copy, 
  Check, 
  QrCode, 
  ExternalLink, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  Phone, 
  Mail, 
  Search, 
  Filter, 
  Lock, 
  Repeat, 
  Zap,
  Info,
  ChevronRight,
  MessageCircle,
  Layers,
  Sliders,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import { DerivAccount } from '../types';
import { P2PView } from './P2PView';

interface PaymentAgent {
  id: number;
  name: string;
  nickname: string;
  email: string;
  phone_numbers: string[];
  payment_methods: string[];
  countries: string[];
  deposit_commission: number;
  withdrawal_commission: number;
  withdrawal_minimum: string;
  withdrawal_maximum: string;
  urls: string[];
  information: string;
}

interface CryptoAsset {
  symbol: string;
  name: string;
  network: string;
  icon: string;
  deposit_address: string;
  min_deposit: string;
  confirmations: string;
  color: string;
}

interface EWalletMethod {
  id: string;
  name: string;
  type: 'card' | 'ewallet';
  icon: string;
  processing_time: string;
  min_amount: number;
  max_amount: number;
  fee: string;
  supported_currencies: string[];
}

const SAMPLE_CRYPTO_ASSETS: CryptoAsset[] = [
  {
    symbol: 'USDT',
    name: 'Tether (TRC20)',
    network: 'TRON (TRC-20)',
    icon: '₮',
    deposit_address: 'T9yD14Nj9j7xKwLzM2P1Q8R3S4T5U6V7W8X9',
    min_deposit: '10 USDT',
    confirmations: '1 Confirmation (~2 mins)',
    color: 'emerald'
  },
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    network: 'Bitcoin Mainnet',
    icon: '₿',
    deposit_address: 'bc1q9x3v7k2m5n8p4r1q0w3e6r9t2y5u8i1o4p7a0s',
    min_deposit: '0.0005 BTC',
    confirmations: '2 Confirmations (~10 mins)',
    color: 'amber'
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    network: 'ERC-20',
    icon: 'Ξ',
    deposit_address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    min_deposit: '0.01 ETH',
    confirmations: '12 Confirmations (~5 mins)',
    color: 'indigo'
  },
  {
    symbol: 'LTC',
    name: 'Litecoin',
    network: 'Litecoin Network',
    icon: 'Ł',
    deposit_address: 'L3qK2m5n8p4r1q0w3e6r9t2y5u8i1o4p7a',
    min_deposit: '0.1 LTC',
    confirmations: '6 Confirmations (~5 mins)',
    color: 'blue'
  },
  {
    symbol: 'USDC',
    name: 'USD Coin (ERC20)',
    network: 'Ethereum (ERC-20)',
    icon: '$',
    deposit_address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    min_deposit: '10 USDC',
    confirmations: '12 Confirmations (~5 mins)',
    color: 'sky'
  }
];

const SAMPLE_PAYMENT_METHODS: EWalletMethod[] = [
  {
    id: 'visa_mc',
    name: 'Visa / Mastercard / Maestro',
    type: 'card',
    icon: '💳',
    processing_time: 'Instant',
    min_amount: 10,
    max_amount: 10000,
    fee: '0% Free',
    supported_currencies: ['USD', 'EUR', 'GBP', 'AUD']
  },
  {
    id: 'skrill',
    name: 'Skrill',
    type: 'ewallet',
    icon: '🟣',
    processing_time: 'Instant',
    min_amount: 10,
    max_amount: 5000,
    fee: '0% Free',
    supported_currencies: ['USD', 'EUR', 'GBP']
  },
  {
    id: 'neteller',
    name: 'Neteller',
    type: 'ewallet',
    icon: '🟢',
    processing_time: 'Instant',
    min_amount: 10,
    max_amount: 5000,
    fee: '0% Free',
    supported_currencies: ['USD', 'EUR', 'GBP']
  },
  {
    id: 'astropay',
    name: 'AstroPay Voucher & Wallet',
    type: 'ewallet',
    icon: '🟡',
    processing_time: 'Instant',
    min_amount: 10,
    max_amount: 2500,
    fee: '0% Free',
    supported_currencies: ['USD', 'INR', 'BRL', 'NGN']
  },
  {
    id: 'airtm',
    name: 'AirTM',
    type: 'ewallet',
    icon: '🔵',
    processing_time: 'Instant',
    min_amount: 10,
    max_amount: 2500,
    fee: '0% Free',
    supported_currencies: ['USD']
  },
  {
    id: 'perfect_money',
    name: 'Perfect Money',
    type: 'ewallet',
    icon: '🔴',
    processing_time: 'Instant',
    min_amount: 10,
    max_amount: 5000,
    fee: '0% Free',
    supported_currencies: ['USD', 'EUR']
  }
];

const SAMPLE_AGENTS: PaymentAgent[] = [
  {
    id: 101,
    name: 'Global Traders India',
    nickname: 'gt_india',
    email: 'deposits@gtindia.com',
    phone_numbers: ['+919876543210'],
    payment_methods: ['UPI', 'IMPS', 'GooglePay', 'PhonePe', 'Paytm'],
    countries: ['in'],
    deposit_commission: 0,
    withdrawal_commission: 1.5,
    withdrawal_minimum: '10.00',
    withdrawal_maximum: '5000.00',
    urls: ['https://gtindia.com'],
    information: 'Instant UPI and IMPS INR transfers. Certified top-rated agent in India.'
  },
  {
    id: 102,
    name: 'NairaExpress Agent',
    nickname: 'naira_express',
    email: 'support@nairaexpress.ng',
    phone_numbers: ['+2348012345678'],
    payment_methods: ['Bank Transfer', 'Kuda Bank', 'OPay', 'Palmpay'],
    countries: ['ng'],
    deposit_commission: 0,
    withdrawal_commission: 1.0,
    withdrawal_minimum: '10.00',
    withdrawal_maximum: '3000.00',
    urls: ['https://nairaexpress.ng'],
    information: '24/7 Fast NGN bank transfers. Lowest commission rates for Nigeria traders.'
  },
  {
    id: 103,
    name: 'Indo Paymaster',
    nickname: 'indopay',
    email: 'help@indopay.co.id',
    phone_numbers: ['+628123456789'],
    payment_methods: ['BCA', 'Mandiri', 'BRI', 'GoPay', 'OVO'],
    countries: ['id'],
    deposit_commission: 0,
    withdrawal_commission: 2.0,
    withdrawal_minimum: '10.00',
    withdrawal_maximum: '2500.00',
    urls: ['https://indopay.co.id'],
    information: 'Official Indonesia payment agent supporting all major local banks.'
  },
  {
    id: 104,
    name: 'EastAfrica Cashier',
    nickname: 'ea_cashier',
    email: 'info@eapay.co.ke',
    phone_numbers: ['+254712345678'],
    payment_methods: ['M-Pesa', 'Airtel Money', 'Equity Bank'],
    countries: ['ke'],
    deposit_commission: 0,
    withdrawal_commission: 1.5,
    withdrawal_minimum: '10.00',
    withdrawal_maximum: '2000.00',
    urls: ['https://eapay.co.ke'],
    information: 'Instant M-Pesa deposits and withdrawals for Kenya traders.'
  }
];

interface CashierHubProps {
  account: DerivAccount | null;
  send: (payload: Record<string, unknown>) => void;
  onNavigateToP2P: () => void;
  setCustomAlert?: (msg: string) => void;
}

export const CashierHub: React.FC<CashierHubProps> = ({
  account,
  send,
  onNavigateToP2P,
  setCustomAlert
}) => {
  // Navigation state: null = Sub Payment Categories view; string = specific payment dashboard selected
  const [selectedCategory, setSelectedCategory] = useState<'cards_ewallets' | 'p2p' | 'agents' | 'crypto' | 'transfer' | 'express' | null>(null);
  
  // Withdrawal verification state
  const [showWithdrawVerify, setShowWithdrawVerify] = useState<boolean>(false);
  const [withdrawVerifyCode, setWithdrawVerifyCode] = useState<string>('');
  const [isSendingVerify, setIsSendingVerify] = useState<boolean>(false);

  // Selected Crypto Modal State
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoAsset | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<boolean>(false);

  // Agent State
  const [agentCountry, setAgentCountry] = useState<string>('in');
  const [agentSearch, setAgentSearch] = useState<string>('');
  const [selectedAgent, setSelectedAgent] = useState<PaymentAgent | null>(null);
  const [agentActionType, setAgentActionType] = useState<'deposit' | 'withdraw'>('deposit');
  const [agentAmount, setAgentAmount] = useState<string>('50');
  const [agentVerifyCode, setAgentVerifyCode] = useState<string>('');
  const [isSubmittingAgent, setIsSubmittingAgent] = useState<boolean>(false);
  const [agentSuccessMsg, setAgentSuccessMsg] = useState<string | null>(null);

  // Account Transfer State
  const [transferAmount, setTransferAmount] = useState<string>('20');
  const [transferFrom, setTransferFrom] = useState<string>('CR_OPTIONS');
  const [transferTo, setTransferTo] = useState<string>('MT5_SYNTHETIC');
  const [isTransferring, setIsTransferring] = useState<boolean>(false);
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null);

  // Fetch Payment Agents list when agent tab is active
  useEffect(() => {
    if (selectedCategory === 'agents') {
      try {
        send({
          payment_agent_list: agentCountry
        });
      } catch (e) {
        console.log('[Cashier] payment_agent_list error:', e);
      }
    }
  }, [selectedCategory, agentCountry]);

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleDirectDerivCashier = (type: 'deposit' | 'withdraw') => {
    if (type === 'deposit') {
      send({ cashier: 'deposit' });
    } else {
      if (account?.is_virtual) {
        if (setCustomAlert) setCustomAlert("Demo accounts cannot withdraw funds. Please switch to a real account.");
        return;
      }
      send({ cashier: 'withdraw' });
    }
  };

  const handleAgentActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent) return;

    if (account?.is_virtual) {
      if (setCustomAlert) setCustomAlert("Demo accounts cannot use Payment Agents. Please switch to a real account.");
      return;
    }

    const amt = parseFloat(agentAmount);
    const min = parseFloat(selectedAgent.withdrawal_minimum || '10');
    const max = parseFloat(selectedAgent.withdrawal_maximum || '5000');

    if (isNaN(amt) || amt < min || amt > max) {
      if (setCustomAlert) setCustomAlert(`Amount must be between $${min} and $${max}`);
      return;
    }

    setIsSubmittingAgent(true);

    if (agentActionType === 'withdraw') {
      try {
        send({
          payment_agent_withdraw: 1,
          agent_id: selectedAgent.id,
          amount: amt,
          currency: account?.currency || 'USD',
          verification_code: agentVerifyCode.trim() || '123456'
        });
      } catch (err) {
        console.log('[Cashier] Agent withdraw WS error:', err);
      }
    } else {
      try {
        send({
          payment_agent_transfer: 1,
          transfer_to: selectedAgent.nickname,
          amount: amt,
          currency: account?.currency || 'USD'
        });
      } catch (err) {
        console.log('[Cashier] Agent transfer WS error:', err);
      }
    }

    setTimeout(() => {
      setIsSubmittingAgent(false);
      setAgentSuccessMsg(`Request for $${amt} USD via ${selectedAgent.name} successfully submitted! Agent notification dispatched.`);
      setTimeout(() => {
        setSelectedAgent(null);
        setAgentSuccessMsg(null);
      }, 2500);
    }, 1200);
  };

  const handleInternalTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (account?.is_virtual) {
      if (setCustomAlert) setCustomAlert("Internal transfers require a real trading account.");
      return;
    }

    const amt = parseFloat(transferAmount);
    if (isNaN(amt) || amt <= 0 || amt > (account?.balance || 0)) {
      if (setCustomAlert) setCustomAlert(`Invalid transfer amount. Available balance: $${account?.balance?.toFixed(2) || '0.00'}`);
      return;
    }

    setIsTransferring(true);
    
    // WS call for account transfer
    try {
      send({
        transfer_between_accounts: 1,
        amount: amt,
        currency: account?.currency || 'USD'
      });
    } catch (err) {
      console.log('[Cashier] Transfer between accounts error:', err);
    }

    setTimeout(() => {
      setIsTransferring(false);
      setTransferSuccess(`Successfully transferred $${amt.toFixed(2)} USD from ${transferFrom} to ${transferTo}.`);
      setTimeout(() => setTransferSuccess(null), 3000);
    }, 1200);
  };

  // Filter Agents
  const filteredAgents = SAMPLE_AGENTS.filter(agent => {
    if (agentCountry !== 'all' && !agent.countries.includes(agentCountry)) {
      return false;
    }
    if (agentSearch.trim()) {
      const q = agentSearch.toLowerCase();
      const matchName = agent.name.toLowerCase().includes(q) || agent.nickname.toLowerCase().includes(q);
      const matchMethod = agent.payment_methods.some(m => m.toLowerCase().includes(q));
      if (!matchName && !matchMethod) return false;
    }
    return true;
  });

  // Helper for Breadcrumb Category Details
  const getCategoryInfo = (tab: typeof selectedCategory) => {
    switch (tab) {
      case 'cards_ewallets':
        return {
          title: 'Cards & E-Wallets',
          icon: CreditCard,
          color: 'text-emerald-400',
          badgeBg: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
          desc: 'Direct instant deposits & withdrawals via Visa, Mastercard, Skrill, Neteller, AstroPay and AirTM.'
        };
      case 'p2p':
        return {
          title: 'Deriv P2P Market',
          icon: Globe,
          color: 'text-blue-400',
          badgeBg: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
          desc: 'Peer-to-Peer marketplace to buy and sell USD using local bank transfers & mobile money.'
        };
      case 'agents':
        return {
          title: 'Authorized Payment Agents',
          icon: Building2,
          color: 'text-indigo-400',
          badgeBg: 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400',
          desc: 'Deposit and withdraw through certified local Deriv agents in your country.'
        };
      case 'crypto':
        return {
          title: 'Crypto & Blockchain',
          icon: Coins,
          color: 'text-amber-400',
          badgeBg: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
          desc: 'Instant auto-credited crypto deposits across TRON (TRC20), Bitcoin, Ethereum and ERC20.'
        };
      case 'transfer':
        return {
          title: 'Internal Account Transfer',
          icon: Repeat,
          color: 'text-violet-400',
          badgeBg: 'bg-violet-500/20 border-violet-500/30 text-violet-400',
          desc: 'Transfer funds instantly between your Deriv Options, MT5 Synthetic, and MT5 Financial accounts.'
        };
      case 'express':
        return {
          title: 'Express Deriv Cashier',
          icon: Zap,
          color: 'text-red-400',
          badgeBg: 'bg-red-500/20 border-red-500/30 text-red-400',
          desc: 'Direct Deriv official gateway deposit link & email verification code withdrawal system.'
        };
      default:
        return {
          title: 'Sub Payment Categories',
          icon: Layers,
          color: 'text-red-400',
          badgeBg: 'bg-red-500/20 border-red-500/30 text-red-400',
          desc: 'Select a sub payment category below to access its dedicated financial dashboard.'
        };
    }
  };

  const currentInfo = getCategoryInfo(selectedCategory);
  const CurrentIcon = currentInfo.icon;

  const CATEGORIES = [
    {
      id: 'cards_ewallets' as const,
      title: 'Cards & E-Wallets',
      icon: CreditCard,
      color: 'text-emerald-400',
      badge: 'Instant • 0% Fee',
      badgeBg: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
      borderHover: 'hover:border-emerald-500/50 hover:shadow-emerald-500/10',
      desc: 'Deposit & withdraw directly using Visa, Mastercard, Skrill, Neteller, AstroPay and AirTM.',
      tags: ['Visa', 'Mastercard', 'Skrill', 'Neteller', 'AstroPay', 'AirTM']
    },
    {
      id: 'p2p' as const,
      title: 'Deriv P2P Market',
      icon: Globe,
      color: 'text-blue-400',
      badge: 'Local Currency P2P',
      badgeBg: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
      borderHover: 'hover:border-blue-500/50 hover:shadow-blue-500/10',
      desc: 'Buy and sell USD directly with verified local traders using local bank transfers & mobile money.',
      tags: ['Local Bank Transfer', 'UPI', 'M-Pesa', 'IMPS', 'E-Wallets']
    },
    {
      id: 'agents' as const,
      title: 'Payment Agents',
      icon: Building2,
      color: 'text-indigo-400',
      badge: 'Certified Agents',
      badgeBg: 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400',
      borderHover: 'hover:border-indigo-500/50 hover:shadow-indigo-500/10',
      desc: 'Deposit and withdraw through certified local Deriv payment agents in your country.',
      tags: ['INR UPI', 'NGN Bank', 'IDR Bank', 'KES M-Pesa', 'Cash Transfer']
    },
    {
      id: 'crypto' as const,
      title: 'Crypto & Blockchain',
      icon: Coins,
      color: 'text-amber-400',
      badge: 'Auto-Credit • Multi-Chain',
      badgeBg: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
      borderHover: 'hover:border-amber-500/50 hover:shadow-amber-500/10',
      desc: 'Auto-credited cryptocurrency deposits with QR wallet addresses for USDT, BTC, ETH, and LTC.',
      tags: ['USDT TRC20', 'Bitcoin BTC', 'Ethereum ERC20', 'Litecoin LTC']
    },
    {
      id: 'transfer' as const,
      title: 'Internal Account Transfer',
      icon: Repeat,
      color: 'text-violet-400',
      badge: 'Instant MT5 & Options',
      badgeBg: 'bg-violet-500/20 border-violet-500/30 text-violet-400',
      borderHover: 'hover:border-violet-500/50 hover:shadow-violet-500/10',
      desc: 'Transfer funds instantly between your Deriv Options, MT5 Synthetic, and MT5 Financial accounts.',
      tags: ['Options -> MT5', 'MT5 -> Options', 'Financial -> Derived']
    },
    {
      id: 'express' as const,
      title: 'Express Cashier',
      icon: Zap,
      color: 'text-red-400',
      badge: 'Official Deriv Link',
      badgeBg: 'bg-red-500/20 border-red-500/30 text-red-400',
      borderHover: 'hover:border-red-500/50 hover:shadow-red-500/10',
      desc: 'Direct express deposit link to official Deriv gateway & email verification code withdrawal.',
      tags: ['Direct Gateway Deposit', 'Email Code Verification']
    }
  ];

  return (
    <div className="w-full px-2 sm:px-4 py-3 space-y-4 relative z-10 text-white animate-in fade-in duration-300">
      
      {/* CASHIER TOP NAVIGATION & BALANCE HEADER */}
      <div className="bg-[#141922] border border-white/10 rounded-2xl p-3.5 sm:p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        {selectedCategory === null ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white">Cashier & Payment Hub</h2>
              <p className="text-[10px] font-bold text-gray-400">Select a sub payment category below to access its specific financial dashboard.</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setSelectedCategory(null)}
              className="flex items-center gap-2 px-3.5 py-2 bg-black/50 hover:bg-black/80 border border-white/10 hover:border-red-500/40 rounded-xl text-xs font-black uppercase tracking-wider text-gray-300 hover:text-white transition-all group shadow-md"
            >
              <ArrowLeft className="w-4 h-4 text-red-500 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Categories</span>
            </button>

            <div className="h-5 w-[1px] bg-white/10 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${currentInfo.badgeBg}`}>
                <CurrentIcon className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white">{currentInfo.title}</h3>
            </div>
          </div>
        )}

        {/* Available Balance */}
        <div className="flex items-center gap-3 bg-black/40 border border-white/10 px-3.5 py-1.5 rounded-xl ml-auto sm:ml-0">
          <div className="text-right">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Available Balance</p>
            <p className={`text-sm sm:text-base font-black leading-tight ${account?.is_virtual ? 'text-amber-400' : 'text-emerald-400'}`}>
              {account?.currency || 'USD'} {account?.balance?.toFixed(2) || '0.00'}
            </p>
          </div>
          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${
            account?.is_virtual ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
          }`}>
            {account?.is_virtual ? 'DEMO' : 'REAL'}
          </span>
        </div>
      </div>

      {/* STATE 1: ONLY SUB PAYMENT CATEGORIES DISPLAYED WHEN CASHIER IS CLICKED */}
      {selectedCategory === null ? (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          <div className="flex items-center justify-between border-b border-white/10 pb-2 px-1">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-red-500" />
                Select Sub Payment Category
              </h3>
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase">
              6 Dedicated Dashboards Available
            </span>
          </div>

          {/* Sub Payment Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORIES.map((cat) => {
              const IconComp = cat.icon;
              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`bg-[#141922] border border-white/10 ${cat.borderHover} rounded-2xl p-5 transition-all duration-300 flex flex-col justify-between space-y-4 group cursor-pointer shadow-xl hover:-translate-y-1 relative overflow-hidden`}
                >
                  <div className="space-y-3 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner ${cat.badgeBg}`}>
                        <IconComp className="w-6 h-6" />
                      </div>
                      <span className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase border ${cat.badgeBg}`}>
                        {cat.badge}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-black uppercase tracking-wide text-white group-hover:text-red-400 transition-colors flex items-center gap-2">
                        {cat.title}
                      </h4>
                      <p className="text-xs font-bold text-gray-400 mt-1 leading-relaxed">
                        {cat.desc}
                      </p>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {cat.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-black/40 border border-white/10 rounded-lg text-[9px] font-bold text-gray-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-3 flex items-center justify-between text-xs font-black uppercase tracking-wider text-red-500 group-hover:text-red-400 transition-colors">
                    <span>Open {cat.title}</span>
                    <div className="w-7 h-7 rounded-lg bg-red-600/10 group-hover:bg-red-600 group-hover:text-white border border-red-500/20 flex items-center justify-center transition-all">
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* STATE 2: SPECIFIC PAYMENT DASHBOARD SELECTED */
        <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300 w-full">
          
          {/* DASHBOARD VIEW 1: CARDS & E-WALLETS */}
          {selectedCategory === 'cards_ewallets' && (
            <div className="bg-[#141922] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl w-full">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h4 className="text-sm font-black uppercase text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    Supported Cards & E-Wallets
                  </h4>
                  <p className="text-[11px] font-bold text-gray-400 mt-0.5">{currentInfo.desc}</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
                  Zero Fees • Instant
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {SAMPLE_PAYMENT_METHODS.map((method) => (
                  <div 
                    key={method.id}
                    className="bg-black/40 hover:bg-black/60 border border-white/10 hover:border-emerald-500/40 rounded-2xl p-4 transition-all flex flex-col justify-between space-y-3 group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{method.icon}</span>
                        <div>
                          <h4 className="font-black text-sm text-white">{method.name}</h4>
                          <p className="text-[10px] font-bold text-emerald-400 mt-0.5">{method.fee} • {method.processing_time}</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-white/5 text-gray-400 text-[9px] font-bold rounded-lg border border-white/5">
                        ${method.min_amount} - ${method.max_amount}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 border-t border-white/5 pt-3">
                      <button
                        onClick={() => handleDirectDerivCashier('deposit')}
                        className="flex-1 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>Deposit</span>
                      </button>

                      <button
                        onClick={() => handleDirectDerivCashier('withdraw')}
                        className="flex-1 py-2.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all"
                      >
                        <ArrowDownRight className="w-3.5 h-3.5" />
                        <span>Withdraw</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DASHBOARD VIEW 2: DERIV P2P MARKET */}
          {selectedCategory === 'p2p' && (
            <div className="bg-[#141922] border border-white/10 rounded-2xl p-2 sm:p-4 shadow-xl overflow-hidden w-full">
              <P2PView account={account} send={send} />
            </div>
          )}

          {/* DASHBOARD VIEW 3: PAYMENT AGENTS */}
          {selectedCategory === 'agents' && (
            <div className="bg-[#141922] border border-white/10 rounded-3xl p-5 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-400" />
                    <h4 className="text-base font-black uppercase tracking-wider text-white">Certified Payment Agents</h4>
                  </div>
                  <p className="text-[11px] font-bold text-gray-400 mt-1">
                    Exchange local currency with official Deriv authorized payment agents in your area.
                  </p>
                </div>

                {/* Country Filter */}
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Country:</label>
                  <select
                    value={agentCountry}
                    onChange={(e) => setAgentCountry(e.target.value)}
                    className="bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold text-white outline-none focus:border-indigo-500"
                  >
                    <option value="all">All Countries</option>
                    <option value="in">India (INR)</option>
                    <option value="ng">Nigeria (NGN)</option>
                    <option value="id">Indonesia (IDR)</option>
                    <option value="za">South Africa (ZAR)</option>
                    <option value="br">Brazil (BRL)</option>
                    <option value="ke">Kenya (KES)</option>
                  </select>
                </div>
              </div>

              {/* Agent Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={agentSearch}
                  onChange={(e) => setAgentSearch(e.target.value)}
                  placeholder="Search agent by name or payment method..."
                  className="w-full bg-black/60 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-white placeholder-gray-600 outline-none focus:border-indigo-500"
                />
              </div>

              {/* Agent Grid */}
              <div className="grid grid-cols-1 gap-4">
                {filteredAgents.map((agent) => (
                  <div 
                    key={agent.id}
                    className="p-4 bg-black/40 border border-white/10 rounded-2xl hover:border-indigo-500/40 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-black text-xs">
                          {agent.nickname.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-black text-sm text-white">{agent.name}</h4>
                          <span className="text-[10px] font-bold text-gray-400">Handle: @{agent.nickname}</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black rounded-xl">
                        Dep: {agent.deposit_commission}% | With: {agent.withdrawal_commission}%
                      </span>
                    </div>

                    <p className="text-[11px] font-bold text-gray-300 leading-relaxed">
                      {agent.information}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {agent.payment_methods.map((method, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-lg text-[9px] font-bold text-gray-300">
                          {method}
                        </span>
                      ))}
                    </div>

                    <div className="border-t border-white/5 pt-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {agent.phone_numbers[0] && (
                          <a 
                            href={`https://wa.me/${agent.phone_numbers[0].replace(/[^0-9]/g, '')}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="p-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        )}
                        <a 
                          href={`mailto:${agent.email}`}
                          className="p-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Email</span>
                        </a>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedAgent(agent);
                            setAgentActionType('deposit');
                          }}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-[10px] font-black uppercase text-white shadow-md transition-all"
                        >
                          Deposit
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAgent(agent);
                            setAgentActionType('withdraw');
                          }}
                          className="px-3.5 py-2 bg-red-600 hover:bg-red-500 rounded-xl text-[10px] font-black uppercase text-white shadow-md transition-all"
                        >
                          Withdraw
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DASHBOARD VIEW 4: CRYPTO & BLOCKCHAIN */}
          {selectedCategory === 'crypto' && (
            <div className="bg-[#141922] border border-white/10 rounded-3xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h4 className="text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
                    <Coins className="w-5 h-5 text-amber-400" />
                    Crypto & Blockchain Network Portal
                  </h4>
                  <p className="text-[11px] font-bold text-gray-400 mt-0.5">{currentInfo.desc}</p>
                </div>
                <span className="text-[10px] font-bold text-amber-400 uppercase bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20">
                  Instant Auto-Credit
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SAMPLE_CRYPTO_ASSETS.map((asset) => (
                  <div 
                    key={asset.symbol}
                    className="p-4 bg-black/40 border border-white/10 hover:border-amber-500/40 rounded-2xl transition-all space-y-3 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-black text-lg shadow-inner">
                          {asset.icon}
                        </div>
                        <div>
                          <h4 className="font-black text-sm text-white">{asset.name}</h4>
                          <span className="text-[10px] font-bold text-gray-400">{asset.network}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-white/5 rounded-xl text-[10px] font-bold text-gray-300 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Min Deposit:</span>
                        <span className="text-white">{asset.min_deposit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Confirmation Speed:</span>
                        <span className="text-emerald-400">{asset.confirmations}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedCrypto(asset)}
                      className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 rounded-xl text-[10px] font-black uppercase text-white tracking-wider transition-all shadow-lg shadow-amber-600/20 flex items-center justify-center gap-1.5"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Get Wallet Address & QR</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DASHBOARD VIEW 5: INTERNAL ACCOUNT TRANSFER */}
          {selectedCategory === 'transfer' && (
            <div className="bg-[#141922] border border-white/10 rounded-3xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <Repeat className="w-5 h-5 text-violet-400" />
                <div>
                  <h4 className="text-base font-black uppercase tracking-wider text-white">Internal Account Transfer Dashboard</h4>
                  <p className="text-[11px] font-bold text-gray-400 mt-0.5">{currentInfo.desc}</p>
                </div>
              </div>

              <form onSubmit={handleInternalTransferSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* From Account */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase">From Trading Account</label>
                    <select
                      value={transferFrom}
                      onChange={(e) => setTransferFrom(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-2xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-violet-500"
                    >
                      <option value="CR_OPTIONS">Deriv Options Real ({account?.loginid || 'CR000000'})</option>
                      <option value="MT5_SYNTHETIC">Deriv MT5 Derived (MT789210)</option>
                      <option value="MT5_FINANCIAL">Deriv MT5 Financial (MT449120)</option>
                      <option value="DERIV_X">Deriv X Trading Account</option>
                    </select>
                  </div>

                  {/* To Account */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase">To Trading Account</label>
                    <select
                      value={transferTo}
                      onChange={(e) => setTransferTo(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-2xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-violet-500"
                    >
                      <option value="MT5_SYNTHETIC">Deriv MT5 Derived (MT789210)</option>
                      <option value="MT5_FINANCIAL">Deriv MT5 Financial (MT449120)</option>
                      <option value="DERIV_X">Deriv X Trading Account</option>
                      <option value="CR_OPTIONS">Deriv Options Real ({account?.loginid || 'CR000000'})</option>
                    </select>
                  </div>
                </div>

                {/* Amount */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase flex justify-between">
                    <span>Transfer Amount ($ USD)</span>
                    <span>Available: ${account?.balance?.toFixed(2) || '0.00'}</span>
                  </label>
                  <input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    min="1"
                    step="0.01"
                    required
                    className="w-full bg-black/60 border border-white/10 rounded-2xl px-4 py-3 text-sm font-black text-white outline-none focus:border-violet-500"
                  />
                </div>

                {transferSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs font-bold text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>{transferSuccess}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isTransferring}
                  className="w-full py-3.5 bg-violet-600 hover:bg-violet-500 rounded-2xl font-black text-xs uppercase tracking-wider text-white shadow-lg shadow-violet-600/20 transition-all"
                >
                  {isTransferring ? 'Executing Transfer...' : 'Confirm Account Transfer'}
                </button>
              </form>
            </div>
          )}

          {/* DASHBOARD VIEW 6: EXPRESS DERIV CASHIER */}
          {selectedCategory === 'express' && (
            <div className="bg-[#141922] border border-white/10 rounded-3xl p-5 space-y-5 shadow-xl">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <Zap className="w-5 h-5 text-red-500" />
                <div>
                  <h4 className="text-base font-black uppercase tracking-wider text-white">Express Deriv Cashier Gateway</h4>
                  <p className="text-[11px] font-bold text-gray-400 mt-0.5">{currentInfo.desc}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Deposit Option */}
                <div className="p-5 bg-black/40 border border-emerald-500/20 rounded-2xl space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="font-black text-sm uppercase text-emerald-400 flex items-center gap-2">
                        <ArrowUpRight className="w-4 h-4" />
                        Direct Deposit
                      </h5>
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[9px] font-black rounded-lg">Official API</span>
                    </div>
                    <p className="text-[11px] font-bold text-gray-400 leading-relaxed">
                      Instantly open the official encrypted Deriv cashier portal to process direct deposits via credit cards, bank transfer, or electronic vouchers.
                    </p>
                  </div>
                  <button 
                    onClick={() => handleDirectDerivCashier('deposit')}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-black text-xs uppercase text-white shadow-lg transition-all"
                  >
                    Open Deriv Deposit Portal
                  </button>
                </div>

                {/* Withdraw Option */}
                <div className="p-5 bg-black/40 border border-red-500/20 rounded-2xl space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="font-black text-sm uppercase text-red-400 flex items-center gap-2">
                        <ArrowDownRight className="w-4 h-4" />
                        Secure Withdrawal
                      </h5>
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-300 text-[9px] font-black rounded-lg">Email Auth</span>
                    </div>
                    <p className="text-[11px] font-bold text-gray-400 leading-relaxed">
                      Request a 2FA security verification email to initiate withdrawal to your original deposit method.
                    </p>
                  </div>

                  {!showWithdrawVerify ? (
                    <button 
                      onClick={() => {
                        if (account && account.is_virtual) {
                          if (setCustomAlert) setCustomAlert("Demo accounts cannot withdraw funds. Please switch to a real account.");
                          return;
                        }
                        if (account && !account.is_virtual && account.balance <= 0) {
                          if (setCustomAlert) setCustomAlert("Your real account balance is 0. Make a deposit and try again.");
                          return;
                        }
                        setIsSendingVerify(true);
                        send({ verify_email: account?.email, type: 'payment_withdraw' });
                        setTimeout(() => {
                          setIsSendingVerify(false);
                          setShowWithdrawVerify(true);
                        }, 1200);
                      }}
                      disabled={isSendingVerify}
                      className="w-full py-3 bg-red-600 hover:bg-red-500 rounded-xl font-black text-xs uppercase text-white shadow-lg transition-all disabled:opacity-50"
                    >
                      {isSendingVerify ? 'Sending Verification...' : 'Send Withdrawal Verification Email'}
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-[9px] font-black text-gray-400 uppercase">Enter code sent to email</p>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={withdrawVerifyCode}
                          onChange={(e) => setWithdrawVerifyCode(e.target.value)}
                          placeholder="Code"
                          className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono font-bold outline-none focus:border-red-500"
                        />
                        <button 
                          onClick={() => {
                            if (withdrawVerifyCode.trim()) {
                              send({ cashier: 'withdraw', verification_code: withdrawVerifyCode.trim() });
                            }
                          }}
                          disabled={!withdrawVerifyCode.trim()}
                          className="px-4 py-2 bg-red-600 rounded-xl font-black text-xs uppercase disabled:opacity-50"
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CRYPTO DEPOSIT QR MODAL */}
      {selectedCrypto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#141922] border border-white/10 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl relative text-center">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-left">
                <span className="text-2xl">{selectedCrypto.icon}</span>
                <div>
                  <h3 className="font-black text-base text-white">{selectedCrypto.name} Deposit</h3>
                  <p className="text-[10px] font-bold text-amber-400">{selectedCrypto.network}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCrypto(null)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Simulated QR Code Visual */}
            <div className="p-4 bg-white rounded-2xl w-48 h-48 mx-auto flex flex-col items-center justify-center border-4 border-amber-500/30 shadow-inner">
              <QrCode className="w-36 h-36 text-black" />
              <span className="text-[9px] font-black text-black uppercase mt-1">Scan with Crypto Wallet</span>
            </div>

            {/* Deposit Address Box */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-black text-gray-400 uppercase">Deposit Wallet Address</label>
              <div className="flex items-center gap-2 bg-black/60 border border-white/10 rounded-2xl p-2.5">
                <input
                  type="text"
                  readOnly
                  value={selectedCrypto.deposit_address}
                  className="flex-1 bg-transparent text-xs font-mono font-bold text-white outline-none overflow-hidden text-ellipsis"
                />
                <button
                  onClick={() => handleCopyAddress(selectedCrypto.deposit_address)}
                  className="p-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                >
                  {copiedAddress ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedAddress ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-left text-[10px] font-bold text-amber-300 space-y-1">
              <p>• Send only <strong className="text-white">{selectedCrypto.symbol}</strong> via <strong className="text-white">{selectedCrypto.network}</strong> network.</p>
              <p>• Minimum deposit: <strong className="text-white">{selectedCrypto.min_deposit}</strong>.</p>
              <p>• Funds automatically credited after {selectedCrypto.confirmations}.</p>
            </div>

            <button
              onClick={() => setSelectedCrypto(null)}
              className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-2xl font-black text-xs uppercase text-white"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* PAYMENT AGENT REQUEST MODAL */}
      {selectedAgent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#141922] border border-white/10 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl relative">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-black italic uppercase text-white">
                  {agentActionType === 'deposit' ? 'Deposit via Agent' : 'Withdraw via Agent'}
                </h3>
                <p className="text-[10px] font-bold text-indigo-400">
                  Agent: {selectedAgent.name} (@{selectedAgent.nickname})
                </p>
              </div>
              <button
                onClick={() => setSelectedAgent(null)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAgentActionSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase flex justify-between">
                  <span>Amount ($ USD)</span>
                  <span>Limits: ${selectedAgent.withdrawal_minimum} - ${selectedAgent.withdrawal_maximum}</span>
                </label>
                <input
                  type="number"
                  value={agentAmount}
                  onChange={(e) => setAgentAmount(e.target.value)}
                  min={selectedAgent.withdrawal_minimum}
                  max={selectedAgent.withdrawal_maximum}
                  required
                  className="w-full bg-black/60 border border-white/10 rounded-2xl px-4 py-3 text-sm font-black text-white outline-none focus:border-indigo-500"
                />
              </div>

              {agentActionType === 'withdraw' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Verification Code (From Email)</label>
                  <input
                    type="text"
                    value={agentVerifyCode}
                    onChange={(e) => setAgentVerifyCode(e.target.value)}
                    placeholder="Enter 6-digit email code"
                    required
                    className="w-full bg-black/60 border border-white/10 rounded-2xl px-4 py-3 text-xs font-mono font-bold text-white outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              <div className="p-3 bg-white/5 rounded-2xl text-[11px] font-bold text-gray-300 space-y-1">
                <p className="text-gray-400 uppercase text-[9px] font-black">Agent Details:</p>
                <p>Methods: {selectedAgent.payment_methods.join(', ')}</p>
                <p>Commission: {agentActionType === 'deposit' ? `${selectedAgent.deposit_commission}%` : `${selectedAgent.withdrawal_commission}%`}</p>
              </div>

              {agentSuccessMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs font-bold text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{agentSuccessMsg}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAgent(null)}
                  className="flex-1 py-3 bg-white/5 rounded-2xl font-black text-xs uppercase text-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAgent}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black text-xs uppercase text-white shadow-lg"
                >
                  {isSubmittingAgent ? 'Submitting...' : 'Confirm Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
