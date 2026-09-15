import React, { useState, useEffect } from 'react';
import { useTypewriter } from '../hooks/useTypewriter';
import { CopyIcon } from './Icons';

export default function HeroSection({ onOpenModal }) {
  const { displayed, done } = useTypewriter(
    'Glad you stopped in. Good taste tends to find us. Now, what are we building?',
    38,
    600
  );

  const [buttonsVisible, setButtonsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setButtonsVisible(true);
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative z-[1] w-full h-screen flex flex-col justify-end pb-12 md:justify-center md:pb-0 px-5 sm:px-8 md:px-10 overflow-hidden">
      <div className="max-w-xl relative z-10">
        {/* 1. Blurred intro label */}
        <div
          className="pointer-events-none select-none mb-5 sm:mb-6 text-white font-normal"
          style={{
            fontSize: 'clamp(18px, 4vw, 26px)',
            lineHeight: 1.3,
            filter: 'blur(4px)',
          }}
        >
          Hey there, meet A.R.I.A,
          <br />
          Scoredude's Adaptive Response Interface Agent
        </div>

        {/* 2. Typewriter text */}
        <p
          className="text-white mb-5 sm:mb-6 font-normal min-h-[54px]"
          style={{
            fontSize: 'clamp(18px, 4vw, 26px)',
            lineHeight: 1.35,
          }}
        >
          {displayed}
          {!done && <span className="inline-block w-[2px] h-[1.1em] bg-white align-middle ml-[2px] animate-blink" />}
        </p>

        {/* 3. Action pill buttons (Interactive features integration - Emil Kowalski tactile style) */}
        <div
          className="flex flex-wrap gap-y-2 transition-all duration-300 ease-out"
          style={{
            opacity: buttonsVisible ? 1 : 0,
            transform: buttonsVisible ? 'translateY(0)' : 'translateY(8px)',
          }}
        >
          {/* Action 1: Score a student */}
          <button
            type="button"
            onClick={() => onOpenModal('scoring')}
            className="btn-tactile inline-flex items-center justify-center gap-1.5 bg-white text-black border border-white/20 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.45em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-[#110103] hover:text-white hover:border-white/40 shadow-sm hover:shadow-lg transition-all duration-160 cursor-pointer font-semibold"
          >
            <span className="text-amber-500 text-sm">⚡</span>
            <span>Score a student</span>
          </button>

          {/* Action 2: Dashboard & Stats */}
          <button
            type="button"
            onClick={() => onOpenModal('dashboard')}
            className="btn-tactile inline-flex items-center justify-center gap-1.5 bg-white/90 backdrop-blur-md text-black border border-white/20 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.45em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-[#110103] hover:text-white hover:border-white/40 shadow-sm hover:shadow-lg transition-all duration-160 cursor-pointer font-semibold"
          >
            <span className="text-cyan-400 text-sm">📊</span>
            <span>Dashboard & Stats</span>
          </button>

          {/* Action 3: Manage students & topics */}
          <button
            type="button"
            onClick={() => onOpenModal('manage')}
            className="btn-tactile inline-flex items-center justify-center gap-1.5 bg-white/90 backdrop-blur-md text-black border border-white/20 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.45em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-[#110103] hover:text-white hover:border-white/40 shadow-sm hover:shadow-lg transition-all duration-160 cursor-pointer font-semibold"
          >
            <span className="text-emerald-400 text-sm">👥</span>
            <span>Manage Directory</span>
          </button>

          {/* Action 4: View History & Scorecards */}
          <button
            type="button"
            onClick={() => onOpenModal('history')}
            className="btn-tactile inline-flex items-center justify-center gap-1.5 bg-white/90 backdrop-blur-md text-black border border-white/20 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.45em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-[#110103] hover:text-white hover:border-white/40 shadow-sm hover:shadow-lg transition-all duration-160 cursor-pointer font-semibold"
          >
            <span className="text-rose-400 text-sm">📜</span>
            <span>View History (Records)</span>
          </button>
        </div>
      </div>
    </section>
  );
}
