import { useEffect, useState } from 'react'
import { api } from './api'
import { CheckCircleIcon, MinusCircleIcon, XCircleIcon } from './icons'

interface SubjectTotal {
  correct: number
  incorrect: number
  unattempted: number
  marks: number
  max_marks: number
}

interface ReportQuestion {
  ordinal: number
  subject: string
  text: string
  outcome: 'correct' | 'incorrect' | 'unattempted'
  marks_awarded: number
}

interface ReportPayload {
  status: string
  total_marks?: number
  total_max_marks?: number
  by_subject?: Record<string, SubjectTotal>
  questions?: ReportQuestion[]
}

const OUTCOME_ICON = {
  correct: CheckCircleIcon,
  incorrect: XCircleIcon,
  unattempted: MinusCircleIcon,
}

export function Report({ sessionId }: { sessionId: string }) {
  const [report, setReport] = useState<ReportPayload>({ status: 'pending' })

  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout>
    async function poll() {
      const r = await api.report(sessionId)
      if (cancelled) return
      setReport(r as ReportPayload)
      if (r.status !== 'ready') timer = setTimeout(poll, 1500)
    }
    poll()
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [sessionId])

  if (report.status !== 'ready') {
    return (
      <div className="state-screen">
        <div className="spinner" />
        <p>Grading your paper…</p>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-muted-foreground)' }}>
          The worker process picks this up within a couple of seconds — make sure it's running.
        </p>
      </div>
    )
  }

  const subjects = Object.entries(report.by_subject ?? {})
  const totals = subjects.reduce(
    (acc, [, t]) => ({
      correct: acc.correct + t.correct,
      incorrect: acc.incorrect + t.incorrect,
      unattempted: acc.unattempted + t.unattempted,
    }),
    { correct: 0, incorrect: 0, unattempted: 0 },
  )

  return (
    <div className="page">
      <div className="container">
        <div className="card report-hero">
          <p className="eyebrow" style={{ color: 'var(--color-accent)', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Your score
          </p>
          <p className="report-score">
            {report.total_marks}
            <span> / {report.total_max_marks}</span>
          </p>
          <div className="report-summary-row">
            <span className="report-summary-item">
              <span className="dot" style={{ background: 'var(--color-success)' }} /> {totals.correct} correct
            </span>
            <span className="report-summary-item">
              <span className="dot" style={{ background: 'var(--color-destructive)' }} /> {totals.incorrect} incorrect
            </span>
            <span className="report-summary-item">
              <span className="dot" style={{ background: 'var(--color-muted-foreground)' }} /> {totals.unattempted} unattempted
            </span>
          </div>
        </div>

        <section className="section card" style={{ padding: 'var(--space-5)' }}>
          <h3>Subject breakdown</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="subject-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Correct</th>
                  <th>Incorrect</th>
                  <th>Unattempted</th>
                  <th>Marks</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map(([subject, t]) => (
                  <tr key={subject}>
                    <td>{subject}</td>
                    <td className="num">{t.correct}</td>
                    <td className="num">{t.incorrect}</td>
                    <td className="num">{t.unattempted}</td>
                    <td className="num">
                      {t.marks} / {t.max_marks}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="section card" style={{ padding: 'var(--space-5)' }}>
          <h3>Per question</h3>
          <ul className="question-review-list">
            {(report.questions ?? []).map((q) => {
              const Icon = OUTCOME_ICON[q.outcome]
              return (
                <li className="question-review-item" key={q.ordinal}>
                  <span className="outcome-icon" data-outcome={q.outcome}>
                    <Icon />
                  </span>
                  <span className="question-review-text">
                    Q{q.ordinal} · {q.subject} — {q.text}
                  </span>
                  <span
                    className="question-review-marks"
                    style={{
                      color:
                        q.outcome === 'correct'
                          ? 'var(--color-success)'
                          : q.outcome === 'incorrect'
                            ? 'var(--color-destructive)'
                            : 'var(--color-muted-foreground)',
                    }}
                  >
                    {q.marks_awarded > 0 ? '+' : ''}
                    {q.marks_awarded}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      </div>
    </div>
  )
}
