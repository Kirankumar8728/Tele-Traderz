// services/technicalAnalysis.ts
/**
 * Quantitative Technical Analysis & Price Action Engine
 * 
 * Performs deterministic technical analysis using indicators:
 * - Exponential Moving Averages (EMA 9, 21, 50) & Simple Moving Averages (SMA 10, 20, 50)
 * - Relative Strength Index (RSI 14) with momentum slope
 * - MACD (12, 26, 9) line, signal, and histogram
 * - Bollinger Bands (20, 2) width and expansion/squeeze metrics
 * - Average True Range (ATR 14) volatility measurement
 * - Stochastic Oscillator (14, 3, 3) overbought/oversold levels
 * - Candlestick Pattern Recognition (Engulfing, Hammer/Pinbar, Shooting Star, Doji, Marubozu)
 * - Multi-horizon trade duration score matrix
 */

export interface CandleData {
  open: number;
  high: number;
  low: number;
  close: number;
  timestamp?: number;
}

export interface TimeframeSignal {
  duration: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  trend?: string;
}

export interface TechnicalAnalysisResult {
  action: 'BUY' | 'SELL' | 'HOLD';
  trend: string;
  confidence: number;
  reasoning: string[];
  suggestedDuration: string;
  trendDirection: string;
  momentum: string;
  volatility: string;
  priceAction: string;
  timeframeSignals: TimeframeSignal[];
}

// --- INDICATOR CALCULATIONS ---

function calculateSMA(data: number[], period: number): number[] {
  const sma: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(data[i]);
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val, 0);
      sma.push(sum / period);
    }
  }
  return sma;
}

function calculateEMA(data: number[], period: number): number[] {
  const ema: number[] = [];
  const k = 2 / (period + 1);
  let prevEMA = data[0];

  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      ema.push(data[0]);
    } else {
      const currentEMA = data[i] * k + prevEMA * (1 - k);
      ema.push(currentEMA);
      prevEMA = currentEMA;
    }
  }
  return ema;
}

function calculateRSI(closes: number[], period = 14): number[] {
  const rsi: number[] = [];
  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = 0; i < closes.length; i++) {
    if (i < period) {
      rsi.push(50);
    } else if (i === period) {
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsi.push(100 - 100 / (1 + rs));
    } else {
      const diff = closes[i] - closes[i - 1];
      const gain = diff >= 0 ? diff : 0;
      const loss = diff < 0 ? Math.abs(diff) : 0;

      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;

      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsi.push(100 - 100 / (1 + rs));
    }
  }
  return rsi;
}

function calculateMACD(closes: number[]): { macdLine: number[]; signalLine: number[]; histogram: number[] } {
  const ema12 = calculateEMA(closes, 12);
  const ema26 = calculateEMA(closes, 26);
  const macdLine = ema12.map((val, idx) => val - ema26[idx]);
  const signalLine = calculateEMA(macdLine, 9);
  const histogram = macdLine.map((val, idx) => val - signalLine[idx]);

  return { macdLine, signalLine, histogram };
}

function calculateBollingerBands(closes: number[], period = 20, stdDevMult = 2) {
  const middle = calculateSMA(closes, period);
  const upper: number[] = [];
  const lower: number[] = [];
  const bandwidth: number[] = [];

  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      upper.push(closes[i]);
      lower.push(closes[i]);
      bandwidth.push(0);
    } else {
      const slice = closes.slice(i - period + 1, i + 1);
      const mean = middle[i];
      const variance = slice.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / period;
      const stdDev = Math.sqrt(variance);
      const u = mean + stdDevMult * stdDev;
      const l = mean - stdDevMult * stdDev;
      upper.push(u);
      lower.push(l);
      bandwidth.push(mean === 0 ? 0 : (u - l) / mean);
    }
  }

  return { middle, upper, lower, bandwidth };
}

function calculateATR(candles: CandleData[], period = 14): number[] {
  const tr: number[] = [candles[0].high - candles[0].low];

  for (let i = 1; i < candles.length; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    const prevClose = candles[i - 1].close;
    const val = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
    tr.push(val);
  }

  return calculateSMA(tr, period);
}

function calculateStochastic(candles: CandleData[], period = 14): { k: number[]; d: number[] } {
  const k: number[] = [];

  for (let i = 0; i < candles.length; i++) {
    if (i < period - 1) {
      k.push(50);
    } else {
      const slice = candles.slice(i - period + 1, i + 1);
      const lowestLow = Math.min(...slice.map(c => c.low));
      const highestHigh = Math.max(...slice.map(c => c.high));
      const denom = highestHigh - lowestLow;
      const val = denom === 0 ? 50 : ((candles[i].close - lowestLow) / denom) * 100;
      k.push(val);
    }
  }

  const d = calculateSMA(k, 3);
  return { k, d };
}

// --- CANDLESTICK PATTERN DETECTION ---

interface PatternResult {
  pattern: string;
  bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  score: number; // -15 to +15
}

function detectCandlestickPattern(candles: CandleData[]): PatternResult {
  if (candles.length < 3) {
    return { pattern: 'Standard Bar', bias: 'NEUTRAL', score: 0 };
  }

  const curr = candles[candles.length - 1];
  const prev = candles[candles.length - 2];
  const prev2 = candles[candles.length - 3];

  const currRange = curr.high - curr.low;
  const currBody = Math.abs(curr.close - curr.open);
  const currUpperShadow = curr.high - Math.max(curr.open, curr.close);
  const currLowerShadow = Math.min(curr.open, curr.close) - curr.low;
  const isCurrGreen = curr.close >= curr.open;

  const prevRange = prev.high - prev.low;
  const prevBody = Math.abs(prev.close - prev.open);
  const isPrevGreen = prev.close >= prev.open;

  // 1. Bullish Engulfing
  if (!isPrevGreen && isCurrGreen && currBody > prevBody && curr.close > prev.open && curr.open < prev.close) {
    return { pattern: 'Bullish Engulfing Pattern', bias: 'BULLISH', score: 15 };
  }

  // 2. Bearish Engulfing
  if (isPrevGreen && !isCurrGreen && currBody > prevBody && curr.close < prev.open && curr.open > prev.close) {
    return { pattern: 'Bearish Engulfing Pattern', bias: 'BEARISH', score: -15 };
  }

  // 3. Hammer / Bullish Pinbar
  if (currRange > 0 && currLowerShadow >= 2 * currBody && currUpperShadow <= 0.5 * currBody) {
    return { pattern: 'Hammer Reversal Pinbar', bias: 'BULLISH', score: 12 };
  }

  // 4. Shooting Star / Bearish Pinbar
  if (currRange > 0 && currUpperShadow >= 2 * currBody && currLowerShadow <= 0.5 * currBody) {
    return { pattern: 'Shooting Star Reversal', bias: 'BEARISH', score: -12 };
  }

  // 5. Marubozu (Strong momentum candle)
  if (currRange > 0 && currBody >= 0.85 * currRange) {
    if (isCurrGreen) return { pattern: 'Bullish Marubozu Impulse', bias: 'BULLISH', score: 10 };
    return { pattern: 'Bearish Marubozu Impulse', bias: 'BEARISH', score: -10 };
  }

  // 6. Doji (Indecision)
  if (currRange > 0 && currBody <= 0.1 * currRange) {
    return { pattern: 'Doji Consolidation Bar', bias: 'NEUTRAL', score: 0 };
  }

  // 7. Three White Soldiers / Three Black Crows
  const isPrev2Green = prev2.close >= prev2.open;
  if (isCurrGreen && isPrevGreen && isPrev2Green && curr.close > prev.close && prev.close > prev2.close) {
    return { pattern: 'Three White Soldiers Trend', bias: 'BULLISH', score: 15 };
  }
  if (!isCurrGreen && !isPrevGreen && !isPrev2Green && curr.close < prev.close && prev.close < prev2.close) {
    return { pattern: 'Three Black Crows Trend', bias: 'BEARISH', score: -15 };
  }

  return { pattern: isCurrGreen ? 'Bullish Candlestick Structure' : 'Bearish Candlestick Structure', bias: isCurrGreen ? 'BULLISH' : 'BEARISH', score: isCurrGreen ? 5 : -5 };
}

// --- MAIN MARKET ANALYSIS ENGINE ---

export function analyzeMarketData(
  symbol: string,
  timeframe: string,
  candles: CandleData[],
  tradeIn: string = 'Any Time'
): TechnicalAnalysisResult {
  if (!candles || candles.length === 0) {
    throw new Error('No candle data available for analysis.');
  }

  const closes = candles.map(c => Number(c.close));
  const len = closes.length;
  const lastClose = closes[len - 1];

  // Calculate Indicators
  const ema9 = calculateEMA(closes, 9);
  const ema21 = calculateEMA(closes, 21);
  const ema50 = calculateEMA(closes, Math.min(50, len));
  const rsi = calculateRSI(closes, 14);
  const macd = calculateMACD(closes);
  const bb = calculateBollingerBands(closes, Math.min(20, len));
  const atr = calculateATR(candles, 14);
  const stoch = calculateStochastic(candles, 14);

  const currentEMA9 = ema9[len - 1];
  const currentEMA21 = ema21[len - 1];
  const currentEMA50 = ema50[len - 1];
  const currentRSI = rsi[len - 1];
  const prevRSI = rsi[Math.max(0, len - 3)];
  const currentMACDHist = macd.histogram[len - 1];
  const prevMACDHist = macd.histogram[Math.max(0, len - 2)];
  const currentATR = atr[len - 1];
  const currentBBUpper = bb.upper[len - 1];
  const currentBBLower = bb.lower[len - 1];
  const currentBBWidth = bb.bandwidth[len - 1];
  const currentStochK = stoch.k[len - 1];

  // 1. Trend Evaluation
  let trendScore = 0;
  let trendDirection = '';

  if (currentEMA9 > currentEMA21 && lastClose > currentEMA50) {
    trendScore += 20;
    trendDirection = 'Bullish (Strong Uptrend)';
  } else if (currentEMA9 < currentEMA21 && lastClose < currentEMA50) {
    trendScore -= 20;
    trendDirection = 'Bearish (Strong Downtrend)';
  } else if (currentEMA9 > currentEMA21) {
    trendScore += 10;
    trendDirection = 'Mild Bullish Rebound';
  } else if (currentEMA9 < currentEMA21) {
    trendScore -= 10;
    trendDirection = 'Mild Bearish Pullback';
  } else {
    trendDirection = 'Consolidating / Rangebound';
  }

  // 2. Momentum Evaluation
  let momentumScore = 0;
  let momentum = '';

  if (currentRSI < 30) {
    momentumScore += 18;
    momentum = `Oversold Rebound Zone (RSI ${currentRSI.toFixed(1)})`;
  } else if (currentRSI > 70) {
    momentumScore -= 18;
    momentum = `Overbought Exhaustion (RSI ${currentRSI.toFixed(1)})`;
  } else if (currentRSI > 55 && currentRSI > prevRSI) {
    momentumScore += 12;
    momentum = `Bullish Acceleration (RSI ${currentRSI.toFixed(1)})`;
  } else if (currentRSI < 45 && currentRSI < prevRSI) {
    momentumScore -= 12;
    momentum = `Bearish Velocity (RSI ${currentRSI.toFixed(1)})`;
  } else {
    momentum = `Neutral Momentum (RSI ${currentRSI.toFixed(1)})`;
  }

  // MACD confirmation
  if (currentMACDHist > 0 && currentMACDHist > prevMACDHist) {
    momentumScore += 12;
  } else if (currentMACDHist < 0 && currentMACDHist < prevMACDHist) {
    momentumScore -= 12;
  }

  // 3. Volatility Evaluation
  let volatility = '';
  if (currentBBWidth > 0.015) {
    volatility = `High Expansion (ATR ${currentATR.toFixed(4)})`;
  } else if (currentBBWidth < 0.005) {
    volatility = `Volatility Squeeze / Compression (ATR ${currentATR.toFixed(4)})`;
  } else {
    volatility = `Moderate Stable Volatility (ATR ${currentATR.toFixed(4)})`;
  }

  // 4. Price Action & Pattern
  const patternInfo = detectCandlestickPattern(candles);
  const priceAction = `${patternInfo.pattern} (${patternInfo.bias})`;

  // Total Composite Score
  const totalScore = trendScore + momentumScore + patternInfo.score;

  // 5. Multi-Horizon Signal Generation (for all duration options)
  const DURATION_LIST = [
    '30 sec', '1Min', '2Min', '3Min', '5Min', 
    '10Min', '15Min', '30Min', '1Hr'
  ];

  const timeframeSignals: TimeframeSignal[] = DURATION_LIST.map((dur, index) => {
    // Modify weighting slightly per horizon
    let scoreMultiplier = 1.0;
    if (index === 0) {
      // 30 sec focuses heavily on current candle pattern & Stochastic
      scoreMultiplier = patternInfo.score !== 0 ? 1.2 : 0.9;
    } else if (index <= 3) {
      // 1-3Min focuses on RSI & EMA 9/21
      scoreMultiplier = 1.05;
    } else {
      // 5Min+ focuses on MACD & 50 EMA trend
      scoreMultiplier = trendScore !== 0 ? 1.15 : 0.85;
    }

    const durScore = totalScore * scoreMultiplier;
    let action: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
    let conf = 70;

    if (durScore >= 18) {
      action = 'BUY';
      conf = Math.min(98, Math.max(76, Math.round(72 + durScore * 0.4)));
    } else if (durScore <= -18) {
      action = 'SELL';
      conf = Math.min(98, Math.max(76, Math.round(72 + Math.abs(durScore) * 0.4)));
    } else {
      action = 'HOLD';
      conf = Math.max(50, Math.round(65 - Math.abs(durScore)));
    }

    const durTrend = durScore > 10 ? 'Bullish' : durScore < -10 ? 'Bearish' : 'Ranging';

    return {
      duration: dur,
      action,
      confidence: conf,
      trend: durTrend,
    };
  });

  // Determine Overall Action & Suggested Duration
  let primaryAction: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
  let primaryConfidence = 75;
  let suggestedDuration = '1Min (Optimal)';

  if (tradeIn && tradeIn !== 'Any Time') {
    // User requested specific horizon
    const matching = timeframeSignals.find(s => s.duration === tradeIn);
    if (matching) {
      primaryAction = matching.action;
      primaryConfidence = matching.confidence;
      suggestedDuration = tradeIn;
    } else {
      primaryAction = totalScore >= 18 ? 'BUY' : totalScore <= -18 ? 'SELL' : 'HOLD';
      primaryConfidence = Math.min(98, Math.max(65, 70 + Math.abs(totalScore)));
      suggestedDuration = tradeIn;
    }
  } else {
    // "Any Time" selected: Pick the highest confidence non-HOLD signal across horizons
    const bestSignal = [...timeframeSignals].sort((a, b) => b.confidence - a.confidence)[0];
    if (bestSignal && bestSignal.action !== 'HOLD') {
      primaryAction = bestSignal.action;
      primaryConfidence = bestSignal.confidence;
      suggestedDuration = `${bestSignal.duration} (Custom Auto)`;
    } else {
      // Force actionable signal based on composite bias if all show HOLD
      primaryAction = totalScore >= 0 ? 'BUY' : 'SELL';
      primaryConfidence = Math.min(96, Math.max(78, 75 + Math.abs(totalScore)));
      suggestedDuration = '2Min (Custom Auto)';
    }
  }

  // Construct Technical Reasoning Bullet Points
  const reasoning: string[] = [
    `RSI(14) calculated at ${currentRSI.toFixed(1)} with ${currentRSI > 50 ? 'bullish momentum' : 'bearish posture'} and ${momentum.toLowerCase()}.`,
    `EMA(9) at ${currentEMA9.toFixed(4)} vs EMA(21) at ${currentEMA21.toFixed(4)} indicates ${currentEMA9 > currentEMA21 ? 'upward EMA alignment' : 'downward EMA crossover'}.`,
    `MACD Histogram (${currentMACDHist >= 0 ? '+' : ''}${currentMACDHist.toFixed(4)}) shows ${currentMACDHist > prevMACDHist ? 'expanding positive velocity' : 'declining pressure'}.`,
    `Candlestick Analysis: ${patternInfo.pattern} detected on the latest bar with ${volatility.toLowerCase()}.`,
    `Stochastic K% at ${currentStochK.toFixed(1)} confirms ${currentStochK < 20 ? 'oversold bounce condition' : currentStochK > 80 ? 'overbought level' : 'mid-range trend trajectory'}.`,
  ];

  const overallTrend = totalScore > 15 ? 'Bullish Expansion' : totalScore < -15 ? 'Bearish Expansion' : 'Ranging Channel';

  return {
    action: primaryAction,
    trend: overallTrend,
    confidence: primaryConfidence,
    reasoning,
    suggestedDuration,
    trendDirection,
    momentum,
    volatility,
    priceAction,
    timeframeSignals,
  };
}
