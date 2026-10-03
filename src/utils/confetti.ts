import confetti from 'canvas-confetti';

export const launchConfetti = () => {
  // Center burst
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#fbbf24'],
  });
};

export const launchGrandCelebration = () => {
  const duration = 3.5 * 1000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#f43f5e', '#fbbf24', '#34d399', '#a855f7'],
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#f43f5e', '#fbbf24', '#34d399', '#a855f7'],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  frame();
};
