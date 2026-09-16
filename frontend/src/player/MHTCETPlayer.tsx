import { useCallback, useEffect, useRef, useState } from 'react'
import { type Question, SAMPLE_CET_QUESTIONS } from '../data/mockData'
import { AlertIcon, ClockIcon } from '../icons'

interface MHTCETPlayerProps {
  testTitle?: string
  studentName?: string
  questions?: Question[]
  onFinish: (result: {
    totalMarks: number
    maxMarks: number
    part1Marks: number
    part2Marks: number
    answeredCount: number
    correctCount: number
    incorrectCount: number
    unattemptedCount: number
    answers: Record<string, string | number>
    timeTakenSeconds: number
  }) => void
  onExit?: () => void
}

export function MHTCETPlayer({
  testTitle = 'MHT-CET 2026 PCM (State Common Entrance Test)',
  studentName = 'Ananya Deshmukh',
  questions = SAMPLE_CET_QUESTIONS,
  onFinish,
  onExit,
}: MHTCETPlayerProps) {
  // MHT-CET has 2 Parts:
  // Part 1: Physics & Chemistry (90 min) - Locked once submitted
  // Part 2: Mathematics (90 min) - Locked once submitted
  const [currentPart, setCurrentPart] = useState<1 | 2>(1)
  const [part1Submitted, setPart1Submitted] = useState(false)
  const [activeSubject, setActiveSubject] = useState<'Physics' | 'Chemistry' | 'Mathematics'>('Physics')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [partTimeRemaining, setPartTimeRemaining] = useState(90 * 60) // 90 min per part
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({})
  const [visited, setVisited] = useState<Record<string, boolean>>({})
  const [showPartTransitionModal, setShowPartTransitionModal] = useState(false)
  const [showFinalSubmitModal, setShowFinalSubmitModal] = useState(false)

  // Get questions for active part & subject
  const activeSubjectQuestions = questions.filter((q) => q.subject === activeSubject)
  const activeQuestion: Question | undefined = activeSubjectQuestions[currentIndex] || activeSubjectQuestions[0] || questions[0]

  const handleAutoAdvanceToPart2 = useCallback(() => {
    setPart1Submitted(true)
    setCurrentPart(2)
    setActiveSubject('Mathematics')
    setCurrentIndex(0)
    setPartTimeRemaining(90 * 60)
  }, [])

  const handleFinalSubmit = useCallback(() => {
    let part1Marks = 0
    let part2Marks = 0
    let correctCount = 0
    let incorrectCount = 0
    let unattemptedCount = 0

    questions.forEach((q) => {
      const ans = answers[q.id]
      if (ans !== undefined) {
        const isCorrect = Number(ans) === Number(q.correctAnswer)
        const weight = q.subject === 'Mathematics' ? 2 : 1
        if (isCorrect) {
          if (q.subject === 'Mathematics') part2Marks += weight
          else part1Marks += weight
          correctCount++
        } else {
          incorrectCount++
        }
      } else {
        unattemptedCount++
      }
    })

    const totalMarks = part1Marks + part2Marks
    const maxMarks = 200 // 100 in Part 1 + 100 in Part 2

    onFinish({
      totalMarks,
      maxMarks,
      part1Marks,
      part2Marks,
      answeredCount: Object.keys(answers).length,
      correctCount,
      incorrectCount,
      unattemptedCount,
      answers,
      timeTakenSeconds: 180 * 60 - partTimeRemaining,
    })
  }, [answers, onFinish, partTimeRemaining, questions])

  const autoAdvanceRef = useRef(handleAutoAdvanceToPart2)
  const finalSubmitRef = useRef(handleFinalSubmit)

  useEffect(() => {
    autoAdvanceRef.current = handleAutoAdvanceToPart2
    finalSubmitRef.current = handleFinalSubmit
  }, [handleAutoAdvanceToPart2, handleFinalSubmit])

  // Countdown timer for active part
  useEffect(() => {
    const timer = setInterval(() => {
      setPartTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          if (currentPart === 1) {
            autoAdvanceRef.current()
          } else {
            finalSubmitRef.current()
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [currentPart])

  function selectSubject(subj: 'Physics' | 'Chemistry' | 'Mathematics') {
    if (currentPart === 1 && (subj === 'Physics' || subj === 'Chemistry')) {
      setActiveSubject(subj)
      setCurrentIndex(0)
    } else if (currentPart === 2 && subj === 'Mathematics') {
      setActiveSubject('Mathematics')
      setCurrentIndex(0)
    }
  }

  function handleSelectOption(optIdx: number) {
    if (!activeQuestion) return
    setAnswers((prev) => ({ ...prev, [activeQuestion.id]: optIdx }))
    setVisited((prev) => ({ ...prev, [activeQuestion.id]: true }))
  }

  function handleClear() {
    if (!activeQuestion) return
    setAnswers((prev) => {
      const copy = { ...prev }
      delete copy[activeQuestion.id]
      return copy
    })
    setMarkedForReview((prev) => ({ ...prev, [activeQuestion.id]: false }))
  }

  function handleMarkForReview() {
    if (!activeQuestion) return
    setMarkedForReview((prev) => ({ ...prev, [activeQuestion.id]: !prev[activeQuestion.id] }))
    handleNext()
  }

  function handleNext() {
    if (activeQuestion) {
      setVisited((prev) => ({ ...prev, [activeQuestion.id]: true }))
    }
    if (currentIndex < activeSubjectQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else if (currentPart === 1 && activeSubject === 'Physics') {
      setActiveSubject('Chemistry')
      setCurrentIndex(0)
    }
  }

  function handlePrev() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    } else if (currentPart === 1 && activeSubject === 'Chemistry') {
      setActiveSubject('Physics')
      const phyQs = questions.filter((q) => q.subject === 'Physics')
      setCurrentIndex(Math.max(0, phyQs.length - 1))
    }
  }

  function handleSaveAndNext() {
    handleNext()
  }

  function handleManualPart1Submit() {
    setShowPartTransitionModal(true)
  }

  function handleConfirmPart2Transition() {
    setShowPartTransitionModal(false)
    setPart1Submitted(true)
    setCurrentPart(2)
    setActiveSubject('Mathematics')
    setCurrentIndex(0)
    setPartTimeRemaining(90 * 60)
  }

  const mins = Math.floor(partTimeRemaining / 60)
  const secs = partTimeRemaining % 60
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`

  return (
    <div className="cet-container">
      {/* CET Header */}
      <header className="cet-header">
        <div className="cet-header-left">
          <div className="cet-logo-badge">MAH-CET CELL</div>
          <div>
            <h1 className="cet-title">{testTitle}</h1>
            <span className="cet-subtitle">
              Government of Maharashtra · State Common Entrance Test Cell, Mumbai
            </span>
          </div>
        </div>

        <div className="cet-header-right">
          <div className="cet-candidate-info">
            <span>Roll No: <strong>2026-CET-0119</strong></span>
            <span>Name: <strong>{studentName}</strong></span>
          </div>
          <div className="cet-timer-badge">
            <ClockIcon style={{ width: 20, height: 20 }} />
            <span>Time Left: <strong>{formattedTime}</strong></span>
          </div>
          {onExit && (
            <button
              onClick={onExit}
              style={{
                marginLeft: 10,
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
                padding: '4px 8px',
                borderRadius: 4,
                fontSize: '0.75rem',
              }}
            >
              Exit
            </button>
          )}
        </div>
      </header>

      {/* CET Part Indicator & Lock Status Banner */}
      <div className="cet-parts-banner">
        <div className={`cet-part-pill ${currentPart === 1 ? 'active' : part1Submitted ? 'locked' : ''}`}>
          <span className="cet-part-num">Part 1</span>
          <span className="cet-part-name">Physics & Chemistry (90 Min)</span>
          {part1Submitted && <span className="cet-lock-tag">🔒 LOCKED</span>}
        </div>

        <div className={`cet-part-pill ${currentPart === 2 ? 'active' : 'locked'}`}>
          <span className="cet-part-num">Part 2</span>
          <span className="cet-part-name">Mathematics (90 Min)</span>
          {currentPart === 1 && <span className="cet-lock-tag">🔒 Locked until Part 1 Submits</span>}
        </div>
      </div>

      {/* Main Examination Grid */}
      <div className="cet-workspace">
        <div className="cet-left-pane">
          {/* Subject Tab Bar */}
          <div className="cet-subject-bar">
            {currentPart === 1 ? (
              <>
                <button
                  className={`cet-subj-tab ${activeSubject === 'Physics' ? 'active' : ''}`}
                  onClick={() => selectSubject('Physics')}
                >
                  Physics (50 Qs · 1 Mark Each)
                </button>
                <button
                  className={`cet-subj-tab ${activeSubject === 'Chemistry' ? 'active' : ''}`}
                  onClick={() => selectSubject('Chemistry')}
                >
                  Chemistry (50 Qs · 1 Mark Each)
                </button>
              </>
            ) : (
              <button className="cet-subj-tab active" onClick={() => selectSubject('Mathematics')}>
                Mathematics (50 Qs · 2 Marks Each · No Negative Marking)
              </button>
            )}
          </div>

          {/* Question Display Card */}
          <div className="cet-question-panel">
            <div className="cet-q-meta">
              <span><strong>Question {currentIndex + 1}</strong> of {activeSubjectQuestions.length}</span>
              <span className="cet-marks-tag">
                Marks: +{activeSubject === 'Mathematics' ? '2' : '1'} | Negative: 0
              </span>
            </div>

            <div className="cet-q-content">
              <p className="cet-q-text">{activeQuestion?.text}</p>

              <div className="cet-options-group">
                {activeQuestion?.options?.map((opt) => {
                  const isSelected = answers[activeQuestion.id] === opt.id
                  return (
                    <label
                      key={opt.id}
                      className={`cet-option-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectOption(opt.id)}
                    >
                      <input
                        type="radio"
                        name={activeQuestion.id}
                        checked={isSelected}
                        onChange={() => handleSelectOption(opt.id)}
                      />
                      <span className="cet-opt-ordinal">{String.fromCharCode(65 + opt.id)}</span>
                      <span className="cet-opt-text">{opt.text}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* CET Action Bar */}
            <div className="cet-action-bar">
              <div className="cet-action-left">
                <button className="cet-btn cet-btn-review" onClick={handleMarkForReview}>
                  {markedForReview[activeQuestion?.id ?? ''] ? 'Unmark Review' : 'Mark for Review'}
                </button>
                <button className="cet-btn cet-btn-clear" onClick={handleClear}>
                  Clear Response
                </button>
              </div>

              <div className="cet-action-right">
                <button className="cet-btn cet-btn-nav" disabled={currentIndex === 0 && (currentPart === 2 || activeSubject === 'Physics')} onClick={handlePrev}>
                  &lt; Previous
                </button>
                <button className="cet-btn cet-btn-primary" onClick={handleSaveAndNext}>
                  Save & Next &gt;
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CET Right Palette */}
        <aside className="cet-right-pane">
          <div className="cet-palette-header">
            <h4>Question Palette</h4>
            <span className="cet-subj-title">{activeSubject}</span>
          </div>

          {/* CET Legend */}
          <div className="cet-legend">
            <div className="cet-legend-item">
              <span className="cet-swatch cet-swatch-answered"></span>
              <span>Answered</span>
            </div>
            <div className="cet-legend-item">
              <span className="cet-swatch cet-swatch-unanswered"></span>
              <span>Not Answered</span>
            </div>
            <div className="cet-legend-item">
              <span className="cet-swatch cet-swatch-review"></span>
              <span>Marked for Review</span>
            </div>
            <div className="cet-legend-item">
              <span className="cet-swatch cet-swatch-notvisited"></span>
              <span>Not Visited</span>
            </div>
          </div>

          {/* Palette Grid */}
          <div className="cet-palette-grid">
            {activeSubjectQuestions.map((q, idx) => {
              const isAns = answers[q.id] !== undefined
              const isRev = markedForReview[q.id]
              const isVis = visited[q.id]
              const isCurr = activeQuestion?.id === q.id

              let stateClass = 'notvisited'
              if (isRev) stateClass = 'review'
              else if (isAns) stateClass = 'answered'
              else if (isVis) stateClass = 'unanswered'

              return (
                <button
                  key={q.id}
                  className={`cet-pal-btn ${stateClass} ${isCurr ? 'current' : ''}`}
                  onClick={() => {
                    setVisited((prev) => ({ ...prev, [q.id]: true }))
                    setCurrentIndex(idx)
                  }}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>

          {/* Part Submission Controls */}
          <div className="cet-submit-block">
            {currentPart === 1 ? (
              <button className="cet-btn-part-submit" onClick={handleManualPart1Submit}>
                Submit Part 1 & Lock
              </button>
            ) : (
              <button className="cet-btn-final-submit" onClick={() => setShowFinalSubmitModal(true)}>
                Final Submit Exam
              </button>
            )}
          </div>
        </aside>
      </div>

      {/* Part 1 to Part 2 Transition Modal */}
      {showPartTransitionModal && (
        <div className="cet-modal-scrim" onClick={() => setShowPartTransitionModal(false)}>
          <div className="cet-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Submit Part 1 (Physics & Chemistry)?</h3>
            <div className="cet-modal-body">
              <div className="cet-warning-box">
                <AlertIcon style={{ width: 28, height: 28, color: 'var(--color-warning)' }} />
                <div>
                  <strong>MHT-CET Rule:</strong>
                  <p>
                    Once you submit Part 1, you CANNOT return to Physics and Chemistry questions. Part 2 (Mathematics)
                    will start immediately for 90 minutes.
                  </p>
                </div>
              </div>
              <p>Answered in Part 1: {Object.keys(answers).length} questions.</p>
            </div>
            <div className="cet-modal-footer">
              <button className="cet-btn cet-btn-clear" onClick={() => setShowPartTransitionModal(false)}>
                Cancel & Review
              </button>
              <button className="cet-btn cet-btn-primary" onClick={handleConfirmPart2Transition}>
                Lock Part 1 & Proceed to Maths
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Final Submit Modal */}
      {showFinalSubmitModal && (
        <div className="cet-modal-scrim" onClick={() => setShowFinalSubmitModal(false)}>
          <div className="cet-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Submit MHT-CET Exam?</h3>
            <div className="cet-modal-body">
              <p>You have completed your examination. Confirming submission will end your test session.</p>
              <div className="cet-stat-grid">
                <div>Total Questions Answered: <strong>{Object.keys(answers).length}</strong></div>
              </div>
            </div>
            <div className="cet-modal-footer">
              <button className="cet-btn cet-btn-clear" onClick={() => setShowFinalSubmitModal(false)}>
                Back
              </button>
              <button className="cet-btn cet-btn-final-submit" onClick={handleFinalSubmit}>
                Confirm Final Submission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
