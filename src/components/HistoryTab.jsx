import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database,
  Search,
  Filter,
  Trash2,
  Eye,
  Calendar,
  Download,
  Award,
  Sparkles
} from 'lucide-react';
import { getGradeBadgeInfo, playSoundEffect } from '../utils/sound';
import ScorecardModal from './ScorecardModal';

export default function HistoryTab({
  evaluations,
  onRefreshRecords,
  onSelectForScore
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('ALL');
  const [batchFilter, setBatchFilter] = useState('ALL');
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [activeScorecard, setActiveScorecard] = useState(null);

  const uniqueBatches = useMemo(() => {
    const set = new Set();
    evaluations.forEach((e) => {
      if (e.batch) set.add(e.batch);
    });
    return Array.from(set);
  }, [evaluations]);

  const filteredEvaluations = useMemo(() => {
    return evaluations.filter((ev) => {
      const matchSearch =
        ev.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.roll_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.feedback?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchGrade = gradeFilter === 'ALL' || ev.grade === gradeFilter;
      const matchBatch = batchFilter === 'ALL' || ev.batch === batchFilter;

      return matchSearch && matchGrade && matchBatch;
    }).sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'percentage' || sortField === 'total_score') {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      }

      if (sortOrder === 'asc') {
        return valA > valB ? 1 : -1;
      }
      return valA < valB ? 1 : -1;
    });
  }, [evaluations, searchTerm, gradeFilter, batchFilter, sortField, sortOrder]);

  const handleDeleteRecord = async (evalId) => {
    if (!window.confirm('Are you sure you want to delete this evaluation history record from score.db?')) return;
    try {
      const res = await fetch(`/api/evaluations/${evalId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        playSoundEffect('click');
        onRefreshRecords();
      }
    } catch (err) {
      alert('Error deleting evaluation: ' + err.message);
    }
  };

  const handleExportCSV = () => {
    if (filteredEvaluations.length === 0) return;
    let csv = 'ID,Student Name,Roll No,Batch,Total Score,Max Score,Percentage,Grade,Status,Evaluator,Date\n';
    filteredEvaluations.forEach((ev) => {
      csv += `"${ev.id}","${ev.student_name}","${ev.roll_no}","${ev.batch || ''}",${ev.total_score},${ev.max_possible},${ev.percentage},"${ev.grade}","${ev.status}","${ev.evaluator_name}","${ev.evaluation_date}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `scoredude_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Search & Filters */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/15 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-white/10 text-white border border-white/20">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Evaluation History & Records</h2>
              <p className="text-xs text-rose-200/70">
                View past evaluation records, filter by grade/batch, and generate printable scorecards from <code className="text-rose-300 font-mono">score.db</code>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="btn-pill btn-tactile flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black hover:bg-rose-50 text-xs font-bold transition-all cursor-pointer shadow-md border border-white/30"
            >
              <Download className="w-4 h-4 text-rose-600" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-white/10">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-200/60" />
            <input
              type="text"
              placeholder="Search student or roll no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#180104]/85 border border-white/20 focus:border-white text-white text-xs outline-none transition-all placeholder-rose-200/40"
            />
          </div>

          {/* Grade Filter */}
          <div className="relative">
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#180104]/85 border border-white/20 focus:border-white text-white text-xs outline-none cursor-pointer appearance-none"
            >
              <option value="ALL" className="bg-[#2a0107] text-white">All Grades (A+, A, B+, B...)</option>
              <option value="A+" className="bg-[#2a0107] text-white">Grade A+ (Distinction)</option>
              <option value="A" className="bg-[#2a0107] text-white">Grade A (Excellent)</option>
              <option value="B+" className="bg-[#2a0107] text-white">Grade B+ (Very Good)</option>
              <option value="B" className="bg-[#2a0107] text-white">Grade B (Good)</option>
              <option value="C" className="bg-[#2a0107] text-white">Grade C (Average)</option>
              <option value="F" className="bg-[#2a0107] text-white">Grade F (Needs Improvement)</option>
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-rose-200/60 text-xs">
              ▼
            </div>
          </div>

          {/* Batch Filter */}
          <div className="relative">
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#180104]/85 border border-white/20 focus:border-white text-white text-xs outline-none cursor-pointer appearance-none"
            >
              <option value="ALL" className="bg-[#2a0107] text-white">All Batches</option>
              {uniqueBatches.map((b) => (
                <option key={b} value={b} className="bg-[#2a0107] text-white">{b}</option>
              ))}
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-rose-200/60 text-xs">
              ▼
            </div>
          </div>

          {/* Sort By */}
          <div className="relative">
            <select
              value={`${sortField}-${sortOrder}`}
              onChange={(e) => {
                const [f, o] = e.target.value.split('-');
                setSortField(f);
                setSortOrder(o);
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-[#180104]/85 border border-white/20 focus:border-white text-white text-xs outline-none cursor-pointer appearance-none"
            >
              <option value="created_at-desc" className="bg-[#2a0107] text-white">Sort by: Newest First</option>
              <option value="created_at-asc" className="bg-[#2a0107] text-white">Sort by: Oldest First</option>
              <option value="percentage-desc" className="bg-[#2a0107] text-white">Sort by: Highest Score %</option>
              <option value="percentage-asc" className="bg-[#2a0107] text-white">Sort by: Lowest Score %</option>
              <option value="student_name-asc" className="bg-[#2a0107] text-white">Sort by: Name (A-Z)</option>
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-rose-200/60 text-xs">
              ▼
            </div>
          </div>
        </div>
      </div>

      {/* Evaluations Cards List */}
      <div className="space-y-4">
        {filteredEvaluations.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-3xl border border-white/15">
            <Database className="w-12 h-12 text-rose-300/40 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No history records match</h3>
            <p className="text-xs text-rose-200/60">Try adjusting your search keywords or grade filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredEvaluations.map((ev, index) => {
              const gradeBadge = getGradeBadgeInfo(ev.percentage);

              return (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: index * 0.03, ease: [0.16, 1, 0.3, 1] }}
                  className="glass-card p-5 sm:p-6 rounded-2xl border border-white/15 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-white/30 transition-all group"
                >
                  {/* Left: Student Info */}
                  <div className="flex items-start sm:items-center gap-4">
                    <div
                      className="w-13 h-13 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-lg shrink-0"
                      style={{
                        backgroundColor: ev.avatar_color || '#6366f1',
                        boxShadow: `0 0 20px ${ev.avatar_color || '#6366f1'}33`
                      }}
                    >
                      {ev.student_name.charAt(0)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-white group-hover:text-rose-200 transition-colors">
                          {ev.student_name}
                        </h3>
                        <span className="px-2 py-0.5 rounded-md bg-[#180104] text-[11px] font-mono text-rose-200 font-semibold border border-white/15">
                          {ev.roll_no}
                        </span>
                        <span className="text-xs text-rose-200/70">• {ev.batch || 'Batch 2026'}</span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-rose-200/60">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-rose-300/70" />
                          {ev.evaluation_date || ev.created_at?.split(' ')[0]}
                        </span>
                        <span>• Evaluator: <b className="text-white">{ev.evaluator_name}</b></span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Topic Scores */}
                  <div className="flex items-center gap-2 flex-wrap max-w-xl">
                    {ev.scores?.map((sc, scIdx) => (
                      <div
                        key={scIdx}
                        className="px-3 py-1.5 rounded-xl bg-[#180104]/80 border border-white/10 text-xs flex items-center gap-1.5 shadow-sm"
                      >
                        <span className="text-rose-200/70">{sc.topic_name}:</span>
                        <span className="font-bold text-white">{sc.score}</span>
                      </div>
                    ))}
                  </div>

                  {/* Right: Score Total & Actions */}
                  <div className="flex items-center justify-between lg:justify-end gap-5 border-t lg:border-t-0 pt-4 lg:pt-0 border-white/10">
                    <div className="text-right">
                      <div className="flex items-baseline justify-end gap-1.5">
                        <span className="text-2xl font-black text-white">{ev.total_score}</span>
                        <span className="text-xs text-rose-200/60 font-semibold">/ {ev.max_possible}</span>
                      </div>
                      <div className="text-xs text-emerald-400 font-bold">{ev.percentage}%</div>
                    </div>

                    <div
                      className={`px-3.5 py-1.5 rounded-xl font-extrabold text-sm border shadow-md ${gradeBadge.bg}`}
                    >
                      {ev.grade}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveScorecard(ev)}
                        className="btn-tactile flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-rose-100 hover:text-white border border-white/15 transition-all cursor-pointer text-xs font-semibold"
                        title="View Official Scorecard"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Scorecard</span>
                      </button>
                      <button
                        onClick={() => handleDeleteRecord(ev.id)}
                        className="btn-tactile p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 hover:text-rose-100 border border-rose-500/20 transition-all cursor-pointer"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {activeScorecard && (
        <ScorecardModal
          evaluation={activeScorecard}
          onClose={() => setActiveScorecard(null)}
        />
      )}
    </div>
  );
}
