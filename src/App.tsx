/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Gift, 
  AlertCircle, 
  Package, 
  RotateCcw, 
  Flame, 
  Heart,
  Smile,
  ShieldAlert,
  ChevronRight,
  PartyPopper
} from 'lucide-react';
import { RouletteSpinner } from './components/RouletteSpinner';
import { CountdownTimer } from './components/CountdownTimer';
import { SoundToggle } from './components/SoundToggle';
import { sounds } from './utils/sound';
import { launchConfetti, launchGrandCelebration } from './utils/confetti';

type Stage = 
  | 'APOLOGY' 
  | 'ROULETTE' 
  | 'AGE_QUIZ' 
  | 'GOKILL' 
  | 'OLDER_THAN_ME' 
  | 'SEE_BOX_QUESTION' 
  | 'OPEN_FIRST_LAYER' 
  | 'GUESS_PAPER' 
  | 'GIVE_UP_CHOICE' 
  | 'UNWRAP_FINAL' 
  | 'HOW_IS_GIFT' 
  | 'FINALE';

export default function App() {
  const [stage, setStage] = useState<Stage>('APOLOGY');
  const [apologyCountdown, setApologyCountdown] = useState(3);
  
  // Age quiz state
  const [gokillCountdown, setGokillCountdown] = useState(3);
  const [roastMessage, setRoastMessage] = useState<string | null>(null);
  const [roastShake, setRoastShake] = useState(false);

  // Box question state
  const [hasRemovedTidak, setHasRemovedTidak] = useState(false);
  const [boxJokeToast, setBoxJokeToast] = useState<string | null>(null);

  // Guess paper state: remaining choices from ['sabun', 'skincare', 'kunci']
  const [paperChoices, setPaperChoices] = useState<Array<'sabun' | 'skincare' | 'kunci'>>(['sabun', 'skincare', 'kunci']);
  const [paperRoast, setPaperRoast] = useState<string | null>(null);

  // Give up choice state: remaining choices from ['surrender', 'trash']
  const [hasRemovedTrash, setHasRemovedTrash] = useState(false);
  const [trashRoast, setTrashRoast] = useState<string | null>(null);

  // Auto transition for initial apology
  useEffect(() => {
    if (stage === 'APOLOGY') {
      const timer = setInterval(() => {
        setApologyCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setStage('ROULETTE');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [stage]);

  // Gokill 3 seconds countdown
  useEffect(() => {
    if (stage === 'GOKILL') {
      launchConfetti();
      sounds.playCorrect();
      setGokillCountdown(3);
      const timer = setInterval(() => {
        setGokillCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setStage('OLDER_THAN_ME');
            return 0;
          }
          sounds.playTick();
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [stage]);

  // Older than me transition after 3.4 seconds to design shift
  useEffect(() => {
    if (stage === 'OLDER_THAN_ME') {
      const timer = setTimeout(() => {
        setStage('SEE_BOX_QUESTION');
      }, 3400);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  // Age quiz handler - JAWABAN BENAR: 15 (Option B)
  const handleAgeChoice = (choice: 'a' | 'b' | 'c') => {
    if (choice === 'b') {
      // Benar! "mungkin 15"
      setRoastMessage(null);
      setStage('GOKILL');
    } else {
      // Salah (a. Kayaknya 14 atau c. ohh 16!!!)
      sounds.playWrong();
      setRoastShake(true);
      setTimeout(() => setRoastShake(false), 450);

      const wrongRoasts = [
        "salahhh, masa umur sendiri ga tau😝😝😝",
        "waduhhh amnesia mendadak ya bro? coba hitung pake jari kaki dulu🤣",
        "ngawurr!! mau cepet-cepet tua apa gimana nih?🗿",
        "bisa-bisanya umur sendiri lupa, minta dijitak nih wkwk🤪",
        "kocak lu! kalkulator lu lagi error apa gimana??! 🤡"
      ];
      const randomRoast = wrongRoasts[Math.floor(Math.random() * wrongRoasts.length)];
      setRoastMessage(randomRoast);
    }
  };

  // Box question handlers
  const handleBoxAnswer = (answer: 'iya' | 'tidak') => {
    if (answer === 'tidak') {
      sounds.playPoof();
      setHasRemovedTidak(true);
      setBoxJokeToast("Eits gak boleh pilih tidak wkwk! Harus iya! 😜");
      setTimeout(() => setBoxJokeToast(null), 3000);
    } else {
      sounds.playCorrect();
      setStage('OPEN_FIRST_LAYER');
    }
  };

  // Guess behind paper handler
  const handlePaperGuess = (choice: 'sabun' | 'skincare' | 'kunci') => {
    sounds.playWrong();
    let roast = "";
    if (choice === 'sabun') {
      roast = "Masa sabun sih woy?! Lu kira ini paket bansos mandi apa?! 🧼🤣";
    } else if (choice === 'skincare') {
      roast = "Wkwkwk sok glowing banget nebak skincare, tetot salah besar!! 🧴😝";
    } else if (choice === 'kunci') {
      roast = "Kunci apaan? Kunci surga?! Salah keles jangan ngayal! 🔑😜";
    }
    setPaperRoast(roast);

    // Remove the chosen option smoothly
    const updated = paperChoices.filter(item => item !== choice);
    setPaperChoices(updated);

    // If all are exhausted, move to give up stage
    if (updated.length === 0) {
      setTimeout(() => {
        setPaperRoast(null);
        setStage('GIVE_UP_CHOICE');
      }, 1500);
    }
  };

  // Give up / Throw away handler
  const handleGiveUpChoice = (choice: 'surrender' | 'trash') => {
    if (choice === 'trash') {
      sounds.playPoof();
      setHasRemovedTrash(true);
      setTrashRoast("Ehhh jangan dibuang dong parah banget!! Hargai perjuangan yang ngasih woy! 😤😤");
      setTimeout(() => setTrashRoast(null), 3500);
    } else {
      sounds.playTick();
      setStage('UNWRAP_FINAL');
    }
  };

  // How is gift handler
  const handleHowIsGift = () => {
    sounds.playCelebration();
    launchGrandCelebration();
    setStage('FINALE');
  };

  // Restart function
  const handleRestart = () => {
    setStage('APOLOGY');
    setApologyCountdown(3);
    setRoastMessage(null);
    setHasRemovedTidak(false);
    setPaperChoices(['sabun', 'skincare', 'kunci']);
    setPaperRoast(null);
    setHasRemovedTrash(false);
    setTrashRoast(null);
  };

  const isMysteryTheme = [
    'OLDER_THAN_ME', 
    'SEE_BOX_QUESTION', 
    'OPEN_FIRST_LAYER', 
    'GUESS_PAPER', 
    'GIVE_UP_CHOICE', 
    'UNWRAP_FINAL', 
    'HOW_IS_GIFT', 
    'FINALE'
  ].includes(stage);

  return (
    <div className={`min-h-screen relative flex flex-col justify-between overflow-x-hidden transition-colors duration-700 ${
      isMysteryTheme
        ? 'bg-slate-50 text-slate-900'
        : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Sound toggle button */}
      <SoundToggle />

      {/* Tactile Dot Grid */}
      <div className="fixed inset-0 pointer-events-none bg-dot-grid opacity-60 z-0" />

      {/* GPU-Optimized Ambient Color Orbs (Fast, Smooth, No CPU Lag) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className={`gpu-ambient-blob absolute -top-20 -left-20 w-[420px] h-[420px] rounded-full blur-[80px] opacity-35 transition-colors duration-700 ${
          isMysteryTheme ? 'bg-purple-200' : 'bg-rose-200'
        }`} />
        <div className={`gpu-ambient-blob absolute top-1/4 -right-20 w-[400px] h-[400px] rounded-full blur-[80px] opacity-35 transition-colors duration-700 ${
          isMysteryTheme ? 'bg-rose-200' : 'bg-amber-200'
        }`} />
        <div className={`gpu-ambient-blob absolute -bottom-20 left-1/3 w-[380px] h-[380px] rounded-full blur-[80px] opacity-30 transition-colors duration-700 ${
          isMysteryTheme ? 'bg-indigo-100' : 'bg-teal-100'
        }`} />
      </div>

      {/* Main Content Area: Smooth 60fps/120fps GPU Composited Transitions */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 max-w-4xl mx-auto w-full">
        <AnimatePresence mode="wait">

          {/* ----------------- STAGE 0: APOLOGY ----------------- */}
          {stage === 'APOLOGY' && (
            <motion.div
              key="stage-apology"
              initial={{ opacity: 0, y: 15, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.96 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="text-center max-w-lg mx-auto py-12 px-6 sm:px-8 rounded-[32px] liquid-glass-elevated relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-90" />
              
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                className="text-6xl sm:text-7xl mb-5 inline-block filter drop-shadow-md"
              >
                😔
              </motion.div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800 mb-3 font-display">
                maaf udah suruh kamu buka webside ini😔😔
              </h2>
              <p className="text-slate-500 text-sm sm:text-base leading-relaxed mb-8 font-medium">
                Tolong jangan ditutup dulu ya... Ada sesuatu yang harus kamu lihat di sini.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.025, y: -1.5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStage('ROULETTE')}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-full font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group cursor-pointer shadow-[0_10px_24px_rgba(15,23,42,0.16)] liquid-shimmer"
                >
                  <span>Buka Sekarang ({apologyCountdown}s)</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-amber-300" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ----------------- STAGE 1: ROULETTE ----------------- */}
          {stage === 'ROULETTE' && (
            <motion.div
              key="stage-roulette"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              <RouletteSpinner onComplete={() => setStage('AGE_QUIZ')} />
            </motion.div>
          )}

          {/* ----------------- STAGE 2: AGE QUIZ (JAWABAN BENAR: 15) ----------------- */}
          {stage === 'AGE_QUIZ' && (
            <motion.div
              key="stage-age-quiz"
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className={`w-full max-w-xl mx-auto flex flex-col items-center ${
                roastShake ? 'animate-shake' : ''
              }`}
            >
              {/* Question Heading */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass text-amber-700 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
                  <PartyPopper className="w-4 h-4 text-amber-500 animate-bounce" /> Pertanyaan Spesial
                </div>
                <h2 className="text-3xl sm:text-5xl font-black text-slate-900 font-display leading-tight">
                  jadi berapakah umur kamu sekarangg🥳🥳?!?
                </h2>
                <p className="text-slate-500 text-sm mt-3 font-medium">
                  Pilih jawaban yang paling tepat sesuai tanggal 29-11-2011 tadi:
                </p>
              </div>

              {/* Slanted Striped Liquid Glass Columns */}
              <div className="w-full flex flex-col gap-4">
                {/* Option A (14) - Wrong */}
                <motion.button
                  whileHover={{ scale: 1.018, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08, duration: 0.4 }}
                  onClick={() => handleAgeChoice('a')}
                  className="relative overflow-hidden w-full p-5 sm:p-6 rounded-2xl liquid-glass border-2 border-indigo-200/90 hover:border-indigo-500 text-left group cursor-pointer transition-all shadow-[0_8px_20px_rgba(99,102,241,0.06)] liquid-shimmer"
                >
                  <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />
                  <div className="absolute inset-0 bg-stripes-slanted opacity-70 pointer-events-none group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="w-10 h-10 rounded-xl bg-indigo-50/90 border border-indigo-200/80 flex items-center justify-center font-bold font-display text-indigo-600 text-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-sm">
                        a
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-wide font-display">
                        Kayaknya 14
                      </span>
                    </div>
                    <ChevronRight className="w-6 h-6 text-indigo-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.button>

                {/* Option B (15) - CORRECT! */}
                <motion.button
                  whileHover={{ scale: 1.018, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.16, duration: 0.4 }}
                  onClick={() => handleAgeChoice('b')}
                  className="relative overflow-hidden w-full p-5 sm:p-6 rounded-2xl liquid-glass border-2 border-purple-200/90 hover:border-purple-500 text-left group cursor-pointer transition-all shadow-[0_8px_20px_rgba(168,85,247,0.06)] liquid-shimmer"
                >
                  <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />
                  <div className="absolute inset-0 bg-stripes-slanted opacity-70 pointer-events-none group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="w-10 h-10 rounded-xl bg-purple-50/90 border border-purple-200/80 flex items-center justify-center font-bold font-display text-purple-600 text-lg group-hover:bg-purple-600 group-hover:text-white transition-colors shadow-sm">
                        b
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-wide font-display">
                        mungkin 15
                      </span>
                    </div>
                    <ChevronRight className="w-6 h-6 text-purple-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.button>

                {/* Option C (16) - Wrong */}
                <motion.button
                  whileHover={{ scale: 1.018, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.24, duration: 0.4 }}
                  onClick={() => handleAgeChoice('c')}
                  className="relative overflow-hidden w-full p-5 sm:p-6 rounded-2xl liquid-glass border-2 border-rose-200/90 hover:border-rose-500 text-left group cursor-pointer transition-all shadow-[0_8px_20px_rgba(244,63,94,0.06)] liquid-shimmer"
                >
                  <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />
                  <div className="absolute inset-0 bg-stripes-slanted opacity-70 pointer-events-none group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="w-10 h-10 rounded-xl bg-rose-50/90 border border-rose-200/80 flex items-center justify-center font-bold font-display text-rose-600 text-lg group-hover:bg-rose-600 group-hover:text-white transition-colors shadow-sm">
                        c
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-wide font-display">
                        ohh 16!!!
                      </span>
                    </div>
                    <ChevronRight className="w-6 h-6 text-rose-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.button>
              </div>

              {/* Red Mocking Roast: Fast GPU Fade */}
              <AnimatePresence>
                {roastMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.3 }}
                    className="mt-6 w-full p-4 rounded-2xl liquid-glass border-2 border-rose-300 text-rose-950 text-center shadow-[0_12px_28px_rgba(244,63,94,0.12)] relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-stripes-red opacity-50 pointer-events-none" />
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="text-3xl mb-1">😝</div>
                      <p className="text-lg font-black tracking-wide font-display text-rose-950">
                        {roastMessage}
                      </p>
                      <span className="text-xs text-rose-700 font-semibold mt-1">
                        Coba tebak lagi yang bener ya!
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ----------------- STAGE 3: GOKILL + 3s COUNTDOWN ----------------- */}
          {stage === 'GOKILL' && (
            <motion.div
              key="stage-gokill"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="text-center py-10 px-6 max-w-lg mx-auto rounded-[32px] liquid-glass-elevated relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-95" />

              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                className="inline-block p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 shadow-md mb-6"
              >
                <Sparkles className="w-12 h-12 text-emerald-600" />
              </motion.div>

              <h1 className="text-6xl sm:text-8xl font-black tracking-tight text-emerald-600 font-display drop-shadow-sm">
                GOKILL!!!
              </h1>

              <p className="text-xl sm:text-2xl font-black text-slate-800 mt-3 font-display">
                Tepat banget! Umur kamu 15 tahun! 🎯🔥
              </p>

              {/* 3 Seconds Countdown */}
              <div className="mt-8 flex flex-col items-center justify-center">
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-full liquid-glass border border-white text-slate-700 text-sm font-bold shadow-sm">
                  <span>Melanjutkan dalam</span>
                  <span className="w-7 h-7 rounded-full bg-emerald-500 text-white font-black flex items-center justify-center text-sm shadow-md">
                    {gokillCountdown}
                  </span>
                  <span>detik...</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* ----------------- STAGE 4: NOW YOU ARE OLDER THAN ME 🥀 ----------------- */}
          {stage === 'OLDER_THAN_ME' && (
            <motion.div
              key="stage-older-than-me"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45 }}
              className="text-center max-w-md mx-auto py-12 px-6 rounded-[32px] liquid-glass-elevated relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />

              <div className="text-5xl sm:text-6xl mb-6 inline-block filter drop-shadow-md">
                🥀🥀🥀
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display leading-relaxed">
                now you are older than me 🥀🥀🥀
              </h2>
              <p className="text-slate-400 text-sm mt-4 font-mono tracking-wider">
                mempersiapkan misi berikutnya...
              </p>
            </motion.div>
          )}

          {/* ----------------- STAGE 5: SEE BOX QUESTION ----------------- */}
          {stage === 'SEE_BOX_QUESTION' && (
            <motion.div
              key="stage-see-box"
              initial={{ opacity: 0, y: 15, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45 }}
              className="w-full max-w-xl mx-auto flex flex-col items-center"
            >
              {/* Box Quest Tag */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass border border-purple-200 text-purple-700 text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
                <Package className="w-4 h-4 text-purple-600" /> Misi Kotak Rahasia
              </div>

              {/* Text: i hope kamu belum buka kotak nya 🥀🥀🥀 */}
              <p className="text-rose-600 text-base sm:text-lg font-bold mb-4 italic flex items-center justify-center gap-1.5">
                <span>i hope kamu belum buka kotak nya</span>
                <span className="text-xl">🥀🥀🥀</span>
              </p>

              {/* Main question Card */}
              <div className="liquid-glass-elevated rounded-[32px] p-6 sm:p-8 text-center w-full mb-6 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-95" />

                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shadow-md">
                  <Gift className="w-7 h-7" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display leading-snug">
                  apakah kamu sudah melihat kotak yang di lapisi itu?
                </h2>
                <p className="text-amber-700 text-sm font-bold mt-2">
                  (tebak, jangan di buka dulu!)
                </p>

                {/* Choices: a. iya, b. tidak */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                  {/* Option: iya */}
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleBoxAnswer('iya')}
                    className={`relative overflow-hidden p-5 rounded-2xl liquid-glass border-2 border-emerald-300 hover:border-emerald-500 text-left font-display group cursor-pointer transition-all shadow-[0_8px_20px_rgba(16,185,129,0.08)] liquid-shimmer ${
                      hasRemovedTidak ? 'sm:col-span-2' : ''
                    }`}
                  >
                    <div className="absolute inset-0 bg-stripes-slanted opacity-70 pointer-events-none" />
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-xl bg-emerald-100/90 text-emerald-700 font-bold flex items-center justify-center border border-emerald-200 shadow-sm">
                          a
                        </span>
                        <span className="text-xl font-black text-slate-900">
                          iya, udah liat!
                        </span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-emerald-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.button>

                  {/* Option: tidak */}
                  <AnimatePresence>
                    {!hasRemovedTidak && (
                      <motion.button
                        key="btn-tidak"
                        initial={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.3 } }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleBoxAnswer('tidak')}
                        className="relative overflow-hidden p-5 rounded-2xl liquid-glass border-2 border-rose-300 hover:border-rose-500 text-left font-display group cursor-pointer transition-all shadow-[0_8px_20px_rgba(244,63,94,0.08)] liquid-shimmer"
                      >
                        <div className="absolute inset-0 bg-stripes-slanted opacity-70 pointer-events-none" />
                        <div className="relative z-10 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="w-9 h-9 rounded-xl bg-rose-100/90 text-rose-700 font-bold flex items-center justify-center border border-rose-200 shadow-sm">
                              b
                            </span>
                            <span className="text-xl font-black text-slate-900">
                              tidak
                            </span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-rose-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>

                {/* Toast when "tidak" was clicked */}
                <AnimatePresence>
                  {boxJokeToast && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="mt-4 p-3.5 rounded-2xl liquid-glass border border-amber-300 text-amber-900 text-sm font-bold shadow-md"
                    >
                      {boxJokeToast}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* ----------------- STAGE 6: OPEN FIRST LAYER + 1 MINUTE COUNTDOWN ----------------- */}
          {stage === 'OPEN_FIRST_LAYER' && (
            <motion.div
              key="stage-open-first-layer"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.45 }}
              className="w-full max-w-xl mx-auto flex flex-col items-center"
            >
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full liquid-glass border border-amber-200 text-amber-700 text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
                  <Flame className="w-4 h-4 text-amber-500" /> Tantangan Waktu 1 Menit
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-display leading-snug">
                  oke sekarang <span className="text-amber-600 underline decoration-amber-400 decoration-wavy">BUKA LAPISAN PERTAMA KOTAK TERSEBUT</span>!
                </h2>
                <div className="mt-3 p-4 rounded-2xl liquid-glass border border-slate-200/80 text-slate-600 text-sm font-medium shadow-sm">
                  saya kasih kamu waktu 1 menit, bila tidak terbuka maka kembalikan ke pemberi nya 🫢🫢, <span className="text-amber-700 font-bold">bercanda!!!</span>
                </div>
              </div>

              {/* 1 Minute Countdown Timer Card */}
              <div className="w-full p-6 sm:p-8 rounded-[32px] liquid-glass-elevated relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-90" />
                <CountdownTimer onSuccess={() => setStage('GUESS_PAPER')} />
              </div>
            </motion.div>
          )}

          {/* ----------------- STAGE 7: GUESS WHAT IS BEHIND THE PAPER ----------------- */}
          {stage === 'GUESS_PAPER' && (
            <motion.div
              key="stage-guess-paper"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.45 }}
              className="w-full max-w-xl mx-auto flex flex-col items-center"
            >
              <div className="text-center mb-6">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider liquid-glass text-rose-700 border border-rose-200 mb-2 shadow-sm">
                  <ShieldAlert className="w-3.5 h-3.5" /> Jangan Buka Dulu Kotak Nya!
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-slate-900 font-display leading-tight">
                  bisa kamu lihat? apa yang ada di balik kertas tersebut 🤔
                </h2>
                <p className="text-rose-600 font-bold text-sm mt-1">
                  (JANGAN DI BUKA DULU KOTAK NYA)
                </p>
              </div>

              {/* Choices */}
              <div className="w-full flex flex-col gap-3.5">
                <AnimatePresence>
                  {paperChoices.includes('sabun') && (
                    <motion.button
                      key="paper-sabun"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.88, transition: { duration: 0.25 } }}
                      whileHover={{ scale: 1.018, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePaperGuess('sabun')}
                      className="relative overflow-hidden w-full p-5 rounded-2xl liquid-glass border-2 border-slate-200/90 hover:border-rose-400 text-left group cursor-pointer transition-all shadow-[0_8px_20px_rgba(0,0,0,0.04)] liquid-shimmer"
                    >
                      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />
                      <div className="absolute inset-0 bg-stripes-slanted opacity-70 pointer-events-none" />
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center font-display text-lg border border-slate-200 shadow-sm">
                            a
                          </span>
                          <span className="text-xl font-black text-slate-900 font-display">
                            sabun 🧼
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 font-bold group-hover:text-rose-600 transition-colors">
                          Pilih ini?
                        </span>
                      </div>
                    </motion.button>
                  )}

                  {paperChoices.includes('skincare') && (
                    <motion.button
                      key="paper-skincare"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.88, transition: { duration: 0.25 } }}
                      whileHover={{ scale: 1.018, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePaperGuess('skincare')}
                      className="relative overflow-hidden w-full p-5 rounded-2xl liquid-glass border-2 border-slate-200/90 hover:border-rose-400 text-left group cursor-pointer transition-all shadow-[0_8px_20px_rgba(0,0,0,0.04)] liquid-shimmer"
                    >
                      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />
                      <div className="absolute inset-0 bg-stripes-slanted opacity-70 pointer-events-none" />
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center font-display text-lg border border-slate-200 shadow-sm">
                            b
                          </span>
                          <span className="text-xl font-black text-slate-900 font-display">
                            skincare 🧴
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 font-bold group-hover:text-rose-600 transition-colors">
                          Pilih ini?
                        </span>
                      </div>
                    </motion.button>
                  )}

                  {paperChoices.includes('kunci') && (
                    <motion.button
                      key="paper-kunci"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.88, transition: { duration: 0.25 } }}
                      whileHover={{ scale: 1.018, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePaperGuess('kunci')}
                      className="relative overflow-hidden w-full p-5 rounded-2xl liquid-glass border-2 border-slate-200/90 hover:border-rose-400 text-left group cursor-pointer transition-all shadow-[0_8px_20px_rgba(0,0,0,0.04)] liquid-shimmer"
                    >
                      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />
                      <div className="absolute inset-0 bg-stripes-slanted opacity-70 pointer-events-none" />
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center font-display text-lg border border-slate-200 shadow-sm">
                            c
                          </span>
                          <span className="text-xl font-black text-slate-900 font-display">
                            kunci 🔑
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 font-bold group-hover:text-rose-600 transition-colors">
                          Pilih ini?
                        </span>
                      </div>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* Red Mocking Roast */}
              <AnimatePresence>
                {paperRoast && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.3 }}
                    className="mt-6 w-full p-4 rounded-2xl liquid-glass border-2 border-rose-300 text-rose-950 text-center shadow-[0_12px_28px_rgba(244,63,94,0.14)] relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-stripes-red opacity-50 pointer-events-none" />
                    <div className="relative z-10">
                      <p className="text-lg font-black tracking-wide font-display">
                        {paperRoast}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ----------------- STAGE 8: GIVE UP CHOICE ----------------- */}
          {stage === 'GIVE_UP_CHOICE' && (
            <motion.div
              key="stage-give-up"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.45 }}
              className="w-full max-w-xl mx-auto flex flex-col items-center"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider liquid-glass text-amber-700 border border-amber-200 mb-2 shadow-sm">
                  <AlertCircle className="w-3.5 h-3.5" /> Tebakan Habis!
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-display">
                  Semua tebakan kamu salah total! 😂
                </h2>
                <p className="text-slate-500 text-sm mt-2 font-medium">
                  Sekarang tentukan pilihan hidup kamu:
                </p>
              </div>

              <div className="w-full flex flex-col gap-4">
                {/* Option: Menyerah */}
                <motion.button
                  whileHover={{ scale: 1.018, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleGiveUpChoice('surrender')}
                  className="relative overflow-hidden w-full p-5 sm:p-6 rounded-2xl liquid-glass border-2 border-amber-300 hover:border-amber-500 text-left group cursor-pointer transition-all shadow-[0_8px_24px_rgba(245,158,11,0.08)] liquid-shimmer"
                >
                  <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-85" />
                  <div className="absolute inset-0 bg-stripes-slanted opacity-70 pointer-events-none" />
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 font-bold flex items-center justify-center font-display text-lg border border-amber-200 shadow-sm">
                        a
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-slate-900 font-display">
                        menyerah 🏳️
                      </span>
                    </div>
                    <ChevronRight className="w-6 h-6 text-amber-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.button>

                {/* Option: Buang Hadiah Nya */}
                <AnimatePresence>
                  {!hasRemovedTrash && (
                    <motion.button
                      key="btn-trash"
                      exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.3 } }}
                      whileHover={{ scale: 1.018, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleGiveUpChoice('trash')}
                      className="relative overflow-hidden w-full p-5 sm:p-6 rounded-2xl liquid-glass border-2 border-rose-300 hover:border-rose-500 text-left group cursor-pointer transition-all shadow-[0_8px_24px_rgba(244,63,94,0.08)] liquid-shimmer"
                    >
                      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-85" />
                      <div className="absolute inset-0 bg-stripes-slanted opacity-70 pointer-events-none" />
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 font-bold flex items-center justify-center font-display text-lg border border-rose-200 shadow-sm">
                            b
                          </span>
                          <span className="text-xl sm:text-2xl font-black text-slate-900 font-display">
                            buang hadiah nya 🗑️
                          </span>
                        </div>
                        <ChevronRight className="w-6 h-6 text-rose-500 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* Roast Toast for choosing trash */}
              <AnimatePresence>
                {trashRoast && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-6 w-full p-4 rounded-2xl liquid-glass border border-rose-300 text-rose-900 text-center font-semibold shadow-md"
                  >
                    {trashRoast}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ----------------- STAGE 9: UNWRAP FINAL GIFT ----------------- */}
          {stage === 'UNWRAP_FINAL' && (
            <motion.div
              key="stage-unwrap-final"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.45 }}
              className="text-center max-w-lg mx-auto py-10 px-6 sm:px-8 rounded-[32px] liquid-glass-elevated relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-95" />

              <motion.div
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-tr from-amber-400 to-rose-400 flex items-center justify-center text-white shadow-lg"
              >
                <Gift className="w-10 h-10" />
              </motion.div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 font-display leading-tight mb-3">
                Yaudah deh nyerah kan...
              </h2>
              <p className="text-xl sm:text-2xl font-black text-amber-600 font-display uppercase tracking-wide mb-8">
                SEKARANG BUKA HADIAH TERSEBUT! 🎁✨
              </p>

              <motion.button
                whileHover={{ scale: 1.025, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  sounds.playPoof();
                  setStage('HOW_IS_GIFT');
                }}
                className="w-full sm:w-auto min-w-[260px] px-8 py-4 rounded-2xl font-extrabold text-lg bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-[0_12px_24px_rgba(15,23,42,0.18)] cursor-pointer liquid-shimmer"
              >
                Sudah Aku Buka! 🎁
              </motion.button>
            </motion.div>
          )}

          {/* ----------------- STAGE 10: BAGUS ENGGA HADIAH NYA??? ----------------- */}
          {stage === 'HOW_IS_GIFT' && (
            <motion.div
              key="stage-how-is-gift"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.45 }}
              className="w-full max-w-xl mx-auto flex flex-col items-center"
            >
              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider liquid-glass text-emerald-700 border border-emerald-200 mb-3 shadow-sm">
                  <Smile className="w-4 h-4 text-emerald-600" /> Penilaian Terakhir
                </span>
                <h2 className="text-3xl sm:text-5xl font-black text-slate-900 font-display">
                  bagus engga hadiah nya???
                </h2>
                <p className="text-slate-500 text-sm mt-3 font-medium">
                  (Jawab dengan sejujur-jujurnya ya wkwk 😜)
                </p>
              </div>

              {/* All 3 choices */}
              <div className="w-full flex flex-col gap-4">
                {/* a. bagus */}
                <motion.button
                  whileHover={{ scale: 1.018, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleHowIsGift}
                  className="relative overflow-hidden w-full p-5 rounded-2xl liquid-glass border-2 border-emerald-200 hover:border-emerald-500 text-left group cursor-pointer transition-all shadow-[0_8px_20px_rgba(16,185,129,0.06)] liquid-shimmer"
                >
                  <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-85" />
                  <div className="absolute inset-0 bg-stripes-slanted opacity-70 pointer-events-none" />
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center font-display text-lg border border-emerald-200 shadow-sm">
                        a
                      </span>
                      <span className="text-2xl font-black text-slate-900 font-display">
                        bagus 👍
                      </span>
                    </div>
                    <Heart className="w-6 h-6 text-emerald-600 group-hover:scale-115 transition-transform" />
                  </div>
                </motion.button>

                {/* b. bagus */}
                <motion.button
                  whileHover={{ scale: 1.018, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleHowIsGift}
                  className="relative overflow-hidden w-full p-5 rounded-2xl liquid-glass border-2 border-teal-200 hover:border-teal-500 text-left group cursor-pointer transition-all shadow-[0_8px_20px_rgba(20,184,166,0.06)] liquid-shimmer"
                >
                  <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-85" />
                  <div className="absolute inset-0 bg-stripes-slanted opacity-70 pointer-events-none" />
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 font-bold flex items-center justify-center font-display text-lg border border-teal-200 shadow-sm">
                        b
                      </span>
                      <span className="text-2xl font-black text-slate-900 font-display">
                        bagus banget! 😍
                      </span>
                    </div>
                    <Heart className="w-6 h-6 text-teal-600 group-hover:scale-115 transition-transform" />
                  </div>
                </motion.button>

                {/* c. bagus */}
                <motion.button
                  whileHover={{ scale: 1.018, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleHowIsGift}
                  className="relative overflow-hidden w-full p-5 rounded-2xl liquid-glass border-2 border-cyan-200 hover:border-cyan-500 text-left group cursor-pointer transition-all shadow-[0_8px_20px_rgba(6,182,212,0.06)] liquid-shimmer"
                >
                  <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-85" />
                  <div className="absolute inset-0 bg-stripes-slanted opacity-70 pointer-events-none" />
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 font-bold flex items-center justify-center font-display text-lg border border-cyan-200 shadow-sm">
                        c
                      </span>
                      <span className="text-2xl font-black text-slate-900 font-display">
                        bagus parahh! 🔥
                      </span>
                    </div>
                    <Heart className="w-6 h-6 text-cyan-600 group-hover:scale-115 transition-transform" />
                  </div>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ----------------- STAGE 11: GRAND FINALE ----------------- */}
          {stage === 'FINALE' && (
            <motion.div
              key="stage-finale"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45 }}
              className="text-center max-w-2xl mx-auto py-10 px-6 sm:px-10 rounded-[36px] liquid-glass-elevated relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-amber-400 via-rose-400 to-purple-400" />
              
              <div className="relative z-10">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                  className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-tr from-amber-400 via-rose-400 to-purple-500 flex items-center justify-center text-white shadow-lg"
                >
                  <PartyPopper className="w-10 h-10 text-white" />
                </motion.div>

                {/* Special 15th Birthday Badge */}
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass text-amber-800 border border-amber-200 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
                  <Sparkles className="w-4 h-4 text-amber-500 animate-spin" /> Special 15th Birthday
                </span>

                <h1 className="text-3xl sm:text-5xl font-black text-slate-900 font-display leading-tight mb-4">
                  HAPPY BIRTHDAY! 🎉🎂
                </h1>

                {/* Closing text */}
                <div className="my-6 p-6 rounded-2xl liquid-glass border border-white text-slate-700 text-base sm:text-lg leading-relaxed shadow-sm">
                  <p className="font-extrabold text-slate-900 text-lg sm:text-xl font-display mb-2">
                    "itu saja pertunjukan dari webside ini, maaf merepotkan"
                  </p>
                  <p className="text-slate-500 text-sm mt-3 font-medium">
                    Semoga hadiahnya bermanfaat, sehat selalu, makin pintar, dan hari-hari kamu selalu dipenuhi kebahagiaan! 🥳✨
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                  <motion.button
                    whileHover={{ scale: 1.025, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      launchGrandCelebration();
                      sounds.playCelebration();
                    }}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-[0_10px_24px_rgba(15,23,42,0.16)] flex items-center justify-center gap-2 cursor-pointer liquid-shimmer"
                  >
                    <Sparkles className="w-5 h-5 text-amber-300" />
                    <span>Lagi Confetti! 🎊</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.025, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRestart}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold liquid-glass hover:bg-white text-slate-700 border border-slate-200 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 text-slate-500" />
                    <span>Ulangi Dari Awal</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-slate-400 border-t border-slate-200/60 font-medium">
        <span>Birthday Mystery Box Quest • 29-11-2011</span>
      </footer>
    </div>
  );
}
