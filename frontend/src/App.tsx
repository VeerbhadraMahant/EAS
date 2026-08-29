import { useEffect, useState } from 'react'
import { api, type MeResponse } from './api'
import { ErrorBoundary } from './ErrorBoundary'
import { AlertIcon, BookIcon, ClockIcon, LayersIcon, UserIcon } from './icons'
import { Player } from './Player'
import { Report } from './Report'

type Screen = 'loading' | 'home' | 'player' | 'interstitial' | 'report' | 'error'

function App() {
  const [me, setMe] = useState<MeResponse | null>(null)
  const [screen, setScreen] = useState<Screen>('loading')
  const [error, setError] = useState<string | null>(null)
  const [ordinal, setOrdinal] = useState(1)

  useEffect(() => {
    api
      .me()
      .then((res) => {
        setMe(res)
        setOrdinal(res.current_part_ordinal || res.parts[0].ordinal)
        // Refresh-safe: land on the right screen from session state, not a
        // "did they click start" flag that a hard refresh would lose.
        if (['submitted', 'graded', 'reported'].includes(res.session_state)) {
          setScreen('report')
        } else if (res.session_state === 'in_progress') {
          setScreen('player')
        } else {
          setScreen('home')
        }
      })
      .catch((e) => {
        setError(String(e))
        setScreen('error')
      })
  }, [])

  function handlePartSubmitted(sessionState: string) {
    if (sessionState === 'submitted' || !me) {
      setScreen('report')
      return
    }
    const currentIndex = me.parts.findIndex((p) => p.ordinal === ordinal)
    const nextPart = me.parts[currentIndex + 1]
    if (!nextPart) {
      // Shouldn't happen (backend marks the session submitted once every
      // part is submitted) but don't strand the student on a dead screen.
      setScreen('report')
      return
    }
    setOrdinal(nextPart.ordinal)
    setScreen('interstitial')
  }

  if (screen === 'loading') {
    return (
      <div className="state-screen">
        <div className="spinner" />
        <p>Loading your exam…</p>
      </div>
    )
  }

  if (screen === 'error' || !me) {
    return (
      <div className="state-screen">
        <AlertIcon style={{ width: 40, height: 40, color: 'var(--color-destructive)' }} />
        <h2>Can't reach the exam server</h2>
        <p style={{ color: 'var(--color-muted-foreground)', maxWidth: 420 }}>
          The backend is unreachable, or the demo data hasn't been seeded yet.
        </p>
        <pre>{error}</pre>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-muted-foreground)' }}>
          Run <code>uv run python scripts/seed_jee_demo.py</code> in <code>backend/</code>, then reload.
        </p>
      </div>
    )
  }

  const nextPart = me.parts.find((p) => p.ordinal === ordinal)

  return (
    <ErrorBoundary resetKey={screen}>
      {screen === 'home' && (
        <div className="page">
          <div className="container" style={{ maxWidth: 640 }}>
            <header className="home-header">
              <div className="brand">
                <BookIcon />
                EAS
              </div>
              <div className="student-chip">
                <UserIcon style={{ width: '1em', height: '1em' }} />
                {me.student.name}
              </div>
            </header>

            <section className="card test-card">
              <p className="eyebrow">Assigned test</p>
              <h2>{me.test_title}</h2>

              <ul className="part-list">
                {me.parts.map((p) => (
                  <li className="part-row" key={p.ordinal}>
                    <LayersIcon />
                    <span className="part-row-title">{p.title}</span>
                    <span className="part-row-meta">
                      <ClockIcon style={{ width: '1em', height: '1em', verticalAlign: '-2px' }} />{' '}
                      {Math.round(p.duration_seconds / 60)} min
                    </span>
                  </li>
                ))}
              </ul>

              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setScreen('player')}>
                Start test
              </button>

              <div className="notice">
                <AlertIcon style={{ width: 18, height: 18 }} />
                <span>
                  Once started, the clock is set by the server and cannot be paused. Your answers save to this
                  device as you go — a refresh will not lose your progress.
                </span>
              </div>
            </section>
          </div>
        </div>
      )}
      {screen === 'player' && (
        <Player key={ordinal} sessionId={me.session_id} ordinal={ordinal} onSubmitted={handlePartSubmitted} />
      )}
      {screen === 'interstitial' && nextPart && (
        <div className="state-screen">
          <LayersIcon style={{ width: 40, height: 40, color: 'var(--color-accent)' }} />
          <h2>Part submitted</h2>
          <p style={{ color: 'var(--color-muted-foreground)', maxWidth: 420 }}>
            Up next: <strong>{nextPart.title}</strong> ({Math.round(nextPart.duration_seconds / 60)} min). You can't
            go back to the previous part once you continue.
          </p>
          <button className="btn btn-primary" onClick={() => setScreen('player')}>
            Continue to {nextPart.title}
          </button>
        </div>
      )}
      {screen === 'report' && <Report sessionId={me.session_id} />}
    </ErrorBoundary>
  )
}

export default App
