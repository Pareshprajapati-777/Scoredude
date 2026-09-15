import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database,
  Search,
  Filter,
  Trash2,
  Eye,
  Calendar,
  Trophy,
  Download,
  TrendingUp,
  Award,
  Layers,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';
import { getGradeBadgeInfo } from '../utils/sound';
import ScorecardModal from './ScorecardModal';

export default function RecordsViewSection({
  evaluations,
  onRefreshRecords,
  onSelectForEvaluation
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('ALL');
  const [batchFilter, setBatchFilter] = useState('ALL');
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [activeScorecard, setActiveScorecard] = useState(null);

  // Extract unique batches for filter dropdown
  const uniqueBatches = useMemo(() => {
    const set = new Set();
    evaluations.forEach((e) => {
      if (e.batch) set.add(e.batch);
    });
    return Array.from(set);
  }, [evaluations]);

  // Filter & Sort evaluations
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
    if (!window.confirm('Are you sure you want to permanently delete this evaluation record from score.db?')) return;
    try {
      const res = await fetch(`/api/evaluations/${evalId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
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
    link.setAttribute('download', `score_records_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Search & Filters */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Database Records & History (score.db)</h2>
              <p className="text-xs text-slate-400">
                Search, filter, view radar breakdowns, and generate printable scorecards.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer border border-white/10 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-white/10">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search student or roll no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 focus:border-cyan-500 text-white text-xs outline-none transition-all placeholder-slate-500"
            />
          </div>

          {/* Grade Filter */}
          <div className="relative">
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 focus:border-cyan-500 text-white text-xs outline-none cursor-pointer appearance-none"
            >
              <option value="ALL">All Grades (A+, A, B+, B...)</option>
              <option value="A+">Grade A+ (Distinction)</option>
              <option value="A">Grade A (Excellent)</option>
              <option value="B+">Grade B+ (Very Good)</option>
              <option value="B">Grade B (Good)</option>
              <option value="C">Grade C (Average)</option>
              <option value="F">Grade F (Needs Improvement)</option>
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
              ▼
            </div>
          </div>

          {/* Batch Filter */}
          <div className="relative">
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 focus:border-cyan-500 text-white text-xs outline-none cursor-pointer appearance-none"
            >
              <option value="ALL">All Batches</option>
              {uniqueBatches.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
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
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 focus:border-cyan-500 text-white text-xs outline-none cursor-pointer appearance-none"
            >
              <option value="created_at-desc">Sort by: Newest First</option>
              <option value="created_at-asc">Sort by: Oldest First</option>
              <option value="percentage-desc">Sort by: Highest Score %</option>
              <option value="percentage-asc">Sort by: Lowest Score %</option>
              <option value="student_name-asc">Sort by: Name (A-Z)</option>
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
              ▼
            </div>
          </div>
        </div>
      </div>

      {/* Evaluations Table / Cards List */}
      <div className="space-y-4">
        {filteredEvaluations.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-3xl border border-white/10">
            <Database className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-50" />
            <h3 className="text-base font-bold text-white mb-1">No evaluation records match your filter</h3>
            <p className="text-xs text-slate-400">Try adjusting your search keywords or grade filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredEvaluations.map((ev, index) => {
              const gradeBadge = getGradeBadgeInfo(ev.percentage);

              return (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="glass-card p-5 sm:p-6 rounded-2xl border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-indigo-500/40 transition-all group"
                >
                  {/* Left: Student Info & Date */}
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
                        <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {ev.student_name}
                        </h3>
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] font-mono text-cyan-400 font-semibold border border-slate-700">
                          {ev.roll_no}
                        </span>
                        <span className="text-xs text-slate-400">• {ev.batch || 'Batch 2026'}</span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {ev.evaluation_date || ev.created_at?.split(' ')[0]}
                        </span>
                        <span>• Evaluated by: <b className="text-slate-300">{ev.evaluator_name}</b></span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Topic Scores Pills */}
                  <div className="flex items-center gap-2 flex-wrap max-w-xl">
                    {ev.scores?.map((sc, scIdx) => (
                      <div
                        key={scIdx}
                        className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/5 text-xs flex items-center gap-1.5 shadow-sm"
                      >
                        <span className="text-slate-400">{sc.topic_name}:</span>
                        <span className="font-bold text-cyan-300">{sc.score}</span>
                      </div>
                    ))}
                  </div>

                  {/* Right: Score Total, Grade & Actions */}
                  <div className="flex items-center justify-between lg:justify-end gap-5 border-t lg:border-t-0 pt-4 lg:pt-0 border-white/10">
                    <div className="text-right">
                      <div className="flex items-baseline justify-end gap-1.5">
                        <span className="text-2xl font-black text-white">{ev.total_score}</span>
                        <span className="text-xs text-slate-400 font-semibold">/ {ev.max_possible}</span>
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
                        className="p-2.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 hover:text-white border border-indigo-500/30 transition-all cursor-pointer"
                        title="View Official Scorecard"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRecord(ev.id)}
                        className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/30 text-rose-400 transition-all cursor-pointer"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detailed Modal */}
      {activeScorecard && (
        <ScorecardModal
          evaluation={activeScorecard}
          onClose={() => setActiveScorecard(null)}
        />
      )}
    </div>
  );
}
