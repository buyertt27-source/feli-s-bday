import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, useAnimation } from 'motion/react';
import { Sparkles } from 'lucide-react';
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
  items: string[];
  duration: number;
  delay: number;
  onLocked: () => void;
}

const Reel: React.FC<ReelProps> = ({ label, items, duration, delay, onLocked }) => {
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

      // Smooth non-blocking decelerating audio ticks
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

      // GPU Hardware-Accelerated transform with native spring/cubic-bezier
      controls.start({
        y: -(finalIndex * REEL_ITEM_HEIGHT),
        transition: {
          duration: duration,
          ease: [0.16, 0.9, 0.28, 1], // Butter-smooth physical deceleration
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
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
        {label}
      </span>

      {/* GPU-Accelerated Liquid Glass Column */}
      <div
        style={{ height: `${REEL_ITEM_HEIGHT}px` }}
        className={`relative w-full rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-500 ${
          isLocked
            ? 'liquid-glass border-2 border-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.22)]'
            : 'liquid-glass border-2 border-white/90 shadow-[0_8px_20px_rgba(0,0,0,0.04)]'
        }`}
      >
        <div className="absolute inset-0 bg-stripes-slanted opacity-30 pointer-events-none z-10" />

        {/* Top/bottom depth gradients */}
        <div className="absolute inset-x-0 top-0 h-7 bg-gradient-to-b from-white/90 to-transparent pointer-events-none z-20" />
        <div className="absolute inset-x-0 bottom-0 h-7 bg-gradient-to-t from-white/90 to-transparent pointer-events-none z-20" />
        <div className="absolute top-1 bottom-1 left-1.5 w-1 rounded-full bg-white/50 pointer-events-none z-20" />

        {/* Rolling Reel Strip: GPU Composited with will-change */}
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
                    : 'text-slate-800'
                }`}
              >
                {val}
              </span>
            </div>
          ))}
        </motion.div>

        {isLocked && (
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute bottom-2 text-[9px] font-extrabold text-emerald-700 uppercase tracking-widest bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full z-30 shadow-sm border border-emerald-300"
          >
            LOCKED ✓
          </motion.span>
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
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/90 text-amber-700 border border-amber-300/80 mb-3 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" /> Vegas Birthday Roulette
        </span>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 font-display drop-shadow-sm">
          WHEN IS YOUR BIRTHDAY??
        </h1>
        <p className="text-slate-500 text-sm mt-2 font-medium">
          Memutar takdir tanggal kelahiran...
        </p>
      </motion.div>

      {/* Casino Slot Frame */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative p-2 rounded-[28px] bg-gradient-to-b from-white via-slate-100/60 to-white/90 shadow-[0_20px_50px_-10px_rgba(71,85,105,0.12)] w-full border border-white"
      >
        {/* Decorative Glowing Beads */}
        <div className="absolute -top-3 left-8 right-8 flex justify-between pointer-events-none z-30">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className={`w-3.5 h-3.5 rounded-full border border-white ${
                i % 2 === 0
                  ? 'bg-amber-400 shadow-[0_0_10px_#f59e0b]'
                  : 'bg-rose-400 shadow-[0_0_10px_#fb7185]'
              }`}
            />
          ))}
        </div>

        <div className="relative liquid-glass-elevated rounded-[22px] p-6 sm:p-8 overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-90 pointer-events-none" />
          <div className="absolute left-4 right-4 top-[56%] -translate-y-1/2 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent pointer-events-none z-30" />

          {/* Liquid Glass Columns for Reels */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 my-2">
            <Reel
              label="TANGGAL"
              items={DAY_ITEMS}
              duration={2.2}
              delay={0.25}
              onLocked={handleReelLocked}
            />
            <Reel
              label="BULAN"
              items={MONTH_ITEMS}
              duration={3.0}
              delay={0.25}
              onLocked={handleReelLocked}
            />
            <Reel
              label="TAHUN"
              items={YEAR_ITEMS}
              duration={3.8}
              delay={0.25}
              onLocked={handleReelLocked}
            />
          </div>

          {/* Result Banner */}
          <div className="mt-5 pt-4 border-t border-slate-200/60 text-center">
            {isAllLocked ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="flex items-center justify-center gap-2 text-emerald-700 font-bold text-base sm:text-lg"
              >
                <Sparkles className="w-5 h-5 text-amber-500 animate-spin" />
                <span>JACKPOT! Tanggal ditemukan: 29-11-2011 🎯</span>
              </motion.div>
            ) : (
              <div className="text-xs text-amber-700 font-semibold tracking-wider flex items-center justify-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                <span>ROULETTE SEDANG BERPUTAR MULUS...</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
