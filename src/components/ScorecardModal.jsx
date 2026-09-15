import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Printer,
  Share2,
  Trophy,
  Calendar,
  User,
  CheckCircle2,
  Zap,
  Download,
  Award,
  Sparkles
} from 'lucide-react';
import { getGradeBadgeInfo } from '../utils/sound';

export default function ScorecardModal({ evaluation, onClose }) {
  if (!evaluation) return null;

  const gradeInfo = getGradeBadgeInfo(evaluation.percentage);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#240106]/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.92, opacity: 0, y: 25 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 25 }}
        className="crimson-panel-container w-full max-w-3xl p-6 sm:p-10 rounded-3xl relative overflow-hidden border border-white/20 shadow-2xl my-8 print:bg-white print:text-black print:border-none print:shadow-none print:p-4 text-white"
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/15 rounded-full blur-3xl pointer-events-none print:hidden" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-500/15 rounded-full blur-3xl pointer-events-none print:hidden" />

        {/* Modal Header Action Bar (Hidden during Print) */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10 relative z-10 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/10 text-white border border-white/20">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white">Scoredude Official Scorecard</h3>
              <p className="text-xs text-rose-200/70">Accredited Candidate Evaluation Certificate (score.db)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="btn-pill btn-tactile flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black hover:bg-rose-50 text-xs font-bold transition-all cursor-pointer shadow-md border border-white/30"
            >
              <Printer className="w-4 h-4 text-rose-600" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="btn-tactile w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-rose-100 hover:text-white transition-colors cursor-pointer border border-white/10"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Scorecard Layout */}
        <div className="py-6 space-y-8 relative z-10">
          {/* Institution Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-xl relative"
                style={{ backgroundColor: evaluation.avatar_color || '#6366f1' }}
              >
                {evaluation.student_name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">{evaluation.student_name}</h1>
                <p className="text-sm font-mono text-rose-300 font-semibold">{evaluation.roll_no}</p>
                <p className="text-xs text-rose-200/70">{evaluation.batch || 'Batch 2026'}</p>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block">
                <div className={`px-5 py-2 rounded-2xl font-black text-2xl border ${gradeInfo.bg} ${gradeInfo.glow}`}>
                  Grade: {evaluation.grade}
                </div>
                <div className="text-xs font-semibold text-rose-200/70 mt-1.5">{evaluation.status}</div>
              </div>
            </div>
          </div>

          {/* Scores Breakdown Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-rose-100 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-300" /> Topic-wise Evaluation Breakdown (Out of 10)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {evaluation.scores?.map((sc, i) => {
                const pct = (sc.score / (sc.max_score || 10)) * 100;
                return (
                  <div key={i} className="glass-card p-4 rounded-2xl border border-white/15 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-white">{sc.topic_name}</span>
                      <span className="font-mono font-black text-white">
                        {sc.score} / {sc.max_score || 10}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 rounded-full bg-[#180104] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-white transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    {sc.notes && <p className="text-[11px] text-rose-200/70 italic">&quot;{sc.notes}&quot;</p>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cumulative Total & Summary Tile */}
          <div className="p-6 rounded-2xl border border-white/20 flex items-center justify-between bg-gradient-to-r from-[#2b0108]/90 via-[#3d020c]/80 to-[#1f0105]/90 shadow-md">
            <div>
              <span className="text-xs text-rose-200/70 uppercase tracking-wider font-semibold">Overall Total Score</span>
              <div className="text-3xl font-black text-white">
                {evaluation.total_score} / {evaluation.max_possible}
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-rose-200/70 uppercase tracking-wider font-semibold">Percentage</span>
              <div className="text-3xl font-black text-emerald-400">{evaluation.percentage}%</div>
            </div>
          </div>

          {/* Qualitative Insights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" /> Noted Strengths
              </div>
              <ul className="text-xs text-rose-100/90 space-y-1">
                {evaluation.strengths && evaluation.strengths.length > 0 ? (
                  evaluation.strengths.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-400">•</span>
                      <span>{s}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-rose-200/50 italic">No specific strengths tagged</li>
                )}
              </ul>
            </div>

            {/* Improvements */}
            <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/25 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <Zap className="w-4 h-4" /> Next Steps & Growth
              </div>
              <ul className="text-xs text-rose-100/90 space-y-1">
                {evaluation.improvements && evaluation.improvements.length > 0 ? (
                  evaluation.improvements.map((imp, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-400">•</span>
                      <span>{imp}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-rose-200/50 italic">No improvement items recorded</li>
                )}
              </ul>
            </div>
          </div>

          {/* Feedback & Evaluator Signature */}
          <div className="space-y-2 p-4 rounded-2xl bg-[#180104]/70 border border-white/10">
            <span className="text-xs font-bold text-rose-200/70 uppercase tracking-wider">Detailed Feedback Remarks:</span>
            <p className="text-xs text-rose-100/90 leading-relaxed italic">
              &quot;{evaluation.feedback || 'Satisfactory performance recorded.'}&quot;
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-rose-200/70">
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-rose-300" />
              <span>Evaluated by: <b className="text-white">{evaluation.evaluator_name || 'Interview Board'}</b></span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-rose-300" />
              <span>Date: <b className="text-white">{evaluation.evaluation_date || new Date().toISOString().split('T')[0]}</b></span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
