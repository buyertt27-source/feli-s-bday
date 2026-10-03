import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { sounds } from '../utils/sound';

export const SoundToggle: React.FC = () => {
  const [muted, setMuted] = useState(!sounds.enabled);

  const toggleSound = () => {
    sounds.enabled = !sounds.enabled;
    setMuted(!sounds.enabled);
    if (sounds.enabled) {
      sounds.playTick();
    }
  };

  return (
    <button
      onClick={toggleSound}
      title={muted ? 'Nyalakan Suara' : 'Matikan Suara'}
      className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/85 backdrop-blur-xl border border-white/80 shadow-[0_8px_20px_rgba(0,0,0,0.06)] text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-white transition-all active:scale-95 cursor-pointer ring-1 ring-slate-900/5"
    >
      {muted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600 animate-pulse" />}
      <span>{muted ? 'Suara Mati' : 'Suara Aktif'}</span>
    </button>
  );
};
