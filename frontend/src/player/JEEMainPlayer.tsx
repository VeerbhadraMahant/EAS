import { useCallback, useEffect, useRef, useState } from 'react'
import { type Question, SAMPLE_JEE_QUESTIONS } from '../data/mockData'
import { AlertIcon, ClockIcon } from '../icons'

export type QuestionStatus = 'not_visited' | 'not_answered' | 'answered' | 'marked_for_review' | 'answered_marked_for_review'

interface JEEMainPlayerProps {
  testTitle?: string
  studentName?: string
  questions?: Question[]
  onFinish: (result: {
    totalMarks: number
    maxMarks: number
    answeredCount: number
    correctCount: number
    incorrectCount: number
    unattemptedCount: number
    answers: Record<string, string | number>
    statuses: Record<string, QuestionStatus>
    timeTakenSeconds: number
  }) => void
  onExit?: () => void
}

export function JEEMainPlayer({
  testTitle = 'JEE (Main) 2026 - Paper 1 (B.E./B.Tech)',
  studentName = 'Aarav Sharma',
  questions = SAMPLE_JEE_QUESTIONS,
  onFinish,
  onExit,
}: JEEMainPlayerProps) {
  const [activeSubject, setActiveSubject] = useState<'Physics' | 'Chemistry' | 'Mathematics'>('Physics')
  const [activeSection, setActiveSection] = useState<'section_a' | 'section_b'>('section_a')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(180 * 60) // 3 hours
  const [answers, setAnswers] = useState<Record<string, string | number>>({})
  const [statuses, setStatuses] = useState<Record<string, QuestionStatus>>(() => {
    const initial: Record<string, QuestionStatus> = {}
    questions.forEach((q, idx) => {
      initial[q.id] = idx === 0 ? 'not_answered' : 'not_visited'
    })
    return initial
  })
  const [showQuestionPaper, setShowQuestionPaper] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)

  // Filter questions for active subject
  const subjectQuestions = questions.filter((q) => q.subject === activeSubject)
  // Split into Section A (MCQs) and Section B (Numerical)
  const sectionAQuestions = subjectQuestions.filter((q) => q.type === 'mcq')
  const sectionBQuestions = subjectQuestions.filter((q) => q.type === 'numerical')

  const currentQuestionsList = activeSection === 'section_a' ? sectionAQuestions : sectionBQuestions
  const activeQuestion: Question | undefined = currentQuestionsList[currentIndex] || subjectQuestions[0] || questions[0]

  // Summary counts for palette & submission
  const counts = {
    answered: Object.values(statuses).filter((s) => s === 'answered').length,
    not_answered: Object.values(statuses).filter((s) => s === 'not_answered').length,
    not_visited: Object.values(statuses).filter((s) => s === 'not_visited').length,
    marked_for_review: Object.values(statuses).filter((s) => s === 'marked_for_review').length,
    answered_marked_for_review: Object.values(statuses).filter((s) => s === 'answered_marked_for_review').length,
  }

  const handleSubmitTest = useCallback(() => {
    let totalMarks = 0
    let correctCount = 0
    let incorrectCount = 0
    let unattemptedCount = 0

    questions.forEach((q) => {
      const ans = answers[q.id]
      const status = statuses[q.id]
      // Evaluation rule: Answered or Answered & Marked for review are graded
      const isConsidered = status === 'answered' || status === 'answered_marked_for_review'
      if (isConsidered && ans !== undefined && ans !== '') {
        const isCorrect = String(ans).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase()
        if (isCorrect) {
          totalMarks += q.marksPositive
          correctCount++
        } else {
          totalMarks -= q.marksNegative
          incorrectCount++
        }
      } else {
        unattemptedCount++
      }
    })

    const maxMarks = questions.length * 4
    onFinish({
      totalMarks,
      maxMarks,
      answeredCount: counts.answered + counts.answered_marked_for_review,
      correctCount,
      incorrectCount,
      unattemptedCount,
      answers,
      statuses,
      timeTakenSeconds: 180 * 60 - timeRemaining,
    })
  }, [answers, counts.answered, counts.answered_marked_for_review, onFinish, questions, statuses, timeRemaining])

  const submitRef = useRef(handleSubmitTest)
  useEffect(() => {
    submitRef.current = handleSubmitTest
  }, [handleSubmitTest])

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          submitRef.current()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Track question visitation
  function selectQuestion(qId: string, subj: 'Physics' | 'Chemistry' | 'Mathematics', sec: 'section_a' | 'section_b', idx: number) {
    setActiveSubject(subj)
    setActiveSection(sec)
    setCurrentIndex(idx)
    setStatuses((prev) => {
      if (prev[qId] === 'not_visited') {
        return { ...prev, [qId]: 'not_answered' }
      }
      return prev
    })
  }

  // Answer selection
  function handleSelectOption(optIdx: number) {
    if (!activeQuestion) return
    setAnswers((prev) => ({ ...prev, [activeQuestion.id]: optIdx }))
  }

  function handleVirtualKeypad(char: string) {
    if (!activeQuestion) return
    const currentVal = String(answers[activeQuestion.id] ?? '')
    if (char === 'CLEAR') {
      setAnswers((prev) => ({ ...prev, [activeQuestion.id]: '' }))
    } else if (char === 'BACKSPACE') {
      setAnswers((prev) => ({ ...prev, [activeQuestion.id]: currentVal.slice(0, -1) }))
    } else {
      if (currentVal.length < 8) {
        setAnswers((prev) => ({ ...prev, [activeQuestion.id]: currentVal + char }))
      }
    }
  }

  // NTA Action Handlers
  function handleSaveAndNext() {
    if (!activeQuestion) return
    const hasAnswer = answers[activeQuestion.id] !== undefined && answers[activeQuestion.id] !== ''
    setStatuses((prev) => ({
      ...prev,
      [activeQuestion.id]: hasAnswer ? 'answered' : 'not_answered',
    }))
    advanceNext()
  }

  function handleSaveAndMarkForReview() {
    if (!activeQuestion) return
    const hasAnswer = answers[activeQuestion.id] !== undefined && answers[activeQuestion.id] !== ''
    setStatuses((prev) => ({
      ...prev,
      [activeQuestion.id]: hasAnswer ? 'answered_marked_for_review' : 'marked_for_review',
    }))
    advanceNext()
  }

  function handleMarkForReviewAndNext() {
    if (!activeQuestion) return
    setStatuses((prev) => ({
      ...prev,
      [activeQuestion.id]: 'marked_for_review',
    }))
    advanceNext()
  }

  function handleClearResponse() {
    if (!activeQuestion) return
    setAnswers((prev) => {
      const next = { ...prev }
      delete next[activeQuestion.id]
      return next
    })
    setStatuses((prev) => ({
      ...prev,
      [activeQuestion.id]: 'not_answered',
    }))
  }

  function advanceNext() {
    if (currentIndex < currentQuestionsList.length - 1) {
      const nextQ = currentQuestionsList[currentIndex + 1]
      setCurrentIndex(currentIndex + 1)
      if (statuses[nextQ.id] === 'not_visited') {
        setStatuses((prev) => ({ ...prev, [nextQ.id]: 'not_answered' }))
      }
    } else if (activeSection === 'section_a' && sectionBQuestions.length > 0) {
      setActiveSection('section_b')
      setCurrentIndex(0)
      const nextQ = sectionBQuestions[0]
      if (statuses[nextQ.id] === 'not_visited') {
        setStatuses((prev) => ({ ...prev, [nextQ.id]: 'not_answered' }))
      }
    } else {
      // Switch subject
      const subjects: ('Physics' | 'Chemistry' | 'Mathematics')[] = ['Physics', 'Chemistry', 'Mathematics']
      const curIdx = subjects.indexOf(activeSubject)
      if (curIdx < subjects.length - 1) {
        const nextSubj = subjects[curIdx + 1]
        setActiveSubject(nextSubj)
        setActiveSection('section_a')
        setCurrentIndex(0)
      }
    }
  }

  const hours = Math.floor(timeRemaining / 3600)
  const minutes = Math.floor((timeRemaining % 3600) / 60)
  const seconds = timeRemaining % 60
  const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  return (
    <div className="nta-container">
      {/* NTA Top Header */}
      <header className="nta-header">
        <div className="nta-header-left">
          <div className="nta-logo-badge">NTA / JEE</div>
          <div className="nta-exam-meta">
            <h1 className="nta-exam-title">{testTitle}</h1>
            <span className="nta-exam-subtitle">Paper 1: B.E. / B.Tech (Physics, Chemistry, Mathematics)</span>
          </div>
        </div>

        <div className="nta-header-right">
          <div className="nta-candidate-card">
            <div className="nta-candidate-avatar">
              <span className="nta-avatar-icon">👤</span>
            </div>
            <div className="nta-candidate-details">
              <div className="nta-detail-row">
                <span className="nta-lbl">Candidate:</span>
                <strong className="nta-val">{studentName}</strong>
              </div>
              <div className="nta-detail-row">
                <span className="nta-lbl">Subject:</span>
                <span className="nta-val">{activeSubject}</span>
              </div>
              <div className="nta-detail-row">
                <span className="nta-lbl">System:</span>
                <span className="nta-val text-mono">C001</span>
              </div>
            </div>
          </div>
          {onExit && (
            <button
              onClick={onExit}
              style={{
                marginLeft: 10,
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                padding: '4px 8px',
                borderRadius: 4,
                fontSize: '0.75rem',
              }}
            >
              Exit Demo
            </button>
          )}
        </div>
      </header>

      {/* Main Examination Workspace */}
      <div className="nta-workspace">
        <div className="nta-left-pane">
          {/* Subject Navigation Bar */}
          <div className="nta-subject-bar">
            {(['Physics', 'Chemistry', 'Mathematics'] as const).map((subj) => (
              <button
                key={subj}
                className={`nta-subj-btn ${activeSubject === subj ? 'active' : ''}`}
                onClick={() => {
                  setActiveSubject(subj)
                  setActiveSection('section_a')
                  setCurrentIndex(0)
                }}
              >
                {subj}
              </button>
            ))}
          </div>

          {/* Section A / B Tab Bar */}
          <div className="nta-section-bar">
            <div className="nta-section-pills">
              <button
                className={`nta-sec-btn ${activeSection === 'section_a' ? 'active' : ''}`}
                onClick={() => {
                  setActiveSection('section_a')
                  setCurrentIndex(0)
                }}
              >
                Section A (MCQs)
              </button>
              <button
                className={`nta-sec-btn ${activeSection === 'section_b' ? 'active' : ''}`}
                onClick={() => {
                  setActiveSection('section_b')
                  setCurrentIndex(0)
                }}
              >
                Section B (Numerical Entry)
              </button>
            </div>

            <div className="nta-marking-info">
              <span>Marks: </span>
              <strong className="text-success">+{activeQuestion?.marksPositive || 4}</strong>
              <span className="mx-1">/</span>
              <strong className="text-danger">-{activeQuestion?.marksNegative || 1}</strong>
            </div>
          </div>

          {/* Question Display Screen */}
          <div className="nta-question-card">
            <div className="nta-q-header">
              <div className="nta-q-number">
                Question No. {currentIndex + 1}
                <span className="nta-q-type-badge">
                  {activeQuestion?.type === 'mcq' ? 'Single Choice (MCQ)' : 'Numerical Value'}
                </span>
              </div>
              <div className="nta-q-lang">
                <span>View in: <strong>English</strong></span>
              </div>
            </div>

            <div className="nta-q-body">
              <p className="nta-q-text">{activeQuestion?.text}</p>

              {activeQuestion?.pyqInfo && (
                <div className="nta-pyq-tag">
                  <span>📌 Reference: {activeQuestion.pyqInfo}</span>
                </div>
              )}

              {/* Answer input rendering */}
              {activeQuestion?.type === 'mcq' ? (
                <div className="nta-options-list">
                  {activeQuestion.options?.map((opt) => {
                    const isChecked = answers[activeQuestion.id] === opt.id
                    return (
                      <label
                        key={opt.id}
                        className={`nta-option-item ${isChecked ? 'selected' : ''}`}
                        onClick={() => handleSelectOption(opt.id)}
                      >
                        <input
                          type="radio"
                          name={`q_${activeQuestion.id}`}
                          checked={isChecked}
                          onChange={() => handleSelectOption(opt.id)}
                          className="nta-radio-input"
                        />
                        <span className="nta-option-ordinal">({String.fromCharCode(65 + opt.id)})</span>
                        <span className="nta-option-text">{opt.text}</span>
                      </label>
                    )
                  })}
                </div>
              ) : (
                <div className="nta-numerical-box">
                  <p className="nta-num-instruction">
                    Enter the numerical value below (use the on-screen keypad or your keyboard). Round to nearest integer if applicable:
                  </p>
                  <div className="nta-num-input-row">
                    <input
                      type="text"
                      className="nta-num-input"
                      value={String(answers[activeQuestion?.id ?? ''] ?? '')}
                      readOnly
                      placeholder="Enter value..."
                    />
                    <button className="nta-keypad-btn clear" onClick={() => handleVirtualKeypad('CLEAR')}>
                      Clear
                    </button>
                    <button className="nta-keypad-btn backspace" onClick={() => handleVirtualKeypad('BACKSPACE')}>
                      ⌫ Backspace
                    </button>
                  </div>

                  <div className="nta-virtual-keypad">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.', '-'].map((char) => (
                      <button
                        key={char}
                        className="nta-keypad-key"
                        onClick={() => handleVirtualKeypad(char)}
                      >
                        {char}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* NTA Exact Bottom Action Bar */}
          <div className="nta-action-bar">
            <div className="nta-action-left">
              <button className="nta-btn nta-btn-save-next" onClick={handleSaveAndNext}>
                Save & Next
              </button>
              <button className="nta-btn nta-btn-clear" onClick={handleClearResponse}>
                Clear Response
              </button>
              <button className="nta-btn nta-btn-save-mark" onClick={handleSaveAndMarkForReview}>
                Save & Mark for Review
              </button>
              <button className="nta-btn nta-btn-mark-next" onClick={handleMarkForReviewAndNext}>
                Mark for Review & Next
              </button>
            </div>

            <div className="nta-action-right">
              <button
                className="nta-btn nta-btn-nav"
                disabled={currentIndex === 0}
                onClick={() => {
                  if (currentIndex > 0) setCurrentIndex(currentIndex - 1)
                }}
              >
                &lt;&lt; Back
              </button>
              <button
                className="nta-btn nta-btn-nav"
                disabled={currentIndex === currentQuestionsList.length - 1}
                onClick={() => {
                  if (currentIndex < currentQuestionsList.length - 1) setCurrentIndex(currentIndex + 1)
                }}
              >
                Next &gt;&gt;
              </button>
            </div>
          </div>
        </div>

        {/* NTA Right Question Palette */}
        <aside className="nta-right-pane">
          {/* Timer Widget */}
          <div className="nta-timer-card">
            <div className="nta-timer-title">
              <ClockIcon style={{ width: 18, height: 18 }} />
              <span>Time Left</span>
            </div>
            <div className="nta-timer-digits text-mono">{formattedTime}</div>
          </div>

          {/* Official 5-State Legend */}
          <div className="nta-palette-legend">
            <div className="nta-legend-item">
              <span className="nta-badge-shape nta-badge-answered">{counts.answered}</span>
              <span className="nta-legend-label">Answered</span>
            </div>
            <div className="nta-legend-item">
              <span className="nta-badge-shape nta-badge-not-answered">{counts.not_answered}</span>
              <span className="nta-legend-label">Not Answered</span>
            </div>
            <div className="nta-legend-item">
              <span className="nta-badge-shape nta-badge-not-visited">{counts.not_visited}</span>
              <span className="nta-legend-label">Not Visited</span>
            </div>
            <div className="nta-legend-item">
              <span className="nta-badge-shape nta-badge-marked">{counts.marked_for_review}</span>
              <span className="nta-legend-label">Marked for Review</span>
            </div>
            <div className="nta-legend-item">
              <span className="nta-badge-shape nta-badge-answered-marked">{counts.answered_marked_for_review}</span>
              <span className="nta-legend-label">
                Answered & Marked for Review <small>(will be considered for evaluation)</small>
              </span>
            </div>
          </div>

          {/* Subject Question Grid Header */}
          <div className="nta-palette-header">
            <h4>{activeSubject}</h4>
            <span className="nta-sec-label">{activeSection === 'section_a' ? 'Section A' : 'Section B'}</span>
          </div>

          {/* Question Grid Buttons */}
          <div className="nta-palette-grid">
            {currentQuestionsList.map((q, idx) => {
              const status = statuses[q.id] || 'not_visited'
              const isCurrent = activeQuestion?.id === q.id
              return (
                <button
                  key={q.id}
                  className={`nta-grid-btn nta-status-${status} ${isCurrent ? 'current-active' : ''}`}
                  onClick={() => selectQuestion(q.id, activeSubject, activeSection, idx)}
                  title={`Question ${idx + 1} (${status.replace(/_/g, ' ')})`}
                >
                  {idx + 1}
                  {status === 'answered_marked_for_review' && <span className="nta-check-dot">✓</span>}
                </button>
              )
            })}
          </div>

          {/* Quick Utility Links & Submit Button */}
          <div className="nta-palette-footer">
            <div className="nta-quick-links">
              <button className="nta-link-btn" onClick={() => setShowQuestionPaper(true)}>
                📄 Question Paper
              </button>
              <button className="nta-link-btn" onClick={() => setShowInstructions(true)}>
                ℹ️ Instructions
              </button>
            </div>

            <button className="nta-btn-submit" onClick={() => setShowSubmitModal(true)}>
              Submit Exam
            </button>
          </div>
        </aside>
      </div>

      {/* Question Paper Preview Modal */}
      {showQuestionPaper && (
        <div className="nta-modal-scrim" onClick={() => setShowQuestionPaper(false)}>
          <div className="nta-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="nta-modal-header">
              <h3>Question Paper Preview</h3>
              <button className="nta-modal-close" onClick={() => setShowQuestionPaper(false)}>✕</button>
            </div>
            <div className="nta-modal-body">
              {questions.map((q, idx) => (
                <div key={q.id} className="nta-paper-q-block">
                  <div className="nta-paper-q-meta">
                    <strong>Q{idx + 1}.</strong> [{q.subject} - {q.chapter}] (Marks: +{q.marksPositive}, -{q.marksNegative})
                  </div>
                  <p className="nta-paper-q-text">{q.text}</p>
                  {q.options && (
                    <div className="nta-paper-options">
                      {q.options.map((opt) => (
                        <div key={opt.id}>({String.fromCharCode(65 + opt.id)}) {opt.text}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="nta-modal-scrim" onClick={() => setShowInstructions(false)}>
          <div className="nta-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="nta-modal-header">
              <h3>General Instructions - NTA JEE Main</h3>
              <button className="nta-modal-close" onClick={() => setShowInstructions(false)}>✕</button>
            </div>
            <div className="nta-modal-body" style={{ lineHeight: 1.6, fontSize: '0.92rem' }}>
              <h4>General Instructions:</h4>
              <ol style={{ paddingLeft: 20 }}>
                <li>Total duration of JEE (Main) Paper 1 is 180 minutes.</li>
                <li>The clock has been set on the server and the countdown timer at the top right corner shows remaining time.</li>
                <li>When the timer reaches zero, the examination will end automatically.</li>
                <li>You can navigate freely between Physics, Chemistry, and Mathematics.</li>
              </ol>
              <h4 style={{ marginTop: 16 }}>Marking Scheme:</h4>
              <ul style={{ paddingLeft: 20 }}>
                <li>Section A (MCQs): +4 for correct, -1 for incorrect, 0 for unattempted.</li>
                <li>Section B (Numerical): +4 for correct, -1 for incorrect, 0 for unattempted.</li>
                <li>Questions marked for review with an answer WILL be evaluated.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="nta-modal-scrim" onClick={() => setShowSubmitModal(false)}>
          <div className="nta-modal-card submit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="nta-modal-header">
              <h3>Exam Summary & Submission</h3>
              <button className="nta-modal-close" onClick={() => setShowSubmitModal(false)}>✕</button>
            </div>
            <div className="nta-modal-body">
              <table className="nta-summary-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>No. of Questions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span className="nta-badge-shape nta-badge-answered"></span> Answered</td>
                    <td><strong>{counts.answered}</strong></td>
                  </tr>
                  <tr>
                    <td><span className="nta-badge-shape nta-badge-not-answered"></span> Not Answered</td>
                    <td><strong>{counts.not_answered}</strong></td>
                  </tr>
                  <tr>
                    <td><span className="nta-badge-shape nta-badge-marked"></span> Marked for Review</td>
                    <td><strong>{counts.marked_for_review}</strong></td>
                  </tr>
                  <tr>
                    <td><span className="nta-badge-shape nta-badge-answered-marked"></span> Answered & Marked for Review</td>
                    <td><strong>{counts.answered_marked_for_review}</strong></td>
                  </tr>
                  <tr>
                    <td><span className="nta-badge-shape nta-badge-not-visited"></span> Not Visited</td>
                    <td><strong>{counts.not_visited}</strong></td>
                  </tr>
                </tbody>
              </table>

              <div className="nta-submit-warning">
                <AlertIcon style={{ width: 22, height: 22, color: 'var(--color-destructive)' }} />
                <span>
                  Are you sure you want to submit? Once submitted, you cannot change your answers.
                </span>
              </div>
            </div>
            <div className="nta-modal-footer">
              <button className="nta-btn nta-btn-clear" onClick={() => setShowSubmitModal(false)}>
                Return to Exam
              </button>
              <button className="nta-btn nta-btn-save-next" onClick={handleSubmitTest}>
                Confirm Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
