import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserPlus,
  Sliders,
  Plus,
  Trash2,
  Edit2,
  Search,
  Mail,
  GraduationCap,
  Award,
  Hash,
  Palette,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Zap,
  BookOpen,
  MessageSquare
} from 'lucide-react';
import { playSoundEffect } from '../utils/sound';

const PRESET_TOPIC_COLORS = [
  '#06b6d4', // Cyan
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#f43f5e', // Rose
  '#3b82f6', // Blue
];

const PRESET_STUDENT_COLORS = [
  '#38bdf8', '#818cf8', '#f43f5e', '#10b981', '#f59e0b', '#ec4899', '#a855f7', '#14b8a6'
];

export default function ManageTab({
  students,
  topics,
  onRefreshData,
  onSelectStudentForScore
}) {
  const [activeSection, setActiveSection] = useState('students'); // 'students' | 'topics'

  // Student modal states
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentForm, setStudentForm] = useState({
    name: '',
    roll_no: '',
    email: '',
    batch: 'Batch 2026',
    avatar_color: '#38bdf8'
  });

  // Topic modal states
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [topicSearch, setTopicSearch] = useState('');
  const [topicForm, setTopicForm] = useState({
    name: '',
    description: '',
    max_score: 10,
    weightage: 1.0,
    icon: 'Award',
    color: '#6366f1'
  });

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Student Modal Openers
  const openCreateStudent = () => {
    setEditingStudent(null);
    setStudentForm({
      name: '',
      roll_no: `STU-2026-${String(students.length + 1).padStart(3, '0')}`,
      email: '',
      batch: 'Batch 2026',
      avatar_color: PRESET_STUDENT_COLORS[Math.floor(Math.random() * PRESET_STUDENT_COLORS.length)]
    });
    setIsStudentModalOpen(true);
    setNotification(null);
  };

  const openEditStudent = (student) => {
    setEditingStudent(student);
    setStudentForm({
      name: student.name,
      roll_no: student.roll_no,
      email: student.email || '',
      batch: student.batch || 'Batch 2026',
      avatar_color: student.avatar_color || '#38bdf8'
    });
    setIsStudentModalOpen(true);
    setNotification(null);
  };

  // Student Form Submit
  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNotification(null);

    try {
      const url = editingStudent ? `/api/students/${editingStudent.id}` : '/api/students';
      const method = editingStudent ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentForm)
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Failed to save student');

      playSoundEffect('success');
      setNotification({ type: 'success', text: json.message });
      setTimeout(() => {
        setIsStudentModalOpen(false);
        onRefreshData();
      }, 700);
    } catch (err) {
      setNotification({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Student Delete
  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this candidate and related evaluation records?')) return;
    try {
      const res = await fetch(`/api/students/${studentId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        playSoundEffect('click');
        onRefreshData();
      }
    } catch (err) {
      alert('Error deleting student: ' + err.message);
    }
  };

  // Topic Modal Openers
  const openCreateTopic = () => {
    setEditingTopic(null);
    setTopicForm({
      name: '',
      description: '',
      max_score: 10,
      weightage: 1.0,
      icon: 'Award',
      color: PRESET_TOPIC_COLORS[Math.floor(Math.random() * PRESET_TOPIC_COLORS.length)]
    });
    setIsTopicModalOpen(true);
    setNotification(null);
  };

  const openEditTopic = (topic) => {
    setEditingTopic(topic);
    setTopicForm({
      name: topic.name,
      description: topic.description || '',
      max_score: topic.max_score,
      weightage: topic.weightage || 1.0,
      icon: topic.icon || 'Award',
      color: topic.color || '#6366f1'
    });
    setIsTopicModalOpen(true);
    setNotification(null);
  };

  // Topic Form Submit
  const handleTopicSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNotification(null);

    try {
      const url = editingTopic ? `/api/topics/${editingTopic.id}` : '/api/topics';
      const method = editingTopic ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(topicForm)
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Failed to save topic');

      playSoundEffect('success');
      setNotification({ type: 'success', text: json.message });
      setTimeout(() => {
        setIsTopicModalOpen(false);
        onRefreshData();
      }, 700);
    } catch (err) {
      setNotification({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Topic Delete
  const handleDeleteTopic = async (topicId) => {
    if (!window.confirm('Are you sure you want to deactivate or remove this scoring category?')) return;
    try {
      const res = await fetch(`/api/topics/${topicId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        playSoundEffect('click');
        onRefreshData();
      }
    } catch (err) {
      alert('Error deleting topic: ' + err.message);
    }
  };

  // Filtered lists
  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.roll_no.toLowerCase().includes(studentSearch.toLowerCase()) ||
    (s.batch && s.batch.toLowerCase().includes(studentSearch.toLowerCase()))
  );

  const filteredTopics = topics.filter(t =>
    t.name.toLowerCase().includes(topicSearch.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(topicSearch.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      {/* Top Banner with Section Tabs */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/15 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/10 text-white border border-white/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Manage Students & Categories</h2>
              <p className="text-xs text-rose-200/70">Add, edit, or delete candidates and scoring categories in <code className="text-rose-300 font-mono">score.db</code>.</p>
            </div>
          </div>
        </div>

        {/* Section Switcher & Action Buttons - Emil Kowalski style interactive pill tabs */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex items-center p-1 rounded-2xl bg-[#140003]/90 border border-white/15 backdrop-blur-md">
            <button
              onClick={() => { setActiveSection('students'); playSoundEffect('click'); }}
              className={`relative z-10 btn-tactile flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors duration-160 cursor-pointer ${
                activeSection === 'students'
                  ? 'text-black'
                  : 'text-rose-200/70 hover:text-white'
              }`}
            >
              {activeSection === 'students' && (
                <motion.div
                  layoutId="manageSectionPill"
                  className="absolute inset-0 bg-white rounded-xl shadow-md -z-10"
                  transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
                />
              )}
              <Users className="w-4 h-4" />
              <span>Students ({students.length})</span>
            </button>

            <button
              onClick={() => { setActiveSection('topics'); playSoundEffect('click'); }}
              className={`relative z-10 btn-tactile flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors duration-160 cursor-pointer ${
                activeSection === 'topics'
                  ? 'text-black'
                  : 'text-rose-200/70 hover:text-white'
              }`}
            >
              {activeSection === 'topics' && (
                <motion.div
                  layoutId="manageSectionPill"
                  className="absolute inset-0 bg-white rounded-xl shadow-md -z-10"
                  transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
                />
              )}
              <Sliders className="w-4 h-4" />
              <span>Categories ({topics.length})</span>
            </button>
          </div>

          {activeSection === 'students' ? (
            <button
              onClick={openCreateStudent}
              className="btn-pill btn-tactile flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-black hover:bg-rose-50 font-bold text-xs shadow-lg cursor-pointer border border-white/30"
            >
              <UserPlus className="w-4 h-4 text-rose-600" />
              <span>+ Add Student</span>
            </button>
          ) : (
            <button
              onClick={openCreateTopic}
              className="btn-pill btn-tactile flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-black hover:bg-rose-50 font-bold text-xs shadow-lg cursor-pointer border border-white/30"
            >
              <Plus className="w-4 h-4 text-rose-600" />
              <span>+ Add Category</span>
            </button>
          )}
        </div>
      </div>

      {/* SECTION 1: STUDENTS DIRECTORY */}
      {activeSection === 'students' && (
        <div className="space-y-6">
          {/* Search Header */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-200/60" />
              <input
                type="text"
                placeholder="Search students by name, roll, or batch..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#180104]/85 border border-white/20 focus:border-white text-white text-xs outline-none transition-all placeholder-rose-200/40"
              />
            </div>

            <span className="text-xs text-rose-200/70 font-medium">
              Showing <b className="text-white">{filteredStudents.length}</b> candidates
            </span>
          </div>

          {/* Students Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredStudents.map((student, idx) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.03, ease: [0.16, 1, 0.3, 1] }}
                className="glass-card p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden group border border-white/15 hover:border-white/30 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3.5">
                      <div
                        className="w-13 h-13 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg relative"
                        style={{
                          backgroundColor: student.avatar_color || '#38bdf8',
                          boxShadow: `0 0 20px ${student.avatar_color || '#38bdf8'}33`
                        }}
                      >
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-rose-200 transition-colors">
                          {student.name}
                        </h3>
                        <p className="text-xs font-mono text-rose-300 font-semibold">{student.roll_no}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditStudent(student)}
                        className="btn-tactile p-2 rounded-xl bg-white/10 hover:bg-white/20 text-rose-100 hover:text-white border border-white/15 transition-all cursor-pointer"
                        title="Edit Student"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(student.id)}
                        className="btn-tactile p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 hover:text-rose-100 border border-rose-500/20 transition-all cursor-pointer"
                        title="Delete Student"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 py-3 border-y border-white/10 my-2 text-xs text-rose-200/70">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-rose-300/80" /> Batch:
                      </span>
                      <span className="text-white font-medium">{student.batch || 'Batch 2026'}</span>
                    </div>
                    {student.email && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-rose-300/80" /> Email:
                        </span>
                        <span className="text-rose-100 truncate max-w-[150px]">{student.email}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-rose-300/80" /> Evaluated:
                      </span>
                      <span className="text-amber-300 font-bold">{student.evaluations_count || 0} time(s)</span>
                    </div>
                    {student.average_percentage !== null && student.average_percentage !== undefined && (
                      <div className="flex items-center justify-between">
                        <span>Avg Performance:</span>
                        <span className="text-emerald-400 font-extrabold">{student.average_percentage}%</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    onClick={() => onSelectStudentForScore(student)}
                    className="btn-tactile group/btn w-full py-2.5 px-4 rounded-xl bg-white text-black hover:bg-rose-50 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md border border-white/40"
                  >
                    <span>Score Student</span>
                    <span className="text-sm transition-transform duration-160 group-hover/btn:translate-x-1">→</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: CATEGORIES & TOPICS */}
      {activeSection === 'topics' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-200/60" />
              <input
                type="text"
                placeholder="Search categories / topics..."
                value={topicSearch}
                onChange={(e) => setTopicSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#180104]/85 border border-white/20 focus:border-white text-white text-xs outline-none transition-all placeholder-rose-200/40"
              />
            </div>

            <span className="text-xs text-rose-200/70 font-medium">
              Showing <b className="text-white">{filteredTopics.length}</b> scoring pillars
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredTopics.map((topic, index) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.03, ease: [0.16, 1, 0.3, 1] }}
                className="glass-card p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden group border border-white/15 hover:border-white/30 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-base shadow-sm"
                      style={{ backgroundColor: `${topic.color}25`, borderColor: `${topic.color}66`, borderWidth: '1px' }}
                    >
                      <span style={{ color: topic.color }}>#{index + 1}</span>
                    </div>

                    <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditTopic(topic)}
                        className="btn-tactile p-2 rounded-xl bg-white/10 hover:bg-white/20 text-rose-100 hover:text-white border border-white/15 transition-all cursor-pointer"
                        title="Edit Category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTopic(topic.id)}
                        className="btn-tactile p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 hover:text-rose-100 border border-rose-500/20 transition-all cursor-pointer"
                        title="Remove Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1.5 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: topic.color }} />
                    {topic.name}
                  </h3>
                  <p className="text-xs text-rose-200/70 line-clamp-2 leading-relaxed mb-4">
                    {topic.description || 'Evaluation topic'}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-rose-200/70">
                  <span>Max: <b className="text-white">{topic.max_score} pts</b></span>
                  <span className="px-2.5 py-1 rounded-full bg-[#180104] text-rose-200 text-[11px] font-semibold border border-white/15">
                    Weight: {topic.weightage}x
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* STUDENT CREATE / EDIT MODAL */}
      <AnimatePresence>
        {isStudentModalOpen && (
          <div
            onClick={() => setIsStudentModalOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#240106]/85 backdrop-blur-md"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="crimson-panel-container w-full max-w-md p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-white/10 text-white border border-white/20">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {editingStudent ? 'Edit Student Profile' : 'Register New Student'}
                    </h3>
                    <p className="text-xs text-rose-200/70">Syncs directly to score.db</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsStudentModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-rose-100 hover:text-white transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {notification && (
                <div className={`p-3.5 rounded-xl mb-4 flex items-center gap-2.5 text-xs ${notification.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
                  {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{notification.text}</span>
                </div>
              )}

              <form onSubmit={handleStudentSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-rose-100 uppercase tracking-wider mb-2">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe, Priya Sharma"
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#180104]/85 border border-white/20 focus:border-white text-white text-xs outline-none placeholder-rose-200/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-rose-100 uppercase tracking-wider mb-2">
                    Roll / Candidate ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. STU-2026-042"
                    value={studentForm.roll_no}
                    onChange={(e) => setStudentForm({ ...studentForm, roll_no: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#180104]/85 border border-white/20 focus:border-white text-white font-mono text-xs outline-none placeholder-rose-200/40"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-rose-100 uppercase tracking-wider mb-2">
                      Batch / Class
                    </label>
                    <input
                      type="text"
                      value={studentForm.batch}
                      onChange={(e) => setStudentForm({ ...studentForm, batch: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#180104]/85 border border-white/20 focus:border-white text-white text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-rose-100 uppercase tracking-wider mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="email@example.com"
                      value={studentForm.email}
                      onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#180104]/85 border border-white/20 focus:border-white text-white text-xs outline-none placeholder-rose-200/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-rose-100 uppercase tracking-wider mb-2">
                    Avatar Theme Color
                  </label>
                  <div className="flex items-center gap-2.5">
                    {PRESET_STUDENT_COLORS.map((c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setStudentForm({ ...studentForm, avatar_color: c })}
                        style={{ backgroundColor: c }}
                        className={`w-7 h-7 rounded-full border-2 transition-all ${studentForm.avatar_color === c ? 'scale-125 border-white shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsStudentModalOpen(false)}
                    className="btn-tactile px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-rose-100 text-xs font-semibold cursor-pointer border border-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-pill btn-tactile px-6 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-rose-50 shadow-md cursor-pointer disabled:opacity-50 border border-white/30"
                  >
                    {loading ? 'Saving...' : editingStudent ? 'Update Profile' : 'Save Student'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TOPIC CREATE / EDIT MODAL */}
      <AnimatePresence>
        {isTopicModalOpen && (
          <div
            onClick={() => setIsTopicModalOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#240106]/85 backdrop-blur-md"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="crimson-panel-container w-full max-w-lg p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-white/10 text-white border border-white/20">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {editingTopic ? 'Edit Scoring Category' : 'Create New Category'}
                    </h3>
                    <p className="text-xs text-rose-200/70">Configure parameters for dynamic evaluation</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsTopicModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-rose-100 hover:text-white transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {notification && (
                <div className={`p-3.5 rounded-xl mb-4 flex items-center gap-2.5 text-xs ${notification.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
                  {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{notification.text}</span>
                </div>
              )}

              <form onSubmit={handleTopicSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-rose-100 uppercase tracking-wider mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CV, Confidence, Communication, Knowledge, Problem Solving..."
                    value={topicForm.name}
                    onChange={(e) => setTopicForm({ ...topicForm, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#180104]/85 border border-white/20 focus:border-white text-white text-xs outline-none placeholder-rose-200/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-rose-100 uppercase tracking-wider mb-2">
                    Evaluation Criteria / Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="What competencies or skills are evaluated under this pillar..."
                    value={topicForm.description}
                    onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#180104]/85 border border-white/20 focus:border-white text-white text-xs outline-none resize-none placeholder-rose-200/40"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-rose-100 uppercase tracking-wider mb-2">
                      Max Marks (Out of)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={topicForm.max_score}
                      onChange={(e) => setTopicForm({ ...topicForm, max_score: Number(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl bg-[#180104]/85 border border-white/20 focus:border-white text-white text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-rose-100 uppercase tracking-wider mb-2">
                      Weight Multiplier
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="5.0"
                      value={topicForm.weightage}
                      onChange={(e) => setTopicForm({ ...topicForm, weightage: Number(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl bg-[#180104]/85 border border-white/20 focus:border-white text-white text-xs outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-rose-100 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-rose-300" /> Color Accent
                  </label>
                  <div className="flex items-center gap-2.5">
                    {PRESET_TOPIC_COLORS.map((c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setTopicForm({ ...topicForm, color: c })}
                        style={{ backgroundColor: c }}
                        className={`w-7 h-7 rounded-full border-2 transition-all ${topicForm.color === c ? 'scale-125 border-white shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsTopicModalOpen(false)}
                    className="btn-tactile px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-rose-100 text-xs font-semibold cursor-pointer border border-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-pill btn-tactile px-6 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-rose-50 shadow-md cursor-pointer disabled:opacity-50 border border-white/30"
                  >
                    {loading ? 'Saving...' : editingTopic ? 'Update Category' : 'Save Category'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
