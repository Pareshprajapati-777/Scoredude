import React from 'react';
import { getGradeBadgeInfo } from '../utils/sound';

export default function DashboardModal({
  isOpen,
  onClose,
  stats,
  evaluations,
  students,
  topics,
  onOpenScore,
  onOpenManage,
  onOpenHistory,
  onViewScorecard
}) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-30 flex justify-start pt-20 pb-4 px-3 sm:px-6 lg:px-8 overflow-hidden animate-fadeIn"
    >
      {/* Soft left crimson gradient backdrop so puppet character remains completely visible on the right */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#320107]/90 via-[#45020c]/50 to-transparent pointer-events-none" />

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full lg:w-[62%] xl:w-[58%] h-full crimson-panel-container rounded-3xl p-5 sm:p-7 shadow-2xl text-white overflow-y-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/15">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">📊</span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Scoredude Performance Hub
              </h2>
            </div>
            <p className="text-xs text-rose-200/70">
              Live statistics, class benchmark telemetry, and candidate leaderboard from <code className="text-rose-300 font-mono">score.db</code>.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => { onClose(); onOpenScore(); }}
              className="btn-pill btn-tactile px-4 py-2 rounded-full bg-white text-black font-bold text-xs hover:bg-rose-50 border border-white/30 transition-all cursor-pointer shadow-lg"
            >
              ⚡ Score a Student
            </button>
            <button
              onClick={onClose}
              title="Close to home"
              className="btn-tactile w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-rose-100 hover:text-white transition-colors cursor-pointer text-sm font-bold border border-white/10"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 glass-card rounded-2xl border border-white/15 hover:border-white/30 transition-all">
            <span className="text-[10px] font-bold text-rose-200/70 uppercase tracking-wider block mb-1">
              Total Candidates
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white">{students?.length || 0}</div>
            <span className="text-[10px] text-rose-300 font-medium">Registered in Directory</span>
          </div>

          <div className="p-5 glass-card rounded-2xl border border-white/15 hover:border-white/30 transition-all">
            <span className="text-[11px] font-bold text-rose-200/70 uppercase tracking-wider block mb-1">
              Evaluations Done
            </span>
            <div className="text-3xl font-black text-white">{evaluations?.length || 0}</div>
            <span className="text-[11px] text-rose-300 font-medium">Committed in score.db</span>
          </div>

          <div className="p-5 glass-card rounded-2xl border border-white/15 hover:border-white/30 transition-all">
            <span className="text-[11px] font-bold text-rose-200/70 uppercase tracking-wider block mb-1">
              Class Average
            </span>
            <div className="text-3xl font-black text-emerald-400">{stats?.avgPercentage || 0}%</div>
            <span className="text-[11px] text-rose-200/60">High: {stats?.highestPercentage || 0}% • Low: {stats?.lowestPercentage || 0}%</span>
          </div>

          <div className="p-5 glass-card rounded-2xl border border-white/15 hover:border-white/30 transition-all">
            <span className="text-[11px] font-bold text-rose-200/70 uppercase tracking-wider block mb-1">
              Scoring Pillars
            </span>
            <div className="text-3xl font-black text-white">{topics?.length || 0}</div>
            <span className="text-[11px] text-amber-300 font-medium">Active Categories (Max 10)</span>
          </div>
        </div>

        {/* Leaderboard & Category Benchmarks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Candidates Leaderboard */}
          <div className="p-6 glass-card rounded-2xl border border-white/15 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold uppercase tracking-wider text-rose-100">
                🏆 Top Candidates Leaderboard
              </h3>
              <button
                onClick={() => { onClose(); onOpenHistory(); }}
                className="text-xs text-amber-300 hover:text-white underline cursor-pointer"
              >
                View All History
              </button>
            </div>

            <div className="space-y-2.5">
              {stats?.topPerformers?.length === 0 ? (
                <p className="text-xs text-rose-200/60 py-6 text-center">No evaluations yet.</p>
              ) : (
                stats?.topPerformers?.slice(0, 5).map((cand, rank) => {
                  const badge = getGradeBadgeInfo(cand.avg_score);
                  return (
                    <div
                      key={cand.student_id}
                      className="p-3 bg-[#1e0105]/75 border border-white/10 rounded-xl flex items-center justify-between gap-3 hover:border-rose-400/30 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-5 text-center font-bold text-xs text-rose-300/80">
                          {rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : `#${rank + 1}`}
                        </span>
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs text-white shadow-md"
                          style={{ backgroundColor: cand.avatar_color || '#38bdf8' }}
                        >
                          {cand.student_name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{cand.student_name}</div>
                          <div className="text-[10px] text-rose-200/60 font-mono">{cand.roll_no} • {cand.batch}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="text-right">
                          <div className="text-xs font-black text-emerald-400">{cand.avg_score}%</div>
                          <div className="text-[9px] text-rose-300/60">{cand.evaluations_count} eval(s)</div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-white/15 text-white font-bold text-[10px] border border-white/10">
                          {badge.grade}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Topic Performance Benchmark */}
          <div className="p-6 glass-card rounded-2xl border border-white/15 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold uppercase tracking-wider text-rose-100">
                📈 Category Benchmarks (Out of 10)
              </h3>
              <button
                onClick={() => { onClose(); onOpenManage(); }}
                className="text-xs text-rose-300 hover:text-white underline cursor-pointer"
              >
                Manage Categories
              </button>
            </div>

            <div className="space-y-3.5">
              {stats?.topicPerformance?.length === 0 ? (
                <p className="text-xs text-rose-200/60 py-6 text-center">No category scores yet.</p>
              ) : (
                stats?.topicPerformance?.map((tp, idx) => {
                  const pct = tp.avg_percentage || ((tp.avg_score / 10) * 100);
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white">{tp.topic_name}</span>
                        <span className="text-rose-100 font-mono font-bold">
                          {tp.avg_score} / 10 <span className="text-emerald-400">({pct.toFixed(0)}%)</span>
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-white transition-all duration-700"
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="p-6 glass-card rounded-2xl border border-white/15 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-sm font-bold uppercase tracking-wider text-rose-100">
              ⏱️ Recent Evaluation History
            </h3>
            <button
              onClick={() => { onClose(); onOpenHistory(); }}
              className="text-xs text-rose-300 hover:text-white underline cursor-pointer"
            >
              Open History Tab
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {evaluations?.slice(0, 3).map((ev) => (
              <div
                key={ev.id}
                onClick={() => {
                  onClose();
                  if (onViewScorecard) onViewScorecard(ev);
                }}
                className="btn-tactile p-3.5 bg-[#1e0105]/75 border border-white/10 rounded-xl hover:border-white/30 hover:bg-[#2b0108]/90 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-white">{ev.student_name}</span>
                  <span className="px-1.5 py-0.5 rounded bg-white/15 text-white font-bold text-[10px] border border-white/10">
                    {ev.grade}
                  </span>
                </div>
                <div className="text-sm font-black text-white mb-2">
                  {ev.total_score}/{ev.max_possible} ({ev.percentage}%)
                </div>
                <div className="text-[10px] text-rose-200/60 flex items-center justify-between">
                  <span>{ev.evaluation_date}</span>
                  <span className="text-rose-300 font-medium group-hover:underline">View Scorecard →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
