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
import { QuestProgress } from './components/QuestProgress';
import { Box3DViewer } from './components/Box3DViewer';
import { sounds } from './utils/sound';
import { launchConfetti, launchGrandCelebration } from './utils/confetti';

type Stage = 
  | 'WELCOME' 
  | 'ROULETTE' 
  | 'AGE_QUIZ' 
  | 'GOKILL' 
  | 'OLDER_ROAST' 
  | 'SEE_BOX_QUESTION' 
  | 'OPEN_FIRST_LAYER' 
  | 'GUESS_PAPER' 
  | 'GIVE_UP_CHOICE' 
  | 'UNWRAP_FINAL' 
  | 'HOW_IS_GIFT' 
  | 'FINALE';

export default function App() {
  const [stage, setStage] = useState<Stage>('WELCOME');
  const [welcomeCountdown, setWelcomeCountdown] = useState(5); // 5 detik durasi
  
  // Age quiz state
  const [gokillCountdown, setGokillCountdown] = useState(5); // 5 detik durasi
  const [olderCountdown, setOlderCountdown] = useState(5); // 5 detik durasi
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

  // Auto transition for Welcome (5 seconds duration)
  useEffect(() => {
    if (stage === 'WELCOME') {
      const timer = setInterval(() => {
        setWelcomeCountdown((prev) => {
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

  // Gokill 5 seconds countdown
  useEffect(() => {
    if (stage === 'GOKILL') {
      launchConfetti();
      sounds.playCorrect();
      setGokillCountdown(5);
      const timer = setInterval(() => {
        setGokillCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setStage('OLDER_ROAST');
            return 0;
          }
          sounds.playTick();
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [stage]);

  // Older roast screen: 5 seconds duration
  useEffect(() => {
    if (stage === 'OLDER_ROAST') {
      setOlderCountdown(5);
      const timer = setInterval(() => {
        setOlderCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setStage('SEE_BOX_QUESTION');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [stage]);

  // Age quiz handler - JAWABAN BENAR: 15 (Option B)
  const handleAgeChoice = (choice: 'a' | 'b' | 'c') => {
    if (choice === 'b') {
      setRoastMessage(null);
      setStage('GOKILL');
    } else {
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

    const updated = paperChoices.filter(item => item !== choice);
    setPaperChoices(updated);

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
    setStage('WELCOME');
    setWelcomeCountdown(5);
    setRoastMessage(null);
    setHasRemovedTidak(false);
    setPaperChoices(['sabun', 'skincare', 'kunci']);
    setPaperRoast(null);
    setHasRemovedTrash(false);
    setTrashRoast(null);
  };

  // Determine active step index & name for the minimal top progress indicator
  const getStepInfo = (): { step: number; name: string } => {
    switch (stage) {
      case 'WELCOME':
        return { step: 0, name: 'Selamat Datang' };
      case 'ROULETTE':
        return { step: 1, name: 'Tanggal Lahir' };
      case 'AGE_QUIZ':
      case 'GOKILL':
      case 'OLDER_ROAST':
        return { step: 2, name: 'Tebak Umur' };
      case 'SEE_BOX_QUESTION':
        return { step: 3, name: 'Cek Kotak' };
      case 'OPEN_FIRST_LAYER':
        return { step: 4, name: 'Buka Lapisan 1' };
      case 'GUESS_PAPER':
      case 'GIVE_UP_CHOICE':
        return { step: 5, name: 'Tebak Rahasia' };
      case 'UNWRAP_FINAL':
      case 'HOW_IS_GIFT':
        return { step: 6, name: 'Buka Kado' };
      case 'FINALE':
        return { step: 7, name: 'Selesai' };
      default:
        return { step: 0, name: 'Petualangan' };
    }
  };

  const { step: currentStepIndex, name: currentStepName } = getStepInfo();

  return (
    <div className="min-h-screen relative flex flex-col justify-between overflow-x-hidden bg-[#fafafa] text-slate-900 selection:bg-amber-200 selection:text-slate-900 pt-16">
      {/* Minimal Top Step Indicator */}
      <QuestProgress currentStep={currentStepIndex} stepName={currentStepName} />

      {/* Clean Background Grid */}
      <div className="fixed inset-0 pointer-events-none bg-dot-grid opacity-50 z-0" />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 max-w-3xl mx-auto w-full">
        <AnimatePresence mode="wait">

          {/* ----------------- STAGE 0: WELCOME (Halo Peliii, selamat datang) ----------------- */}
          {stage === 'WELCOME' && (
            <motion.div
              key="stage-welcome"
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="text-center max-w-lg mx-auto py-12 px-6 sm:px-10 rounded-[32px] bg-white border border-slate-200/90 shadow-[0_20px_50px_rgba(0,0,0,0.04)] relative"
            >
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-100 text-slate-700 font-mono text-[10px] font-bold uppercase tracking-[0.2em] mb-6 border border-slate-200/80">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Birthday Quest
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mb-3 font-display">
                Halo Peliii, selamat datang
              </h1>
              <p className="text-slate-500 text-base sm:text-lg leading-relaxed mb-8 font-medium">
                (ikuti arahan nya yahh😊😊)
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.02, y: -1.5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStage('ROULETTE')}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl font-extrabold bg-slate-900 text-white hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group cursor-pointer shadow-[0_10px_25px_rgba(15,23,42,0.15)] text-sm tracking-wide"
                >
                  <span>Mulai Sekarang ({welcomeCountdown}s)</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-amber-300" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ----------------- STAGE 1: ROULETTE (29-11-2011) ----------------- */}
          {stage === 'ROULETTE' && (
            <motion.div
              key="stage-roulette"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
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
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className={`w-full max-w-xl mx-auto flex flex-col items-center ${
                roastShake ? 'animate-shake' : ''
              }`}
            >
              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-[0.2em] bg-slate-100 text-slate-700 border border-slate-200 mb-3 shadow-xs">
                  <PartyPopper className="w-3.5 h-3.5 text-amber-500" /> Pertanyaan Spesial
                </span>
                <h2 className="text-3xl sm:text-5xl font-black text-slate-900 font-display leading-tight">
                  jadi berapakah umur kamu sekarangg🥳🥳?!?
                </h2>
                <p className="text-slate-500 text-sm mt-3 font-medium">
                  Pilih jawaban yang paling tepat sesuai tanggal 29-11-2011 tadi:
                </p>
              </div>

              {/* Slanted Striped Rectangular Options: Clean Bespoke Cards */}
              <div className="w-full flex flex-col gap-3.5">
                {/* Option A (14) - Wrong */}
                <motion.button
                  whileHover={{ scale: 1.015, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08, duration: 0.4 }}
                  onClick={() => handleAgeChoice('a')}
                  className="relative overflow-hidden w-full p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 hover:border-slate-400 text-left group cursor-pointer transition-all shadow-[0_4px_16px_rgba(0,0,0,0.03)]"
                >
                  <div className="absolute inset-0 bg-stripes-slanted opacity-70 pointer-events-none group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/90 flex items-center justify-center font-mono font-bold text-slate-700 text-sm group-hover:bg-slate-900 group-hover:text-white transition-colors">
                        a
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-slate-900 font-display tracking-tight">
                        Kayaknya 14
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 group-hover:text-slate-800 transition-all" />
                  </div>
                </motion.button>

                {/* Option B (15) - CORRECT! */}
                <motion.button
                  whileHover={{ scale: 1.015, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.16, duration: 0.4 }}
                  onClick={() => handleAgeChoice('b')}
                  className="relative overflow-hidden w-full p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 hover:border-slate-400 text-left group cursor-pointer transition-all shadow-[0_4px_16px_rgba(0,0,0,0.03)]"
                >
                  <div className="absolute inset-0 bg-stripes-slanted opacity-70 pointer-events-none group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/90 flex items-center justify-center font-mono font-bold text-slate-700 text-sm group-hover:bg-slate-900 group-hover:text-white transition-colors">
                        b
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-slate-900 font-display tracking-tight">
                        mungkin 15
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 group-hover:text-slate-800 transition-all" />
                  </div>
                </motion.button>

                {/* Option C (16) - Wrong */}
                <motion.button
                  whileHover={{ scale: 1.015, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.24, duration: 0.4 }}
                  onClick={() => handleAgeChoice('c')}
                  className="relative overflow-hidden w-full p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 hover:border-slate-400 text-left group cursor-pointer transition-all shadow-[0_4px_16px_rgba(0,0,0,0.03)]"
                >
                  <div className="absolute inset-0 bg-stripes-slanted opacity-70 pointer-events-none group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/90 flex items-center justify-center font-mono font-bold text-slate-700 text-sm group-hover:bg-slate-900 group-hover:text-white transition-colors">
                        c
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-slate-900 font-display tracking-tight">
                        ohh 16!!!
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 group-hover:text-slate-800 transition-all" />
                  </div>
                </motion.button>
              </div>

              {/* Red Mocking Roast */}
              <AnimatePresence>
                {roastMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.3 }}
                    className="mt-6 w-full p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 text-center shadow-sm relative overflow-hidden"
                  >
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="text-2xl mb-1">😝</div>
                      <p className="text-base sm:text-lg font-black tracking-wide font-display text-rose-950">
                        {roastMessage}
                      </p>
                      <span className="text-xs text-rose-700 font-medium mt-1">
                        Coba tebak lagi yang bener ya!
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ----------------- STAGE 3: GOKILL + 5s COUNTDOWN ----------------- */}
          {stage === 'GOKILL' && (
            <motion.div
              key="stage-gokill"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="text-center py-12 px-6 sm:px-10 max-w-lg mx-auto rounded-[32px] bg-white border border-slate-200/90 shadow-[0_20px_50px_rgba(0,0,0,0.06)] relative overflow-hidden"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 mb-6 shadow-xs">
                <Sparkles className="w-8 h-8" />
              </div>

              <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-slate-900 font-display">
                GOKILL!!!
              </h1>

              <p className="text-xl sm:text-2xl font-black text-emerald-700 mt-3 font-display">
                Tepat banget! Umur kamu 15 tahun! 🎯🔥
              </p>

              {/* 5 Seconds Countdown Display */}
              <div className="mt-8 flex flex-col items-center justify-center">
                <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-slate-100 border border-slate-200/80 text-slate-700 text-sm font-semibold shadow-xs">
                  <span>Melanjutkan dalam</span>
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-mono text-xs font-bold flex items-center justify-center">
                    {gokillCountdown}
                  </span>
                  <span>detik...</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* ----------------- STAGE 4: WKWKKW SELAMAT YA SEKARANG LU LEBIH TUA (5 Detik) ----------------- */}
          {stage === 'OLDER_ROAST' && (
            <motion.div
              key="stage-older-roast"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45 }}
              className="text-center max-w-lg mx-auto py-12 px-6 sm:px-8 rounded-[32px] bg-white border border-slate-200/90 shadow-[0_20px_50px_rgba(0,0,0,0.04)]"
            >
              <div className="text-5xl sm:text-6xl mb-6 inline-block">
                🫵😂🫵😂
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-display leading-snug">
                WKWKKW selamat ya sekarang lu lebih tua dari gw🫵😂🫵😂
              </h2>
              <p className="text-slate-400 text-sm mt-4 font-mono">
                Membuka misi kotak dalam {olderCountdown} detik...
              </p>

              {/* Progress track for the 5-second duration */}
              <div className="w-48 h-1.5 bg-slate-100 rounded-full mx-auto mt-6 overflow-hidden">
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 5, ease: 'linear' }}
                  className="h-full bg-slate-900 rounded-full"
                />
              </div>
            </motion.div>
          )}

          {/* ----------------- STAGE 5: SEE BOX QUESTION (WITH 3D BOX MODEL) ----------------- */}
          {stage === 'SEE_BOX_QUESTION' && (
            <motion.div
              key="stage-see-box"
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45 }}
              className="w-full max-w-xl mx-auto flex flex-col items-center"
            >
              {/* Box Quest Tag */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-[0.2em] bg-slate-100 text-slate-700 border border-slate-200 mb-3 shadow-xs">
                <Package className="w-3.5 h-3.5 text-slate-500" /> Misi Kotak Rahasia
              </div>

              {/* Text: i hope kamu belum buka kotak nya 🥀🥀🥀 */}
              <p className="text-slate-600 text-base sm:text-lg font-bold mb-4 italic flex items-center justify-center gap-1.5">
                <span>i hope kamu belum buka kotak nya</span>
                <span className="text-xl">🥀🥀🥀</span>
              </p>

              {/* 3D Modeling Box Illustration - CLOSED KOTAK BOX PERSEGI PANJANG */}
              <Box3DViewer state="CLOSED" />

              {/* Main question Card */}
              <div className="rounded-[32px] p-6 sm:p-8 text-center w-full mb-6 bg-white border border-slate-200/90 shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display leading-snug">
                  apakah kamu sudah melihat kotak yang di lapisi itu?
                </h2>
                <p className="text-amber-700 text-sm font-bold mt-2">
                  (tebak, jangan di buka dulu!)
                </p>

                {/* Choices: a. iya, b. tidak */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-8">
                  {/* Option: iya */}
                  <motion.button
                    whileHover={{ scale: 1.015, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleBoxAnswer('iya')}
                    className={`relative overflow-hidden p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-800 text-left font-display group cursor-pointer transition-all shadow-xs ${
                      hasRemovedTidak ? 'sm:col-span-2' : ''
                    }`}
                  >
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-xl bg-slate-100 font-mono text-xs font-bold text-slate-700 flex items-center justify-center border border-slate-200">
                          a
                        </span>
                        <span className="text-lg font-black text-slate-900">
                          iya, udah liat!
                        </span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 group-hover:text-slate-800 transition-all" />
                    </div>
                  </motion.button>

                  {/* Option: tidak */}
                  <AnimatePresence>
                    {!hasRemovedTidak && (
                      <motion.button
                        key="btn-tidak"
                        initial={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.25 } }}
                        whileHover={{ scale: 1.015, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleBoxAnswer('tidak')}
                        className="relative overflow-hidden p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-800 text-left font-display group cursor-pointer transition-all shadow-xs"
                      >
                        <div className="relative z-10 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="w-9 h-9 rounded-xl bg-slate-100 font-mono text-xs font-bold text-slate-700 flex items-center justify-center border border-slate-200">
                              b
                            </span>
                            <span className="text-lg font-black text-slate-900">
                              tidak
                            </span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 group-hover:text-slate-800 transition-all" />
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
                      className="mt-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm font-bold"
                    >
                      {boxJokeToast}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* ----------------- STAGE 6: OPEN FIRST LAYER (WITH 3D BOX MODEL) ----------------- */}
          {stage === 'OPEN_FIRST_LAYER' && (
            <motion.div
              key="stage-open-first-layer"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.45 }}
              className="w-full max-w-xl mx-auto flex flex-col items-center"
            >
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-[0.2em] bg-slate-100 text-slate-700 border border-slate-200 mb-3 shadow-xs">
                  <Flame className="w-3.5 h-3.5 text-amber-500" /> Tantangan Waktu 1 Menit
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-display leading-snug">
                  oke sekarang <span className="underline decoration-slate-900 decoration-2 underline-offset-4">BUKA LAPISAN PERTAMA KOTAK TERSEBUT</span>!
                </h2>
                <div className="mt-3 p-4 rounded-2xl bg-white border border-slate-200/80 text-slate-600 text-sm font-medium shadow-xs">
                  saya kasih kamu waktu 1 menit, bila tidak terbuka maka kembalikan ke pemberi nya 🫢🫢, <span className="text-slate-900 font-bold">bercanda!!!</span>
                </div>
              </div>

              {/* 3D Modeling Box Illustration - LID OPEN REVEALING LONG PROTECTIVE PAPER */}
              <Box3DViewer state="LID_OPEN" />

              {/* 1 Minute Countdown Timer Card */}
              <div className="w-full p-6 sm:p-8 rounded-[32px] bg-white border border-slate-200/90 shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
                <CountdownTimer onSuccess={() => setStage('GUESS_PAPER')} />
              </div>
            </motion.div>
          )}

          {/* ----------------- STAGE 7: GUESS WHAT IS BEHIND THE PAPER (WITH 3D BOX MODEL) ----------------- */}
          {stage === 'GUESS_PAPER' && (
            <motion.div
              key="stage-guess-paper"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.45 }}
              className="w-full max-w-xl mx-auto flex flex-col items-center"
            >
              <div className="text-center mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-[0.2em] bg-rose-50 text-rose-700 border border-rose-200 mb-2 shadow-xs">
                  <ShieldAlert className="w-3.5 h-3.5" /> Jangan Buka Dulu Kotak Nya!
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-slate-900 font-display leading-tight">
                  bisa kamu lihat? apa yang ada di balik kertas tersebut 🤔
                </h2>
                <p className="text-rose-600 font-bold text-sm mt-1">
                  (JANGAN DI BUKA DULU KOTAK NYA)
                </p>
              </div>

              {/* 3D Modeling Box Illustration - LONG PAPER WRAP AROUND SMALL SOAP-SIZED BOX */}
              <Box3DViewer state="PAPER_PEEK" />

              {/* Choices: sabun, skincare, kunci */}
              <div className="w-full flex flex-col gap-3">
                <AnimatePresence>
                  {paperChoices.includes('sabun') && (
                    <motion.button
                      key="paper-sabun"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.88, transition: { duration: 0.25 } }}
                      whileHover={{ scale: 1.015, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePaperGuess('sabun')}
                      className="relative overflow-hidden w-full p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-800 text-left group cursor-pointer transition-all shadow-xs"
                    >
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="w-10 h-10 rounded-xl bg-slate-100 font-mono text-xs font-bold text-slate-700 flex items-center justify-center border border-slate-200">
                            a
                          </span>
                          <span className="text-xl font-black text-slate-900 font-display">
                            sabun 🧼
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 font-medium group-hover:text-slate-800 transition-colors">
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
                      whileHover={{ scale: 1.015, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePaperGuess('skincare')}
                      className="relative overflow-hidden w-full p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-800 text-left group cursor-pointer transition-all shadow-xs"
                    >
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="w-10 h-10 rounded-xl bg-slate-100 font-mono text-xs font-bold text-slate-700 flex items-center justify-center border border-slate-200">
                            b
                          </span>
                          <span className="text-xl font-black text-slate-900 font-display">
                            skincare 🧴
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 font-medium group-hover:text-slate-800 transition-colors">
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
                      whileHover={{ scale: 1.015, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePaperGuess('kunci')}
                      className="relative overflow-hidden w-full p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-800 text-left group cursor-pointer transition-all shadow-xs"
                    >
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="w-10 h-10 rounded-xl bg-slate-100 font-mono text-xs font-bold text-slate-700 flex items-center justify-center border border-slate-200">
                            c
                          </span>
                          <span className="text-xl font-black text-slate-900 font-display">
                            kunci 🔑
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 font-medium group-hover:text-slate-800 transition-colors">
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
                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.3 }}
                    className="mt-6 w-full p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 text-center shadow-xs"
                  >
                    <p className="text-base sm:text-lg font-black tracking-wide font-display">
                      {paperRoast}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ----------------- STAGE 8: GIVE UP CHOICE (WITH 3D BOX MODEL) ----------------- */}
          {stage === 'GIVE_UP_CHOICE' && (
            <motion.div
              key="stage-give-up"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.45 }}
              className="w-full max-w-xl mx-auto flex flex-col items-center"
            >
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-[0.2em] bg-amber-50 text-amber-800 border border-amber-200 mb-2 shadow-xs">
                  <AlertCircle className="w-3.5 h-3.5" /> Tebakan Habis!
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-display">
                  Semua tebakan kamu salah total! 😂
                </h2>
                <p className="text-slate-500 text-sm mt-2 font-medium">
                  Sekarang tentukan pilihan hidup kamu:
                </p>
              </div>

              {/* 3D Modeling Box Illustration - PAPER PEEK */}
              <Box3DViewer state="PAPER_PEEK" />

              <div className="w-full flex flex-col gap-3.5">
                {/* Option: Menyerah */}
                <motion.button
                  whileHover={{ scale: 1.015, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleGiveUpChoice('surrender')}
                  className="relative overflow-hidden w-full p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 hover:border-slate-800 text-left group cursor-pointer transition-all shadow-xs"
                >
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="w-10 h-10 rounded-xl bg-slate-100 font-mono text-xs font-bold text-slate-700 flex items-center justify-center border border-slate-200">
                        a
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-slate-900 font-display">
                        menyerah 🏳️
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 group-hover:text-slate-800 transition-all" />
                  </div>
                </motion.button>

                {/* Option: Buang Hadiah Nya */}
                <AnimatePresence>
                  {!hasRemovedTrash && (
                    <motion.button
                      key="btn-trash"
                      exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.25 } }}
                      whileHover={{ scale: 1.015, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleGiveUpChoice('trash')}
                      className="relative overflow-hidden w-full p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 hover:border-slate-800 text-left group cursor-pointer transition-all shadow-xs"
                    >
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="w-10 h-10 rounded-xl bg-slate-100 font-mono text-xs font-bold text-slate-700 flex items-center justify-center border border-slate-200">
                            b
                          </span>
                          <span className="text-xl sm:text-2xl font-black text-slate-900 font-display">
                            buang hadiah nya 🗑️
                          </span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 group-hover:text-slate-800 transition-all" />
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
                    className="mt-6 w-full p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-center font-semibold shadow-xs"
                  >
                    {trashRoast}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ----------------- STAGE 9: UNWRAP FINAL GIFT (WITH 3D BOX MODEL) ----------------- */}
          {stage === 'UNWRAP_FINAL' && (
            <motion.div
              key="stage-unwrap-final"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.45 }}
              className="text-center max-w-lg mx-auto py-10 px-6 sm:px-10 rounded-[32px] bg-white border border-slate-200/90 shadow-[0_20px_50px_rgba(0,0,0,0.04)]"
            >
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-display leading-tight mb-2">
                Yaudah deh nyerah kan...
              </h2>
              <p className="text-xl sm:text-2xl font-black text-slate-800 font-display uppercase tracking-wide mb-6">
                SEKARANG BUKA HADIAH TERSEBUT! 🎁✨
              </p>

              {/* 3D Modeling Box Illustration - FINAL UNWRAPPED SMALL BOX OPENING */}
              <Box3DViewer state="FINAL_UNWRAPPED" />

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  sounds.playPoof();
                  setStage('HOW_IS_GIFT');
                }}
                className="w-full sm:w-auto min-w-[260px] px-8 py-4 rounded-2xl font-extrabold text-base bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-[0_12px_24px_rgba(15,23,42,0.15)] cursor-pointer"
              >
                Sudah Aku Buka! 🎁
              </motion.button>
            </motion.div>
          )}

          {/* ----------------- STAGE 10: BAGUS ENGGA HADIAH NYA??? (WITH 3D BOX MODEL) ----------------- */}
          {stage === 'HOW_IS_GIFT' && (
            <motion.div
              key="stage-how-is-gift"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.45 }}
              className="w-full max-w-xl mx-auto flex flex-col items-center"
            >
              <div className="text-center mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-[0.2em] bg-slate-100 text-slate-700 border border-slate-200 mb-3 shadow-xs">
                  <Smile className="w-3.5 h-3.5 text-emerald-600" /> Penilaian Terakhir
                </span>
                <h2 className="text-3xl sm:text-5xl font-black text-slate-900 font-display">
                  bagus engga hadiah nya???
                </h2>
                <p className="text-slate-500 text-sm mt-2 font-medium">
                  (Jawab dengan sejujur-jujurnya ya wkwk 😜)
                </p>
              </div>

              {/* 3D Modeling Box Illustration - FULLY UNWRAPPED RADIATING PRIZE */}
              <Box3DViewer state="FINAL_UNWRAPPED" />

              {/* All 3 choices */}
              <div className="w-full flex flex-col gap-3.5">
                {/* a. bagus */}
                <motion.button
                  whileHover={{ scale: 1.015, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleHowIsGift}
                  className="relative overflow-hidden w-full p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-800 text-left group cursor-pointer transition-all shadow-xs"
                >
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="w-10 h-10 rounded-xl bg-slate-100 font-mono text-xs font-bold text-slate-700 flex items-center justify-center border border-slate-200">
                        a
                      </span>
                      <span className="text-2xl font-black text-slate-900 font-display">
                        bagus 👍
                      </span>
                    </div>
                    <Heart className="w-5 h-5 text-rose-500 group-hover:scale-115 transition-transform" />
                  </div>
                </motion.button>

                {/* b. bagus */}
                <motion.button
                  whileHover={{ scale: 1.015, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleHowIsGift}
                  className="relative overflow-hidden w-full p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-800 text-left group cursor-pointer transition-all shadow-xs"
                >
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="w-10 h-10 rounded-xl bg-slate-100 font-mono text-xs font-bold text-slate-700 flex items-center justify-center border border-slate-200">
                        b
                      </span>
                      <span className="text-2xl font-black text-slate-900 font-display">
                        bagus banget! 😍
                      </span>
                    </div>
                    <Heart className="w-5 h-5 text-rose-500 group-hover:scale-115 transition-transform" />
                  </div>
                </motion.button>

                {/* c. bagus */}
                <motion.button
                  whileHover={{ scale: 1.015, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleHowIsGift}
                  className="relative overflow-hidden w-full p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-800 text-left group cursor-pointer transition-all shadow-xs"
                >
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="w-10 h-10 rounded-xl bg-slate-100 font-mono text-xs font-bold text-slate-700 flex items-center justify-center border border-slate-200">
                        c
                      </span>
                      <span className="text-2xl font-black text-slate-900 font-display">
                        bagus parahh! 🔥
                      </span>
                    </div>
                    <Heart className="w-5 h-5 text-rose-500 group-hover:scale-115 transition-transform" />
                  </div>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ----------------- STAGE 11: GRAND FINALE ----------------- */}
          {stage === 'FINALE' && (
            <motion.div
              key="stage-finale"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45 }}
              className="text-center max-w-2xl mx-auto py-10 px-6 sm:px-10 rounded-[36px] bg-white border border-slate-200 shadow-[0_25px_60px_rgba(0,0,0,0.06)] relative overflow-hidden"
            >
              <div className="relative z-10">
                {/* 3D Modeling Box Illustration - CELEBRATING */}
                <Box3DViewer state="CELEBRATING" className="max-w-md mx-auto" />

                {/* Special 15th Birthday Badge */}
                <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200 font-mono text-[10px] font-bold uppercase tracking-[0.2em] mb-4 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Special 15th Birthday
                </span>

                <h1 className="text-3xl sm:text-5xl font-black text-slate-900 font-display leading-tight mb-4">
                  HAPPY BIRTHDAY, PELIII! 🎉🎂
                </h1>

                {/* Closing text */}
                <div className="my-6 p-6 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-700 text-base sm:text-lg leading-relaxed shadow-xs">
                  <p className="font-extrabold text-slate-900 text-lg sm:text-xl font-display mb-2">
                    "itu saja pertunjukan dari webside ini, maaf merepotkan"
                  </p>
                  <p className="text-slate-500 text-sm mt-3 font-medium">
                    Semoga hadiahnya bermanfaat, sehat selalu, makin pintar, dan hari-hari kamu selalu dipenuhi kebahagiaan! 🥳✨
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mt-8">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      launchGrandCelebration();
                      sounds.playCelebration();
                    }}
                    className="w-full sm:w-auto px-7 py-3.5 rounded-2xl font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-[0_10px_24px_rgba(15,23,42,0.16)] flex items-center justify-center gap-2 cursor-pointer text-sm"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Lagi Confetti! 🎊</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRestart}
                    className="w-full sm:w-auto px-7 py-3.5 rounded-2xl font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
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
      <footer className="relative z-10 py-5 text-center text-xs text-slate-400 font-mono border-t border-slate-100">
        <span>Birthday Mystery Box Quest • 29-11-2011 • Peliii</span>
      </footer>
    </div>
  );
}
