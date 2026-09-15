// Utility for playing subtle web audio UI sound effects
export const playSoundEffect = (type) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'slider') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'success') {
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.1, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.35);
      });
    } else if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    }
  } catch {
    // Ignore audio permission/context errors
  }
};

export const getGradeBadgeInfo = (percentage) => {
  if (percentage >= 90) {
    return {
      grade: 'A+',
      status: 'Distinction',
      bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/20',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.35)]',
      color: '#10b981'
    };
  }
  if (percentage >= 80) {
    return {
      grade: 'A',
      status: 'Excellent',
      bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-cyan-500/20',
      glow: 'shadow-[0_0_20px_rgba(6,182,212,0.35)]',
      color: '#06b6d4'
    };
  }
  if (percentage >= 70) {
    return {
      grade: 'B+',
      status: 'Very Good',
      bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-indigo-500/20',
      glow: 'shadow-[0_0_20px_rgba(99,102,241,0.35)]',
      color: '#6366f1'
    };
  }
  if (percentage >= 60) {
    return {
      grade: 'B',
      status: 'Good',
      bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-amber-500/20',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.35)]',
      color: '#f59e0b'
    };
  }
  if (percentage >= 50) {
    return {
      grade: 'C',
      status: 'Average',
      bg: 'bg-orange-500/20 text-orange-300 border-orange-500/40 shadow-orange-500/20',
      glow: 'shadow-[0_0_20px_rgba(249,115,22,0.35)]',
      color: '#f97316'
    };
  }
  return {
    grade: 'F',
    status: 'Needs Improvement',
    bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-rose-500/20',
    glow: 'shadow-[0_0_20px_rgba(244,63,94,0.35)]',
    color: '#f43f5e'
  };
};
