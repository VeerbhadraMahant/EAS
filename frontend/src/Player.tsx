import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { api, type Bundle } from './api'
import { db, recordEvent, replayAnswers } from './db'
import { ChevronLeftIcon, ChevronRightIcon, ClockIcon, CloudIcon, CloudOffIcon } from './icons'

const HEARTBEAT_MS = 15_000
const WARNING_THRESHOLD_S = 120
const CRITICAL_THRESHOLD_S = 60

interface Props {
  sessionId: string
  ordinal: number
  onSubmitted: (sessionState: string) => void
}

export function Player({ sessionId, ordinal, onSubmitted }: Props) {
  const [bundle, setBundle] = useState<Bundle | null>(null)
  const [answers, setAnswers] = useState<Map<string, number | null>>(new Map())
  const [current, setCurrent] = useState(0)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingSync, setPendingSync] = useState(0)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const partId = bundle?.part_id ?? null

  const flushEvents = useCallback(async () => {
    const unsynced = await db.events.where({ sessionId, synced: 0 }).sortBy('clientSeq')
    setPendingSync(unsynced.length)
    if (unsynced.length === 0) return
    await api.postEvents(
      sessionId,
      unsynced.map((e) => ({
        client_instance_id: e.clientInstanceId,
        client_seq: e.clientSeq,
        part_id: e.partId,
        type: e.type,
        client_ts: e.clientTs,
        payload: e.payload,
      })),
    )
    await db.events.bulkPut(unsynced.map((e) => ({ ...e, synced: 1 as const })))
    setPendingSync(0)
  }, [sessionId])

  // Initial load: preload bundle (starting the clock if not already started),
  // then replay local events so a hard refresh restores exact answer state
  // without waiting on the network.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const initial = await api.bundle(sessionId, ordinal)
      const active = initial.state === 'pending' ? await api.start(sessionId, ordinal) : initial
      const restored = await replayAnswers(sessionId)
      if (cancelled) return
      setBundle(active)
      setAnswers(restored)
      setRemaining(active.remaining_seconds)
    })()
    return () => {
      cancelled = true
    }
  }, [sessionId, ordinal])

  // Local 1s countdown between reconciliations.
  useEffect(() => {
    if (remaining === null) return
    const t = setInterval(() => setRemaining((r) => (r === null ? r : Math.max(0, r - 1))), 1000)
    return () => clearInterval(t)
  }, [remaining === null])

  const submittedRef = useRef(false)
  const submit = useCallback(async () => {
    if (submittedRef.current) return
    submittedRef.current = true
    setSubmitting(true)
    setSubmitError(null)
    try {
      await flushEvents()
      const result = await api.submit(sessionId, ordinal)
      onSubmitted(result.session_state)
    } catch (e) {
      // Network hiccup or backend down: don't strand the student on a dead
      // "Submitting…" button — their answers are still safe in Dexie either
      // way, so let them retry.
      submittedRef.current = false
      setSubmitting(false)
      setSubmitError(String(e))
    }
  }, [flushEvents, sessionId, ordinal, onSubmitted])

  // Server-authoritative reconciliation + background sync. Never trust the
  // client clock past this correction. Failures here are transient network
  // issues — logged, not surfaced, since the countdown itself is still
  // running locally and will retry on the next tick.
  useEffect(() => {
    const t = setInterval(async () => {
      try {
        await flushEvents()
        const hb = await api.heartbeat(sessionId, ordinal)
        setRemaining(hb.remaining_seconds)
        if (hb.remaining_seconds === 0) submit()
      } catch (e) {
        console.error('heartbeat failed, will retry next tick', e)
      }
    }, HEARTBEAT_MS)
    return () => clearInterval(t)
  }, [sessionId, ordinal, flushEvents, submit])

  useEffect(() => {
    if (remaining === 0) submit()
  }, [remaining, submit])

  const bySubject = useMemo(() => {
    if (!bundle) return []
    const groups = new Map<string, { index: number; question: Bundle['questions'][number] }[]>()
    bundle.questions.forEach((q, index) => {
      const list = groups.get(q.subject) ?? []
      list.push({ index, question: q })
      groups.set(q.subject, list)
    })
    return [...groups.entries()]
  }, [bundle])

  const q = bundle?.questions[current]

  // Dwell-time tracking: grading reconstructs time-per-question from the gap
  // between consecutive question_viewed events, so every navigation needs
  // one, including the first render.
  useEffect(() => {
    if (!q) return
    recordEvent(sessionId, partId, 'question_viewed', { question_id: q.question_id }).then(flushEvents)
  }, [q?.question_id, sessionId, partId, flushEvents])

  if (!bundle || !q) {
    return (
      <div className="state-screen">
        <div className="spinner" />
        <p>Preparing your paper…</p>
      </div>
    )
  }

  const selected = answers.get(q.question_id) ?? null
  const answeredCount = bundle.questions.filter((bq) => answers.get(bq.question_id) != null).length

  async function selectOption(ordinalIdx: number) {
    await recordEvent(sessionId, partId, 'answer_selected', {
      question_id: q!.question_id,
      selected_option: ordinalIdx,
    })
    setAnswers((prev) => new Map(prev).set(q!.question_id, ordinalIdx))
    flushEvents()
  }

  async function clearAnswer() {
    await recordEvent(sessionId, partId, 'answer_cleared', { question_id: q!.question_id })
    setAnswers((prev) => new Map(prev).set(q!.question_id, null))
    flushEvents()
  }

  const urgency = remaining === null ? null : remaining <= CRITICAL_THRESHOLD_S ? 'critical' : remaining <= WARNING_THRESHOLD_S ? 'warning' : 'normal'
  const mins = remaining !== null ? Math.floor(remaining / 60) : 0
  const secs = remaining !== null ? remaining % 60 : 0

  return (
    <div className="player-shell">
      <div className="player-topbar">
        <span className="player-title">{bundle.title}</span>
        <span className="sync-indicator" aria-live="polite">
          {pendingSync > 0 ? (
            <>
              <CloudOffIcon /> <span>Saving…</span>
            </>
          ) : (
            <>
              <CloudIcon /> <span>Saved</span>
            </>
          )}
        </span>
        <div className="timer tabular-nums" data-urgency={urgency ?? 'normal'} aria-live="polite">
          <ClockIcon />
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </div>
      </div>

      <div className="player-body">
        <div>
          <div className="card question-card">
            <div className="question-meta">
              <span className="badge badge-muted">
                Question {current + 1} of {bundle.questions.length}
              </span>
              <span className="badge badge-muted">{q.subject}</span>
            </div>

            <p className="question-text">{q.text}</p>

            <div className="options" role="radiogroup" aria-label={`Options for question ${current + 1}`}>
              {q.options.map((opt) => (
                <label key={opt.ordinal} className="option" data-selected={selected === opt.ordinal}>
                  <input
                    type="radio"
                    name={q.question_id}
                    checked={selected === opt.ordinal}
                    onChange={() => selectOption(opt.ordinal)}
                  />
                  <span className="option-radio">
                    <span className="option-radio-dot" />
                  </span>
                  <span className="option-text">{opt.text}</span>
                </label>
              ))}
            </div>

            <div className="question-actions">
              <button className="btn btn-outline" onClick={clearAnswer} disabled={selected == null}>
                Clear response
              </button>
            </div>
          </div>

          <div className="player-footer">
            <button className="btn btn-secondary" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>
              <ChevronLeftIcon /> Previous
            </button>
            <button
              className="btn btn-secondary"
              disabled={current === bundle.questions.length - 1}
              onClick={() => setCurrent((c) => c + 1)}
            >
              Next <ChevronRightIcon />
            </button>
            <span className="spacer" />
            <button className="btn btn-primary" onClick={() => setConfirmOpen(true)} disabled={submitting}>
              Submit test
            </button>
          </div>
        </div>

        <aside className="card palette-panel">
          <div className="palette-legend">
            <div className="legend-row">
              <span className="legend-swatch" style={{ background: 'var(--color-success-bg)', border: '1px solid var(--color-success)' }} />
              Answered ({answeredCount})
            </div>
            <div className="legend-row">
              <span className="legend-swatch" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }} />
              Not answered ({bundle.questions.length - answeredCount})
            </div>
          </div>

          {bySubject.map(([subject, items]) => (
            <div key={subject}>
              <p className="palette-subject-heading">{subject}</p>
              <div className="palette-grid">
                {items.map(({ index, question }) => (
                  <button
                    key={question.question_id}
                    className="palette-btn"
                    data-answered={answers.get(question.question_id) != null}
                    data-current={index === current}
                    onClick={() => setCurrent(index)}
                    aria-label={`Go to question ${index + 1}${answers.get(question.question_id) != null ? ' (answered)' : ''}`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </aside>
      </div>

      {confirmOpen && (
        <div className="modal-scrim" onClick={() => setConfirmOpen(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h3>Submit test?</h3>
            <p style={{ color: 'var(--color-muted-foreground)', fontSize: '0.9rem' }}>
              You can't change answers after submitting.
            </p>
            <div className="modal-summary">
              <div className="modal-summary-item">
                <strong>{answeredCount}</strong>
                <span>Answered</span>
              </div>
              <div className="modal-summary-item">
                <strong>{bundle.questions.length - answeredCount}</strong>
                <span>Unanswered</span>
              </div>
            </div>
            {submitError && (
              <p style={{ color: 'var(--color-destructive)', fontSize: '0.85rem' }}>
                Couldn't reach the server. Your answers are saved on this device — safe to try again.
              </p>
            )}
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setConfirmOpen(false)} disabled={submitting}>
                Keep working
              </button>
              <button className="btn btn-primary" onClick={submit} disabled={submitting}>
                {submitting ? 'Submitting…' : submitError ? 'Retry submit' : 'Submit test'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
