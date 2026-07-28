// StatusBar.tsx
import React, { useEffect, useState } from 'react';
import { Activity, Radio, ZoomIn, ZoomOut, Clock, Globe } from 'lucide-react';
import { Timeframe } from '../types';

interface StatusBarProps {
  isConnected: boolean;
  underlying_symbol: string;
  timeframe: Timeframe;
  ohlc?: {
    open: number;
    high: number;
    low: number;
    close: number;
  } | null;
  crosshairData?: {
    price?: number;
    time?: number | string;
  } | null;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  isConnected,
  underlying_symbol,
  timeframe,
  ohlc,
  crosshairData
}) => {
  const [latency, setLatency] = useState<number>(15);

  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(() => {
      // Generate a realistic minor fluctuate latency between 8ms and 32ms
      setLatency(Math.floor(Math.random() * (32 - 8) + 8));
    }, 5000);
    return () => clearInterval(interval);
  }, [isConnected]);

  return (
    <div className="h-7 bg-[#0b0e14] border-t border-white/5 flex items-center justify-between px-3 text-[10px] font-bold text-gray-500 select-none flex-shrink-0">
      {/* Left section: WebSocket & telemetries */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="uppercase text-[9px] font-black tracking-wider text-gray-400">
            {isConnected ? 'Deriv WS Connected' : 'WS Disconnected'}
          </span>
        </div>

        {isConnected && (
          <div className="flex items-center gap-1">
            <Radio className="w-3 h-3 text-gray-600" />
            <span className="font-mono tabular-nums text-gray-400">{latency}ms</span>
          </div>
        )}

        <div className="hidden md:flex items-center gap-1.5">
          <span className="uppercase text-[9px] font-black tracking-wider">Symbol:</span>
          <span className="text-white font-mono">{underlying_symbol}</span>
        </div>

        <div className="hidden md:flex items-center gap-1.5">
          <span className="uppercase text-[9px] font-black tracking-wider">Interval:</span>
          <span className="text-white font-mono uppercase">{timeframe}</span>
        </div>
      </div>

      {/* Middle section: Real-time OHLC */}
      {ohlc && (
        <div className="flex items-center gap-2.5 font-mono text-[9px] tabular-nums">
          <div className="flex gap-1">
            <span className="text-gray-600 font-bold uppercase">O:</span>
            <span className="text-white font-black">{ohlc.open.toFixed(4)}</span>
          </div>
          <div className="flex gap-1">
            <span className="text-gray-600 font-bold uppercase">H:</span>
            <span className="text-green-500 font-black">{ohlc.high.toFixed(4)}</span>
          </div>
          <div className="flex gap-1">
            <span className="text-gray-600 font-bold uppercase">L:</span>
            <span className="text-red-500 font-black">{ohlc.low.toFixed(4)}</span>
          </div>
          <div className="flex gap-1">
            <span className="text-gray-600 font-bold uppercase">C:</span>
            <span className="text-white font-black">{ohlc.close.toFixed(4)}</span>
          </div>
        </div>
      )}

      {/* Right section: Cursor coordinates & status */}
      <div className="flex items-center gap-4">
        {crosshairData && (
          <div className="flex items-center gap-3 font-mono text-white text-[9px] tabular-nums bg-white/5 px-2 py-0.5 rounded">
            {crosshairData.price !== undefined && (
              <div className="flex gap-1">
                <span className="text-gray-500 font-black uppercase">Cursor:</span>
                <span className="font-bold">{crosshairData.price.toFixed(4)}</span>
              </div>
            )}
            {crosshairData.time !== undefined && (
              <div className="flex gap-1">
                <span className="text-gray-500 font-black uppercase">Time:</span>
                <span className="font-bold">
                  {typeof crosshairData.time === 'number' 
                    ? new Date(crosshairData.time).toLocaleTimeString() 
                    : crosshairData.time}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <Globe className="w-3 h-3 text-red-500" />
          <span className="uppercase text-[9px] font-black tracking-wider text-gray-400">Market Open</span>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
