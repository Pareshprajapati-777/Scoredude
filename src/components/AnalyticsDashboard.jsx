import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Users,
  Award,
  BookOpen,
  Sparkles,
  Trophy,
  Flame,
  CheckCircle2,
  BarChart3
} from 'lucide-react';
import { getGradeBadgeInfo } from '../utils/sound';

export default function AnalyticsDashboard({ stats, onSelectStudent }) {
  if (!stats) {
    return (
      <div className="glass-panel p-12 text-center rounded-3xl border border-white/10">
        <Sparkles className="w-8 h-8 text-cyan-400 mx-auto mb-3 animate-spin-slow" />
        <h3 className="text-base font-bold text-white">Loading Analytics...</h3>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 4 Stat Highlights Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Candidates */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 rounded-2xl border border-white/10 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Candidates</span>
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{stats.totalStudents || 0}</span>
            <span className="text-xs text-cyan-400 font-medium">Registered</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">Active candidates in database</div>
        </motion.div>

        {/* Total Evaluations */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card p-6 rounded-2xl border border-white/10 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Evaluations</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{stats.totalEvaluations || 0}</span>
            <span className="text-xs text-indigo-400 font-medium">Completed</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">Saved in SQLite score.db</div>
        </motion.div>

        {/* Average Score % */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 rounded-2xl border border-white/10 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Batch Average</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400">{stats.avgPercentage || 0}%</span>
            <span className="text-xs text-slate-400 font-medium">Overall</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">High: {stats.highestPercentage || 0}% • Low: {stats.lowestPercentage || 0}%</div>
        </motion.div>

        {/* Dynamic Topics Active */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-6 rounded-2xl border border-white/10 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scoring Pillars</span>
            <div className="p-2.5 rounded-xl bg-fuchsia-500/20 text-fuchsia-400">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{stats.totalTopics || 0}</span>
            <span className="text-xs text-fuchsia-400 font-medium">Active Topics</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">100% Dynamic & Configurable</div>
        </motion.div>
      </div>

      {/* Leaderboard & Topic Performance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Performers Leaderboard */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Top Candidates Leaderboard</h3>
                <p className="text-xs text-slate-400">Ranked by average evaluation performance</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {stats.topPerformers?.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No evaluation history available yet.</p>
            ) : (
              stats.topPerformers?.map((cand, rank) => {
                const badge = getGradeBadgeInfo(cand.avg_score);
                return (
                  <motion.div
                    key={cand.student_id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: rank * 0.04 }}
                    className="glass-card p-4 rounded-2xl flex items-center justify-between gap-4 border border-white/5 hover:border-amber-500/30 transition-all"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-7 text-center font-black text-sm">
                        {rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : `#${rank + 1}`}
                      </div>
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-base shadow-sm"
                        style={{ backgroundColor: cand.avatar_color || '#38bdf8' }}
                      >
                        {cand.student_name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{cand.student_name}</h4>
                        <span className="text-xs text-slate-400 font-mono">{cand.roll_no}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-base font-extrabold text-emerald-400">{cand.avg_score}%</div>
                        <div className="text-[10px] text-slate-400">{cand.evaluations_count} eval(s)</div>
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
        </div>

        {/* Topic-Wise Average Performance Breakdown */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Topic Performance Radar</h3>
                <p className="text-xs text-slate-400">Average benchmark score across each topic</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {stats.topicPerformance?.map((tp, idx) => {
              const pct = tp.avg_percentage || ((tp.avg_score / 10) * 100);
              return (
                <div key={idx} className="glass-card p-4 rounded-2xl border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white text-sm">{tp.topic_name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-cyan-300 text-sm">
                        {tp.avg_score} / 10
                      </span>
                      <span className="text-emerald-400 font-extrabold">({pct.toFixed(0)}%)</span>
                    </div>
                  </div>

                  {/* Progress visualization */}
                  <div className="w-full h-3 rounded-full bg-slate-800/90 overflow-hidden p-0.5 border border-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-fuchsia-500 transition-all duration-700"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
