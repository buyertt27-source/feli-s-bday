import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, AlertTriangle, CheckCircle, PlusCircle } from 'lucide-react';
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
      {/* Precision Chronometer Timer */}
      <div className="relative mb-6 flex flex-col items-center">
        {/* Subtle Ambient Radial Lighting */}
        <div
          className={`absolute inset-0 rounded-full blur-2xl transition-colors duration-500 pointer-events-none opacity-20 ${
            timeLeft <= 10 ? 'bg-rose-500' : 'bg-emerald-500'
          }`}
        />

        {/* Circular Gauge Instrument */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center rounded-full bg-white border border-slate-200/90 shadow-[0_12px_30px_rgba(0,0,0,0.04)] p-3">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            {/* Background track */}
            <circle
              cx="50"
              cy="50"
              r="41"
              className="stroke-slate-100"
              strokeWidth="5"
              fill="transparent"
            />
            {/* Progress track */}
            <circle
              cx="50"
              cy="50"
              r="41"
              stroke={timeLeft <= 10 ? '#ef4444' : '#0f172a'}
              strokeWidth="5"
              strokeDasharray={257.6}
              strokeDashoffset={257.6 - (257.6 * percentage) / 100}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          {/* Time display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-mono text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">
              CHRONO TIMER
            </span>
            <span
              className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${
                timeLeft <= 10 ? 'text-rose-600 animate-pulse' : 'text-slate-900'
              }`}
            >
              {formattedTime}
            </span>
            <span className="text-[11px] font-semibold text-slate-400 mt-1">
              {timeLeft} detik tersisa
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons & Expired State */}
      <AnimatePresence mode="wait">
        {isExpired ? (
          <motion.div
            key="expired-box"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.35 }}
            className="w-full bg-white border border-rose-200 rounded-3xl p-6 text-center shadow-[0_15px_35px_rgba(239,68,68,0.08)]"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-50 text-rose-600 mb-3 border border-rose-200">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-1 font-display">
              Waktu mu sudah habis! ⏰
            </h3>
            <p className="text-slate-600 text-sm mb-6 font-medium">
              Apakah lapisan kotak sudah terbuka atau mau nambah waktu lagi?
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <motion.button
                whileHover={{ scale: 1.02, y: -1.5 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleComplete}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-md active:scale-95 cursor-pointer text-sm"
              >
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Sudah Terbuka!</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -1.5 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddMinute}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-all shadow-xs active:scale-95 cursor-pointer text-sm"
              >
                <PlusCircle className="w-4 h-4 text-slate-500" />
                <span>Tambah Waktu (+1 Menit)</span>
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="active-box"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3 }}
            className="w-full flex flex-col items-center"
          >
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleComplete}
              className="w-full sm:w-auto min-w-[280px] flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-extrabold text-base bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-[0_10px_25px_rgba(15,23,42,0.15)] cursor-pointer"
            >
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span>SUDAH TERBUKA</span>
            </motion.button>
            <p className="text-xs text-slate-400 font-medium mt-3 text-center">
              Tekan tombol di atas kalau kamu udah selesai buka lapisan pertama!
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
