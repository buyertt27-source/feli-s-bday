import React from 'react';
import { motion } from 'motion/react';

interface QuestProgressProps {
  currentStep: number; // 0 to 7 (8 total steps)
  stepName: string;
}

const TOTAL_STEPS = 8;

export const QuestProgress: React.FC<QuestProgressProps> = ({ currentStep, stepName }) => {
  const progressPercent = Math.round(((currentStep + 1) / TOTAL_STEPS) * 100);

  return (
    <div className="fixed top-0 left-0 right-0 z-40 flex flex-col items-center pointer-events-none pt-3 px-4">
      {/* Top minimal progress bar container */}
      <div className="w-full max-w-md pointer-events-auto">
        <div className="flex items-center justify-between gap-3 px-4 py-2 rounded-full bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.04)] ring-1 ring-slate-900/5">
          {/* Step Counter & Label */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-900 text-white font-mono text-[10px] font-bold">
              {currentStep + 1}
            </span>
            <span className="text-xs font-bold text-slate-800 tracking-tight truncate">
              {stepName}
            </span>
          </div>

          {/* Segmented Progress Track */}
          <div className="flex items-center gap-1">
            {[...Array(TOTAL_STEPS)].map((_, idx) => (
              <div
                key={idx}
                className="relative h-1.5 rounded-full overflow-hidden transition-all duration-500"
                style={{
                  width: idx === currentStep ? '20px' : '7px',
                  backgroundColor: idx <= currentStep ? '#0f172a' : '#e2e8f0',
                }}
              >
                {idx === currentStep && (
                  <motion.div
                    layoutId="active-step-glow"
                    className="absolute inset-0 bg-amber-400 opacity-80"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </div>
            ))}
            <span className="font-mono text-[10px] font-semibold text-slate-400 ml-1.5">
              {progressPercent}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
