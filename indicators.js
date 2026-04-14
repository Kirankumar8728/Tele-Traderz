// Available Indicators Configuration
const AVAILABLE_INDICATORS = {
    volatility: {
        name: 'Volatility Indicators',
        items: [
            { id: 'atr', name: 'Average True Range (ATR)', type: 'atr', options: { period: 14 }, color: '#f59e0b', pane: 1 },
            { id: 'truerange', name: 'True Range', type: 'truerange', options: {}, color: '#3b82f6', pane: 1 }
        ]
    },
    overlap: {
        name: 'Overlap Studies',
        items: [
            { id: 'sma', name: 'Simple Moving Average (SMA)', type: 'sma', options: { period: 20 }, color: '#f59e0b', pane: 0 },
            { id: 'ema', name: 'Exponential Moving Average (EMA)', type: 'ema', options: { period: 20 }, color: '#3b82f6', pane: 0 },
            { id: 'wma', name: 'Weighted Moving Average (WMA)', type: 'wma', options: { period: 20 }, color: '#8b5cf6', pane: 0 },
            { id: 'psar', name: 'Parabolic SAR', type: 'psar', options: { step: 0.02, max: 0.2 }, color: '#ec4899', pane: 0 },
            { id: 'bollingerbands', name: 'Bollinger Bands', type: 'bollingerbands', options: { period: 20, stdDev: 2 }, color: '#10b981', pane: 0 }
        ]
    },
    momentum: {
        name: 'Momentum Indicators',
        items: [
            { id: 'rsi', name: 'Relative Strength Index (RSI)', type: 'rsi', options: { period: 14 }, color: '#8b5cf6', pane: 1 },
            { id: 'macd', name: 'MACD', type: 'macd', options: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 }, color: '#3b82f6', pane: 1 },
            { id: 'stochastic', name: 'Stochastic Oscillator', type: 'stochastic', options: { period: 14, signalPeriod: 3 }, color: '#ec4899', pane: 1 },
            { id: 'cci', name: 'Commodity Channel Index (CCI)', type: 'cci', options: { period: 20 }, color: '#f59e0b', pane: 1 },
            { id: 'adx', name: 'Average Directional Index (ADX)', type: 'adx', options: { period: 14 }, color: '#10b981', pane: 1 },
            { id: 'roc', name: 'Rate Of Change (ROC)', type: 'roc', options: { period: 14 }, color: '#3b82f6', pane: 1 },
            { id: 'williamsr', name: 'Williams %R', type: 'williamsr', options: { period: 14 }, color: '#ef4444', pane: 1 },
            { id: 'awesomeoscillator', name: 'Awesome Oscillator', type: 'awesomeoscillator', options: { fastPeriod: 5, slowPeriod: 34 }, color: '#f59e0b', pane: 1 }
        ]
    },
    volume: {
        name: 'Volume Indicators',
        items: [
            { id: 'obv', name: 'On Balance Volume (OBV)', type: 'obv', options: {}, color: '#3b82f6', pane: 1 },
            { id: 'vwap', name: 'Volume Weighted Average Price (VWAP)', type: 'vwap', options: {}, color: '#10b981', pane: 0 },
            { id: 'adl', name: 'Accumulation/Distribution Line', type: 'adl', options: {}, color: '#8b5cf6', pane: 1 }
        ]
    }
};

// State for active indicators
let activeIndicators = [];

function getIndicatorConfig(id) {
    for (const cat in AVAILABLE_INDICATORS) {
        const item = AVAILABLE_INDICATORS[cat].items.find(i => i.id === id);
        if (item) return item;
    }
    return null;
}

function calculateIndicatorData(indicator, chartData) {
    if (!window[indicator.type]) {
        console.warn(`Indicator ${indicator.type} not found in technicalindicators library.`);
        return [];
    }

    try {
        const values = chartData.map(d => d.close !== undefined ? d.close : d.value);
        const high = chartData.map(d => d.high !== undefined ? d.high : (d.close !== undefined ? d.close : d.value));
        const low = chartData.map(d => d.low !== undefined ? d.low : (d.close !== undefined ? d.close : d.value));
        const close = chartData.map(d => d.close !== undefined ? d.close : d.value);
        const volume = chartData.map(d => d.tick_volume || 0);

        let input = { ...indicator.options };
        
        // Map inputs based on indicator requirements
        const valueBased = ['sma', 'ema', 'wma', 'rsi', 'roc', 'macd', 'bollingerbands'];
        const hlcBased = ['atr', 'adx', 'stochastic', 'williamsr', 'cci', 'truerange'];
        const hlBased = ['psar', 'awesomeoscillator'];
        const volumeBased = ['obv', 'vwap', 'adl'];

        if (valueBased.includes(indicator.type)) {
            input.values = values;
        } else if (hlcBased.includes(indicator.type)) {
            input.high = high;
            input.low = low;
            input.close = close;
        } else if (hlBased.includes(indicator.type)) {
            input.high = high;
            input.low = low;
        } else if (volumeBased.includes(indicator.type)) {
            input.high = high;
            input.low = low;
            input.close = close;
            input.volume = volume;
        }

        const result = window[indicator.type].calculate(input);
        
        // Map result back to chart time
        const offset = chartData.length - result.length;
        
        return result.map((val, i) => {
            const time = chartData[i + offset].time;
            
            // Handle complex objects (like MACD, Bollinger Bands)
            if (typeof val === 'object' && val !== null) {
                let primaryValue = 0;
                if (val.MACD !== undefined) primaryValue = val.MACD; // MACD
                else if (val.middle !== undefined) primaryValue = val.middle; // Bollinger Bands
                else if (val.adx !== undefined) primaryValue = val.adx; // ADX
                else if (val.k !== undefined) primaryValue = val.k; // Stochastic
                
                return { time, value: primaryValue, ...val };
            }
            
            return { time, value: val };
        });
    } catch (e) {
        console.error(`Error calculating ${indicator.type}:`, e);
        return [];
    }
}
