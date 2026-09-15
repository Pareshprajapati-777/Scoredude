import express from 'express';
import cors from 'cors';
import db from './db.js';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Helper to compute grade & status
function calculateGradeAndStatus(percentage) {
  if (percentage >= 90) return { grade: 'A+', status: 'Distinction', color: '#10b981' };
  if (percentage >= 80) return { grade: 'A', status: 'Excellent', color: '#38bdf8' };
  if (percentage >= 70) return { grade: 'B+', status: 'Very Good', color: '#6366f1' };
  if (percentage >= 60) return { grade: 'B', status: 'Good', color: '#eab308' };
  if (percentage >= 50) return { grade: 'C', status: 'Average', color: '#f97316' };
  return { grade: 'F', status: 'Needs Improvement', color: '#ef4444' };
}

// ================= TOPICS APIS (100% Dynamic) =================

// GET all active topics
app.get('/api/topics', (req, res) => {
  try {
    const all = req.query.all === 'true';
    const query = all
      ? 'SELECT * FROM topics ORDER BY order_index ASC, id ASC'
      : 'SELECT * FROM topics WHERE is_active = 1 ORDER BY order_index ASC, id ASC';
    const topics = db.prepare(query).all();
    res.json({ success: true, data: topics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// CREATE a new topic
app.post('/api/topics', (req, res) => {
  try {
    const { name, description, max_score = 10, weightage = 1.0, icon = 'Award', color = '#6366f1' } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Topic name is required' });
    }

    const maxOrder = db.prepare('SELECT MAX(order_index) as maxOrder FROM topics').get().maxOrder || 0;

    const stmt = db.prepare(`
      INSERT INTO topics (name, description, max_score, weightage, icon, color, order_index, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `);

    const result = stmt.run(name.trim(), description || '', Number(max_score) || 10, Number(weightage) || 1.0, icon, color, maxOrder + 1);
    const newTopic = db.prepare('SELECT * FROM topics WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({ success: true, data: newTopic, message: 'Topic created successfully' });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ success: false, message: 'A topic with this name already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// UPDATE a topic
app.put('/api/topics/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, max_score, weightage, icon, color, order_index, is_active } = req.body;

    const existing = db.prepare('SELECT * FROM topics WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    const stmt = db.prepare(`
      UPDATE topics
      SET name = COALESCE(?, name),
          description = COALESCE(?, description),
          max_score = COALESCE(?, max_score),
          weightage = COALESCE(?, weightage),
          icon = COALESCE(?, icon),
          color = COALESCE(?, color),
          order_index = COALESCE(?, order_index),
          is_active = COALESCE(?, is_active)
      WHERE id = ?
    `);

    stmt.run(
      name !== undefined ? name.trim() : null,
      description !== undefined ? description : null,
      max_score !== undefined ? Number(max_score) : null,
      weightage !== undefined ? Number(weightage) : null,
      icon !== undefined ? icon : null,
      color !== undefined ? color : null,
      order_index !== undefined ? Number(order_index) : null,
      is_active !== undefined ? (is_active ? 1 : 0) : null,
      id
    );

    const updated = db.prepare('SELECT * FROM topics WHERE id = ?').get(id);
    res.json({ success: true, data: updated, message: 'Topic updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE a topic (soft or hard)
app.delete('/api/topics/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { hard } = req.query;

    if (hard === 'true') {
      db.prepare('DELETE FROM topics WHERE id = ?').run(id);
      return res.json({ success: true, message: 'Topic permanently removed' });
    }

    // Default toggle or soft delete
    db.prepare('UPDATE topics SET is_active = 0 WHERE id = ?').run(id);
    res.json({ success: true, message: 'Topic deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ================= STUDENTS APIS =================

// GET all students
app.get('/api/students', (req, res) => {
  try {
    const search = req.query.search;
    let query = `
      SELECT s.*,
        COUNT(e.id) as evaluations_count,
        ROUND(AVG(e.percentage), 1) as average_percentage,
        MAX(e.created_at) as last_evaluated_at
      FROM students s
      LEFT JOIN evaluations e ON s.id = e.student_id
    `;
    const params = [];

    if (search) {
      query += ` WHERE s.name LIKE ? OR s.roll_no LIKE ? OR s.batch LIKE ?`;
      const sTerm = `%${search}%`;
      params.push(sTerm, sTerm, sTerm);
    }

    query += ` GROUP BY s.id ORDER BY s.name ASC`;

    const students = db.prepare(query).all(...params);
    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// CREATE a student
app.post('/api/students', (req, res) => {
  try {
    const { name, roll_no, email, batch = 'Batch 2026', avatar_color = '#38bdf8' } = req.body;
    if (!name || !roll_no) {
      return res.status(400).json({ success: false, message: 'Student name and Roll No are required' });
    }

    const stmt = db.prepare(`
      INSERT INTO students (name, roll_no, email, batch, avatar_color)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(name.trim(), roll_no.trim().toUpperCase(), email ? email.trim() : null, batch.trim(), avatar_color);
    const newStudent = db.prepare('SELECT * FROM students WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({ success: true, data: newStudent, message: 'Student registered successfully' });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ success: false, message: 'Student with this Roll No already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// UPDATE a student
app.put('/api/students/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, roll_no, email, batch, avatar_color } = req.body;

    const existing = db.prepare('SELECT * FROM students WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const stmt = db.prepare(`
      UPDATE students
      SET name = COALESCE(?, name),
          roll_no = COALESCE(?, roll_no),
          email = COALESCE(?, email),
          batch = COALESCE(?, batch),
          avatar_color = COALESCE(?, avatar_color)
      WHERE id = ?
    `);

    stmt.run(
      name !== undefined ? name.trim() : null,
      roll_no !== undefined ? roll_no.trim().toUpperCase() : null,
      email !== undefined ? email.trim() : null,
      batch !== undefined ? batch.trim() : null,
      avatar_color !== undefined ? avatar_color : null,
      id
    );

    const updated = db.prepare('SELECT * FROM students WHERE id = ?').get(id);
    res.json({ success: true, data: updated, message: 'Student updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE a student
app.delete('/api/students/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM students WHERE id = ?').run(id);
    res.json({ success: true, message: 'Student and related records deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ================= EVALUATIONS / SCORING APIS =================

// SUBMIT a new score evaluation
app.post('/api/evaluations', (req, res) => {
  const transaction = db.transaction((payload) => {
    const {
      student_id,
      evaluator_name = 'Evaluator Panel',
      topic_scores = [],
      feedback = '',
      strengths = [],
      improvements = [],
      evaluation_date = new Date().toISOString().split('T')[0]
    } = payload;

    if (!student_id) {
      throw new Error('Student ID is required');
    }

    if (!Array.isArray(topic_scores) || topic_scores.length === 0) {
      throw new Error('At least one topic score is required');
    }

    let total_score = 0;
    let max_possible = 0;

    topic_scores.forEach(item => {
      const score = Math.max(0, Math.min(Number(item.score) || 0, Number(item.max_score) || 10));
      const maxScore = Number(item.max_score) || 10;
      total_score += score;
      max_possible += maxScore;
    });

    const percentage = max_possible > 0 ? Number(((total_score / max_possible) * 100).toFixed(1)) : 0;
    const { grade, status } = calculateGradeAndStatus(percentage);

    const insertEval = db.prepare(`
      INSERT INTO evaluations (
        student_id, evaluator_name, total_score, max_possible, percentage,
        grade, status, feedback, strengths, improvements, evaluation_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertEval.run(
      student_id,
      evaluator_name.trim(),
      Number(total_score.toFixed(1)),
      Number(max_possible.toFixed(1)),
      percentage,
      grade,
      status,
      feedback.trim(),
      JSON.stringify(strengths),
      JSON.stringify(improvements),
      evaluation_date
    );

    const evaluation_id = result.lastInsertRowid;

    const insertScoreItem = db.prepare(`
      INSERT INTO evaluation_scores (
        evaluation_id, topic_id, topic_name, score, max_score, percentage, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    topic_scores.forEach(item => {
      const score = Math.max(0, Math.min(Number(item.score) || 0, Number(item.max_score) || 10));
      const maxScore = Number(item.max_score) || 10;
      const pct = maxScore > 0 ? Number(((score / maxScore) * 100).toFixed(1)) : 0;

      insertScoreItem.run(
        evaluation_id,
        item.topic_id || null,
        item.topic_name || 'General',
        Number(score.toFixed(1)),
        Number(maxScore.toFixed(1)),
        pct,
        item.notes || ''
      );
    });

    return evaluation_id;
  });

  try {
    const evaluationId = transaction(req.body);
    const evaluation = db.prepare(`
      SELECT e.*, s.name as student_name, s.roll_no, s.batch, s.avatar_color
      FROM evaluations e
      JOIN students s ON e.student_id = s.id
      WHERE e.id = ?
    `).get(evaluationId);

    const scores = db.prepare('SELECT * FROM evaluation_scores WHERE evaluation_id = ?').all(evaluationId);
    evaluation.scores = scores;
    evaluation.strengths = JSON.parse(evaluation.strengths || '[]');
    evaluation.improvements = JSON.parse(evaluation.improvements || '[]');

    res.status(201).json({
      success: true,
      data: evaluation,
      message: 'Score evaluated and saved to database successfully!'
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// GET all evaluations / records (with filtering, search, sorting)
app.get('/api/evaluations', (req, res) => {
  try {
    const { student_id, search, grade, batch, sort_by = 'created_at', order = 'DESC' } = req.query;

    let query = `
      SELECT e.*,
        s.name as student_name,
        s.roll_no,
        s.email as student_email,
        s.batch,
        s.avatar_color
      FROM evaluations e
      JOIN students s ON e.student_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (student_id) {
      query += ` AND e.student_id = ?`;
      params.push(student_id);
    }

    if (grade && grade !== 'ALL') {
      query += ` AND e.grade = ?`;
      params.push(grade);
    }

    if (batch && batch !== 'ALL') {
      query += ` AND s.batch = ?`;
      params.push(batch);
    }

    if (search) {
      query += ` AND (s.name LIKE ? OR s.roll_no LIKE ? OR e.feedback LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    const validSorts = ['created_at', 'total_score', 'percentage', 'student_name', 'evaluation_date'];
    const sortField = validSorts.includes(sort_by) ? (sort_by === 'student_name' ? 's.name' : `e.${sort_by}`) : 'e.created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY ${sortField} ${sortOrder}`;

    const evaluations = db.prepare(query).all(...params);

    const scoreItems = db.prepare('SELECT * FROM evaluation_scores').all();
    const scoresByEval = {};
    scoreItems.forEach(sc => {
      if (!scoresByEval[sc.evaluation_id]) scoresByEval[sc.evaluation_id] = [];
      scoresByEval[sc.evaluation_id].push(sc);
    });

    evaluations.forEach(ev => {
      ev.scores = scoresByEval[ev.id] || [];
      try {
        ev.strengths = JSON.parse(ev.strengths || '[]');
      } catch {
        ev.strengths = [];
      }
      try {
        ev.improvements = JSON.parse(ev.improvements || '[]');
      } catch {
        ev.improvements = [];
      }
    });

    res.json({ success: true, count: evaluations.length, data: evaluations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single evaluation by ID
app.get('/api/evaluations/:id', (req, res) => {
  try {
    const { id } = req.params;
    const evaluation = db.prepare(`
      SELECT e.*, s.name as student_name, s.roll_no, s.email as student_email, s.batch, s.avatar_color
      FROM evaluations e
      JOIN students s ON e.student_id = s.id
      WHERE e.id = ?
    `).get(id);

    if (!evaluation) {
      return res.status(404).json({ success: false, message: 'Evaluation record not found' });
    }

    evaluation.scores = db.prepare('SELECT * FROM evaluation_scores WHERE evaluation_id = ?').all(id);
    try {
      evaluation.strengths = JSON.parse(evaluation.strengths || '[]');
    } catch {
      evaluation.strengths = [];
    }
    try {
      evaluation.improvements = JSON.parse(evaluation.improvements || '[]');
    } catch {
      evaluation.improvements = [];
    }

    res.json({ success: true, data: evaluation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE evaluation
app.delete('/api/evaluations/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM evaluations WHERE id = ?').run(id);
    res.json({ success: true, message: 'Evaluation deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ================= ANALYTICS & SUMMARY STATS =================

app.get('/api/analytics/stats', (req, res) => {
  try {
    const totalStudents = db.prepare('SELECT COUNT(*) as count FROM students').get().count;
    const totalTopics = db.prepare('SELECT COUNT(*) as count FROM topics WHERE is_active = 1').get().count;
    const totalEvaluations = db.prepare('SELECT COUNT(*) as count FROM evaluations').get().count;

    const avgScoreStats = db.prepare(`
      SELECT
        ROUND(AVG(percentage), 1) as avgPercentage,
        ROUND(MAX(percentage), 1) as highestPercentage,
        ROUND(MIN(percentage), 1) as lowestPercentage
      FROM evaluations
    `).get();

    const topicPerformance = db.prepare(`
      SELECT
        topic_name,
        ROUND(AVG(score), 2) as avg_score,
        ROUND(AVG(percentage), 1) as avg_percentage,
        COUNT(*) as evaluations_count
      FROM evaluation_scores
      GROUP BY topic_name
      ORDER BY avg_score DESC
    `).all();

    const gradeDistribution = db.prepare(`
      SELECT grade, COUNT(*) as count
      FROM evaluations
      GROUP BY grade
      ORDER BY count DESC
    `).all();

    const topPerformers = db.prepare(`
      SELECT
        s.id as student_id,
        s.name as student_name,
        s.roll_no,
        s.batch,
        s.avatar_color,
        ROUND(MAX(e.percentage), 1) as best_score,
        ROUND(AVG(e.percentage), 1) as avg_score,
        e.grade as best_grade,
        COUNT(e.id) as evaluations_count
      FROM students s
      JOIN evaluations e ON s.id = e.student_id
      GROUP BY s.id
      ORDER BY avg_score DESC, best_score DESC
      LIMIT 10
    `).all();

    const recentActivity = db.prepare(`
      SELECT
        e.id,
        s.name as student_name,
        s.roll_no,
        e.total_score,
        e.max_possible,
        e.percentage,
        e.grade,
        e.created_at
      FROM evaluations e
      JOIN students s ON e.student_id = s.id
      ORDER BY e.created_at DESC
      LIMIT 5
    `).all();

    res.json({
      success: true,
      data: {
        totalStudents,
        totalTopics,
        totalEvaluations,
        avgPercentage: avgScoreStats.avgPercentage || 0,
        highestPercentage: avgScoreStats.highestPercentage || 0,
        lowestPercentage: avgScoreStats.lowestPercentage || 0,
        topicPerformance,
        gradeDistribution,
        topPerformers,
        recentActivity
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Listen
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
