import React, { useState, useEffect } from 'react';
import BackgroundVideo from './components/BackgroundVideo';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';

import DashboardModal from './components/DashboardModal';
import ScoringModal from './components/ScoringModal';
import ManageTab from './components/ManageTab';
import HistoryTab from './components/HistoryTab';
import ScorecardModal from './components/ScorecardModal';
import { playSoundEffect } from './utils/sound';

export default function App() {
  const [activeModal, setActiveModal] = useState(null); // 'dashboard' | 'scoring' | 'manage' | 'history' | null
  const [students, setStudents] = useState([]);
  const [topics, setTopics] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedStudentForEval, setSelectedStudentForEval] = useState(null);
  const [viewingScorecardModal, setViewingScorecardModal] = useState(null);

  const fetchAllData = async () => {
    try {
      const [studentsRes, topicsRes, evalsRes, statsRes] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/topics'),
        fetch('/api/evaluations'),
        fetch('/api/analytics/stats')
      ]);

      const [sData, tData, eData, stData] = await Promise.all([
        studentsRes.json(),
        topicsRes.json(),
        evalsRes.json(),
        statsRes.json()
      ]);

      if (sData.success) setStudents(sData.data || []);
      if (tData.success) setTopics(tData.data || []);
      if (eData.success) setEvaluations(eData.data || []);
      if (stData.success) setStats(stData.data || null);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleOpenModal = (modalName) => {
    setActiveModal(modalName);
    playSoundEffect('click');
  };

  const handleSelectStudentForScore = (student) => {
    setSelectedStudentForEval(student);
    setActiveModal('scoring');
    playSoundEffect('click');
  };

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black text-white selection:bg-white selection:text-black">
      {/* Dynamic Scrubbing Video */}
      <BackgroundVideo />

      {/* Main NavBar integration */}
      <Navbar
        activeModal={activeModal}
        onOpenModal={handleOpenModal}
        evaluationsCount={evaluations.length}
      />

      {/* Mainframe Hero Integration */}
      {/* Hide hero interactions via pointer-events-none if a modal is open to prevent double clicks */}
      <div className={`w-full h-full transition-opacity duration-300 ${activeModal ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <HeroSection onOpenModal={handleOpenModal} />
      </div>

      {/* Modals integrated into the Mainframe aesthetic */}
      <DashboardModal
        isOpen={activeModal === 'dashboard'}
        onClose={() => setActiveModal(null)}
        stats={stats}
        evaluations={evaluations}
        students={students}
        topics={topics}
        onOpenScore={() => handleOpenModal('scoring')}
        onOpenManage={() => handleOpenModal('manage')}
        onOpenHistory={() => handleOpenModal('history')}
        onViewScorecard={(record) => {
          setActiveModal(null);
          setViewingScorecardModal(record);
        }}
      />

      <ScoringModal
        isOpen={activeModal === 'scoring'}
        onClose={() => setActiveModal(null)}
        students={students}
        topics={topics}
        preselectedStudent={selectedStudentForEval}
        onEvaluationSaved={fetchAllData}
        onOpenManage={() => handleOpenModal('manage')}
        onViewScorecard={(record) => {
          setActiveModal(null);
          setViewingScorecardModal(record);
        }}
      />

      {/* Wrapping ManageTab inside a sleek left glass panel matching the photo theme */}
      {activeModal === 'manage' && (
        <div
          onClick={() => setActiveModal(null)}
          className="fixed inset-0 z-30 flex justify-start pt-20 pb-4 px-3 sm:px-6 lg:px-8 overflow-hidden animate-fadeIn"
        >
          {/* Soft left crimson gradient backdrop so puppet character remains completely visible on the right */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#320107]/90 via-[#45020c]/50 to-transparent pointer-events-none" />

          <div
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full lg:w-[62%] xl:w-[58%] h-full crimson-panel-container rounded-3xl p-5 sm:p-7 shadow-2xl text-white overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/15">
              <div className="flex items-center gap-2">
                <span className="text-xl">👥</span>
                <h2 className="text-xl font-bold tracking-tight text-white">Scoredude Directory & Categories</h2>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                title="Close to home"
                className="btn-tactile w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-rose-100 hover:text-white transition-colors cursor-pointer text-sm font-bold border border-white/10"
              >
                ✕
              </button>
            </div>
            <ManageTab
              students={students}
              topics={topics}
              onRefreshData={fetchAllData}
              onSelectStudentForScore={(s) => {
                setActiveModal(null);
                handleSelectStudentForScore(s);
              }}
            />
          </div>
        </div>
      )}

      {/* Wrapping HistoryTab inside left glass panel matching the photo theme */}
      {activeModal === 'history' && (
        <div
          onClick={() => setActiveModal(null)}
          className="fixed inset-0 z-30 flex justify-start pt-20 pb-4 px-3 sm:px-6 lg:px-8 overflow-hidden animate-fadeIn"
        >
          {/* Soft left crimson gradient backdrop so puppet character remains completely visible on the right */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#320107]/90 via-[#45020c]/50 to-transparent pointer-events-none" />

          <div
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full lg:w-[62%] xl:w-[58%] h-full crimson-panel-container rounded-3xl p-5 sm:p-7 shadow-2xl text-white overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/15">
              <div className="flex items-center gap-2">
                <span className="text-xl">📜</span>
                <h2 className="text-xl font-bold tracking-tight text-white">Scoredude Evaluation History</h2>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                title="Close to home"
                className="btn-tactile w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-rose-100 hover:text-white transition-colors cursor-pointer text-sm font-bold border border-white/10"
              >
                ✕
              </button>
            </div>
            <HistoryTab
              evaluations={evaluations}
              onRefreshRecords={fetchAllData}
              onSelectForScore={(s) => {
                setActiveModal(null);
                handleSelectStudentForScore(s);
              }}
            />
          </div>
        </div>
      )}

      {/* Scorecard Modal */}
      {viewingScorecardModal && (
        <ScorecardModal
          evaluation={viewingScorecardModal}
          onClose={() => setViewingScorecardModal(null)}
        />
      )}
    </main>
  );
}
