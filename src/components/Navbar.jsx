import React from 'react';

export default function Navbar({ activeModal, onOpenModal, evaluationsCount }) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleNavClick = (modalName) => {
    if (activeModal === modalName) {
      onOpenModal(null);
    } else {
      onOpenModal(modalName);
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 w-full px-5 sm:px-8 py-4 sm:py-5 flex justify-between items-center bg-[#350208]/40 backdrop-blur-md border-b border-white/10">
        {/* Logo (left) */}
        <div
          onClick={() => handleNavClick(null)}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <span
            className="text-[21px] sm:text-[26px] tracking-tight text-white group-hover:opacity-80 transition-opacity font-bold"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Scoredude®
          </span>
          <span
            className="text-[25px] sm:text-[30px] text-white leading-none group-hover:rotate-45 transition-transform duration-300"
            style={{ letterSpacing: '-0.02em' }}
          >
            ✳︎
          </span>
        </div>

        {/* Desktop nav links (center, hidden below md) */}
        <div className="hidden md:flex items-center text-[18px] lg:text-[21px] text-white">
          <button
            onClick={() => handleNavClick('dashboard')}
            className={`hover:opacity-60 transition-opacity cursor-pointer ${
              activeModal === 'dashboard' ? 'underline underline-offset-4 font-semibold' : ''
            }`}
          >
            Dashboard
          </button>
          <span>,&nbsp;</span>
          <button
            onClick={() => handleNavClick('scoring')}
            className={`hover:opacity-60 transition-opacity cursor-pointer ${
              activeModal === 'scoring' ? 'underline underline-offset-4 font-semibold' : ''
            }`}
          >
            Score
          </button>
          <span>,&nbsp;</span>
          <button
            onClick={() => handleNavClick('manage')}
            className={`hover:opacity-60 transition-opacity cursor-pointer ${
              activeModal === 'manage' ? 'underline underline-offset-4 font-semibold' : ''
            }`}
          >
            Students & Categories
          </button>
          <span>,&nbsp;</span>
          <button
            onClick={() => handleNavClick('history')}
            className={`hover:opacity-60 transition-opacity cursor-pointer flex items-center gap-1.5 ${
              activeModal === 'history' ? 'underline underline-offset-4 font-semibold' : ''
            }`}
          >
            <span>History</span>
            {evaluationsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-white text-black text-[11px] font-bold">
                {evaluationsCount}
              </span>
            )}
          </button>
        </div>

        {/* Desktop CTA (right, hidden below md) */}
        <button
          onClick={() => handleNavClick('scoring')}
          className="btn-tactile hidden md:inline-flex items-center gap-1.5 justify-center bg-white text-black border border-white/20 rounded-full text-[14px] px-5 py-2 font-semibold hover:bg-black hover:text-white hover:border-white transition-all duration-160 cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]"
        >
          <span className="text-amber-500 text-sm">⚡</span>
          <span>Score Candidate</span>
        </button>

        {/* Mobile hamburger (visible below md) */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          className="md:hidden flex flex-col justify-center items-center gap-[5px] w-8 h-8 z-30 cursor-pointer focus:outline-none"
        >
          <span
            className={`w-6 h-[2px] bg-white transition-all duration-300 transform ${
              mobileMenuOpen ? 'rotate-45 translate-y-[7px]' : ''
            }`}
          />
          <span
            className={`w-6 h-[2px] bg-white transition-all duration-300 ${
              mobileMenuOpen ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <span
            className={`w-6 h-[2px] bg-white transition-all duration-300 transform ${
              mobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''
            }`}
          />
        </button>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-20 bg-gradient-to-b from-[#4d020a]/98 via-[#350106]/98 to-[#1c0003]/98 backdrop-blur-2xl flex flex-col justify-center px-8 gap-6 transition-all duration-300 md:hidden ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button
          onClick={() => handleNavClick('dashboard')}
          className="text-left text-[28px] font-medium text-white hover:opacity-60 transition-opacity"
        >
          1. Dashboard
        </button>
        <button
          onClick={() => handleNavClick('scoring')}
          className="text-left text-[28px] font-medium text-white hover:opacity-60 transition-opacity"
        >
          2. Score Candidate
        </button>
        <button
          onClick={() => handleNavClick('manage')}
          className="text-left text-[28px] font-medium text-white hover:opacity-60 transition-opacity"
        >
          3. Manage Students & Topics
        </button>
        <button
          onClick={() => handleNavClick('history')}
          className="text-left text-[28px] font-medium text-white hover:opacity-60 transition-opacity flex items-center justify-between"
        >
          <span>4. View History</span>
          {evaluationsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-white text-black text-xs font-bold">
              {evaluationsCount} records
            </span>
          )}
        </button>
        <div className="pt-4 border-t border-white/20">
          <button
            onClick={() => handleNavClick(null)}
            className="text-sm text-rose-200/70 hover:text-white"
          >
            ← Close to Hero Video
          </button>
        </div>
      </div>
    </>
  );
}
