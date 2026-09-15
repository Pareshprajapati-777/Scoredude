import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Edit2,
  BookOpen,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Hash,
  Palette
} from 'lucide-react';

const PRESET_COLORS = [
  '#06b6d4', // Cyan
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#f43f5e', // Rose
  '#3b82f6', // Blue
];

const PRESET_ICONS = ['FileText', 'Zap', 'MessageSquare', 'BookOpen', 'Award', 'Target', 'Brain', 'Code', 'Compass', 'Flame'];

export default function TopicManager({ topics, onRefreshTopics }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    max_score: 10,
    weightage: 1.0,
    icon: 'Award',
    color: '#6366f1'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const openCreateModal = () => {
    setEditingTopic(null);
    setFormData({
      name: '',
      description: '',
      max_score: 10,
      weightage: 1.0,
      icon: 'Award',
      color: PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]
    });
    setIsModalOpen(true);
    setMessage(null);
  };

  const openEditModal = (topic) => {
    setEditingTopic(topic);
    setFormData({
      name: topic.name,
      description: topic.description || '',
      max_score: topic.max_score,
      weightage: topic.weightage || 1.0,
      icon: topic.icon || 'Award',
      color: topic.color || '#6366f1'
    });
    setIsModalOpen(true);
    setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const url = editingTopic ? `/api/topics/${editingTopic.id}` : '/api/topics';
      const method = editingTopic ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to save topic');
      }

      setMessage({ type: 'success', text: json.message });
      setTimeout(() => {
        setIsModalOpen(false);
        onRefreshTopics();
      }, 800);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (topicId) => {
    if (!window.confirm('Are you sure you want to deactivate or remove this scoring topic?')) return;
    try {
      const res = await fetch(`/api/topics/${topicId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        onRefreshTopics();
      }
    } catch (err) {
      alert('Error deleting topic: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Dynamic Scoring Topics (100% Configurable)</h2>
              <p className="text-sm text-slate-400">Add, customize or re-weight topics dynamically. Changes reflect in real-time scoring.</p>
            </div>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Topic</span>
        </button>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {topics.map((topic, index) => (
          <motion.div
            key={topic.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden group"
          >
            {/* Ambient accent background glow */}
            <div
              className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40"
              style={{ backgroundColor: topic.color || '#6366f1' }}
            />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-inner"
                  style={{ backgroundColor: `${topic.color}33`, borderColor: `${topic.color}88`, borderWidth: '1px' }}
                >
                  <span style={{ color: topic.color }}>#{index + 1}</span>
                </div>
                <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(topic)}
                    className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Edit Topic"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(topic.id)}
                    className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/30 text-rose-400 transition-colors cursor-pointer"
                    title="Remove Topic"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white tracking-wide mb-1 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: topic.color }} />
                {topic.name}
              </h3>
              <p className="text-sm text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                {topic.description || 'Standard evaluation pillar'}
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-slate-500" /> Max Score: <b className="text-slate-200">{topic.max_score} pts</b>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-800/90 text-indigo-300 border border-slate-700">
                Weight: {topic.weightage}x
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal for Add / Edit Topic */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="glass-panel w-full max-w-lg p-6 sm:p-8 rounded-3xl relative overflow-hidden border border-white/20 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {editingTopic ? 'Edit Topic' : 'Create New Topic'}
                    </h3>
                    <p className="text-xs text-slate-400">Configure parameters for dynamic evaluation</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {message && (
                <div className={`p-4 rounded-xl mb-5 flex items-center gap-3 text-sm ${message.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
                  {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  <span>{message.text}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Topic Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CV, Confidence, Communication, Knowledge, Coding..."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-slate-500 text-sm outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Description / Evaluation Criteria
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Describe what specific skills or parameters are assessed..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-slate-500 text-sm outline-none transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Max Score (Out of)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={formData.max_score}
                      onChange={(e) => setFormData({ ...formData, max_score: Number(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700 focus:border-indigo-500 text-white text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Weight Multiplier
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="5.0"
                      value={formData.weightage}
                      onChange={(e) => setFormData({ ...formData, weightage: Number(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700 focus:border-indigo-500 text-white text-sm outline-none"
                    />
                  </div>
                </div>

                {/* Color Theme Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-slate-400" /> Color Accent
                  </label>
                  <div className="flex items-center gap-3 flex-wrap">
                    {PRESET_COLORS.map((c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setFormData({ ...formData, color: c })}
                        style={{ backgroundColor: c }}
                        className={`w-8 h-8 rounded-full border-2 transition-transform ${formData.color === c ? 'scale-125 border-white shadow-lg' : 'border-transparent opacity-80 hover:opacity-100 hover:scale-110'}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/30 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : editingTopic ? 'Update Topic' : 'Create Topic'}
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
