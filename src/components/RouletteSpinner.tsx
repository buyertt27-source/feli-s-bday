import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, useAnimation } from 'motion/react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { sounds } from '../utils/sound';

interface RouletteSpinnerProps {
  onComplete: () => void;
}

const DAY_ITEMS = [
  '04', '17', '02', '25', '09', '18', '03', '26', '12', '30',
  '15', '07', '22', '11', '08', '19', '14', '31', '06', '20',
  '13', '27', '10', '16', '23', '28', '29'
];

const MONTH_ITEMS = [
  '02', '08', '04', '12', '07', '05', '01', '06', '03', '09',
  '10', '02', '07', '04', '12', '06', '08', '01', '09', '11'
];

const YEAR_ITEMS = [
  '2003', '2020', '2007', '2016', '2002', '2019', '2009', '2014',
  '2001', '2018', '2005', '2023', '2008', '2015', '2004', '2022',
  '2006', '2013', '2010', '2012', '2011'
];

const REEL_ITEM_HEIGHT = 104;

interface ReelProps {
  label: string;
  subLabel: string;
  items: string[];
  duration: number;
  delay: number;
  onLocked: () => void;
}

const Reel: React.FC<ReelProps> = ({ label, subLabel, items, duration, delay, onLocked }) => {
  const [isLocked, setIsLocked] = useState(false);
  const controls = useAnimation();
  const hasStartedRef = useRef(false);
  const onLockedRef = useRef(onLocked);
  onLockedRef.current = onLocked;

  const finalIndex = items.length - 1;

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    let isMounted = true;
    let tickTimeout: ReturnType<typeof setTimeout>;

    const startTimeout = setTimeout(() => {
      if (!isMounted) return;

      const startTime = Date.now();
      const totalMs = duration * 1000;

      const scheduleTick = () => {
        if (!isMounted) return;
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / totalMs, 1);

        if (progress < 0.96) {
          sounds.playTick();
          const nextInterval = 75 + Math.pow(progress, 2.2) * 300;
          tickTimeout = setTimeout(scheduleTick, nextInterval);
        }
      };
      scheduleTick();

      controls.start({
        y: -(finalIndex * REEL_ITEM_HEIGHT),
        transition: {
          duration: duration,
          ease: [0.16, 0.9, 0.28, 1],
        },
      }).then(() => {
        if (!isMounted) return;
        clearTimeout(tickTimeout);
        setIsLocked(true);
        sounds.playRouletteStop();
        onLockedRef.current();
      });
    }, delay * 1000);

    return () => {
      isMounted = false;
      clearTimeout(startTimeout);
      clearTimeout(tickTimeout);
    };
  }, [controls, delay, duration, finalIndex]);

  return (
    <div className="flex flex-col items-center w-full">
      {/* Precision Label Header */}
      <div className="flex items-center justify-between w-full px-1.5 mb-2">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
          {label}
        </span>
        <span className="font-mono text-[9px] text-slate-400">
          {subLabel}
        </span>
      </div>

      {/* Crafted Precision Drum Casing */}
      <div
        style={{ height: `${REEL_ITEM_HEIGHT}px` }}
        className={`relative w-full rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-500 ${
          isLocked
            ? 'bg-emerald-50/70 border-2 border-emerald-500 shadow-[0_4px_24px_rgba(16,185,129,0.18)]'
            : 'bg-white border-2 border-slate-200/90 shadow-[inset_0_2px_4px_rgba(0,0,0,0.03),0_4px_16px_rgba(0,0,0,0.04)]'
        }`}
      >
        {/* Subtle physical graduation marks on edges */}
        <div className="absolute left-1.5 top-0 bottom-0 flex flex-col justify-between py-2 pointer-events-none z-20">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-1.5 h-[1px] bg-slate-300" />
          ))}
        </div>
        <div className="absolute right-1.5 top-0 bottom-0 flex flex-col justify-between py-2 pointer-events-none z-20">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-1.5 h-[1px] bg-slate-300" />
          ))}
        </div>

        {/* Top/bottom optical depth shadows */}
        <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white via-white/80 to-transparent pointer-events-none z-20" />
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-20" />

        {/* Rolling Reel Numbers */}
        <motion.div
          animate={controls}
          initial={{ y: 0 }}
          style={{ willChange: 'transform', transform: 'translateZ(0)' }}
          className="absolute top-0 w-full flex flex-col items-center"
        >
          {items.map((val, idx) => (
            <div
              key={idx}
              style={{ height: `${REEL_ITEM_HEIGHT}px` }}
              className="flex items-center justify-center w-full select-none"
            >
              <span
                className={`text-4xl sm:text-5xl font-black font-display tracking-tight transition-colors duration-200 ${
                  isLocked && idx === finalIndex
                    ? 'text-emerald-600 scale-105'
                    : 'text-slate-900'
                }`}
              >
                {val}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Locked Verification Pill */}
        {isLocked && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute bottom-2 flex items-center gap-1 font-mono text-[9px] font-bold text-emerald-800 uppercase tracking-widest bg-emerald-100/90 backdrop-blur-sm px-2 py-0.5 rounded-full z-30 shadow-sm border border-emerald-300"
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>LOCKED</span>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export const RouletteSpinner: React.FC<RouletteSpinnerProps> = ({ onComplete }) => {
  const [lockedCount, setLockedCount] = useState(0);
  const hasTriggeredComplete = useRef(false);

  const handleReelLocked = useCallback(() => {
    setLockedCount((prev) => {
      const next = prev + 1;
      if (next === 3 && !hasTriggeredComplete.current) {
        hasTriggeredComplete.current = true;
        sounds.playCelebration();
        setTimeout(() => {
          onComplete();
        }, 1600);
      }
      return next;
    });
  }, [onComplete]);

  const isAllLocked = lockedCount === 3;

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-8"
      >
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-[0.2em] bg-slate-100 text-slate-700 border border-slate-200 mb-3 shadow-xs">
          <Sparkles className="w-3 h-3 text-amber-500" /> Dial Takdir Kelahiran
        </span>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 font-display">
          WHEN IS YOUR BIRTHDAY??
        </h1>
        <p className="text-slate-500 text-sm mt-2 font-medium">
          Memutar dial mekanik untuk mencocokkan tanggal lahir kamu...
        </p>
      </motion.div>

      {/* Crafted Precision Slot Frame */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative p-3 rounded-[32px] bg-white border border-slate-200 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.02)] w-full"
      >
        {/* Corner Precision Screws / Rivets */}
        <div className="absolute top-3 left-3 w-2 h-2 rounded-full border border-slate-300 bg-slate-100" />
        <div className="absolute top-3 right-3 w-2 h-2 rounded-full border border-slate-300 bg-slate-100" />
        <div className="absolute bottom-3 left-3 w-2 h-2 rounded-full border border-slate-300 bg-slate-100" />
        <div className="absolute bottom-3 right-3 w-2 h-2 rounded-full border border-slate-300 bg-slate-100" />

        <div className="relative rounded-[24px] p-5 sm:p-7 bg-slate-50/70 border border-slate-100">
          {/* Authentic Center Target Payline */}
          <div className="absolute left-3 right-3 top-[56%] -translate-y-1/2 h-[1px] bg-red-400/40 pointer-events-none z-30" />
          <div className="absolute left-1 top-[56%] -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-red-500 pointer-events-none z-30 shadow-xs" />
          <div className="absolute right-1 top-[56%] -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-red-500 pointer-events-none z-30 shadow-xs" />

          {/* 3 Reel Columns */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 my-1">
            <Reel
              label="TANGGAL"
              subLabel="DD"
              items={DAY_ITEMS}
              duration={2.2}
              delay={0.25}
              onLocked={handleReelLocked}
            />
            <Reel
              label="BULAN"
              subLabel="MM"
              items={MONTH_ITEMS}
              duration={3.0}
              delay={0.25}
              onLocked={handleReelLocked}
            />
            <Reel
              label="TAHUN"
              subLabel="YYYY"
              items={YEAR_ITEMS}
              duration={3.8}
              delay={0.25}
              onLocked={handleReelLocked}
            />
          </div>

          {/* Result Status Footer */}
          <div className="mt-5 pt-3.5 border-t border-slate-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isAllLocked ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-amber-400 animate-pulse'}`} />
              <span className="font-mono text-[11px] font-semibold text-slate-600">
                {isAllLocked ? 'TARGET TERKUNCI' : `PUTARAN ${lockedCount + 1}/3...`}
              </span>
            </div>

            {isAllLocked ? (
              <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-md">
                29-11-2011 🎯
              </span>
            ) : (
              <span className="font-mono text-[11px] text-slate-400">
                Menyinkronkan...
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
