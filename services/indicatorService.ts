
import { SMA, EMA, RSI, BollingerBands, MACD, ATR, ADX, Stochastic, WilliamsR, ROC, AwesomeOscillator, CCI } from 'technicalindicators';

export interface IndicatorConfig {
  id: string;
  type: string;
  name: string;
  options: Record<string, any>;
  color: string;
  color2?: string;
  color3?: string;
  pane: number; // 0 for main chart, 1 for separate panel
  collapsed?: boolean;
}

export const calculateIndicator = (indicator: IndicatorConfig, chartData: any[]): any => {
  const closes = chartData.map(d => d.close || d.value);
  const highs = chartData.map(d => d.high || d.close || d.value);
  const lows = chartData.map(d => d.low || d.close || d.value);
  const volumes = chartData.map(d => d.volume || 0);

  try {
    let result: any[] = [];
    const options = indicator.options;

    switch (indicator.type) {
      case 'SMA':
        result = SMA.calculate({ period: options.period, values: closes });
        break;
      case 'EMA':
        result = EMA.calculate({ period: options.period, values: closes });
        break;
      case 'BB':
        result = BollingerBands.calculate({ period: options.period, stdDev: options.stdDev, values: closes });
        break;
      case 'RSI':
        result = RSI.calculate({ period: options.period, values: closes });
        break;
      case 'MACD':
        const macdRaw = MACD.calculate({
          values: closes,
          fastPeriod: options.fastPeriod,
          slowPeriod: options.slowPeriod,
          signalPeriod: options.signalPeriod,
          SimpleMAOscillator: false,
          SimpleMASignal: false
        });
        return alignData(macdRaw.map(v => ({
          macd: v.MACD,
          signal: v.signal,
          histogram: v.histogram
        })), chartData);
      case 'ATR':
        result = ATR.calculate({ period: options.period, high: highs, low: lows, close: closes });
        break;
      case 'ADX':
        result = ADX.calculate({ period: options.period, high: highs, low: lows, close: closes });
        break;
      case 'Stochastic':
        const stochRaw = Stochastic.calculate({ period: options.period, signalPeriod: options.signalPeriod, high: highs, low: lows, close: closes });
        return alignData(stochRaw, chartData);
      case 'WilliamsR':
        result = WilliamsR.calculate({ period: options.period, high: highs, low: lows, close: closes });
        break;
      case 'ROC':
        result = ROC.calculate({ period: options.period, values: closes });
        break;
      case 'AwesomeOscillator':
        result = AwesomeOscillator.calculate({ fastPeriod: options.fastPeriod, slowPeriod: options.slowPeriod, high: highs, low: lows });
        break;
      case 'CCI':
        result = CCI.calculate({ period: options.period, high: highs, low: lows, close: closes });
        break;
      case 'Momentum':
        // Momentum = Price - Price(n)
        const momRes = [];
        for (let i = options.period; i < closes.length; i++) {
          momRes.push({ time: chartData[i].time, value: closes[i] - closes[i - options.period] });
        }
        return momRes;
      case 'Vortex':
        // Vortex Indicator
        const vResult = [];
        for (let i = 1; i < chartData.length; i++) {
          const tr = Math.max(highs[i] - lows[i], Math.abs(highs[i] - closes[i-1]), Math.abs(lows[i] - closes[i-1]));
          const vmPlus = Math.abs(highs[i] - lows[i-1]);
          const vmMinus = Math.abs(lows[i] - highs[i-1]);
          vResult.push({ tr, vmPlus, vmMinus });
        }
        const vFinal = [];
        for (let i = options.period; i < vResult.length; i++) {
          const slice = vResult.slice(i - options.period, i);
          const sumTR = slice.reduce((a, b) => a + b.tr, 0);
          const sumVMPlus = slice.reduce((a, b) => a + b.vmPlus, 0);
          const sumVMMinus = slice.reduce((a, b) => a + b.vmMinus, 0);
          vFinal.push({ 
            time: chartData[i].time, 
            plus: sumVMPlus / sumTR, 
            minus: sumVMMinus / sumTR 
          });
        }
        return vFinal;
      case 'Aroon':
        // Aroon Indicator
        const aroonRes = [];
        for (let i = options.period; i < chartData.length; i++) {
          const sliceHigh = highs.slice(i - options.period, i + 1);
          const sliceLow = lows.slice(i - options.period, i + 1);
          const maxVal = sliceHigh.reduce((a, b) => Math.max(a, b), -Infinity);
          const minVal = sliceLow.reduce((a, b) => Math.min(a, b), Infinity);
          const maxIdx = sliceHigh.lastIndexOf(maxVal);
          const minIdx = sliceLow.lastIndexOf(minVal);
          aroonRes.push({
            time: chartData[i].time,
            up: ((options.period - (options.period - maxIdx)) / options.period) * 100,
            down: ((options.period - (options.period - minIdx)) / options.period) * 100
          });
        }
        return aroonRes;
      case 'Alligator':
        // Alligator is 3 SMAs with offsets
        const jaw = SMA.calculate({ period: 13, values: closes });
        const teeth = SMA.calculate({ period: 8, values: closes });
        const lips = SMA.calculate({ period: 5, values: closes });
        
        const alligatorRes = [];
        const maxLen = Math.max(jaw.length, teeth.length, lips.length);
        const off = chartData.length - maxLen;
        
        for (let i = 0; i < maxLen; i++) {
          alligatorRes.push({
            time: chartData[i + off].time,
            jaw: jaw[jaw.length - maxLen + i] || null,
            teeth: teeth[teeth.length - maxLen + i] || null,
            lips: lips[lips.length - maxLen + i] || null
          });
        }
        return alligatorRes;
      case 'Envelopes':
        const base = SMA.calculate({ period: options.period, values: closes });
        const percent = options.percent / 100;
        const envRes = [];
        const envOff = chartData.length - base.length;
        for (let i = 0; i < base.length; i++) {
          envRes.push({
            time: chartData[i + envOff].time,
            upper: base[i] * (1 + percent),
            lower: base[i] * (1 - percent),
            middle: base[i]
          });
        }
        return envRes;
      case 'Donchian':
        const donchian = [];
        for (let i = options.period; i < chartData.length; i++) {
          const slice = chartData.slice(i - options.period, i);
          const sliceVals = slice.map(d => d.high || d.value);
          const max = sliceVals.reduce((a, b) => Math.max(a, b), -Infinity);
          const sliceLowVals = slice.map(d => d.low || d.value);
          const min = sliceLowVals.reduce((a, b) => Math.min(a, b), Infinity);
          donchian.push({ time: chartData[i].time, upper: max, lower: min, middle: (max + min) / 2 });
        }
        return donchian;
      case 'Keltner':
        const ema = EMA.calculate({ period: options.period, values: closes });
        const atr = ATR.calculate({ period: options.period, high: highs, low: lows, close: closes });
        const kResult = [];
        const kOffset = chartData.length - Math.min(ema.length, atr.length);
        const startIdx = Math.max(ema.length, atr.length);
        // Aligning is tricky, let's just use the last N values
        const minLen = Math.min(ema.length, atr.length);
        for (let i = 0; i < minLen; i++) {
          const e = ema[ema.length - minLen + i];
          const a = atr[atr.length - minLen + i];
          const time = chartData[chartData.length - minLen + i].time;
          kResult.push({ time, upper: e + a * options.multiplier, lower: e - a * options.multiplier, middle: e });
        }
        return kResult;
      case 'Supertrend':
        // Basic Supertrend implementation
        const stATR = ATR.calculate({ period: options.period, high: highs, low: lows, close: closes });
        const stResult = [];
        const stOffset = chartData.length - stATR.length;
        let trend = 1; // 1 for up, -1 for down
        let upperBand = 0;
        let lowerBand = 0;
        let superTrend = 0;

        for (let i = 0; i < stATR.length; i++) {
          const idx = i + stOffset;
          const currHigh = highs[idx];
          const currLow = lows[idx];
          const currClose = closes[idx];
          const currATR = stATR[i];
          
          const mid = (currHigh + currLow) / 2;
          const basicUpper = mid + options.multiplier * currATR;
          const basicLower = mid - options.multiplier * currATR;
          
          const prevClose = closes[idx - 1] || currClose;
          const prevUpper = upperBand;
          const prevLower = lowerBand;
          
          upperBand = (basicUpper < prevUpper || prevClose > prevUpper) ? basicUpper : prevUpper;
          lowerBand = (basicLower > prevLower || prevClose < prevLower) ? basicLower : prevLower;
          
          if (trend === 1) {
            if (currClose < lowerBand) {
              trend = -1;
              superTrend = upperBand;
            } else {
              superTrend = lowerBand;
            }
          } else {
            if (currClose > upperBand) {
              trend = 1;
              superTrend = lowerBand;
            } else {
              superTrend = upperBand;
            }
          }
          
          stResult.push({ time: chartData[idx].time, value: superTrend, trend });
        }
        return stResult;
      case 'BearsPower':
        const bearsEMA = EMA.calculate({ period: options.period, values: closes });
        const bearsRes = [];
        const bearsOff = chartData.length - bearsEMA.length;
        for (let i = 0; i < bearsEMA.length; i++) {
          bearsRes.push({ time: chartData[i + bearsOff].time, value: lows[i + bearsOff] - bearsEMA[i] });
        }
        return bearsRes;
      case 'BullsPower':
        const bullsEMA = EMA.calculate({ period: options.period, values: closes });
        const bullsRes = [];
        const bullsOff = chartData.length - bullsEMA.length;
        for (let i = 0; i < bullsEMA.length; i++) {
          bullsRes.push({ time: chartData[i + bullsOff].time, value: highs[i + bullsOff] - bullsEMA[i] });
        }
        return bullsRes;
      case 'DeMarker':
        const deM = [];
        for (let i = 1; i < chartData.length; i++) {
          const deMax = highs[i] > highs[i-1] ? highs[i] - highs[i-1] : 0;
          const deMin = lows[i] < lows[i-1] ? lows[i-1] - lows[i] : 0;
          deM.push({ deMax, deMin });
        }
        const deMaxSMA = SMA.calculate({ period: options.period, values: deM.map(d => d.deMax) });
        const deMinSMA = SMA.calculate({ period: options.period, values: deM.map(d => d.deMin) });
        const deMRes = [];
        const deMOff = chartData.length - deMaxSMA.length;
        for (let i = 0; i < deMaxSMA.length; i++) {
          const val = deMaxSMA[i] / (deMaxSMA[i] + deMinSMA[i]);
          deMRes.push({ time: chartData[i + deMOff].time, value: val });
        }
        return deMRes;
      case 'VolumeOscillator':
        const fastVol = EMA.calculate({ period: options.fastPeriod, values: volumes });
        const slowVol = EMA.calculate({ period: options.slowPeriod, values: volumes });
        const volRes = [];
        const volMinLen = Math.min(fastVol.length, slowVol.length);
        const volOff = chartData.length - volMinLen;
        for (let i = 0; i < volMinLen; i++) {
          const f = fastVol[fastVol.length - volMinLen + i];
          const s = slowVol[slowVol.length - volMinLen + i];
          volRes.push({ time: chartData[i + volOff].time, value: ((f - s) / s) * 100 });
        }
        return volRes;
      case 'Fractal':
        const fractals = [];
        for (let i = 2; i < chartData.length - 2; i++) {
          const isUp = highs[i] > highs[i-1] && highs[i] > highs[i-2] && highs[i] > highs[i+1] && highs[i] > highs[i+2];
          const isDown = lows[i] < lows[i-1] && lows[i] < lows[i-2] && lows[i] < lows[i+1] && lows[i] < lows[i+2];
          if (isUp) fractals.push({ time: chartData[i].time, value: highs[i], type: 'up' });
          if (isDown) fractals.push({ time: chartData[i].time, value: lows[i], type: 'down' });
        }
        return fractals;
      case 'ParabolicSAR':
        // technicalindicators has PSAR? No, it doesn't seem to.
        // Let's implement a simple one.
        const psarRes = [];
        let isUpTrend = true;
        let ep = highs[0];
        let sar = lows[0];
        let af = options.step;
        
        for (let i = 1; i < chartData.length; i++) {
          const prevSar = sar;
          sar = prevSar + af * (ep - prevSar);
          
          if (isUpTrend) {
            if (lows[i] < sar) {
              isUpTrend = false;
              sar = ep;
              ep = lows[i];
              af = options.step;
            } else {
              if (highs[i] > ep) {
                ep = highs[i];
                af = Math.min(af + options.step, options.max);
              }
              sar = Math.min(sar, lows[i-1], (lows[i-2] || lows[i-1]));
            }
          } else {
            if (highs[i] > sar) {
              isUpTrend = true;
              sar = ep;
              ep = highs[i];
              af = options.step;
            } else {
              if (lows[i] < ep) {
                ep = lows[i];
                af = Math.min(af + options.step, options.max);
              }
              sar = Math.max(sar, highs[i-1], (highs[i-2] || highs[i-1]));
            }
          }
          psarRes.push({ time: chartData[i].time, value: sar });
        }
        return psarRes;
      case 'ZigZag':
        const zigZag = [];
        let lastHigh = highs[0];
        let lastLow = lows[0];
        let lastHighIdx = 0;
        let lastLowIdx = 0;
        let zzTrend = 0; // 1 for up, -1 for down
        const percentChange = options.percent / 100;

        for (let i = 1; i < chartData.length; i++) {
          const h = highs[i];
          const l = lows[i];
          
          if (zzTrend === 0) {
            if (h >= lastLow * (1 + percentChange)) {
              zzTrend = 1;
              zigZag.push({ time: chartData[lastLowIdx].time, value: lastLow });
              lastHigh = h;
              lastHighIdx = i;
            } else if (l <= lastHigh * (1 - percentChange)) {
              zzTrend = -1;
              zigZag.push({ time: chartData[lastHighIdx].time, value: lastHigh });
              lastLow = l;
              lastLowIdx = i;
            }
          } else if (zzTrend === 1) {
            if (h > lastHigh) {
              lastHigh = h;
              lastHighIdx = i;
            } else if (l <= lastHigh * (1 - percentChange)) {
              zigZag.push({ time: chartData[lastHighIdx].time, value: lastHigh });
              zzTrend = -1;
              lastLow = l;
              lastLowIdx = i;
            }
          } else if (zzTrend === -1) {
            if (l < lastLow) {
              lastLow = l;
              lastLowIdx = i;
            } else if (h >= lastLow * (1 + percentChange)) {
              zigZag.push({ time: chartData[lastLowIdx].time, value: lastLow });
              zzTrend = 1;
              lastHigh = h;
              lastHighIdx = i;
            }
          }
        }
        // Add last point
        zigZag.push({ time: chartData[chartData.length - 1].time, value: zzTrend === 1 ? lastHigh : lastLow });
        return zigZag;
    }

    // Default alignment for simple indicators
    return alignData(result, chartData);

  } catch (e) {
    console.error(`Error calculating ${indicator.type}:`, e);
    return [];
  }
};

const alignData = (result: any[], chartData: any[]) => {
  const diff = chartData.length - result.length;
  return result.map((v, i) => {
    const time = chartData[i + diff].time;
    if (typeof v === 'object' && v !== null) {
      return { time, ...v };
    }
    return { time, value: v };
  });
};
