import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, AlertTriangle, CheckCircle, PlusCircle, Sparkles } from 'lucide-react';
import { sounds } from '../utils/sound';

interface CountdownTimerProps {
  onSuccess: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ onSuccess }) => {
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(true);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          setIsExpired(true);
          sounds.playWrong();
          return 0;
        }
        if (prev <= 10) {
          sounds.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleAddMinute = () => {
    sounds.playTick();
    setTimeLeft(60);
    setIsExpired(false);
    setIsRunning(true);
  };

  const handleComplete = () => {
    setIsRunning(false);
    sounds.playCorrect();
    onSuccess();
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const percentage = (timeLeft / 60) * 100;

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center">
      {/* Timer Display with Liquid Glass Styling */}
      <div className="relative mb-6 flex flex-col items-center">
        {/* Soft fluid aura blur */}
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className={`absolute inset-0 rounded-full blur-3xl transition-colors duration-500 pointer-events-none ${
            timeLeft <= 10 ? 'bg-rose-400' : 'bg-emerald-300'
          }`}
        />

        {/* Circular Progress Ring in Liquid Glass Casing */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center rounded-full liquid-glass shadow-[inset_0_2px_6px_rgba(255,255,255,1),0_20px_45px_rgba(0,0,0,0.06)] p-3">
          {/* Subtle fluid gloss crescent on top */}
          <div className="absolute top-2 left-6 right-6 h-8 rounded-full bg-gradient-to-b from-white/80 to-transparent pointer-events-none" />

          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            {/* Background track */}
            <circle
              cx="50"
              cy="50"
              r="41"
              className="stroke-slate-200/50"
              strokeWidth="5.5"
              fill="transparent"
            />
            {/* Animated progress track with fluid glow */}
            <circle
              cx="50"
              cy="50"
              r="41"
              stroke={timeLeft <= 10 ? '#f43f5e' : '#10b981'}
              strokeWidth="5.5"
              strokeDasharray={257.6}
              strokeDashoffset={257.6 - (257.6 * percentage) / 100}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          {/* Time in center with soft glass depth */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <Clock
              className={`w-6 h-6 mb-1 ${
                timeLeft <= 10 ? 'text-rose-500 animate-bounce' : 'text-emerald-600'
              }`}
            />
            <span
              className={`text-4xl sm:text-5xl font-black font-display tracking-tight ${
                timeLeft <= 10 ? 'text-rose-600 animate-pulse' : 'text-slate-900'
              }`}
            >
              {formattedTime}
            </span>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Sisa Waktu
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons & Expired State */}
      <AnimatePresence mode="wait">
        {isExpired ? (
          <motion.div
            key="expired-box"
            initial={{ opacity: 0, scale: 0.92, y: 15, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.92, filter: 'blur(8px)' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full liquid-glass border border-rose-200 rounded-3xl p-6 text-center shadow-[0_25px_50px_rgba(244,63,94,0.15)]"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-100 text-rose-600 mb-3 border border-rose-200 shadow-sm">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-1 font-display">
              Waktu mu sudah habis! ⏰
            </h3>
            <p className="text-slate-600 text-sm mb-6 font-medium">
              Apakah lapisan kotak sudah berhasil terbuka atau mau nambah waktu lagi?
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <motion.button
                whileHover={{ scale: 1.025, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleComplete}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-[0_10px_25px_rgba(16,185,129,0.3)] active:scale-95 cursor-pointer"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Sudah Terbuka!</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.025, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddMinute}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold bg-amber-500 hover:bg-amber-600 text-white transition-all shadow-[0_10px_25px_rgba(245,158,11,0.3)] active:scale-95 cursor-pointer"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Tambah Waktu (+1 Menit)</span>
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="active-box"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.4 }}
            className="w-full flex flex-col items-center"
          >
            <motion.button
              whileHover={{ scale: 1.025, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleComplete}
              className="w-full sm:w-auto min-w-[280px] flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-extrabold text-base sm:text-lg bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white hover:brightness-105 transition-all shadow-[0_14px_35px_rgba(16,185,129,0.35)] cursor-pointer liquid-shimmer"
            >
              <CheckCircle className="w-6 h-6 text-white" />
              <span>✅ SUDAH TERBUKA</span>
            </motion.button>
            <p className="text-xs text-slate-500 font-medium mt-3 text-center">
              Tekan tombol di atas kalau kamu udah selesai buka bungkus lapisan pertama!
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
