import { useState } from 'react'
import {
  ALL_QB_QUESTIONS,
  CONCEPT_MASTERY_LIST,
  MOCK_ROSTER,
  MOCK_TESTS,
  type StudentProfile,
  type TestDef,
} from '../data/mockData'
import {
  AlertIcon,
  BarChartIcon,
  CheckCircleIcon,
  DownloadIcon,
  Edit3Icon,
  EyeIcon,
  LayersIcon,
  PlayIcon,
  PlusIcon,
  SearchIcon,
  SparklesIcon,
  TrendingUpIcon,
  UsersIcon,
  ZapIcon,
} from '../icons'

export type TeacherTab = 'stud_list' | 'test_setter' | 'tests_manage' | 'progress_tracker' | 'recent_analysis'

interface TeacherDashboardProps {
  onPreviewExam: (test: TestDef) => void
}

export function TeacherDashboard({ onPreviewExam }: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState<TeacherTab>('stud_list')
  const [selectedBatch, setSelectedBatch] = useState<string>('All')
  const [studentSearch, setStudentSearch] = useState<string>('')
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null)

  // Test Setter Wizard State
  const [setterStep, setSetterStep] = useState<number>(1)
  const [newTestTitle, setNewTestTitle] = useState<string>('NTA JEE Main 2026 - Weekly Drill 05')
  const [newTestPattern, setNewTestPattern] = useState<'jee_main' | 'mht_cet' | 'custom'>('jee_main')
  const [newTestDuration, setNewTestDuration] = useState<number>(180)
  const [newTestBatch, setNewTestBatch] = useState<string>('JEE Super-30 (Alpha)')
  const [selectedQsForTest, setSelectedQsForTest] = useState<string[]>(['q_phy_01', 'q_phy_02', 'q_chem_01', 'q_math_01'])
  const [testCreatedSuccess, setTestCreatedSuccess] = useState<boolean>(false)

  // Live Invigilator Extra Time State
  const [extraTimeAudits, setExtraTimeAudits] = useState<{ studentName: string; minutes: number; time: string }[]>([])
  const [extraTimeNotice, setExtraTimeNotice] = useState<string | null>(null)

  // Filter student roster
  const filteredStudents = MOCK_ROSTER.filter((s) => {
    if (selectedBatch !== 'All' && !s.batch.includes(selectedBatch)) return false
    if (studentSearch.trim()) {
      const q = studentSearch.toLowerCase()
      if (!s.name.toLowerCase().includes(q) && !s.rollNo.toLowerCase().includes(q)) return false
    }
    return true
  })

  function handleGrantExtraTime(studentName: string, mins: number) {
    const audit = {
      studentName,
      minutes: mins,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setExtraTimeAudits((prev) => [audit, ...prev])
    setExtraTimeNotice(`Granted +${mins} minutes to ${studentName}. Event logged to server audit trail.`)
    setTimeout(() => setExtraTimeNotice(null), 4000)
  }

  function handlePublishTest() {
    setTestCreatedSuccess(true)
    setTimeout(() => {
      setTestCreatedSuccess(false)
      setActiveTab('tests_manage')
      setSetterStep(1)
    }, 1800)
  }

  return (
    <div className="teacher-console">
      {/* Teacher Navigation Header */}
      <div className="teacher-subbar">
        <div className="container flex-between">
          <div className="teacher-nav-pills">
            <button
              className={`t-nav-btn ${activeTab === 'stud_list' ? 'active' : ''}`}
              onClick={() => setActiveTab('stud_list')}
            >
              <UsersIcon />
              <span>Stud List Analysis</span>
            </button>

            <button
              className={`t-nav-btn ${activeTab === 'test_setter' ? 'active' : ''}`}
              onClick={() => setActiveTab('test_setter')}
            >
              <PlusIcon />
              <span>Test Setter & Builder</span>
            </button>

            <button
              className={`t-nav-btn ${activeTab === 'tests_manage' ? 'active' : ''}`}
              onClick={() => setActiveTab('tests_manage')}
            >
              <LayersIcon />
              <span>Tests & Live Invigilator</span>
            </button>

            <button
              className={`t-nav-btn ${activeTab === 'progress_tracker' ? 'active' : ''}`}
              onClick={() => setActiveTab('progress_tracker')}
            >
              <TrendingUpIcon />
              <span>Cohort Progress Tracker</span>
            </button>

            <button
              className={`t-nav-btn ${activeTab === 'recent_analysis' ? 'active' : ''}`}
              onClick={() => setActiveTab('recent_analysis')}
            >
              <BarChartIcon />
              <span>Recent Test Analysis</span>
            </button>
          </div>

          <div className="batch-selector-box">
            <span className="batch-lbl">Batch:</span>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="batch-dropdown"
            >
              <option value="All">All Batches (312 Students)</option>
              <option value="JEE Super-30">JEE Super-30 (Alpha)</option>
              <option value="MHT-CET Champions">MHT-CET Champions</option>
              <option value="JEE Droppers">JEE Droppers Intensive</option>
            </select>
          </div>
        </div>
      </div>

      <main className="container teacher-content">
        {/* ================= 1. STUD LIST ANALYSIS ================= */}
        {activeTab === 'stud_list' && (
          <div className="stud-list-module">
            <div className="module-header-row">
              <div>
                <h2>Student Roster & Cohort Telemetry</h2>
                <p className="text-muted">
                  Individual student longitudinal tracking, test completion rates, risk indicators, and intervention drilldowns.
                </p>
              </div>

              <div className="roster-actions">
                <div className="search-input-wrapper">
                  <SearchIcon style={{ width: 16, height: 16 }} />
                  <input
                    type="text"
                    placeholder="Search student by name or roll number..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                  />
                </div>
                <button className="btn-export-csv">
                  <DownloadIcon style={{ width: 16, height: 16 }} /> Export Roster
                </button>
              </div>
            </div>

            {/* Quick Summary Strip */}
            <div className="teacher-quick-stats-grid">
              <div className="glass-card t-stat-card">
                <span className="t-stat-lbl">Active Enrolled</span>
                <span className="t-stat-val text-indigo">{filteredStudents.length} Students</span>
                <span className="t-stat-sub">Across 3 Batches</span>
              </div>
              <div className="glass-card t-stat-card">
                <span className="t-stat-lbl">Batch Avg Score</span>
                <span className="t-stat-val text-emerald">204 / 300</span>
                <span className="t-stat-sub text-success">+8.4% this month</span>
              </div>
              <div className="glass-card t-stat-card">
                <span className="t-stat-lbl">Avg Attendance</span>
                <span className="t-stat-val text-amber">92.4%</span>
                <span className="t-stat-sub">Test participation rate</span>
              </div>
              <div className="glass-card t-stat-card">
                <span className="t-stat-lbl">At-Risk Students</span>
                <span className="t-stat-val text-destructive">2 Students</span>
                <span className="t-stat-sub">Falling accuracy &gt; 15%</span>
              </div>
            </div>

            {/* Student Table */}
            <div className="glass-card section-table-box">
              <div className="table-responsive">
                <table className="modern-table interactive-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Roll No</th>
                      <th>Batch</th>
                      <th>Percentile</th>
                      <th>Avg Score</th>
                      <th>Accuracy</th>
                      <th>Attendance</th>
                      <th>Trend</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((stud) => (
                      <tr key={stud.id} onClick={() => setSelectedStudent(stud)}>
                        <td>
                          <div className="user-cell">
                            <div className="user-avatar-circle">{stud.name.charAt(0)}</div>
                            <div>
                              <strong>{stud.name}</strong>
                              <span className="user-sub">{stud.targetExam}</span>
                            </div>
                          </div>
                        </td>
                        <td><code className="text-mono">{stud.rollNo}</code></td>
                        <td><span className="badge-batch">{stud.batch}</span></td>
                        <td><strong className="text-primary">{stud.currentPercentile}%</strong></td>
                        <td><strong>{stud.avgScore}</strong> <small>/ 300</small></td>
                        <td>{stud.accuracyRate}%</td>
                        <td>{stud.attendanceRate}%</td>
                        <td>
                          {stud.trend === 'rising' && (
                            <span className="trend-badge rising">▲ Rising</span>
                          )}
                          {stud.trend === 'stable' && (
                            <span className="trend-badge stable">▬ Stable</span>
                          )}
                          {stud.trend === 'needs_attention' && (
                            <span className="trend-badge risk">⚠️ Needs Attention</span>
                          )}
                        </td>
                        <td>
                          <button
                            className="btn-view-drilldown"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedStudent(stud)
                            }}
                          >
                            <EyeIcon style={{ width: 15, height: 15 }} /> View Profile
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Student Drilldown Drawer / Modal */}
            {selectedStudent && (
              <div className="drawer-overlay" onClick={() => setSelectedStudent(null)}>
                <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
                  <div className="drawer-header">
                    <div className="user-cell">
                      <div className="user-avatar-circle lg">{selectedStudent.name.charAt(0)}</div>
                      <div>
                        <h3>{selectedStudent.name}</h3>
                        <p className="text-muted">{selectedStudent.rollNo} · {selectedStudent.batch}</p>
                      </div>
                    </div>
                    <button className="btn-close-drawer" onClick={() => setSelectedStudent(null)}>✕</button>
                  </div>

                  <div className="drawer-body">
                    <div className="drawer-stat-pills">
                      <div className="d-pill">
                        <span>Percentile</span>
                        <strong>{selectedStudent.currentPercentile}%</strong>
                      </div>
                      <div className="d-pill">
                        <span>Tests Taken</span>
                        <strong>{selectedStudent.testsTaken} Tests</strong>
                      </div>
                      <div className="d-pill">
                        <span>Avg Score</span>
                        <strong>{selectedStudent.avgScore} / 300</strong>
                      </div>
                      <div className="d-pill">
                        <span>Attendance</span>
                        <strong>{selectedStudent.attendanceRate}%</strong>
                      </div>
                    </div>

                    <div className="drawer-section">
                      <h4>Concept Strengths & Weaknesses</h4>
                      <div className="concept-chip-list">
                        <div className="concept-chip strong">
                          <span>✓ General Organic Chemistry</span>
                          <strong>94% Accuracy</strong>
                        </div>
                        <div className="concept-chip strong">
                          <span>✓ Rotational Dynamics</span>
                          <strong>88% Accuracy</strong>
                        </div>
                        <div className="concept-chip moderate">
                          <span>~ Chemical Kinetics</span>
                          <strong>77% Accuracy</strong>
                        </div>
                        <div className="concept-chip weak">
                          <span>✗ Vectors & 3D Geometry</span>
                          <strong>50% Accuracy (Intervention Needed)</strong>
                        </div>
                      </div>
                    </div>

                    <div className="drawer-section">
                      <h4>Recent Sitting History</h4>
                      <div className="drawer-history-list">
                        <div className="history-row">
                          <div>
                            <strong>JEE Main 2026 Shift 1 Simulation</strong>
                            <span className="text-muted block font-sm">08 Sep 2026</span>
                          </div>
                          <span className="score-badge text-emerald">232 / 300 (Rank 4)</span>
                        </div>
                        <div className="history-row">
                          <div>
                            <strong>JEE Weekly Mock 04</strong>
                            <span className="text-muted block font-sm">01 Sep 2026</span>
                          </div>
                          <span className="score-badge text-emerald">215 / 300 (Rank 6)</span>
                        </div>
                      </div>
                    </div>

                    <div className="drawer-section">
                      <h4>Teacher Intervention Note</h4>
                      <textarea
                        className="drawer-note-input"
                        placeholder="Add a private teacher observation or assign remedial practice modules..."
                        defaultValue="Student has exceptional speed in Physics. Advised to spend 10 more minutes reviewing Mathematics numericals before submitting."
                      />
                      <button className="btn-save-note">Save Observation</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= 2. TEST SETTER & BUILDER ================= */}
        {activeTab === 'test_setter' && (
          <div className="test-setter-module">
            <div className="module-header-row">
              <div>
                <h2>Test Setter & Exam Authoring Studio</h2>
                <p className="text-muted">
                  Create official NTA JEE Main, MHT-CET, or custom institutional tests with multi-part locked timing and question tagging.
                </p>
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div className="setter-stepper">
              <div className={`step-item ${setterStep >= 1 ? 'active' : ''} ${setterStep > 1 ? 'completed' : ''}`}>
                <span className="step-circle">{setterStep > 1 ? '✓' : '1'}</span>
                <span className="step-label">1. General Info & Pattern</span>
              </div>
              <div className="step-divider"></div>
              <div className={`step-item ${setterStep >= 2 ? 'active' : ''} ${setterStep > 2 ? 'completed' : ''}`}>
                <span className="step-circle">{setterStep > 2 ? '✓' : '2'}</span>
                <span className="step-label">2. Parts & Section Timing</span>
              </div>
              <div className="step-divider"></div>
              <div className={`step-item ${setterStep >= 3 ? 'active' : ''} ${setterStep > 3 ? 'completed' : ''}`}>
                <span className="step-circle">{setterStep > 3 ? '✓' : '3'}</span>
                <span className="step-label">3. Ingest / Pick Questions</span>
              </div>
              <div className="step-divider"></div>
              <div className={`step-item ${setterStep >= 4 ? 'active' : ''}`}>
                <span className="step-circle">4</span>
                <span className="step-label">4. Review & Publish</span>
              </div>
            </div>

            {/* Wizard Step 1: General Info */}
            {setterStep === 1 && (
              <div className="glass-card wizard-card">
                <h3>Step 1: Test Details & Exam Blueprint</h3>

                <div className="form-grid">
                  <div className="form-group full">
                    <label>Test Title / Paper Name:</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newTestTitle}
                      onChange={(e) => setNewTestTitle(e.target.value)}
                      placeholder="e.g. JEE Main 2026 - All India Mock 05"
                    />
                  </div>

                  <div className="form-group">
                    <label>Exam Blueprint Pattern:</label>
                    <div className="pattern-selector-grid">
                      <div
                        className={`pattern-card ${newTestPattern === 'jee_main' ? 'selected' : ''}`}
                        onClick={() => {
                          setNewTestPattern('jee_main')
                          setNewTestDuration(180)
                        }}
                      >
                        <span className="pattern-badge badge-jee_main">NTA JEE Main</span>
                        <h4>JEE Main Paper 1</h4>
                        <p>3 Hours · 75 Qs · Single continuous block · Section A MCQs (+4/-1) + Section B Numericals</p>
                      </div>

                      <div
                        className={`pattern-card ${newTestPattern === 'mht_cet' ? 'selected' : ''}`}
                        onClick={() => {
                          setNewTestPattern('mht_cet')
                          setNewTestDuration(180)
                        }}
                      >
                        <span className="pattern-badge badge-mht_cet">MHT-CET PCM</span>
                        <h4>MHT-CET Engineering</h4>
                        <p>180 Mins · 150 Qs · 2 Locked Parts (Phy+Chem 90m, Math 90m) · No negative marks</p>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Assign to Batch:</label>
                    <select
                      className="form-input"
                      value={newTestBatch}
                      onChange={(e) => setNewTestBatch(e.target.value)}
                    >
                      <option value="JEE Super-30 (Alpha)">JEE Super-30 (Alpha Batch)</option>
                      <option value="MHT-CET Champions">MHT-CET Champions</option>
                      <option value="JEE Droppers Intensive">JEE Droppers Intensive</option>
                      <option value="All Batches">All Batches (312 Students)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Total Duration (Minutes):</label>
                    <input
                      type="number"
                      className="form-input"
                      value={newTestDuration}
                      onChange={(e) => setNewTestDuration(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="wizard-footer">
                  <span></span>
                  <button className="btn-wizard-next" onClick={() => setSetterStep(2)}>
                    Next: Parts & Timing Rules &gt;
                  </button>
                </div>
              </div>
            )}

            {/* Wizard Step 2: Parts & Section Rules */}
            {setterStep === 2 && (
              <div className="glass-card wizard-card">
                <h3>Step 2: Parts, Sections & Marking Scheme</h3>

                {newTestPattern === 'jee_main' ? (
                  <div className="pattern-config-box">
                    <div className="config-banner">
                      <ZapIcon style={{ width: 18, height: 18 }} />
                      <span><strong>NTA JEE Configuration:</strong> Single continuous 180 min part with free navigation between subjects.</span>
                    </div>

                    <div className="parts-summary-table">
                      <table className="modern-table">
                        <thead>
                          <tr>
                            <th>Subject</th>
                            <th>Section A (MCQs)</th>
                            <th>Section B (Numericals)</th>
                            <th>Positive Mark</th>
                            <th>Negative Mark</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><strong>Physics</strong></td>
                            <td>20 Qs</td>
                            <td>5 Qs (Compulsory)</td>
                            <td className="text-success">+4</td>
                            <td className="text-danger">-1</td>
                          </tr>
                          <tr>
                            <td><strong>Chemistry</strong></td>
                            <td>20 Qs</td>
                            <td>5 Qs (Compulsory)</td>
                            <td className="text-success">+4</td>
                            <td className="text-danger">-1</td>
                          </tr>
                          <tr>
                            <td><strong>Mathematics</strong></td>
                            <td>20 Qs</td>
                            <td>5 Qs (Compulsory)</td>
                            <td className="text-success">+4</td>
                            <td className="text-danger">-1</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="pattern-config-box">
                    <div className="config-banner">
                      <AlertIcon style={{ width: 18, height: 18 }} />
                      <span><strong>MHT-CET Configuration:</strong> 2 Independent parts with strict server-enforced lock on Part 1 submission.</span>
                    </div>

                    <div className="parts-summary-table">
                      <table className="modern-table">
                        <thead>
                          <tr>
                            <th>Part</th>
                            <th>Subjects Included</th>
                            <th>Duration</th>
                            <th>Lock Rule</th>
                            <th>Marking</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><strong>Part 1</strong></td>
                            <td>Physics (50 Qs) + Chemistry (50 Qs)</td>
                            <td>90 Minutes</td>
                            <td><span className="badge-lock">Strict Auto-Lock</span></td>
                            <td>+1 per correct · 0 negative</td>
                          </tr>
                          <tr>
                            <td><strong>Part 2</strong></td>
                            <td>Mathematics (50 Qs)</td>
                            <td>90 Minutes</td>
                            <td><span className="badge-lock">Final Submission</span></td>
                            <td>+2 per correct · 0 negative</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="wizard-footer">
                  <button className="btn-wizard-prev" onClick={() => setSetterStep(1)}>
                    &lt; Back
                  </button>
                  <button className="btn-wizard-next" onClick={() => setSetterStep(3)}>
                    Next: Select / Ingest Questions &gt;
                  </button>
                </div>
              </div>
            )}

            {/* Wizard Step 3: Question Ingestion / Selection */}
            {setterStep === 3 && (
              <div className="glass-card wizard-card">
                <div className="card-header-flex">
                  <div>
                    <h3>Step 3: Question Ingestion & Selection</h3>
                    <p className="text-muted font-sm">
                      Pick from Question Bank or upload image crops / enter new questions. Selected: <strong>{selectedQsForTest.length} Questions</strong>
                    </p>
                  </div>
                  <span className="badge-target">Target Marks: {selectedQsForTest.length * 4}</span>
                </div>

                <div className="question-picker-list">
                  {ALL_QB_QUESTIONS.map((q) => {
                    const isSelected = selectedQsForTest.includes(q.id)
                    return (
                      <div
                        key={q.id}
                        className={`q-picker-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedQsForTest((prev) =>
                            prev.includes(q.id) ? prev.filter((id) => id !== q.id) : [...prev, q.id]
                          )
                        }}
                      >
                        <div className="picker-checkbox">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                          />
                        </div>
                        <div className="picker-content">
                          <div className="picker-meta">
                            <span className="badge-subj">{q.subject}</span>
                            <span className="badge-chapter">{q.chapter}</span>
                            <span className={`badge-diff badge-diff-${q.difficulty}`}>{q.difficulty}</span>
                            <span className="badge-type">{q.type === 'mcq' ? 'MCQ' : 'Numerical'}</span>
                          </div>
                          <p className="picker-text">{q.text}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="wizard-footer">
                  <button className="btn-wizard-prev" onClick={() => setSetterStep(2)}>
                    &lt; Back
                  </button>
                  <button className="btn-wizard-next" onClick={() => setSetterStep(4)}>
                    Next: Review & Publish &gt;
                  </button>
                </div>
              </div>
            )}

            {/* Wizard Step 4: Review & Publish */}
            {setterStep === 4 && (
              <div className="glass-card wizard-card">
                <h3>Step 4: Final Blueprint Review & Publication</h3>

                <div className="publish-summary-grid">
                  <div className="p-summary-item">
                    <span className="p-lbl">Test Title:</span>
                    <strong>{newTestTitle}</strong>
                  </div>
                  <div className="p-summary-item">
                    <span className="p-lbl">Exam Pattern:</span>
                    <span className={`badge-pattern badge-${newTestPattern}`}>
                      {newTestPattern === 'jee_main' ? 'NTA JEE Main' : 'MHT-CET PCM'}
                    </span>
                  </div>
                  <div className="p-summary-item">
                    <span className="p-lbl">Assigned Batch:</span>
                    <strong>{newTestBatch}</strong>
                  </div>
                  <div className="p-summary-item">
                    <span className="p-lbl">Total Duration:</span>
                    <strong>{newTestDuration} Minutes</strong>
                  </div>
                  <div className="p-summary-item">
                    <span className="p-lbl">Total Questions:</span>
                    <strong>{selectedQsForTest.length} Selected Questions</strong>
                  </div>
                  <div className="p-summary-item">
                    <span className="p-lbl">Total Maximum Marks:</span>
                    <strong>{selectedQsForTest.length * 4} Marks</strong>
                  </div>
                </div>

                {testCreatedSuccess && (
                  <div className="success-banner">
                    <CheckCircleIcon style={{ width: 22, height: 22 }} />
                    <span>Test successfully built and queued for {newTestBatch}! Redirecting to Tests manager...</span>
                  </div>
                )}

                <div className="wizard-footer">
                  <button className="btn-wizard-prev" onClick={() => setSetterStep(3)}>
                    &lt; Back
                  </button>
                  <button className="btn-publish-test" onClick={handlePublishTest}>
                    <SparklesIcon style={{ width: 18, height: 18 }} /> Publish & Assign to Batch
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= 3. TESTS MANAGEMENT & LIVE INVIGILATOR ================= */}
        {activeTab === 'tests_manage' && (
          <div className="tests-manage-module">
            <div className="module-header-row">
              <div>
                <h2>Tests Management & Live Invigilation Center</h2>
                <p className="text-muted">
                  Manage assigned mock papers, monitor live active test sittings, and grant compensated time with audited events.
                </p>
              </div>

              <button className="btn-create-test-direct" onClick={() => setActiveTab('test_setter')}>
                <PlusIcon style={{ width: 16, height: 16 }} /> Create New Test
              </button>
            </div>

            {/* Extra time notice banner */}
            {extraTimeNotice && (
              <div className="audit-notice-banner">
                <CheckCircleIcon style={{ width: 20, height: 20 }} />
                <span>{extraTimeNotice}</span>
              </div>
            )}

            {/* Live Sitting Invigilator Panel */}
            <div className="glass-card invigilator-card">
              <div className="card-header-flex">
                <div className="live-pulse-header">
                  <span className="live-dot-pulse"></span>
                  <div>
                    <h3>Live Invigilator Console: JEE Main Mock Paper 01</h3>
                    <span className="text-muted font-sm">34 students currently writing paper · Server authoring active</span>
                  </div>
                </div>
              </div>

              <div className="live-students-grid">
                {[
                  { name: 'Aarav Sharma', roll: '2026-JEE-0482', part: 'Part 1 (Phy)', timeRemaining: '01:42:15' },
                  { name: 'Rohan Kulkarni', roll: '2026-JEE-0512', part: 'Part 1 (Chem)', timeRemaining: '01:42:15' },
                  { name: 'Pooja Iyer', roll: '2026-JEE-0309', part: 'Part 1 (Math)', timeRemaining: '01:42:15' },
                  { name: 'Aditya Patil', roll: '2026-CET-0881', part: 'Part 1', timeRemaining: '01:38:10' },
                ].map((st, idx) => (
                  <div key={idx} className="live-student-pill">
                    <div className="live-st-meta">
                      <strong>{st.name}</strong>
                      <span className="text-muted font-sm">{st.roll} · {st.part}</span>
                      <span className="text-mono text-primary font-sm">⏱ {st.timeRemaining}</span>
                    </div>

                    <div className="live-st-actions">
                      <button
                        className="btn-extra-time"
                        onClick={() => handleGrantExtraTime(st.name, 5)}
                        title="Grant +5 minutes for machine lag"
                      >
                        +5 Min
                      </button>
                      <button
                        className="btn-extra-time"
                        onClick={() => handleGrantExtraTime(st.name, 10)}
                        title="Grant +10 minutes"
                      >
                        +10 Min
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {extraTimeAudits.length > 0 && (
                <div className="audit-log-strip">
                  <span className="audit-title">Audited Time Actions:</span>
                  {extraTimeAudits.map((a, i) => (
                    <span key={i} className="audit-chip">
                      {a.time}: +{a.minutes}m granted to {a.studentName}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Test Repository Table */}
            <div className="glass-card section-table-box">
              <div className="card-header-flex">
                <div>
                  <h3>Institutional Test Papers</h3>
                  <p className="text-muted font-sm">Scheduled, active, and published mock exams</p>
                </div>
              </div>

              <div className="table-responsive">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Paper Title</th>
                      <th>Pattern</th>
                      <th>Duration</th>
                      <th>Questions</th>
                      <th>Target Batch</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_TESTS.map((t) => (
                      <tr key={t.id}>
                        <td>
                          <strong>{t.title}</strong>
                          <span className="block text-muted font-sm">{t.targetExam}</span>
                        </td>
                        <td><span className={`badge-pattern badge-${t.pattern}`}>{t.patternLabel}</span></td>
                        <td>{t.durationMinutes} Mins</td>
                        <td>{t.totalQuestions} Qs ({t.totalMarks} Marks)</td>
                        <td><span className="badge-batch">Super-30 + CET</span></td>
                        <td>
                          <span className={`badge-status badge-status-${t.status}`}>
                            {t.status === 'assigned' ? 'Live Sitting' : 'Completed'}
                          </span>
                        </td>
                        <td>
                          <div className="action-button-group">
                            <button
                              className="btn-action-icon"
                              title="Preview as Student"
                              onClick={() => onPreviewExam(t)}
                            >
                              <PlayIcon style={{ width: 14, height: 14 }} /> Preview
                            </button>
                            <button className="btn-action-icon" title="Edit Paper">
                              <Edit3Icon style={{ width: 14, height: 14 }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= 4. COHORT PROGRESS TRACKER ================= */}
        {activeTab === 'progress_tracker' && (
          <div className="cohort-progress-module">
            <div className="module-header-row">
              <div>
                <h2>Cohort Concept Mastery & Weakness Matrix</h2>
                <p className="text-muted">
                  Batch-level syllabus telemetry across Class 11 and 12 NCERT / State Board concept trees.
                </p>
              </div>
            </div>

            {/* Batch Weakness Alert Cards */}
            <div className="weakness-alert-grid">
              <div className="glass-card alert-box warning">
                <AlertIcon style={{ width: 22, height: 22, color: 'var(--color-warning)' }} />
                <div>
                  <strong>Batch Weakness Alert: Vectors & 3D Geometry</strong>
                  <p>54% of students in Alpha Batch scored negative or left blank. Recommended: Assign 1 remedial drill.</p>
                </div>
              </div>

              <div className="glass-card alert-box info">
                <SparklesIcon style={{ width: 22, height: 22, color: 'var(--color-primary)' }} />
                <div>
                  <strong>Batch Strength: General Organic Chemistry (GOC)</strong>
                  <p>92% mastery across 312 students. Batch is performing in top 1% nationally for this topic.</p>
                </div>
              </div>
            </div>

            {/* Cohort Heatmap Table */}
            <div className="glass-card section-table-box">
              <div className="card-header-flex">
                <div>
                  <h3>Batch Concept Mastery Heatmap</h3>
                  <p className="text-muted font-sm">Aggregated performance across 14 historical mock papers</p>
                </div>
              </div>

              <div className="table-responsive">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Chapter & Core Concept</th>
                      <th>Class</th>
                      <th>Batch Mastery</th>
                      <th>Avg Accuracy</th>
                      <th>Questions Encountered</th>
                      <th>Recommended Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CONCEPT_MASTERY_LIST.map((c, i) => (
                      <tr key={i}>
                        <td><strong>{c.subject}</strong></td>
                        <td>{c.chapter}</td>
                        <td><span className="badge-class">Class {c.classLevel}</span></td>
                        <td>
                          <div className="table-progress-cell">
                            <span>{c.masteryPercentage}%</span>
                            <div className="progress-track sm">
                              <div
                                className={`progress-fill ${c.masteryPercentage >= 80 ? 'bg-emerald' : c.masteryPercentage >= 65 ? 'bg-indigo' : 'bg-amber'}`}
                                style={{ width: `${c.masteryPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td><strong>{c.accuracy}%</strong></td>
                        <td>{c.totalAttempted * 12} attempts</td>
                        <td>
                          {c.masteryPercentage < 65 ? (
                            <span className="action-tag text-destructive">Schedule Remedial Class</span>
                          ) : (
                            <span className="action-tag text-success">On Target</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= 5. RECENT TEST ANALYSIS ================= */}
        {activeTab === 'recent_analysis' && (
          <div className="recent-analysis-module">
            <div className="module-header-row">
              <div>
                <h2>Recent Paper Diagnostics: JEE Main Shift 1 Simulation</h2>
                <p className="text-muted">
                  Comprehensive class bell curve distribution, hardest questions, dwell time sinkholes, and rank leaderboard.
                </p>
              </div>

              <button className="btn-export-csv">
                <DownloadIcon style={{ width: 16, height: 16 }} /> Download Score PDF
              </button>
            </div>

            {/* Metric Summary Grid */}
            <div className="teacher-quick-stats-grid">
              <div className="glass-card t-stat-card">
                <span className="t-stat-lbl">Class Average</span>
                <span className="t-stat-val text-indigo">184 / 300</span>
                <span className="t-stat-sub">Median: 188</span>
              </div>
              <div className="glass-card t-stat-card">
                <span className="t-stat-lbl">Highest Score</span>
                <span className="t-stat-val text-emerald">268 / 300</span>
                <span className="t-stat-sub">Vikramaditya Joshi (99.81%ile)</span>
              </div>
              <div className="glass-card t-stat-card">
                <span className="t-stat-lbl">Estimated Cutoff</span>
                <span className="t-stat-val text-amber">90.5 %ile (~152 M)</span>
                <span className="t-stat-sub">General Category</span>
              </div>
              <div className="glass-card t-stat-card">
                <span className="t-stat-lbl">Submission Rate</span>
                <span className="t-stat-val text-cyan">100%</span>
                <span className="t-stat-sub">312 / 312 students submitted</span>
              </div>
            </div>

            {/* Hardest Questions & Sinkholes */}
            <div className="glass-card section-table-box">
              <div className="card-header-flex">
                <div>
                  <h3>Hardest Questions & Dwell-Time Sinkholes</h3>
                  <p className="text-muted font-sm">Questions that caused highest negative marking and time traps</p>
                </div>
              </div>

              <div className="table-responsive">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Q No.</th>
                      <th>Subject & Chapter</th>
                      <th>Failure Rate</th>
                      <th>Avg Dwell Time</th>
                      <th>Common Wrong Option</th>
                      <th>Diagnostic Insight</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Q42</strong></td>
                      <td>Mathematics · Quadratic Equations with Modulus</td>
                      <td><span className="text-destructive font-bold">78% Wrong / Blank</span></td>
                      <td>4m 12s (Time trap)</td>
                      <td>Option (B) "2 Solutions"</td>
                      <td>Students failed to verify extraneous roots in absolute value interval.</td>
                    </tr>
                    <tr>
                      <td><strong>Q18</strong></td>
                      <td>Physics · Electric Potential at Origin</td>
                      <td><span className="text-destructive font-bold">64% Wrong</span></td>
                      <td>3m 45s</td>
                      <td>Option (A) "1000 V"</td>
                      <td>Sign error when integrating dV = -E·dr from (0,0) to (10,20).</td>
                    </tr>
                    <tr>
                      <td><strong>Q31</strong></td>
                      <td>Chemistry · Chemical Kinetics Activation Energy</td>
                      <td><span className="text-amber font-bold">48% Calculation Error</span></td>
                      <td>2m 50s</td>
                      <td>Numerical entry 54 vs 54000</td>
                      <td>Unit mismatch between Joules and Kilojoules.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Batch Leaderboard Table */}
            <div className="glass-card section-table-box">
              <div className="card-header-flex">
                <div>
                  <h3>Batch Rank Leaderboard</h3>
                  <p className="text-muted font-sm">Rankings sorted by total marks with time taken tiebreaker</p>
                </div>
              </div>

              <div className="table-responsive">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Student Name</th>
                      <th>Roll No</th>
                      <th>Score</th>
                      <th>Percentile</th>
                      <th>Correct / Wrong</th>
                      <th>Time Taken</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_ROSTER.slice(0, 5).map((st, i) => (
                      <tr key={st.id}>
                        <td>
                          <span className={`rank-badge ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}`}>
                            #{i + 1}
                          </span>
                        </td>
                        <td><strong>{st.name}</strong></td>
                        <td><code>{st.rollNo}</code></td>
                        <td><strong className="text-primary">{st.avgScore} / 300</strong></td>
                        <td><strong className="text-emerald">{st.currentPercentile}%</strong></td>
                        <td>
                          <span className="text-success">{Math.round(st.avgScore / 4)} ✓</span> /{' '}
                          <span className="text-danger">{Math.round((300 - st.avgScore) / 8)} ✗</span>
                        </td>
                        <td>{145 + i * 6} mins</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
