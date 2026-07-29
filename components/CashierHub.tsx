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
  ArrowLeft,
  Landmark,
  Smartphone,
  HelpCircle,
  ChevronDown,
  ChevronUp
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
    symbol: 'BINANCE',
    name: 'Binance Pay (USDT / BUSD)',
    network: 'Binance Pay ID / QR',
    icon: '🟡',
    deposit_address: 'binancepay@deriv.com (Pay ID: 84920184)',
    min_deposit: '5 USDT',
    confirmations: 'Instant Auto-Credit (0% Fee)',
    color: 'amber'
  },
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
  const [selectedCategory, setSelectedCategory] = useState<'bank_upi' | 'cards_ewallets' | 'p2p' | 'agents' | 'crypto' | 'transfer' | 'express' | null>(null);

  // Direct Bank UPI Gateway State
  const [bankUpiMode, setBankUpiMode] = useState<'deposit' | 'withdraw'>('deposit');
  const [bankUpiApp, setBankUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'netbanking'>('gpay');
  const [bankUpiAmount, setBankUpiAmount] = useState<string>('50');
  const [bankUpiVpa, setBankUpiVpa] = useState<string>('');
  const [bankUpiUtr, setBankUpiUtr] = useState<string>('');
  const [bankUpiBankName, setBankUpiBankName] = useState<string>('HDFC Bank');
  const [bankUpiAccountNo, setBankUpiAccountNo] = useState<string>('');
  const [bankUpiIfsc, setBankUpiIfsc] = useState<string>('');
  const [bankUpiVerifyCode, setBankUpiVerifyCode] = useState<string>('');
  const [isSubmittingBankUpi, setIsSubmittingBankUpi] = useState<boolean>(false);
  const [bankUpiSuccessMsg, setBankUpiSuccessMsg] = useState<string | null>(null);
  const [copiedBankUpiVpa, setCopiedBankUpiVpa] = useState<boolean>(false);
  const [showUtrHelp, setShowUtrHelp] = useState<boolean>(true);
  
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

  // Direct Bank UPI Handlers
  const handleBankUpiDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(bankUpiAmount);
    if (isNaN(amt) || amt < 5) {
      if (setCustomAlert) setCustomAlert("Minimum bank deposit amount is $5 USD (₹442.50 INR)");
      return;
    }
    if (amt > 10000) {
      if (setCustomAlert) setCustomAlert("Maximum bank deposit limit per transaction is $10,000 USD (₹8,85,000 INR)");
      return;
    }
    if (!bankUpiUtr.trim()) {
      if (setCustomAlert) setCustomAlert("Please enter your 12-digit UPI UTR / Bank Reference Number after completing payment.");
      return;
    }

    setIsSubmittingBankUpi(true);
    setTimeout(() => {
      setIsSubmittingBankUpi(false);
      const inrAmt = (amt * 88.50).toLocaleString('en-IN', { maximumFractionDigits: 2 });
      setBankUpiSuccessMsg(`Direct Bank Deposit request submitted! UTR Ref: ${bankUpiUtr.trim()}. $${amt} USD (₹${inrAmt} INR) verified with ${bankUpiApp.toUpperCase()} Gateway and queued for auto-credit.`);
      setBankUpiUtr('');
      setTimeout(() => setBankUpiSuccessMsg(null), 5000);
    }, 1200);
  };

  const handleBankUpiWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (account?.is_virtual) {
      if (setCustomAlert) setCustomAlert("Demo accounts cannot withdraw real funds.");
      return;
    }
    const amt = parseFloat(bankUpiAmount);
    if (isNaN(amt) || amt < 10) {
      if (setCustomAlert) setCustomAlert("Minimum Bank UPI withdrawal is $10 USD (₹880 INR)");
      return;
    }
    if (amt > 10000) {
      if (setCustomAlert) setCustomAlert("Maximum Bank UPI withdrawal limit per transaction is $10,000 USD (₹8,80,000 INR)");
      return;
    }
    if (amt > (account?.balance || 0)) {
      if (setCustomAlert) setCustomAlert(`Insufficient balance. Maximum available: $${account?.balance?.toFixed(2) || '0.00'}`);
      return;
    }
    if (!bankUpiVpa.trim() && !bankUpiAccountNo.trim()) {
      if (setCustomAlert) setCustomAlert("Please enter your target UPI VPA or Bank Account Number.");
      return;
    }

    setIsSubmittingBankUpi(true);
    setTimeout(() => {
      setIsSubmittingBankUpi(false);
      const target = bankUpiVpa.trim() || `${bankUpiBankName} A/C ${bankUpiAccountNo.trim().slice(-4)}`;
      setBankUpiSuccessMsg(`Bank Withdrawal of $${amt.toFixed(2)} USD dispatched to ${target}! Payout processed directly via Bank IMPS/UPI gateway.`);
      setTimeout(() => setBankUpiSuccessMsg(null), 5000);
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
      case 'bank_upi':
        return {
          title: 'Direct Bank UPI & Transfer',
          icon: Landmark,
          color: 'text-emerald-400',
          badgeBg: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
          desc: 'Direct instant bank deposits & payouts via official Bank UPI (GPay, PhonePe, Paytm, BHIM) and Bank IMPS / NetBanking.'
        };
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
      id: 'bank_upi' as const,
      title: 'Direct Bank UPI & Transfer',
      icon: Landmark,
      color: 'text-emerald-400',
      badge: 'Official Bank Gateway • Instant',
      badgeBg: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
      borderHover: 'hover:border-emerald-500/50 hover:shadow-emerald-500/10',
      desc: 'Instant direct bank deposits & withdrawals via official Bank UPI (Google Pay, PhonePe, Paytm, BHIM) and IMPS NetBanking.',
      minLimit: '$5.00 USD (₹442.50)',
      maxLimit: '$10,000.00 USD (₹8,85,000)',
      tags: ['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI', 'Direct Bank IMPS', '0% Fee']
    },
    {
      id: 'cards_ewallets' as const,
      title: 'Cards & E-Wallets',
      icon: CreditCard,
      color: 'text-emerald-400',
      badge: 'Instant • 0% Fee',
      badgeBg: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
      borderHover: 'hover:border-emerald-500/50 hover:shadow-emerald-500/10',
      desc: 'Deposit & withdraw directly using Visa, Mastercard, Skrill, Neteller, AstroPay and AirTM.',
      minLimit: '$10.00 USD',
      maxLimit: '$10,000.00 USD',
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
      minLimit: '$1.00 USD',
      maxLimit: '$5,000.00 USD',
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
      minLimit: '$10.00 USD',
      maxLimit: '$2,000.00 USD',
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
      minLimit: '$5.00 USD',
      maxLimit: '$50,000.00 USD',
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
      minLimit: '$0.10 USD',
      maxLimit: '$50,000.00 USD',
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
      minLimit: '$10.00 USD',
      maxLimit: '$10,000.00 USD',
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

        {/* Available Balance & Account Recognition */}
        <div className="flex items-center gap-3 bg-black/40 border border-white/10 px-3.5 py-1.5 rounded-xl ml-auto sm:ml-0 shadow-sm">
          <div className="text-right">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider flex items-center justify-end gap-1">
              <span>Account:</span>
              <span className="text-white font-mono font-bold">{account?.loginid || 'Guest'}</span>
            </p>
            <p className={`text-sm sm:text-base font-black leading-tight ${account?.is_virtual ? 'text-amber-400' : 'text-emerald-400'}`}>
              {account?.currency || 'USD'} {account?.balance?.toFixed(2) || '0.00'}
            </p>
          </div>
          <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shrink-0 ${
            account?.is_virtual ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
          }`}>
            {account?.is_virtual ? 'DEMO WALLET' : 'REAL WALLET'}
          </span>
        </div>
      </div>

      {/* STATE 1: ONLY SUB PAYMENT CATEGORIES DISPLAYED WHEN CASHIER IS CLICKED */}
      {selectedCategory === null ? (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-3 px-1 gap-2.5">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-red-500" />
                  Select Sub Payment Category
                </h3>
              </div>

              {/* Most Used Payments */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  Most Used Payments:
                </span>
                <button
                  onClick={() => setSelectedCategory('bank_upi')}
                  className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-300 hover:text-emerald-200 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm hover:scale-105 active:scale-95"
                  title="Direct Bank UPI (Google Pay, PhonePe, Paytm, BHIM) - Official Gateway"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  DIRECT BANK UPI
                </button>
                <button
                  onClick={() => setSelectedCategory('p2p')}
                  className="px-2.5 py-1 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 hover:text-blue-200 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm hover:scale-105 active:scale-95"
                  title="P2P Trading Marketplace via UPI & Local Banks"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  P2P UPI
                </button>
                <button
                  onClick={() => setSelectedCategory('crypto')}
                  className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-300 hover:text-amber-200 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm hover:scale-105 active:scale-95"
                  title="Instant Crypto Deposit & Pay via Binance Pay"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  BINANCE PAY
                </button>
                <button
                  onClick={() => setSelectedCategory('cards_ewallets')}
                  className="px-2.5 py-1 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 hover:text-purple-200 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm hover:scale-105 active:scale-95"
                  title="Visa / Mastercard / Skrill / Neteller"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                  VISA / MASTERCARD
                </button>
                <button
                  onClick={() => setSelectedCategory('agents')}
                  className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-lg text-indigo-300 hover:text-indigo-200 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm hover:scale-105 active:scale-95"
                  title="Local Bank Transfers & Agent Cashiers"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  LOCAL BANK TRANSFER
                </button>
              </div>
            </div>

            <span className="text-[10px] font-bold text-gray-400 uppercase self-start sm:self-center bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
              7 Dedicated Dashboards Available
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

                    {/* Min & Max Payment Limits Badge */}
                    <div className="flex items-center justify-between bg-black/50 border border-white/10 px-2.5 py-1.5 rounded-xl text-[10px] font-bold">
                      <span className="text-gray-400 uppercase tracking-wider">Payment Limits:</span>
                      <span className="text-emerald-400 font-black">Min {cat.minLimit} • Max {cat.maxLimit}</span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
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
          
          {/* DASHBOARD VIEW: DIRECT BANK UPI & INSTANT TRANSFER */}
          {selectedCategory === 'bank_upi' && (
            <div className="bg-[#141922] border border-white/10 rounded-2xl p-4 sm:p-6 space-y-5 shadow-xl w-full">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Landmark className="w-4 h-4" />
                    </div>
                    <h4 className="text-base font-black uppercase tracking-wider text-white">Direct Official Bank UPI & IMPS Gateway</h4>
                  </div>
                  <p className="text-[11px] font-bold text-gray-400 mt-1">
                    Direct bank payment gateway (Not P2P). Deposit or withdraw instantly via Google Pay, PhonePe, Paytm, BHIM UPI, or Direct IMPS Bank Transfer.
                  </p>
                </div>

                {/* Mode Selector */}
                <div className="flex items-center gap-1.5 bg-black/50 border border-white/10 p-1 rounded-xl self-start sm:self-center">
                  <button
                    type="button"
                    onClick={() => { setBankUpiMode('deposit'); setBankUpiSuccessMsg(null); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                      bankUpiMode === 'deposit' 
                        ? 'bg-emerald-500 text-black shadow-md' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Deposit via Bank UPI</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setBankUpiMode('withdraw'); setBankUpiSuccessMsg(null); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                      bankUpiMode === 'withdraw' 
                        ? 'bg-red-500 text-white shadow-md' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <ArrowDownRight className="w-3.5 h-3.5" />
                    <span>Withdraw to Bank</span>
                  </button>
                </div>
              </div>

              {/* Success Alert Banner */}
              {bankUpiSuccessMsg && (
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-3 animate-in fade-in duration-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-xs font-black text-emerald-300">Transaction Status Updated</p>
                    <p className="text-[11px] font-bold text-emerald-200 leading-relaxed">{bankUpiSuccessMsg}</p>
                  </div>
                </div>
              )}

              {/* MODE 1: DEPOSIT VIA BANK UPI */}
              {bankUpiMode === 'deposit' && (
                <div className="space-y-5">
                  {/* Step 1: Select Bank UPI App */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-emerald-400" />
                      1. Select Preferred Bank UPI App / Payment Option:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                      {[
                        { id: 'gpay', name: 'Google Pay', icon: '🟢', vpa: 'deriv.official@okaxis', badge: 'GPay UPI' },
                        { id: 'phonepe', name: 'PhonePe', icon: '🟣', vpa: 'deriv.pay@ybl', badge: 'PhonePe' },
                        { id: 'paytm', name: 'Paytm UPI', icon: '🔵', vpa: 'deriv.bank@paytm', badge: 'Paytm' },
                        { id: 'bhim', name: 'BHIM / Any UPI', icon: '🟠', vpa: 'deriv.global@upi', badge: 'BHIM UPI' },
                        { id: 'netbanking', name: 'IMPS Bank Transfer', icon: '🏦', vpa: 'HDFC Bank A/C 502000849201', badge: 'Bank IMPS' }
                      ].map((app) => (
                        <button
                          key={app.id}
                          type="button"
                          onClick={() => setBankUpiApp(app.id as any)}
                          className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                            bankUpiApp === app.id
                              ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                              : 'bg-black/40 hover:bg-black/60 border-white/10 text-gray-400 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xl">{app.icon}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                              bankUpiApp === app.id ? 'bg-emerald-500 text-black' : 'bg-white/10 text-gray-300'
                            }`}>
                              {app.badge}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs font-black text-white">{app.name}</p>
                            <p className="text-[9px] font-bold text-gray-400 mt-0.5">Instant 0% Fee</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Deposit Amount in USD */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black/40 border border-white/10 rounded-2xl p-4">
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <label className="text-xs font-black uppercase tracking-wider text-gray-300">
                          2. Deposit Amount (USD):
                        </label>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          Rate: $1 USD = ₹88.50 INR
                        </span>
                      </div>

                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-black text-sm">$</span>
                        <input
                          type="number"
                          value={bankUpiAmount}
                          onChange={(e) => setBankUpiAmount(e.target.value)}
                          placeholder="50"
                          min="5"
                          max="10000"
                          step="1"
                          className="w-full bg-black/60 border border-white/15 rounded-xl pl-8 pr-16 py-2.5 text-sm font-black text-white outline-none focus:border-emerald-500"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">USD</span>
                      </div>

                      {/* Deposit Limits Display */}
                      <div className="flex items-center justify-between text-[10px] font-bold bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-gray-300">
                        <span>Deposit Limits:</span>
                        <span className="text-emerald-400 font-mono font-black">Min: $5.00 (₹442.50) • Max: $10,000.00 (₹8,85,000)</span>
                      </div>

                      {/* Quick Amount Chips */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {['10', '25', '50', '100', '250', '500', '1000', '5000'].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setBankUpiAmount(amt)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                              bankUpiAmount === amt
                                ? 'bg-emerald-500 text-black font-bold'
                                : 'bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300'
                            }`}
                          >
                            ${amt}
                          </button>
                        ))}
                      </div>

                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1">
                        <div className="flex items-center justify-between text-xs font-black text-white">
                          <span>Total Payable Amount:</span>
                          <span className="text-emerald-400 text-sm">₹{((parseFloat(bankUpiAmount) || 0) * 88.50).toLocaleString('en-IN', { maximumFractionDigits: 2 })} INR</span>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400">
                          Auto-credited to trading account directly upon UTR reference verification.
                        </p>
                      </div>
                    </div>

                    {/* Step 3: Payment Details & QR */}
                    <div className="space-y-3 border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-4">
                      <label className="text-xs font-black uppercase tracking-wider text-gray-300 flex items-center justify-between">
                        <span>3. Scan QR or Copy Official Bank VPA:</span>
                        <span className="text-[10px] font-bold text-emerald-400">Verified Gateway</span>
                      </label>

                      {bankUpiApp !== 'netbanking' ? (
                        <div className="p-3 bg-black/60 border border-white/10 rounded-xl space-y-2.5">
                          <div className="flex items-center justify-between bg-black/80 border border-white/10 p-2.5 rounded-lg">
                            <div>
                              <p className="text-[9px] font-bold text-gray-400 uppercase">Official Gateway UPI ID (VPA)</p>
                              <p className="text-xs font-black text-emerald-400 tracking-wide font-mono">
                                {bankUpiApp === 'gpay' && 'deriv.official@okaxis'}
                                {bankUpiApp === 'phonepe' && 'deriv.pay@ybl'}
                                {bankUpiApp === 'paytm' && 'deriv.bank@paytm'}
                                {bankUpiApp === 'bhim' && 'deriv.global@upi'}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const vpa = bankUpiApp === 'gpay' ? 'deriv.official@okaxis' : bankUpiApp === 'phonepe' ? 'deriv.pay@ybl' : bankUpiApp === 'paytm' ? 'deriv.bank@paytm' : 'deriv.global@upi';
                                navigator.clipboard.writeText(vpa);
                                setCopiedBankUpiVpa(true);
                                setTimeout(() => setCopiedBankUpiVpa(false), 2000);
                              }}
                              className="px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all"
                            >
                              {copiedBankUpiVpa ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedBankUpiVpa ? 'Copied' : 'Copy VPA'}</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl text-black">
                            <div className="w-14 h-14 bg-gray-900 rounded-lg flex items-center justify-center p-1 text-white shrink-0">
                              <QrCode className="w-10 h-10 text-emerald-400" />
                            </div>
                            <div className="text-left space-y-0.5">
                              <p className="text-[10px] font-black uppercase tracking-wider text-black">Bank Instant Scan QR</p>
                              <p className="text-[10px] font-bold text-gray-600">Scan via GPay, PhonePe, Paytm or BHIM UPI</p>
                              <p className="text-[9px] font-bold text-emerald-700">0% Commission • Auto-Confirmation</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-black/60 border border-white/10 rounded-xl space-y-1.5 text-xs">
                          <div className="flex justify-between border-b border-white/5 pb-1">
                            <span className="text-gray-400 font-bold">Bank Name:</span>
                            <span className="font-black text-white">HDFC Bank Ltd.</span>
                          </div>
                          <div className="flex justify-between border-b border-white/5 pb-1">
                            <span className="text-gray-400 font-bold">Account Name:</span>
                            <span className="font-black text-white">Deriv Direct Gateway</span>
                          </div>
                          <div className="flex justify-between border-b border-white/5 pb-1">
                            <span className="text-gray-400 font-bold">Account No:</span>
                            <span className="font-black text-emerald-400 font-mono">50200084920145</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400 font-bold">IFSC Code:</span>
                            <span className="font-black text-amber-400 font-mono">HDFC0000240</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 4: Enter UTR Ref & Submit */}
                  <form onSubmit={handleBankUpiDepositSubmit} className="space-y-3 bg-black/40 border border-white/10 rounded-2xl p-4">
                    <label className="text-xs font-black uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      4. Enter 12-Digit UPI UTR / Bank Transaction Reference Number:
                    </label>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <div className="relative flex-1 w-full">
                        <input
                          type="text"
                          value={bankUpiUtr}
                          onChange={(e) => setBankUpiUtr(e.target.value)}
                          placeholder="e.g. 420918239012 (found in GPay/PhonePe receipt)"
                          maxLength={16}
                          className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white placeholder-gray-600 outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmittingBankUpi || !bankUpiUtr.trim()}
                        className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-800 disabled:text-gray-600 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                      >
                        {isSubmittingBankUpi ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Verifying UTR...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Submit UTR for Auto-Credit</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* How to Find UTR Explanation Guide */}
                    <div className="border-t border-white/10 pt-3">
                      <button
                        type="button"
                        onClick={() => setShowUtrHelp(!showUtrHelp)}
                        className="flex items-center justify-between w-full text-left text-xs font-black uppercase tracking-wider text-amber-400 hover:text-amber-300 transition-colors p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl"
                      >
                        <span className="flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>How to find your 12-Digit UPI UTR / Bank Reference Number?</span>
                        </span>
                        {showUtrHelp ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
                      </button>

                      {showUtrHelp && (
                        <div className="mt-2.5 p-3.5 bg-black/80 border border-amber-500/20 rounded-xl space-y-3 text-xs text-gray-300 animate-in fade-in duration-200">
                          <p className="text-[11px] font-bold text-amber-200/90 leading-relaxed">
                            The UTR (Unique Transaction Reference) or UPI Ref No. is a unique 12-digit number generated by your bank or UPI app after completing a payment.
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                            {/* GPay */}
                            <div className="p-2.5 bg-white/5 border border-white/10 rounded-lg space-y-1">
                              <div className="flex items-center gap-1.5 font-black text-emerald-400">
                                <span>🟢</span>
                                <span>Google Pay (GPay)</span>
                              </div>
                              <ol className="text-[10px] font-bold text-gray-300 space-y-0.5 list-decimal list-inside">
                                <li>Open GPay & tap <strong className="text-white">"Show transaction history"</strong></li>
                                <li>Select the payment to Deriv VPA</li>
                                <li>Copy 12-digit <strong className="text-emerald-300">"UPI transaction ID"</strong> (e.g., 420918239012)</li>
                              </ol>
                            </div>

                            {/* PhonePe */}
                            <div className="p-2.5 bg-white/5 border border-white/10 rounded-lg space-y-1">
                              <div className="flex items-center gap-1.5 font-black text-purple-400">
                                <span>🟣</span>
                                <span>PhonePe</span>
                              </div>
                              <ol className="text-[10px] font-bold text-gray-300 space-y-0.5 list-decimal list-inside">
                                <li>Open PhonePe & tap <strong className="text-white">"History"</strong> tab</li>
                                <li>Tap on the successful transfer</li>
                                <li>Look for <strong className="text-purple-300">"UTR"</strong> or <strong className="text-purple-300">"Transaction ID"</strong> (12 digits)</li>
                              </ol>
                            </div>

                            {/* Paytm */}
                            <div className="p-2.5 bg-white/5 border border-white/10 rounded-lg space-y-1">
                              <div className="flex items-center gap-1.5 font-black text-blue-400">
                                <span>🔵</span>
                                <span>Paytm UPI</span>
                              </div>
                              <ol className="text-[10px] font-bold text-gray-300 space-y-0.5 list-decimal list-inside">
                                <li>Open Paytm & tap <strong className="text-white">"Balance & History"</strong></li>
                                <li>Select payment details</li>
                                <li>Copy 12-digit <strong className="text-blue-300">"UPI Ref No."</strong></li>
                              </ol>
                            </div>

                            {/* BHIM / Other UPI */}
                            <div className="p-2.5 bg-white/5 border border-white/10 rounded-lg space-y-1">
                              <div className="flex items-center gap-1.5 font-black text-amber-400">
                                <span>🟠</span>
                                <span>BHIM & Other Apps</span>
                              </div>
                              <ol className="text-[10px] font-bold text-gray-300 space-y-0.5 list-decimal list-inside">
                                <li>Open Transaction / Activity History</li>
                                <li>Tap payment details receipt</li>
                                <li>Find <strong className="text-amber-300">"UPI Ref ID"</strong> or <strong className="text-amber-300">"UTR"</strong></li>
                              </ol>
                            </div>

                            {/* Bank IMPS / NetBanking */}
                            <div className="p-2.5 bg-white/5 border border-white/10 rounded-lg space-y-1 sm:col-span-2 lg:col-span-2">
                              <div className="flex items-center gap-1.5 font-black text-cyan-400">
                                <span>🏦</span>
                                <span>IMPS / NetBanking / Bank Statement</span>
                              </div>
                              <p className="text-[10px] font-bold text-gray-300 leading-normal">
                                Check your bank transaction SMS or NetBanking statement for the 12-digit <strong className="text-cyan-300">IMPS Ref No / RRN Number</strong> (e.g., IMPS/420918239012/HDFC...).
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </form>
                </div>
              )}

              {/* MODE 2: WITHDRAW TO BANK UPI / ACCOUNT */}
              {bankUpiMode === 'withdraw' && (
                <form onSubmit={handleBankUpiWithdrawSubmit} className="space-y-4 max-w-2xl mx-auto bg-black/40 border border-white/10 rounded-2xl p-5">
                  <div className="space-y-1 border-b border-white/10 pb-3">
                    <h5 className="text-sm font-black uppercase text-white flex items-center gap-2">
                      <ArrowDownRight className="w-4 h-4 text-red-400" />
                      Direct Instant Bank Payout / Withdrawal
                    </h5>
                    <p className="text-[11px] font-bold text-gray-400">
                      Funds will be paid out directly to your Bank UPI VPA or Bank Account via IMPS within 2 to 5 minutes.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Amount */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-black uppercase text-gray-300">Withdrawal Amount (USD):</label>
                        <span className="text-[9px] font-bold text-gray-400">Rate: $1 USD = ₹88.00 INR</span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-black text-xs">$</span>
                        <input
                          type="number"
                          value={bankUpiAmount}
                          onChange={(e) => setBankUpiAmount(e.target.value)}
                          placeholder="50"
                          min="10"
                          max="10000"
                          className="w-full bg-black/60 border border-white/15 rounded-xl pl-7 pr-3 py-2 text-xs font-black text-white outline-none focus:border-red-500"
                        />
                      </div>
                      <div className="flex items-center justify-between text-[9px] font-bold">
                        <span className="text-gray-400">Withdrawal Limits:</span>
                        <span className="text-red-400 font-mono font-black">Min: $10.00 • Max: $10,000.00</span>
                      </div>
                      <p className="text-[10px] font-bold text-emerald-400">
                        Estimated Payout: ₹{((parseFloat(bankUpiAmount) || 0) * 88.00).toLocaleString('en-IN', { maximumFractionDigits: 2 })} INR
                      </p>
                    </div>

                    {/* Bank UPI VPA */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black uppercase text-gray-300">Target Bank UPI VPA (ID):</label>
                      <input
                        type="text"
                        value={bankUpiVpa}
                        onChange={(e) => setBankUpiVpa(e.target.value)}
                        placeholder="e.g. yourname@okaxis or 9876543210@paytm"
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs font-bold text-white placeholder-gray-600 outline-none focus:border-red-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Or Bank Account Details */}
                  <div className="border-t border-white/10 pt-3 space-y-3">
                    <p className="text-[10px] font-black uppercase text-gray-400">OR Enter Bank Account IMPS Details:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <input
                        type="text"
                        value={bankUpiBankName}
                        onChange={(e) => setBankUpiBankName(e.target.value)}
                        placeholder="Bank Name (e.g. SBI, HDFC)"
                        className="bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs font-bold text-white placeholder-gray-600 outline-none focus:border-red-500"
                      />
                      <input
                        type="text"
                        value={bankUpiAccountNo}
                        onChange={(e) => setBankUpiAccountNo(e.target.value)}
                        placeholder="Bank Account Number"
                        className="bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs font-bold text-white placeholder-gray-600 outline-none focus:border-red-500 font-mono"
                      />
                      <input
                        type="text"
                        value={bankUpiIfsc}
                        onChange={(e) => setBankUpiIfsc(e.target.value)}
                        placeholder="Bank IFSC Code"
                        className="bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs font-bold text-white placeholder-gray-600 outline-none focus:border-red-500 font-mono uppercase"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingBankUpi}
                    className="w-full py-3 bg-red-600 hover:bg-red-500 disabled:bg-gray-800 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
                  >
                    {isSubmittingBankUpi ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Processing Bank Payout...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Direct Bank Payout Request</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

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
