// AISignalPanel.tsx
import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, TrendingDown, RefreshCw, AlertTriangle, HelpCircle, Compass, Zap, Activity, Layers, Clock } from 'lucide-react';
import { Candle } from '../services/ChartCache';

interface AISignalPanelProps {
  symbol: string;
  timeframe: string;
  candles: Candle[];
}

export interface TimeframeSignal {
  duration: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  trend?: string;
}

interface AIAnalysis {
  action: 'BUY' | 'SELL' | 'HOLD';
  trend: string;
  confidence: number;
  reasoning: string[];
  suggestedDuration: string;
  trendDirection?: string;
  momentum?: string;
  volatility?: string;
  priceAction?: string;
  timeframeSignals?: TimeframeSignal[];
}

export const AISignalPanel: React.FC<AISignalPanelProps> = ({ symbol, timeframe, candles }) => {
  const [tradeIn, setTradeIn] = useState<string>('Any Time');
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAnalyzedAt, setLastAnalyzedAt] = useState<string | null>(null);

  const TIMEFRAME_OPTIONS = [
    'Any Time', '30 sec', '1Min', '2Min', '3Min', '5Min', 
    '10Min', '15Min', '30Min', '1Hr', '2Hr', 
    '4Hr', '8Hr', '1D'
  ];

  const getSymbolDisplayName = (sym: string) => {
    const exactMappings: Record<string, string> = {
      '1HZ10V': 'Volatility 10 (1s)',
      '1HZ25V': 'Volatility 25 (1s)',
      '1HZ50V': 'Volatility 50 (1s)',
      '1HZ75V': 'Volatility 75 (1s)',
      '1HZ100V': 'Volatility 100 (1s)',
      '1HZ150V': 'Volatility 150 (1s)',
      '1HZ250V': 'Volatility 250 (1s)',
      'R_10': 'Volatility 10',
      'R_25': 'Volatility 25',
      'R_50': 'Volatility 50',
      'R_75': 'Volatility 75',
      'R_100': 'Volatility 100',
    };
    return exactMappings[sym] || sym;
  };

  const handleAnalyze = async () => {
    if (!candles || candles.length === 0) {
      setError('No market candle data available to analyze.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: getSymbolDisplayName(symbol),
          timeframe,
          candles: candles.slice(-50), // Send last 50 candles to optimize context and tokens
          tradeIn,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze market.');
      }

      setAnalysis(data.analysis);
      setLastAnalyzedAt(new Date().toLocaleTimeString());
    } catch (err: any) {
      console.error('[AI ANALYZE ERROR]', err);
      setError(err.message || 'Error communicating with AI service.');
    } finally {
      setLoading(false);
    }
  };

  // Run automatically when the symbol, timeframe, or trade duration is changed
  useEffect(() => {
    handleAnalyze();
  }, [symbol, timeframe, tradeIn]);

  return (
    <div className="p-4 space-y-4 h-full flex flex-col min-h-0 text-gray-300 overflow-y-auto no-scrollbar">
      {/* Header section with status info */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <span className="text-[9px] font-black uppercase tracking-widest text-violet-400 block">AI Market Pulse</span>
          <h3 className="text-xs font-black uppercase text-white truncate max-w-[170px]">
            {getSymbolDisplayName(symbol)} ({timeframe})
          </h3>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="p-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white rounded-lg transition-all flex items-center justify-center gap-1 shadow-lg shadow-violet-600/15"
          title="Refresh Analysis"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="h-px bg-white/5 flex-shrink-0" />

      {/* Trade In Duration Selector */}
      <div className="bg-[#141922]/40 border border-white/5 rounded-2xl p-3 space-y-2 flex-shrink-0">
        <label className="text-[9px] font-black uppercase tracking-wider text-gray-500 flex items-center justify-between">
          <span>Trade In</span>
          <span className="text-violet-400 font-extrabold text-[8px] uppercase">Duration Horizon</span>
        </label>
        <div className="relative">
          <select
            value={tradeIn}
            onChange={(e) => setTradeIn(e.target.value)}
            disabled={loading}
            className="w-full bg-[#1c2230] border border-white/5 hover:border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-all appearance-none cursor-pointer"
          >
            {TIMEFRAME_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center py-8 space-y-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin" />
            <Brain className="w-5 h-5 text-violet-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <div className="text-center space-y-1 px-4">
            <p className="text-xs font-black uppercase text-white tracking-wider animate-pulse">Running AI Engine...</p>
            <p className="text-[9px] text-gray-500 font-bold uppercase">
              Analyzing latest candles using Gemini
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="flex-1 flex flex-col items-center justify-center py-6 text-center space-y-3">
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-full">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-black uppercase text-red-500">Analysis Failed</p>
            <p className="text-[10px] text-gray-400 font-semibold px-4">{error}</p>
          </div>
          <button
            onClick={handleAnalyze}
            className="px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/20 rounded-xl text-[10px] font-black uppercase transition-all"
          >
            Retry Analysis
          </button>
        </div>
      )}

      {/* Main Analysis Display */}
      {!loading && !error && analysis && (
        <div className="flex-1 flex flex-col justify-between min-h-0 space-y-4 pb-20">
          <div className="space-y-4">
            {/* Signal Card */}
            <div className="bg-[#141922]/50 border border-white/5 rounded-2xl p-4 flex flex-col items-center text-center relative overflow-hidden">
              {analysis.action === 'BUY' && (
                <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none" />
              )}
              {analysis.action === 'SELL' && (
                <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />
              )}

              <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">
                RECOMMENDED ACTION
              </span>

              {/* Trade Available Badge */}
              {analysis.action !== 'HOLD' && (
                <div className="mb-2 px-2.5 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[9px] font-black uppercase tracking-wider text-violet-300">
                    Trade Available ({analysis.suggestedDuration})
                  </span>
                </div>
              )}

              {/* Recommended Action Container */}
              <div className="flex items-center gap-2 mb-3">
                {analysis.action === 'BUY' && (
                  <span className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl text-lg font-black tracking-widest uppercase flex items-center gap-1.5 shadow-lg shadow-emerald-500/5">
                    <TrendingUp className="w-5 h-5 animate-bounce" />
                    RISE / BUY
                  </span>
                )}
                {analysis.action === 'SELL' && (
                  <span className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-lg font-black tracking-widest uppercase flex items-center gap-1.5 shadow-lg shadow-red-500/5">
                    <TrendingDown className="w-5 h-5 animate-bounce" />
                    FALL / SELL
                  </span>
                )}
                {analysis.action === 'HOLD' && (
                  <div className="flex flex-col items-center gap-2 px-3 py-4 bg-yellow-500/5 border border-yellow-500/15 rounded-xl w-full">
                    <AlertTriangle className="w-6 h-6 text-yellow-500 animate-pulse" />
                    <span className="text-[11px] font-black uppercase text-yellow-500 tracking-wider text-center leading-normal">
                      No Trade Found, Try Different Time frame analysis
                    </span>
                  </div>
                )}
              </div>

              {/* Grid with confidence and duration (Only show for BUY/SELL actions to keep UI clean and high-fidelity) */}
              {analysis.action !== 'HOLD' && (
                <div className="grid grid-cols-2 gap-4 w-full pt-3 border-t border-white/5 mt-1">
                  <div className="text-left">
                    <span className="text-[8px] font-bold text-gray-500 uppercase block">CONFIDENCE</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs font-black text-white">{analysis.confidence}%</span>
                      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden min-w-[40px]">
                        <div 
                          className={`h-full rounded-full ${
                            analysis.action === 'BUY' 
                              ? 'bg-emerald-500' 
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${analysis.confidence}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-left">
                    <span className="text-[8px] font-bold text-gray-500 uppercase block">SUGGESTED RANGE</span>
                    <span className="text-xs font-black text-white block mt-0.5 uppercase">
                      {analysis.suggestedDuration}
                    </span>
                  </div>
                </div>
              )}

              {/* Trend Badge */}
              {analysis.action !== 'HOLD' && (
                <div className="mt-3 w-full flex items-center justify-between text-left bg-white/5 rounded-xl px-3 py-1.5">
                  <span className="text-[8px] font-bold text-gray-500 uppercase">Trend Mode</span>
                  <span className={`text-[10px] font-black uppercase ${
                    analysis.trend.toLowerCase().includes('bull') 
                      ? 'text-emerald-500' 
                      : analysis.trend.toLowerCase().includes('bear') 
                        ? 'text-red-500' 
                        : 'text-yellow-500'
                  }`}>
                    {analysis.trend}
                  </span>
                </div>
              )}
            </div>

            {/* 4-Factor Analysis Pillars */}
            <div className="space-y-2">
              <h4 className="text-[9px] font-black uppercase tracking-widest text-gray-500 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-violet-400" />
                  Core Factor Analysis
                </span>
                <span className="text-[8px] text-violet-400/80 font-bold uppercase">4-Pillar Model</span>
              </h4>

              <div className="grid grid-cols-2 gap-2">
                {/* 1. Trend Direction */}
                <div className="bg-[#141922]/40 border border-white/5 p-2.5 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-blue-400">
                    <Compass className="w-3 h-3 flex-shrink-0" />
                    <span className="text-[8px] font-black uppercase tracking-wider text-gray-400">Trend Direction</span>
                  </div>
                  <p className="text-[10px] font-black text-white truncate uppercase">
                    {analysis.trendDirection || analysis.trend || 'Ranging'}
                  </p>
                </div>

                {/* 2. Momentum */}
                <div className="bg-[#141922]/40 border border-white/5 p-2.5 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <Zap className="w-3 h-3 flex-shrink-0" />
                    <span className="text-[8px] font-black uppercase tracking-wider text-gray-400">Momentum</span>
                  </div>
                  <p className="text-[10px] font-black text-white truncate uppercase">
                    {analysis.momentum || 'Neutral Momentum'}
                  </p>
                </div>

                {/* 3. Volatility */}
                <div className="bg-[#141922]/40 border border-white/5 p-2.5 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-violet-400">
                    <Activity className="w-3 h-3 flex-shrink-0" />
                    <span className="text-[8px] font-black uppercase tracking-wider text-gray-400">Volatility</span>
                  </div>
                  <p className="text-[10px] font-black text-white truncate uppercase">
                    {analysis.volatility || 'Stable Volatility'}
                  </p>
                </div>

                {/* 4. Price Action */}
                <div className="bg-[#141922]/40 border border-white/5 p-2.5 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Layers className="w-3 h-3 flex-shrink-0" />
                    <span className="text-[8px] font-black uppercase tracking-wider text-gray-400">Price Action</span>
                  </div>
                  <p className="text-[10px] font-black text-white truncate uppercase">
                    {analysis.priceAction || 'Candle Pattern'}
                  </p>
                </div>
              </div>
            </div>

            {/* Technical Reasoning Bullets */}
            <div className="space-y-2">
              <h4 className="text-[9px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1">
                <Brain className="w-3 h-3 text-violet-400" />
                Technical Reasoning
              </h4>
              <div className="space-y-1.5">
                {analysis.reasoning.map((bullet, idx) => (
                  <div key={idx} className="flex gap-2 text-[10px] font-bold text-gray-300 leading-relaxed bg-[#141922]/25 border border-white/5 p-2 rounded-xl">
                    <span className="text-violet-400 flex-shrink-0">•</span>
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* All Timeframes AI Signals Section */}
            {analysis.timeframeSignals && analysis.timeframeSignals.length > 0 && (
              <div className="space-y-2.5 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-violet-400" />
                    All Timeframes AI Signals
                  </h4>
                  <span className="text-[8px] text-violet-300 font-bold uppercase bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full">
                    {tradeIn === 'Any Time' ? 'Full Multi-Horizon Analysis' : 'Multi-Timeframe Signals'}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-1.5">
                  {analysis.timeframeSignals.map((tfSignal) => {
                    const isSelected = tradeIn === tfSignal.duration;
                    return (
                      <div
                        key={tfSignal.duration}
                        onClick={() => setTradeIn(tfSignal.duration)}
                        title="Click to select this duration"
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected 
                            ? 'bg-violet-600/15 border-violet-500/50 shadow-md shadow-violet-600/10' 
                            : 'bg-[#141922]/40 border-white/5 hover:border-white/10 hover:bg-[#141922]/60'
                        }`}
                      >
                        {/* Duration Label */}
                        <div className="flex items-center gap-1.5 min-w-[70px]">
                          <span className={`text-[10px] font-black uppercase tracking-wider ${isSelected ? 'text-violet-300' : 'text-gray-200'}`}>
                            {tfSignal.duration}
                          </span>
                        </div>

                        {/* Signal Pill */}
                        <div className="flex items-center gap-2">
                          {tfSignal.action === 'BUY' && (
                            <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[9px] font-black tracking-wider uppercase flex items-center gap-1 shadow-sm shadow-emerald-500/5">
                              <TrendingUp className="w-3 h-3 text-emerald-400" />
                              RISE / BUY ({tfSignal.confidence}%)
                            </span>
                          )}
                          {tfSignal.action === 'SELL' && (
                            <span className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-[9px] font-black tracking-wider uppercase flex items-center gap-1 shadow-sm shadow-red-500/5">
                              <TrendingDown className="w-3 h-3 text-red-400" />
                              FALL / SELL ({tfSignal.confidence}%)
                            </span>
                          )}
                          {tfSignal.action === 'HOLD' && (
                            <span className="px-2.5 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400/90 rounded-lg text-[9px] font-bold tracking-wider uppercase flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-yellow-500/80" />
                              NO TRADE
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Warning Message & Time stamp */}
          <div className="space-y-3 flex-shrink-0 pt-4 border-t border-white/5">
            {/* Warning block - exact user phrasing:
                "ai can make mistakes trade at your own risk these signals wont give 100% of successrate. So try at your own risk." */}
            <div className="bg-yellow-500/5 border border-yellow-500/10 p-3 rounded-2xl flex gap-2.5 items-start">
              <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-[8px] font-black text-yellow-500 uppercase tracking-widest block">RISK WARNING</span>
                <p className="text-[9px] font-black text-gray-400 leading-normal lowercase first-letter:uppercase">
                  ai can make mistakes trade at your own risk these signals wont give 100% of successrate. So try at your own risk.
                </p>
              </div>
            </div>

            {/* Timings info */}
            {lastAnalyzedAt && (
              <span className="text-[7px] text-gray-600 font-bold uppercase block text-center">
                Last Analysed: {lastAnalyzedAt}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Empty State / Initial Trigger */}
      {!loading && !error && !analysis && (
        <div className="flex-1 flex flex-col items-center justify-center py-12 text-center space-y-4">
          <Brain className="w-10 h-10 text-gray-600 animate-pulse" />
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase text-white">No active signal</h4>
            <p className="text-[10px] text-gray-500 font-bold uppercase px-4">
              Tap below to run Gemini AI analysis on current market candlesticks
            </p>
          </div>
          <button
            onClick={handleAnalyze}
            className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-wider shadow-lg shadow-violet-600/20 transition-all flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Analyze Market
          </button>
        </div>
      )}
    </div>
  );
};
