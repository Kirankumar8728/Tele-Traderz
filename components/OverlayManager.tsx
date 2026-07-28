// OverlayManager.tsx
import React, { useState, useEffect } from 'react';
import { OverlayManager as Service, OverlayConfig } from '../services/OverlayManager';
import { Eye, Shield, Percent, Sparkles, RefreshCw, BarChart2 } from 'lucide-react';

export const OverlayManager: React.FC = () => {
  const [overlays, setOverlays] = useState<OverlayConfig[]>([]);

  useEffect(() => {
    const manager = Service.getInstance();
    
    const handleUpdate = (configs: OverlayConfig[]) => {
      setOverlays(configs);
    };

    manager.registerListener(handleUpdate);

    return () => {
      manager.unregisterListener(handleUpdate);
    };
  }, []);

  const handleToggle = (id: string) => {
    Service.getInstance().toggleOverlay(id);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto no-scrollbar text-gray-300 p-4 space-y-6">
      {/* Visual Chart Elements */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5" />
          Chart Overlays
        </h3>
        <p className="text-[10px] text-gray-600 font-bold uppercase -mt-1 pl-5">Enable decorative and structural chart visual components</p>
        
        <div className="flex flex-col gap-2">
          {overlays.map(overlay => (
            <div
              key={overlay.id}
              className="bg-[#141922]/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between transition-all"
            >
              <div>
                <p className="text-xs font-black text-white uppercase">{overlay.label}</p>
                <p className="text-[10px] font-bold text-gray-500 uppercase mt-0.5">Toggle display on layout canvas</p>
              </div>
              
              <button
                onClick={() => handleToggle(overlay.id)}
                className={`px-4 py-2 text-[10px] font-black rounded-xl uppercase border transition-all ${
                  overlay.enabled
                    ? 'bg-red-600/10 border-red-500/20 text-red-500'
                    : 'bg-white/5 border-white/5 text-gray-500'
                }`}
              >
                {overlay.enabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverlayManager;
