import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Users,
  Award,
  TrendingUp,
  Sliders,
  Trophy,
  ArrowRight,
  Clock,
  CheckCircle2,
  BarChart3,
  Calendar,
  Zap,
  Star
} from 'lucide-react';
import { getGradeBadgeInfo } from '../utils/sound';

export default function DashboardTab({
  stats,
  evaluations,
  students,
  topics,
  onNavigateToTab,
  onSelectStudentForScore,
  onViewScorecard
}) {
  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner with Quick CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
            <span>Welcome to Scoredude Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Modern Dynamic Evaluation & Scoring
          </h1>
          <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">
            Assess students across custom dynamic pillars, calculate auto-totals, track performance trajectories, and persist data in <code className="text-cyan-400 font-mono">score.db</code>.
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={() => onNavigateToTab('score')}
            className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-fuchsia-600 hover:from-cyan-400 hover:to-fuchsia-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Award className="w-4 h-4 text-cyan-200" />
            <span>Score a Student</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigateToTab('manage')}
            className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-white/10 transition-all cursor-pointer"
          >
            <Users className="w-4 h-4 text-cyan-400" />
            <span>Manage Students & Categories</span>
          </button>
        </div>
      </motion.div>

      {/* 4 KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Students */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, delay: 0.02 }}
          className="glass-card p-6 rounded-2xl border border-white/10 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Students</span>
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{students?.length || 0}</span>
            <span className="text-xs text-cyan-400 font-semibold">Candidates</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Managed in Tab 3</p>
        </motion.div>

        {/* Total Evaluations Completed */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, delay: 0.06 }}
          className="glass-card p-6 rounded-2xl border border-white/10 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Evaluations</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{evaluations?.length || 0}</span>
            <span className="text-xs text-indigo-400 font-semibold">Records Saved</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Stored in SQLite score.db</p>
        </motion.div>

        {/* Class Average */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="glass-card p-6 rounded-2xl border border-white/10 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Average</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400">{stats?.avgPercentage || 0}%</span>
            <span className="text-xs text-slate-400 font-medium">Mean Score</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">High: {stats?.highestPercentage || 0}% • Low: {stats?.lowestPercentage || 0}%</p>
        </motion.div>

        {/* Active Scoring Categories */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, delay: 0.14 }}
          className="glass-card p-6 rounded-2xl border border-white/10 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Categories</span>
            <div className="p-2.5 rounded-xl bg-fuchsia-500/20 text-fuchsia-400">
              <Sliders className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{topics?.length || 0}</span>
            <span className="text-xs text-fuchsia-400 font-semibold">Pillars (Max 10)</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Dynamic & Reconfigurable</p>
        </motion.div>
      </div>

      {/* Main Grid: Leaderboard & Category Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Candidates Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-5"
        >
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Top Candidates Leaderboard</h3>
                <p className="text-xs text-slate-400">Ranked by performance score percentage</p>
              </div>
            </div>

            <button
              onClick={() => onNavigateToTab('history')}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View All History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {stats?.topPerformers?.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No evaluations recorded yet.</p>
            ) : (
              stats?.topPerformers?.slice(0, 5).map((cand, rank) => {
                const badge = getGradeBadgeInfo(cand.avg_score);
                return (
                  <motion.div
                    key={cand.student_id}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: rank * 0.05 }}
                    className="glass-card p-4 rounded-2xl flex items-center justify-between gap-4 border border-white/5 hover:border-amber-500/30 transition-all group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-6 text-center font-black text-sm">
                        {rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : `#${rank + 1}`}
                      </div>
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-base shadow-sm"
                        style={{ backgroundColor: cand.avatar_color || '#38bdf8' }}
                      >
                        {cand.student_name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                          {cand.student_name}
                        </h4>
                        <span className="text-xs text-slate-400 font-mono">{cand.roll_no} • {cand.batch}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-base font-black text-emerald-400">{cand.avg_score}%</div>
                        <div className="text-[10px] text-slate-400">{cand.evaluations_count} evaluation(s)</div>
                      </div>
                      <div className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${badge.bg}`}>
                        {badge.grade}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Category Performance Radar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-5"
        >
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Topic Performance Radar</h3>
                <p className="text-xs text-slate-400">Class average benchmark per category (out of 10)</p>
              </div>
            </div>

            <button
              onClick={() => onNavigateToTab('manage')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Manage Categories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {stats?.topicPerformance?.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No topic data available yet.</p>
            ) : (
              stats?.topicPerformance?.map((tp, idx) => {
                const pct = tp.avg_percentage || ((tp.avg_score / 10) * 100);
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                    className="glass-card p-4 rounded-2xl border border-white/5 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white text-sm">{tp.topic_name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-cyan-300 text-sm">
                          {tp.avg_score} / 10
                        </span>
                        <span className="text-emerald-400 font-extrabold">({pct.toFixed(0)}%)</span>
                      </div>
                    </div>

                    <div className="w-full h-2.5 rounded-full bg-slate-800/90 overflow-hidden p-0.5 border border-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${Math.min(pct, 100)}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-fuchsia-500"
                      />
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Evaluations Activity Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-5"
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Recent Evaluation Activity</h3>
              <p className="text-xs text-slate-400">Latest scorecards committed to score.db</p>
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('history')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Open All History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {evaluations?.slice(0, 3).map((ev, idx) => {
            const badge = getGradeBadgeInfo(ev.percentage);
            return (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.06 }}
                onClick={() => onViewScorecard(ev)}
                className="glass-card p-5 rounded-2xl border border-white/5 hover:border-indigo-500/40 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow-sm"
                        style={{ backgroundColor: ev.avatar_color || '#6366f1' }}
                      >
                        {ev.student_name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {ev.student_name}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono">{ev.roll_no}</span>
                      </div>
                    </div>

                    <div className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${badge.bg}`}>
                      {ev.grade}
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1 my-2">
                    <span className="text-xl font-black text-white">{ev.total_score}</span>
                    <span className="text-xs text-slate-400 font-semibold">/ {ev.max_possible} ({ev.percentage}%)</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    {ev.evaluation_date || ev.created_at?.split(' ')[0]}
                  </span>
                  <span className="text-indigo-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    Scorecard →
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
