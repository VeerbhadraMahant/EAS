import { useState } from 'react'
import {
  ALL_QB_QUESTIONS,
  CONCEPT_MASTERY_LIST,
  MOCK_STUDENT,
  MOCK_TESTS,
  SAMPLE_JEE_QUESTIONS,
  type TestDef,
} from '../data/mockData'
import {
  AwardIcon,
  BarChartIcon,
  BookIcon,
  BookmarkIcon,
  CheckCircleIcon,
  ClockIcon,
  FilterIcon,
  LayersIcon,
  MinusCircleIcon,
  PlayIcon,
  SearchIcon,
  SparklesIcon,
  TargetIcon,
  TrendingUpIcon,
  XCircleIcon,
  ZapIcon,
} from '../icons'

export type StudentTab = 'tests' | 'progress' | 'analysis' | 'qb'

interface StudentHomeProps {
  onLaunchTest: (test: TestDef) => void
  initialTab?: StudentTab
}

export function StudentHome({ onLaunchTest, initialTab = 'tests' }: StudentHomeProps) {
  const [activeTab, setActiveTab] = useState<StudentTab>(initialTab)
  const [selectedExamFilter, setSelectedExamFilter] = useState<string>('all')

  // QB state
  const [qbSubject, setQbSubject] = useState<string>('All')
  const [qbDifficulty, setQbDifficulty] = useState<string>('All')
  const [qbSearch, setQbSearch] = useState<string>('')
  const [userQbAnswers, setUserQbAnswers] = useState<Record<string, number | string>>({})
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({})
  const [bookmarkedQs, setBookmarkedQs] = useState<Record<string, boolean>>({})

  // Analysis state
  const [analysisQFilter, setAnalysisQFilter] = useState<'all' | 'correct' | 'incorrect' | 'unattempted'>('all')

  // Filter tests
  const filteredTests = MOCK_TESTS.filter((t) => {
    if (selectedExamFilter === 'jee') return t.pattern === 'jee_main'
    if (selectedExamFilter === 'cet') return t.pattern === 'mht_cet'
    return true
  })

  // Filter QB questions
  const filteredQbQuestions = ALL_QB_QUESTIONS.filter((q) => {
    if (qbSubject !== 'All' && q.subject !== qbSubject) return false
    if (qbDifficulty !== 'All' && q.difficulty !== qbDifficulty.toLowerCase()) return false
    if (qbSearch.trim()) {
      const matchText = (q.text + ' ' + q.chapter + ' ' + (q.pyqInfo || '')).toLowerCase()
      if (!matchText.includes(qbSearch.toLowerCase())) return false
    }
    return true
  })

  return (
    <div className="student-workspace">
      {/* Student Sub-Navigation Bar */}
      <div className="student-nav-bar">
        <div className="container flex-between">
          <div className="nav-tab-group">
            <button
              className={`nav-tab-btn ${activeTab === 'tests' ? 'active' : ''}`}
              onClick={() => setActiveTab('tests')}
            >
              <LayersIcon />
              <span>Tests Module</span>
              <span className="tab-pill-badge">{MOCK_TESTS.filter((t) => t.status === 'assigned').length} Active</span>
            </button>

            <button
              className={`nav-tab-btn ${activeTab === 'progress' ? 'active' : ''}`}
              onClick={() => setActiveTab('progress')}
            >
              <TrendingUpIcon />
              <span>Progress Tracker</span>
            </button>

            <button
              className={`nav-tab-btn ${activeTab === 'analysis' ? 'active' : ''}`}
              onClick={() => setActiveTab('analysis')}
            >
              <BarChartIcon />
              <span>Detailed Analysis</span>
            </button>

            <button
              className={`nav-tab-btn ${activeTab === 'qb' ? 'active' : ''}`}
              onClick={() => setActiveTab('qb')}
            >
              <BookIcon />
              <span>Question Bank (QB)</span>
            </button>
          </div>

          <div className="student-header-meta">
            <div className="meta-badge target-badge">
              <TargetIcon style={{ width: 15, height: 15 }} />
              <span>{MOCK_STUDENT.targetExam}</span>
            </div>
            <div className="meta-badge percentile-badge">
              <AwardIcon style={{ width: 15, height: 15 }} />
              <span>{MOCK_STUDENT.currentPercentile} %ile</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      <main className="container student-content">
        {/* ================= 1. TESTS MODULE ================= */}
        {activeTab === 'tests' && (
          <div className="tests-module">
            {/* Header / Filter row */}
            <div className="module-header-row">
              <div>
                <h2>Assigned & Mock Tests</h2>
                <p className="text-muted">
                  Official NTA JEE Main and MHT-CET CBT pattern simulations with instant AI grading and dwell-time tracking.
                </p>
              </div>

              <div className="filter-pill-row">
                <button
                  className={`filter-pill ${selectedExamFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedExamFilter('all')}
                >
                  All Exams
                </button>
                <button
                  className={`filter-pill ${selectedExamFilter === 'jee' ? 'active' : ''}`}
                  onClick={() => setSelectedExamFilter('jee')}
                >
                  JEE Main Pattern
                </button>
                <button
                  className={`filter-pill ${selectedExamFilter === 'cet' ? 'active' : ''}`}
                  onClick={() => setSelectedExamFilter('cet')}
                >
                  MHT-CET Pattern
                </button>
              </div>
            </div>

            {/* Test Cards Grid */}
            <div className="test-cards-grid">
              {filteredTests.map((test) => (
                <div key={test.id} className={`glass-card test-card-item ${test.status}`}>
                  <div className="test-card-top">
                    <span className={`badge-pattern badge-${test.pattern}`}>
                      {test.patternLabel}
                    </span>
                    <span className={`badge-status badge-status-${test.status}`}>
                      {test.status === 'assigned' ? '● Available' : '✓ Completed'}
                    </span>
                  </div>

                  <h3 className="test-card-title">{test.title}</h3>
                  <p className="test-card-meta-desc">
                    {test.targetExam} · {test.partsCount} {test.partsCount > 1 ? 'Locked Parts' : 'Single Block'}
                  </p>

                  <div className="test-specs-grid">
                    <div className="spec-item">
                      <ClockIcon style={{ width: 16, height: 16 }} />
                      <span>{test.durationMinutes} Mins</span>
                    </div>
                    <div className="spec-item">
                      <TargetIcon style={{ width: 16, height: 16 }} />
                      <span>{test.totalQuestions} Questions</span>
                    </div>
                    <div className="spec-item">
                      <AwardIcon style={{ width: 16, height: 16 }} />
                      <span>{test.totalMarks} Marks</span>
                    </div>
                  </div>

                  {test.status === 'assigned' ? (
                    <div className="test-card-actions">
                      <button
                        className="btn-cbt-launch"
                        onClick={() => onLaunchTest(test)}
                      >
                        <PlayIcon style={{ width: 18, height: 18 }} />
                        <span>
                          {test.pattern === 'jee_main'
                            ? 'Start Test (Exact JEE CBT)'
                            : 'Start Test (Exact MHT-CET CBT)'}
                        </span>
                      </button>
                      <div className="test-card-footer-note">
                        <span>Due: {test.dueDate}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="test-card-completed-box">
                      <div className="completed-stats-row">
                        <div className="c-stat">
                          <span className="c-stat-lbl">Your Score</span>
                          <span className="c-stat-val text-primary">{test.score} / {test.totalMarks}</span>
                        </div>
                        <div className="c-stat">
                          <span className="c-stat-lbl">Percentile</span>
                          <span className="c-stat-val text-success">{test.percentile}%</span>
                        </div>
                        <div className="c-stat">
                          <span className="c-stat-lbl">Rank</span>
                          <span className="c-stat-val">{test.rank} <small>/ {test.totalStudents}</small></span>
                        </div>
                      </div>
                      <button
                        className="btn-analysis-view"
                        onClick={() => setActiveTab('analysis')}
                      >
                        <BarChartIcon style={{ width: 16, height: 16 }} />
                        <span>View Detailed Analysis</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= 2. PROGRESS TRACKER MODULE ================= */}
        {activeTab === 'progress' && (
          <div className="progress-module">
            <div className="module-header-row">
              <div>
                <h2>Longitudinal Progress Tracker</h2>
                <p className="text-muted">
                  Cross-test performance analytics mapped across NCERT & Maharashtra State Board concept taxonomy.
                </p>
              </div>
            </div>

            {/* Performance Overview KPI Cards */}
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-top">
                  <span className="kpi-label">Current All-India Percentile</span>
                  <AwardIcon className="kpi-icon text-indigo" />
                </div>
                <div className="kpi-value text-indigo">98.42 %</div>
                <div className="kpi-growth text-success">
                  <TrendingUpIcon style={{ width: 14, height: 14 }} /> +3.2% over last 4 tests
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-top">
                  <span className="kpi-label">Average Mock Score</span>
                  <TargetIcon className="kpi-icon text-emerald" />
                </div>
                <div className="kpi-value text-emerald">218 <small>/ 300</small></div>
                <div className="kpi-growth text-success">
                  <TrendingUpIcon style={{ width: 14, height: 14 }} /> Batch Rank #4 (Top 2%)
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-top">
                  <span className="kpi-label">Overall Accuracy Rate</span>
                  <CheckCircleIcon className="kpi-icon text-amber" />
                </div>
                <div className="kpi-value text-amber">78.5%</div>
                <div className="kpi-growth text-muted">
                  84% Phy · 81% Chem · 71% Math
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-top">
                  <span className="kpi-label">Syllabus Completion</span>
                  <BookIcon className="kpi-icon text-cyan" />
                </div>
                <div className="kpi-value text-cyan">91%</div>
                <div className="kpi-growth text-success">
                  Class 11: 94% · Class 12: 88%
                </div>
              </div>
            </div>

            {/* Score Progression & Subject Balance */}
            <div className="progress-analytics-grid">
              {/* Score Trend Card */}
              <div className="glass-card analytics-box">
                <div className="card-header-flex">
                  <div>
                    <h3>Score Trajectory (Past 6 Sittings)</h3>
                    <p className="text-muted font-sm">Track improvement across full-length papers</p>
                  </div>
                  <span className="badge-trend text-success">Consistent Growth</span>
                </div>

                <div className="chart-bar-container">
                  {[
                    { test: 'Mock 09', score: 178, max: 300, date: 'Aug 10' },
                    { test: 'Mock 10', score: 192, max: 300, date: 'Aug 17' },
                    { test: 'Mock 11', score: 185, max: 300, date: 'Aug 24' },
                    { test: 'Mock 12', score: 204, max: 300, date: 'Aug 31' },
                    { test: 'Mock 13', score: 215, max: 300, date: 'Sep 08' },
                    { test: 'Mock 14', score: 232, max: 300, date: 'Sep 15' },
                  ].map((item, idx) => (
                    <div key={idx} className="chart-bar-column">
                      <div className="chart-bar-wrapper">
                        <div
                          className="chart-bar-fill"
                          style={{ height: `${(item.score / item.max) * 100}%` }}
                        >
                          <span className="bar-value-tooltip">{item.score}</span>
                        </div>
                      </div>
                      <span className="chart-x-label">{item.test}</span>
                      <span className="chart-x-sub">{item.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subject Balance */}
              <div className="glass-card analytics-box">
                <div className="card-header-flex">
                  <div>
                    <h3>Subject Mastery Balance</h3>
                    <p className="text-muted font-sm">Relative strength across PCM</p>
                  </div>
                </div>

                <div className="subject-balance-list">
                  <div className="subj-bal-item">
                    <div className="subj-bal-header">
                      <span>Physics</span>
                      <strong className="text-primary">82% Mastery · +78 Avg Marks</strong>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill bg-indigo" style={{ width: '82%' }}></div>
                    </div>
                  </div>

                  <div className="subj-bal-item">
                    <div className="subj-bal-header">
                      <span>Chemistry</span>
                      <strong className="text-emerald">86% Mastery · +84 Avg Marks</strong>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill bg-emerald" style={{ width: '86%' }}></div>
                    </div>
                  </div>

                  <div className="subj-bal-item">
                    <div className="subj-bal-header">
                      <span>Mathematics</span>
                      <strong className="text-amber">68% Mastery · +56 Avg Marks</strong>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill bg-amber" style={{ width: '68%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="ai-insight-box">
                  <SparklesIcon style={{ width: 20, height: 20, color: 'var(--color-primary)' }} />
                  <div>
                    <strong>AI Recommendation:</strong>
                    <p>
                      Mathematics <em>Vectors & 3D Geometry</em> and <em>Definite Integrals</em> represent your highest score boost opportunities. Focusing 4 hours this week can lift overall score by +16 marks.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chapter Mastery Matrix */}
            <div className="glass-card section-table-box">
              <div className="card-header-flex">
                <div>
                  <h3>Chapter-Level Concept Mastery Heatmap</h3>
                  <p className="text-muted font-sm">Granular performance tags derived from exam telemetry</p>
                </div>
              </div>

              <div className="table-responsive">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Chapter & Concept</th>
                      <th>Class</th>
                      <th>Mastery</th>
                      <th>Questions Attempted</th>
                      <th>Accuracy</th>
                      <th>Status Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CONCEPT_MASTERY_LIST.map((cm, idx) => (
                      <tr key={idx}>
                        <td><strong>{cm.subject}</strong></td>
                        <td>{cm.chapter}</td>
                        <td><span className="badge-class">Class {cm.classLevel}</span></td>
                        <td>
                          <div className="table-progress-cell">
                            <span>{cm.masteryPercentage}%</span>
                            <div className="progress-track sm">
                              <div
                                className={`progress-fill ${cm.masteryPercentage >= 80 ? 'bg-emerald' : cm.masteryPercentage >= 65 ? 'bg-indigo' : 'bg-amber'}`}
                                style={{ width: `${cm.masteryPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td>{cm.totalAttempted} Qs</td>
                        <td><strong>{cm.accuracy}%</strong></td>
                        <td>
                          <span className={`grade-pill grade-${cm.difficultyGrade.toLowerCase()}`}>
                            {cm.difficultyGrade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= 3. ANALYSIS MODULE ================= */}
        {activeTab === 'analysis' && (
          <div className="analysis-module">
            <div className="module-header-row">
              <div>
                <h2>Sitting Diagnostic & Behavioral Analysis</h2>
                <p className="text-muted">
                  Deep post-sitting reconstruction: score breakdown, dwell time, cognitive fatigue, and question-by-question review.
                </p>
              </div>

              <div className="sitting-select-chip">
                <span>Sitting: <strong>JEE Main 2026 Shift 1 Simulation (08 Sep)</strong></span>
              </div>
            </div>

            {/* Score Hero Card */}
            <div className="glass-card analysis-hero">
              <div className="hero-main-stat">
                <span className="hero-eyebrow">Overall Test Score</span>
                <div className="hero-big-number">
                  232 <span>/ 300</span>
                </div>
                <div className="hero-subtags">
                  <span className="subtag-pill text-emerald">98.85 Percentile</span>
                  <span className="subtag-pill text-indigo">Batch Rank: 4 of 312</span>
                </div>
              </div>

              <div className="hero-breakdown-stats">
                <div className="h-stat-box">
                  <span className="h-stat-lbl text-emerald">+ Earned Marks</span>
                  <strong className="h-stat-val text-emerald">+244</strong>
                  <span className="h-stat-sub">61 Correct Answers</span>
                </div>
                <div className="h-stat-box">
                  <span className="h-stat-lbl text-destructive">- Penalty Marks</span>
                  <strong className="h-stat-val text-destructive">-12</strong>
                  <span className="h-stat-sub">12 Incorrect (MCQ -1)</span>
                </div>
                <div className="h-stat-box">
                  <span className="h-stat-lbl text-muted">Unattempted</span>
                  <strong className="h-stat-val text-muted">2</strong>
                  <span className="h-stat-sub">0 Penalty marks</span>
                </div>
              </div>
            </div>

            {/* Behavioral & Cognitive Metrics (From spec) */}
            <div className="behavioral-grid">
              <div className="glass-card b-card">
                <div className="b-header">
                  <ClockIcon className="text-amber" />
                  <h4>Wasted Dwell Time</h4>
                </div>
                <div className="b-val text-amber">11m 40s</div>
                <p className="b-desc">
                  Time spent reading and working on 2 questions that were ultimately left blank. Reducing this recovers 2 extra MCQ attempts.
                </p>
              </div>

              <div className="glass-card b-card">
                <div className="b-header">
                  <ZapIcon className="text-cyan" />
                  <h4>Endgame Fatigue Index</h4>
                </div>
                <div className="b-val text-cyan">91% vs 64%</div>
                <p className="b-desc">
                  Accuracy in the first 30 minutes was 91%, dropping to 64% in the final 30 minutes. Pacing adjustments recommended.
                </p>
              </div>

              <div className="glass-card b-card">
                <div className="b-header">
                  <CheckCircleIcon className="text-emerald" />
                  <h4>Answer Revision Impact</h4>
                </div>
                <div className="b-val text-emerald">+9 Net Marks</div>
                <p className="b-desc">
                  You revised 4 answers: 3 changed from incorrect to correct (+15 marks), 1 changed to incorrect (-5 marks). Good intuition discipline.
                </p>
              </div>
            </div>

            {/* Question Review Section */}
            <div className="glass-card question-review-section">
              <div className="card-header-flex">
                <div>
                  <h3>Question-by-Question Solution & Telemetry</h3>
                  <p className="text-muted font-sm">Inspect each problem, answer choices, marking, and full explanations</p>
                </div>

                <div className="filter-pill-row">
                  <button
                    className={`filter-pill ${analysisQFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setAnalysisQFilter('all')}
                  >
                    All (75)
                  </button>
                  <button
                    className={`filter-pill ${analysisQFilter === 'correct' ? 'active' : ''}`}
                    onClick={() => setAnalysisQFilter('correct')}
                  >
                    Correct (61)
                  </button>
                  <button
                    className={`filter-pill ${analysisQFilter === 'incorrect' ? 'active' : ''}`}
                    onClick={() => setAnalysisQFilter('incorrect')}
                  >
                    Incorrect (12)
                  </button>
                  <button
                    className={`filter-pill ${analysisQFilter === 'unattempted' ? 'active' : ''}`}
                    onClick={() => setAnalysisQFilter('unattempted')}
                  >
                    Unattempted (2)
                  </button>
                </div>
              </div>

              <div className="q-review-list">
                {SAMPLE_JEE_QUESTIONS.map((q, idx) => {
                  const isCorrect = idx !== 1 && idx !== 4
                  const isIncorrect = idx === 1
                  const isUnattempted = idx === 4

                  if (analysisQFilter === 'correct' && !isCorrect) return null
                  if (analysisQFilter === 'incorrect' && !isIncorrect) return null
                  if (analysisQFilter === 'unattempted' && !isUnattempted) return null

                  return (
                    <div key={q.id} className="q-review-card">
                      <div className="q-review-header">
                        <div className="q-review-title-left">
                          <span className="q-num-badge">Q{idx + 1}</span>
                          <span className="badge-subj">{q.subject}</span>
                          <span className="badge-chapter">{q.chapter}</span>
                        </div>

                        <div className="q-review-marks-status">
                          {isCorrect && (
                            <span className="status-badge-correct">
                              <CheckCircleIcon style={{ width: 16, height: 16 }} /> +4 Marks (Correct)
                            </span>
                          )}
                          {isIncorrect && (
                            <span className="status-badge-incorrect">
                              <XCircleIcon style={{ width: 16, height: 16 }} /> -1 Mark (Incorrect)
                            </span>
                          )}
                          {isUnattempted && (
                            <span className="status-badge-unattempted">
                              <MinusCircleIcon style={{ width: 16, height: 16 }} /> 0 Marks (Unattempted)
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="q-review-text">{q.text}</p>

                      {q.options && (
                        <div className="q-review-options-grid">
                          {q.options.map((opt) => {
                            const isCorrectOpt = opt.id === q.correctAnswer
                            const isUserSelected = isIncorrect && opt.id === 1

                            return (
                              <div
                                key={opt.id}
                                className={`q-rev-opt ${isCorrectOpt ? 'correct-opt' : isUserSelected ? 'wrong-user-opt' : ''}`}
                              >
                                <span className="opt-ord">({String.fromCharCode(65 + opt.id)})</span>
                                <span className="opt-txt">{opt.text}</span>
                                {isCorrectOpt && <span className="opt-verdict-tag">✓ Correct Answer</span>}
                                {isUserSelected && <span className="opt-verdict-tag wrong">✗ Your Choice</span>}
                              </div>
                            )
                          })}
                        </div>
                      )}

                      <div className="q-review-explanation-box">
                        <div className="exp-header">
                          <SparklesIcon style={{ width: 16, height: 16 }} />
                          <strong>Detailed Step-by-Step Solution:</strong>
                        </div>
                        <p className="exp-text">{q.explanation}</p>
                        {q.pyqInfo && <span className="pyq-ref-tag">📌 {q.pyqInfo}</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= 4. QUESTION BANK (QB) MODULE ================= */}
        {activeTab === 'qb' && (
          <div className="qb-module">
            <div className="module-header-row">
              <div>
                <h2>Question Bank & Practice Arena</h2>
                <p className="text-muted">
                  Curated PYQ & mock questions tagged with difficulty bands and instant step-by-step solution solver.
                </p>
              </div>

              <div className="qb-stats-pills">
                <span className="qb-stat-pill">Total Available: <strong>1,450+ Qs</strong></span>
                <span className="qb-stat-pill">Bookmarked: <strong>{Object.keys(bookmarkedQs).length}</strong></span>
              </div>
            </div>

            {/* Filter controls */}
            <div className="glass-card qb-filter-card">
              <div className="qb-search-bar">
                <SearchIcon style={{ width: 18, height: 18, color: 'var(--color-muted-foreground)' }} />
                <input
                  type="text"
                  placeholder="Search by topic, keyword, or concept (e.g., 'Rotational Dynamics', 'Arrhenius', 'Integration')..."
                  value={qbSearch}
                  onChange={(e) => setQbSearch(e.target.value)}
                />
                {qbSearch && (
                  <button className="btn-clear-search" onClick={() => setQbSearch('')}>✕</button>
                )}
              </div>

              <div className="qb-filter-row">
                <div className="filter-group">
                  <span className="filter-label"><FilterIcon style={{ width: 14, height: 14 }} /> Subject:</span>
                  {(['All', 'Physics', 'Chemistry', 'Mathematics'] as const).map((s) => (
                    <button
                      key={s}
                      className={`pill-btn ${qbSubject === s ? 'active' : ''}`}
                      onClick={() => setQbSubject(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <div className="filter-group">
                  <span className="filter-label">Difficulty:</span>
                  {(['All', 'Easy', 'Medium', 'Hard'] as const).map((d) => (
                    <button
                      key={d}
                      className={`pill-btn ${qbDifficulty === d ? 'active' : ''}`}
                      onClick={() => setQbDifficulty(d)}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Questions Grid */}
            <div className="qb-questions-list">
              {filteredQbQuestions.map((q, idx) => {
                const isBookmarked = !!bookmarkedQs[q.id]
                const userAns = userQbAnswers[q.id]
                const isRevealed = !!revealedSolutions[q.id]

                return (
                  <div key={q.id} className="glass-card qb-card">
                    <div className="qb-card-top">
                      <div className="qb-tags-left">
                        <span className="qb-idx-badge">#{idx + 1}</span>
                        <span className="badge-subj">{q.subject}</span>
                        <span className="badge-chapter">{q.chapter}</span>
                        <span className={`badge-diff badge-diff-${q.difficulty}`}>{q.difficulty}</span>
                      </div>

                      <button
                        className={`btn-bookmark ${isBookmarked ? 'bookmarked' : ''}`}
                        onClick={() =>
                          setBookmarkedQs((prev) => ({ ...prev, [q.id]: !prev[q.id] }))
                        }
                        title="Bookmark question"
                      >
                        <BookmarkIcon style={{ width: 18, height: 18 }} />
                      </button>
                    </div>

                    <p className="qb-text">{q.text}</p>

                    {q.type === 'mcq' && q.options && (
                      <div className="qb-options-grid">
                        {q.options.map((opt) => {
                          const isSelected = userAns === opt.id
                          return (
                            <button
                              key={opt.id}
                              className={`qb-opt-btn ${isSelected ? 'selected' : ''}`}
                              onClick={() =>
                                setUserQbAnswers((prev) => ({ ...prev, [q.id]: opt.id }))
                              }
                            >
                              <span className="qb-opt-ord">({String.fromCharCode(65 + opt.id)})</span>
                              <span>{opt.text}</span>
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {q.type === 'numerical' && (
                      <div className="qb-num-entry">
                        <label>Your Numerical Answer:</label>
                        <input
                          type="text"
                          placeholder="Type answer..."
                          value={String(userAns ?? '')}
                          onChange={(e) =>
                            setUserQbAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                          }
                          className="qb-input-num"
                        />
                      </div>
                    )}

                    <div className="qb-card-actions">
                      <button
                        className="btn-reveal-solution"
                        onClick={() =>
                          setRevealedSolutions((prev) => ({ ...prev, [q.id]: !prev[q.id] }))
                        }
                      >
                        <SparklesIcon style={{ width: 16, height: 16 }} />
                        <span>{isRevealed ? 'Hide Solution' : 'Check Answer & View Solution'}</span>
                      </button>

                      {q.pyqInfo && <span className="qb-pyq-tag">📌 {q.pyqInfo}</span>}
                    </div>

                    {isRevealed && (
                      <div className="qb-solution-drawer">
                        <div className="sol-verdict">
                          <strong>Correct Answer: </strong>
                          <span className="text-success">
                            {q.type === 'mcq' && q.options
                              ? `(${String.fromCharCode(65 + Number(q.correctAnswer))}) ${q.options[Number(q.correctAnswer)]?.text}`
                              : q.correctAnswer}
                          </span>
                        </div>
                        <p className="sol-exp">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
