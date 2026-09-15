import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '..', 'score.db');
const db = new Database(dbPath);

// Enable foreign keys and WAL mode for smooth concurrent reads/writes
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDatabase() {
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      roll_no TEXT UNIQUE NOT NULL,
      email TEXT,
      batch TEXT DEFAULT 'Batch 2026',
      avatar_color TEXT DEFAULT '#38bdf8',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS topics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      max_score REAL DEFAULT 10,
      weightage REAL DEFAULT 1.0,
      icon TEXT DEFAULT 'Award',
      color TEXT DEFAULT '#6366f1',
      order_index INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS evaluations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      evaluator_name TEXT DEFAULT 'Chief Evaluator',
      total_score REAL NOT NULL,
      max_possible REAL NOT NULL,
      percentage REAL NOT NULL,
      grade TEXT NOT NULL,
      status TEXT NOT NULL,
      feedback TEXT,
      strengths TEXT,
      improvements TEXT,
      evaluation_date DATE DEFAULT (date('now')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS evaluation_scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      evaluation_id INTEGER NOT NULL,
      topic_id INTEGER,
      topic_name TEXT NOT NULL,
      score REAL NOT NULL,
      max_score REAL NOT NULL DEFAULT 10,
      percentage REAL NOT NULL,
      notes TEXT,
      FOREIGN KEY (evaluation_id) REFERENCES evaluations(id) ON DELETE CASCADE,
      FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL
    );
  `);

  // Seed default topics if empty
  const topicCount = db.prepare('SELECT COUNT(*) as count FROM topics').get().count;
  if (topicCount === 0) {
    const insertTopic = db.prepare(`
      INSERT INTO topics (name, description, max_score, weightage, icon, color, order_index, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `);

    const defaultTopics = [
      {
        name: 'CV',
        description: 'Resume structure, experience alignment, formatting & portfolio quality',
        max_score: 10,
        weightage: 1.0,
        icon: 'FileText',
        color: '#06b6d4',
        order_index: 1
      },
      {
        name: 'Confidence',
        description: 'Posture, body language, composure under pressure & eye contact',
        max_score: 10,
        weightage: 1.0,
        icon: 'Zap',
        color: '#f59e0b',
        order_index: 2
      },
      {
        name: 'Communication',
        description: 'Verbal articulation, active listening, fluency & clarity',
        max_score: 10,
        weightage: 1.0,
        icon: 'MessageSquare',
        color: '#ec4899',
        order_index: 3
      },
      {
        name: 'Knowledge',
        description: 'Technical depth, domain expertise, analytical & problem-solving ability',
        max_score: 10,
        weightage: 1.0,
        icon: 'BookOpen',
        color: '#10b981',
        order_index: 4
      }
    ];

    for (const t of defaultTopics) {
      insertTopic.run(t.name, t.description, t.max_score, t.weightage, t.icon, t.color, t.order_index);
    }
  }

  // Seed initial students if empty
  const studentCount = db.prepare('SELECT COUNT(*) as count FROM students').get().count;
  if (studentCount === 0) {
    const insertStudent = db.prepare(`
      INSERT INTO students (name, roll_no, email, batch, avatar_color)
      VALUES (?, ?, ?, ?, ?)
    `);

    const initialStudents = [
      { name: 'Aarav Sharma', roll_no: 'STU-2026-001', email: 'aarav.sharma@example.edu', batch: 'Alpha Batch', avatar_color: '#38bdf8' },
      { name: 'Priya Patel', roll_no: 'STU-2026-002', email: 'priya.patel@example.edu', batch: 'Alpha Batch', avatar_color: '#f43f5e' },
      { name: 'Rohan Mehta', roll_no: 'STU-2026-003', email: 'rohan.mehta@example.edu', batch: 'Beta Batch', avatar_color: '#10b981' },
      { name: 'Ananya Verma', roll_no: 'STU-2026-004', email: 'ananya.verma@example.edu', batch: 'Alpha Batch', avatar_color: '#a855f7' },
      { name: 'Kabir Sen', roll_no: 'STU-2026-005', email: 'kabir.sen@example.edu', batch: 'Gamma Batch', avatar_color: '#eab308' },
      { name: 'Sneha Roy', roll_no: 'STU-2026-006', email: 'sneha.roy@example.edu', batch: 'Beta Batch', avatar_color: '#ec4899' }
    ];

    for (const s of initialStudents) {
      insertStudent.run(s.name, s.roll_no, s.email, s.batch, s.avatar_color);
    }

    const topics = db.prepare('SELECT * FROM topics ORDER BY order_index ASC').all();
    const students = db.prepare('SELECT * FROM students').all();

    const sampleScores = [
      { studentIdx: 0, scores: [9, 8.5, 9, 8], feedback: 'Outstanding resume and communication. Very clear technical grasp.', strengths: '["Professional CV", "Great diction", "Sharp problem-solving"]', improvements: '["Deepen advanced architecture knowledge"]' },
      { studentIdx: 1, scores: [8.5, 9.5, 9, 9], feedback: 'Exceptional confidence and articulation. Impressive domain depth.', strengths: '["High energy & poise", "Articulate explanations", "Strong fundamentals"]', improvements: '["Structure project achievements in CV with metrics"]' },
      { studentIdx: 2, scores: [7.5, 7, 7.5, 8.5], feedback: 'Strong technical knowledge. Needs slight polish in body language.', strengths: '["Solid logic & coding ability", "Honest approach"]', improvements: '["Maintain steady eye contact", "Add live demo links to CV"]' },
      { studentIdx: 3, scores: [9.5, 8.5, 9.5, 9], feedback: 'Top tier candidate. Excellent balance across all four pillars.', strengths: '["Flawless CV design", "Impeccable communication", "Thorough preparation"]', improvements: '["Keep up the phenomenal consistency"]' }
    ];

    const insertEval = db.prepare(`
      INSERT INTO evaluations (student_id, evaluator_name, total_score, max_possible, percentage, grade, status, feedback, strengths, improvements, evaluation_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertScore = db.prepare(`
      INSERT INTO evaluation_scores (evaluation_id, topic_id, topic_name, score, max_score, percentage, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    for (const item of sampleScores) {
      const student = students[item.studentIdx];
      if (!student) continue;

      let total = 0;
      let maxPossible = 0;
      item.scores.forEach((sc, idx) => {
        const top = topics[idx];
        const max = top ? top.max_score : 10;
        total += sc;
        maxPossible += max;
      });

      const pct = (total / maxPossible) * 100;
      let grade = 'A';
      let status = 'Passed';
      if (pct >= 90) { grade = 'A+'; status = 'Distinction'; }
      else if (pct >= 80) { grade = 'A'; status = 'Excellent'; }
      else if (pct >= 70) { grade = 'B+'; status = 'Very Good'; }
      else if (pct >= 60) { grade = 'B'; status = 'Good'; }
      else { grade = 'C'; status = 'Needs Improvement'; }

      const evalResult = insertEval.run(
        student.id,
        'Senior Interview Panel',
        Number(total.toFixed(1)),
        maxPossible,
        Number(pct.toFixed(1)),
        grade,
        status,
        item.feedback,
        item.strengths,
        item.improvements,
        new Date().toISOString().split('T')[0]
      );

      const evalId = evalResult.lastInsertRowid;
      item.scores.forEach((sc, idx) => {
        const top = topics[idx];
        if (top) {
          const scorePct = (sc / top.max_score) * 100;
          insertScore.run(evalId, top.id, top.name, sc, top.max_score, Number(scorePct.toFixed(1)), 'Initial assessment');
        }
      });
    }
  }

  console.log('Database initialized successfully with schema and seed data.');
}

initDatabase();

export default db;
