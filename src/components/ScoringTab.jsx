import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  CheckCircle2,
  Trophy,
  Star,
  Flame,
  ArrowRight,
  RotateCcw,
  Zap,
  BookOpen,
  MessageSquare,
  FileText,
  Plus,
  Minus,
  Award,
  AlertCircle,
  Users,
  Sliders,
  Eye
} from 'lucide-react';
import { playSoundEffect, getGradeBadgeInfo } from '../utils/sound';

export default function ScoringTab({
  students,
  topics,
  preselectedStudent,
  onEvaluationSaved,
  onNavigateToTab,
  onViewScorecard
}) {
  const [selectedStudentId, setSelectedStudentId] = useState(
    preselectedStudent ? preselectedStudent.id : (students[0]?.id || '')
  );
  const [evaluatorName, setEvaluatorName] = useState('Senior Evaluation Board');
  const [scores, setScores] = useState({});
  const [notes, setNotes] = useState({});
  const [feedback, setFeedback] = useState('');
  const [strengths, setStrengths] = useState(['Clear diction & confidence', 'Structured presentation']);
  const [newStrength, setNewStrength] = useState('');
  const [improvements, setImprovements] = useState(['Add quantifiable impact to resume']);
  const [newImprovement, setNewImprovement] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedSuccessRecord, setSavedSuccessRecord] = useState(null);

  useEffect(() => {
    if (preselectedStudent) {
      setSelectedStudentId(preselectedStudent.id);
    } else if (students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(students[0].id);
    }
  }, [preselectedStudent, students]);

  useEffect(() => {
    const initialScores = {};
    const initialNotes = {};
    topics.forEach((t) => {
      if (scores[t.id] === undefined) {
        initialScores[t.id] = 8.0;
      } else {
        initialScores[t.id] = scores[t.id];
      }
      initialNotes[t.id] = notes[t.id] || '';
    });
    setScores(initialScores);
    setNotes(initialNotes);
  }, [topics]);

  const currentStudent = useMemo(() => {
    return students.find((s) => s.id === Number(selectedStudentId)) || students[0];
  }, [students, selectedStudentId]);

  // Live Auto-Total Calculation
  const { totalScore, maxPossible, percentage, gradeInfo } = useMemo(() => {
    let total = 0;
    let max = 0;
    topics.forEach((t) => {
      const val = Number(scores[t.id]) || 0;
      const topicMax = Number(t.max_score) || 10;
      total += Math.min(val, topicMax);
      max += topicMax;
    });

    const pct = max > 0 ? (total / max) * 100 : 0;
    const badge = getGradeBadgeInfo(pct);

    return {
      totalScore: Number(total.toFixed(1)),
      maxPossible: max,
      percentage: Number(pct.toFixed(1)),
      gradeInfo: badge
    };
  }, [topics, scores]);

  const handleScoreChange = (topicId, val) => {
    const num = Math.max(0, Math.min(Number(val), 10));
    setScores((prev) => ({ ...prev, [topicId]: num }));
    playSoundEffect('slider');
  };

  const handleQuickPreset = (topicId, presetVal) => {
    setScores((prev) => ({ ...prev, [topicId]: presetVal }));
    playSoundEffect('click');
  };

  const handleAddStrength = () => {
    if (newStrength.trim()) {
      setStrengths([...strengths, newStrength.trim()]);
      setNewStrength('');
      playSoundEffect('click');
    }
  };

  const handleRemoveStrength = (idx) => {
    setStrengths(strengths.filter((_, i) => i !== idx));
  };

  const handleAddImprovement = () => {
    if (newImprovement.trim()) {
      setImprovements([...improvements, newImprovement.trim()]);
      setNewImprovement('');
      playSoundEffect('click');
    }
  };

  const handleRemoveImprovement = (idx) => {
    setImprovements(improvements.filter((_, i) => i !== idx));
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#06b6d4', '#6366f1', '#ec4899', '#10b981', '#f59e0b']
    });
  };

  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    if (!currentStudent) {
      alert('Please register or select a student from Tab 3 first!');
      return;
    }
    if (topics.length === 0) {
      alert('Please add at least one scoring category in Tab 3 first!');
      return;
    }

    setIsSubmitting(true);
    try {
      const topic_scores = topics.map((t) => ({
        topic_id: t.id,
        topic_name: t.name,
        score: Number(scores[t.id] || 0),
        max_score: Number(t.max_score || 10),
        notes: notes[t.id] || ''
      }));

      const payload = {
        student_id: currentStudent.id,
        evaluator_name: evaluatorName,
        topic_scores,
        feedback: feedback || 'Performance evaluated across all standard core topics.',
        strengths,
        improvements,
        evaluation_date: new Date().toISOString().split('T')[0]
      };

      const res = await fetch('/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Error saving score');

      playSoundEffect('success');
      triggerConfetti();
      setSavedSuccessRecord(json.data);

      if (onEvaluationSaved) {
        onEvaluationSaved();
      }
    } catch (err) {
      alert('Failed to save score: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetEvaluationForm = () => {
    const initialScores = {};
    topics.forEach((t) => {
      initialScores[t.id] = 8.0;
    });
    setScores(initialScores);
    setFeedback('');
    setSavedSuccessRecord(null);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner with Dynamic Auto Total Summary */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold mb-3">
            <Award className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tab 2: Scoring Engine (0 to 10)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Live Student Scorecard Evaluator
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Rate each category out of 10. Auto-calculates total, letter grade, and commits to SQLite <code className="text-cyan-400 font-mono">score.db</code>.
          </p>
        </div>

        {/* Live Auto-Total Display Tile */}
        <motion.div
          key={`${totalScore}-${percentage}`}
          initial={{ scale: 0.96 }}
          animate={{ scale: 1 }}
          className="glass-card p-5 rounded-2xl border border-indigo-500/30 shadow-glass-glow flex items-center justify-between gap-6 self-stretch lg:self-auto"
        >
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">Live Auto Total</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-fuchsia-400">
                {totalScore}
              </span>
              <span className="text-slate-400 font-semibold text-sm">/ {maxPossible}</span>
            </div>
            <span className="text-xs text-emerald-400 font-bold">{percentage}% Score</span>
          </div>

          <div className="h-12 w-px bg-white/10" />

          <div className="text-center">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block mb-1">Grade</span>
            <div className={`px-4 py-1.5 rounded-xl font-black text-xl border shadow-lg ${gradeInfo.bg} ${gradeInfo.glow}`}>
              {gradeInfo.grade}
            </div>
          </div>
        </motion.div>
      </div>

      <form onSubmit={handleSubmitEvaluation} className="space-y-8">
        {/* Step 1: Candidate Selection (from Tab 3) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm border border-cyan-500/30">
                1
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">Select Candidate & Evaluator Details</h2>
                <p className="text-xs text-slate-400">Choose from students configured in Tab 3</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateToTab('manage')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>+ Add / Manage Students in Tab 3</span>
              <span>→</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Candidate Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Candidate / Student *
              </label>
              {students.length > 0 ? (
                <div className="relative">
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-700 focus:border-cyan-500 text-white font-medium text-xs outline-none cursor-pointer appearance-none"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.roll_no}) — {s.batch || 'Batch 2026'}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                    ▼
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
                  <span>No students registered yet.</span>
                  <button
                    type="button"
                    onClick={() => onNavigateToTab('manage')}
                    className="font-bold underline cursor-pointer"
                  >
                    Go to Tab 3 to Add Student
                  </button>
                </div>
              )}

              {currentStudent && (
                <div className="mt-3 p-3.5 rounded-2xl bg-slate-900/50 border border-white/5 flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-base shadow-md"
                    style={{ backgroundColor: currentStudent.avatar_color || '#38bdf8' }}
                  >
                    {currentStudent.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">{currentStudent.name}</h4>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {currentStudent.roll_no} • {currentStudent.batch}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Evaluator Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Evaluator / Board Panel Name
              </label>
              <input
                type="text"
                value={evaluatorName}
                onChange={(e) => setEvaluatorName(e.target.value)}
                placeholder="e.g. Chief Interviewer, Technical Board"
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-700 focus:border-cyan-500 text-white font-medium text-xs outline-none transition-all"
              />
              <p className="text-[11px] text-slate-500 mt-2">Recorded alongside score for official scorecard.</p>
            </div>
          </div>
        </motion.div>

        {/* Step 2: Rate Dynamic Categories (Out of 10) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm border border-indigo-500/30">
                2
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">Rate Dynamic Categories (Out of 10)</h2>
                <p className="text-xs text-slate-400">Score candidate on CV, Confidence, Communication, Knowledge & custom pillars</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateToTab('manage')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>+ Add / Edit Categories in Tab 3</span>
              <span>→</span>
            </button>
          </div>

          {topics.length === 0 ? (
            <div className="p-8 text-center glass-card rounded-2xl border border-dashed border-slate-700">
              <p className="text-slate-400 text-xs mb-3">No categories found in database.</p>
              <button
                type="button"
                onClick={() => onNavigateToTab('manage')}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
              >
                Go to Tab 3 to Create Categories
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {topics.map((topic, index) => {
                const currentScore = scores[topic.id] !== undefined ? scores[topic.id] : 8.0;

                return (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: index * 0.03 }}
                    className="glass-card p-6 rounded-2xl border border-white/10 relative overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base shadow-sm"
                            style={{
                              backgroundColor: `${topic.color}25`,
                              color: topic.color,
                              border: `1px solid ${topic.color}55`
                            }}
                          >
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                              {topic.name}
                            </h3>
                            <p className="text-[11px] text-slate-400 line-clamp-1">{topic.description}</p>
                          </div>
                        </div>

                        {/* Dial */}
                        <div className="flex items-baseline gap-1 bg-slate-900/90 px-3.5 py-1.5 rounded-xl border border-white/10 shadow-inner">
                          <span
                            className="text-xl sm:text-2xl font-black"
                            style={{ color: topic.color || '#38bdf8' }}
                          >
                            {Number(currentScore).toFixed(1)}
                          </span>
                          <span className="text-[11px] text-slate-400 font-semibold">/ {topic.max_score || 10}</span>
                        </div>
                      </div>

                      {/* Slider Control */}
                      <div className="mt-4 space-y-2">
                        <div className="relative pt-1">
                          <input
                            type="range"
                            min="0"
                            max={topic.max_score || 10}
                            step="0.5"
                            value={currentScore}
                            onChange={(e) => handleScoreChange(topic.id, e.target.value)}
                            className="w-full"
                          />
                        </div>

                        {/* Quick Presets */}
                        <div className="flex items-center justify-between pt-1">
                          {[0, 5, 7.5, 9, 10].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => handleQuickPreset(topic.id, preset)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                currentScore === preset
                                  ? 'bg-indigo-500 text-white shadow-md'
                                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Topic Notes */}
                    <div className="mt-4 pt-3 border-t border-white/5">
                      <input
                        type="text"
                        placeholder={`Remarks for ${topic.name} (optional)...`}
                        value={notes[topic.id] || ''}
                        onChange={(e) => setNotes({ ...notes, [topic.id]: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-900/60 border border-slate-700/60 focus:border-indigo-500 text-xs text-slate-200 placeholder-slate-500 outline-none"
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Step 3: Observations & Detailed Feedback */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6"
        >
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <div className="w-8 h-8 rounded-xl bg-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center font-bold text-sm border border-fuchsia-500/30">
              3
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Observations & Recommendation Summary</h2>
              <p className="text-xs text-slate-400">Qualitative assessment notes for scorecard</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Key Strengths Observed
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. Sharp communication, High poise..."
                  value={newStrength}
                  onChange={(e) => setNewStrength(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddStrength(); } }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 focus:border-emerald-500 text-xs text-white outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddStrength}
                  className="px-3.5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold cursor-pointer"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {strengths.map((str, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-medium"
                  >
                    <span>{str}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveStrength(idx)}
                      className="hover:text-rose-400 cursor-pointer text-slate-400 ml-1"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Growth areas */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4" /> Areas for Growth & Next Steps
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. Structure CV with metrics, practice mock Q&A..."
                  value={newImprovement}
                  onChange={(e) => setNewImprovement(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddImprovement(); } }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 focus:border-amber-500 text-xs text-white outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddImprovement}
                  className="px-3.5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold cursor-pointer"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {improvements.map((imp, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-medium"
                  >
                    <span>{imp}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveImprovement(idx)}
                      className="hover:text-rose-400 cursor-pointer text-slate-400 ml-1"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Evaluator Summary & Overall Feedback
            </label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Candidate showed strong engagement and thorough preparation..."
              className="w-full px-4 py-3 rounded-2xl bg-slate-900/80 border border-slate-700/80 focus:border-indigo-500 text-white text-xs outline-none resize-none"
            />
          </div>
        </motion.div>

        {/* Submit Actions */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-white/10"
        >
          <button
            type="button"
            onClick={resetEvaluationForm}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer w-full sm:w-auto justify-center"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Form</span>
          </button>

          <button
            type="submit"
            disabled={isSubmitting || !currentStudent || topics.length === 0}
            className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-fuchsia-600 hover:from-cyan-400 hover:to-fuchsia-500 text-white font-black text-sm shadow-2xl shadow-indigo-500/40 transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 cursor-pointer w-full sm:w-auto"
          >
            {isSubmitting ? (
              <span>Saving Score to score.db...</span>
            ) : (
              <>
                <Award className="w-5 h-5 text-cyan-200" />
                <span>Save & Commit Score to score.db</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </motion.div>
      </form>

      {/* Success Modal */}
      <AnimatePresence>
        {savedSuccessRecord && (
          <div
            onClick={() => setSavedSuccessRecord(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-panel w-full max-w-xl p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 shadow-lg shadow-emerald-500/20">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">Score Saved Successfully!</h3>
                    <p className="text-xs text-slate-400">Written to SQLite database <code className="text-cyan-400 font-mono">score.db</code></p>
                  </div>
                </div>
                <button
                  onClick={() => setSavedSuccessRecord(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="my-5 p-5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-bold text-white">{savedSuccessRecord.student_name}</h4>
                    <p className="text-xs text-slate-400 font-mono">{savedSuccessRecord.roll_no} • {savedSuccessRecord.batch}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-emerald-400">{savedSuccessRecord.total_score} / {savedSuccessRecord.max_possible}</span>
                    <span className="block text-[11px] text-slate-400 font-semibold">Grade: {savedSuccessRecord.grade} ({savedSuccessRecord.percentage}%)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-white/10">
                  {savedSuccessRecord.scores?.map((sc) => (
                    <div key={sc.id} className="p-2.5 rounded-xl bg-slate-800/60 border border-white/5 text-center">
                      <span className="text-[10px] text-slate-400 block truncate">{sc.topic_name}</span>
                      <span className="text-sm font-black text-cyan-300">{sc.score}/{sc.max_score}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    const record = savedSuccessRecord;
                    setSavedSuccessRecord(null);
                    if (onViewScorecard) onViewScorecard(record);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Official Scorecard</span>
                </button>

                <button
                  onClick={() => setSavedSuccessRecord(null)}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
