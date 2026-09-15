import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { playSoundEffect, getGradeBadgeInfo } from '../utils/sound';

export default function ScoringModal({
  isOpen,
  onClose,
  students,
  topics,
  preselectedStudent,
  onEvaluationSaved,
  onOpenManage,
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

  if (!isOpen) return null;

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
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ffffff', '#06b6d4', '#6366f1', '#ec4899']
    });
  };

  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    if (!currentStudent) {
      alert('Please register or select a student first!');
      return;
    }
    if (topics.length === 0) {
      alert('Please add at least one scoring category in Manage Directory first!');
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

  const resetForm = () => {
    const initialScores = {};
    topics.forEach((t) => {
      initialScores[t.id] = 8.0;
    });
    setScores(initialScores);
    setFeedback('');
    setSavedSuccessRecord(null);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-30 flex justify-start pt-20 pb-4 px-3 sm:px-6 lg:px-8 overflow-hidden animate-fadeIn"
    >
      {/* Soft left crimson gradient backdrop so puppet character remains completely visible on the right */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#320107]/90 via-[#45020c]/50 to-transparent pointer-events-none" />

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full lg:w-[62%] xl:w-[58%] h-full crimson-panel-container rounded-3xl p-5 sm:p-7 shadow-2xl text-white overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/15">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl select-none">⚡</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Scoredude Evaluation Engine
              </h2>
              <p className="text-xs text-rose-200/70">
                Rate 0 to 10 with live auto-total. Persisted directly into <code className="text-rose-300 font-mono">score.db</code>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Live Auto-Total Display Pill */}
            <div className="flex items-center gap-3 bg-white/10 border border-white/20 px-3.5 py-1.5 rounded-full">
              <div className="text-right">
                <span className="text-[9px] uppercase tracking-wider text-rose-200/70 font-bold block">Auto Total</span>
                <span className="text-sm sm:text-base font-black text-white">
                  {totalScore} <span className="text-xs font-normal text-rose-200/60">/ {maxPossible}</span>
                </span>
              </div>
              <div className="h-5 w-px bg-white/20" />
              <div className="text-center">
                <span className="text-xs font-black text-emerald-400">{percentage}%</span>
                <span className="block text-[9px] text-white font-bold">Grade {gradeInfo.grade}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              title="Close to home"
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-rose-100 hover:text-white transition-colors cursor-pointer text-sm font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmitEvaluation} className="space-y-6 pt-6">
          {/* Candidate & Evaluator Picker */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 glass-card rounded-2xl border border-white/15">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-rose-100 uppercase tracking-wider">
                  Select Candidate *
                </label>
                <button
                  type="button"
                  onClick={() => { onClose(); onOpenManage(); }}
                  className="text-[11px] text-rose-300 hover:text-white underline underline-offset-2 cursor-pointer"
                >
                  + Add New Candidate
                </button>
              </div>

              {students.length > 0 ? (
                <div className="relative">
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#1e0105]/85 border border-white/20 focus:border-white text-white text-xs outline-none cursor-pointer appearance-none"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id} className="bg-[#2a0107] text-white">
                        {s.name} ({s.roll_no}) — {s.batch || 'Batch 2026'}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-rose-200/60 text-xs">
                    ▼
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  No students in database. Click &quot;Add New Candidate&quot; above.
                </div>
              )}

              {currentStudent && (
                <div className="mt-2.5 flex items-center gap-2.5 text-xs text-rose-200/70">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: currentStudent.avatar_color || '#38bdf8' }}
                  />
                  <span>Roll: <b className="text-white font-mono">{currentStudent.roll_no}</b> • {currentStudent.batch}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-rose-100 uppercase tracking-wider mb-2">
                Evaluator / Board Panel Name
              </label>
              <input
                type="text"
                value={evaluatorName}
                onChange={(e) => setEvaluatorName(e.target.value)}
                placeholder="e.g. Chief Interviewer, Evaluation Panel"
                className="w-full px-4 py-3 rounded-xl bg-[#1e0105]/85 border border-white/20 focus:border-white text-white text-xs outline-none placeholder-rose-200/40"
              />
              <p className="text-[11px] text-rose-200/50 mt-2">Recorded on official score.db certificate.</p>
            </div>
          </div>

          {/* Dynamic 0 to 10 Scoring Categories */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-rose-100">
                Rate Categories (0 to 10)
              </h3>
              <button
                type="button"
                onClick={() => { onClose(); onOpenManage(); }}
                className="text-xs text-rose-300 hover:text-white underline underline-offset-2 cursor-pointer"
              >
                + Customize Categories in Directory
              </button>
            </div>

            {topics.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-white/20 rounded-2xl">
                <p className="text-xs text-rose-200/60">No scoring categories configured.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topics.map((topic, index) => {
                  const currentScore = scores[topic.id] !== undefined ? scores[topic.id] : 8.0;

                  return (
                    <div
                      key={topic.id}
                      className="p-4 glass-card rounded-2xl border border-white/15 flex flex-col justify-between hover:border-white/30 transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: topic.color || '#6366f1' }}
                            />
                            <h4 className="text-sm font-bold text-white">{topic.name}</h4>
                          </div>

                          <div className="bg-[#180104] px-3 py-1 rounded-full border border-white/20 font-black text-sm text-white">
                            {Number(currentScore).toFixed(1)} <span className="text-[10px] text-rose-200/60 font-normal">/ {topic.max_score || 10}</span>
                          </div>
                        </div>

                        <p className="text-[11px] text-rose-200/70 line-clamp-1 mb-3">{topic.description}</p>

                        {/* Interactive Slider */}
                        <input
                          type="range"
                          min="0"
                          max={topic.max_score || 10}
                          step="0.5"
                          value={currentScore}
                          onChange={(e) => handleScoreChange(topic.id, e.target.value)}
                          className="w-full accent-rose-500 cursor-pointer"
                        />

                        {/* Presets - Emil Kowalski style tactile chips */}
                        <div className="flex items-center justify-between pt-2.5 gap-1.5">
                          {[0, 5, 7.5, 9, 10].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => handleQuickPreset(topic.id, preset)}
                              className={`btn-tactile flex-1 py-1 rounded-lg text-[11px] font-bold transition-all duration-160 cursor-pointer border ${
                                currentScore === preset
                                  ? 'bg-white text-black border-white shadow-sm scale-105'
                                  : 'bg-white/10 text-rose-200/80 border-white/10 hover:bg-white/20 hover:text-white'
                              }`}
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-white/10">
                        <input
                          type="text"
                          placeholder={`Remarks for ${topic.name}...`}
                          value={notes[topic.id] || ''}
                          onChange={(e) => setNotes({ ...notes, [topic.id]: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#180104]/80 border border-white/15 focus:border-white text-xs text-white placeholder-rose-200/40 outline-none"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Qualitative Feedback & Strengths */}
          <div className="p-5 glass-card border border-white/15 rounded-2xl space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              <div>
                <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
                  Key Strengths
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="e.g. Crisp articulation, Good poise..."
                    value={newStrength}
                    onChange={(e) => setNewStrength(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddStrength(); } }}
                    className="flex-1 px-3 py-2 rounded-xl bg-[#1e0105]/85 border border-white/20 text-xs text-white outline-none placeholder-rose-200/40 focus:border-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddStrength}
                    className="btn-tactile px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/30 cursor-pointer shadow-sm"
                  >
                    + Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {strengths.map((str, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs shadow-sm"
                    >
                      <span>{str}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveStrength(idx)}
                        className="btn-tactile-sm hover:text-white cursor-pointer ml-1 p-0.5 rounded-full hover:bg-emerald-500/30 transition-colors"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Areas for Growth */}
              <div>
                <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
                  Areas for Growth
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="e.g. Include portfolio metrics..."
                    value={newImprovement}
                    onChange={(e) => setNewImprovement(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddImprovement(); } }}
                    className="flex-1 px-4 py-2 rounded-xl bg-[#1e0105]/85 border border-white/20 text-xs text-white outline-none placeholder-rose-200/40 focus:border-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddImprovement}
                    className="btn-tactile px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/30 cursor-pointer shadow-sm"
                  >
                    + Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {improvements.map((imp, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs shadow-sm"
                    >
                      <span>{imp}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveImprovement(idx)}
                        className="btn-tactile-sm hover:text-white cursor-pointer ml-1 p-0.5 rounded-full hover:bg-amber-500/30 transition-colors"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-rose-100 uppercase tracking-wider mb-2">
                Executive Synthesis & Notes
              </label>
              <textarea
                rows={2}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Candidate presented strong technical fundamentals..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#1e0105]/85 border border-white/20 text-white text-xs outline-none resize-none placeholder-rose-200/40 focus:border-white"
              />
            </div>
          </div>

          {/* Action Buttons - Emil Kowalski style */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/15">
            <button
              type="button"
              onClick={resetForm}
              className="btn-tactile px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-rose-100 text-xs font-bold border border-white/10 hover:border-white/30 cursor-pointer w-full sm:w-auto"
            >
              Reset Scores
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !currentStudent || topics.length === 0}
              className="btn-pill btn-tactile px-8 py-3.5 rounded-full bg-white text-black font-extrabold text-sm hover:bg-rose-50 border border-white/40 shadow-xl cursor-pointer disabled:opacity-50 w-full sm:w-auto"
            >
              {isSubmitting ? 'Saving to score.db...' : '⚡ Save & Commit Score to score.db'}
            </button>
          </div>
        </form>

        {/* Success Scorecard Confirmation Box */}
        {savedSuccessRecord && (
          <div className="mt-6 p-5 rounded-2xl bg-white/10 border border-emerald-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <span>✓</span>
                <span>Score successfully committed to SQLite score.db (ID #{savedSuccessRecord.id})</span>
              </div>
              <button
                onClick={() => setSavedSuccessRecord(null)}
                className="btn-tactile-sm text-xs text-rose-200/70 hover:text-white cursor-pointer"
              >
                ✕ Dismiss
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-rose-100">
              <span>{savedSuccessRecord.student_name} ({savedSuccessRecord.roll_no})</span>
              <span className="font-bold text-white">Total: {savedSuccessRecord.total_score}/{savedSuccessRecord.max_possible} ({savedSuccessRecord.percentage}%) • Grade {savedSuccessRecord.grade}</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  const r = savedSuccessRecord;
                  setSavedSuccessRecord(null);
                  onClose();
                  if (onViewScorecard) onViewScorecard(r);
                }}
                className="btn-pill btn-tactile px-5 py-2 rounded-full bg-white text-black text-xs font-bold hover:bg-rose-50 border border-white/30 shadow-md cursor-pointer"
              >
                View Official Scorecard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
