import { useState } from 'react'
import { MOCK_STUDENT, type TestDef } from './data/mockData'
import { ErrorBoundary } from './ErrorBoundary'
import { UserIcon, UsersIcon } from './icons'
import { JEEMainPlayer } from './player/JEEMainPlayer'
import { MHTCETPlayer } from './player/MHTCETPlayer'
import { StudentHome } from './student/StudentHome'
import { TeacherDashboard } from './teacher/TeacherDashboard'

type RoleMode = 'student' | 'teacher'
type AppScreen = 'main' | 'jee_player' | 'cet_player'

function App() {
  const [role, setRole] = useState<RoleMode>('student')
  const [screen, setScreen] = useState<AppScreen>('main')
  const [activeTest, setActiveTest] = useState<TestDef | null>(null)
  const [studentInitialTab, setStudentInitialTab] = useState<'tests' | 'progress' | 'analysis' | 'qb'>('tests')

  // Handle launching a CBT exam
  function handleLaunchTest(test: TestDef) {
    setActiveTest(test)
    if (test.pattern === 'jee_main') {
      setScreen('jee_player')
    } else {
      setScreen('cet_player')
    }
  }

  // Handle finishing a CBT exam
  function handleTestFinish() {
    setScreen('main')
    setRole('student')
    setStudentInitialTab('analysis')
  }

  // Handle exiting / canceling exam
  function handleExitExam() {
    setScreen('main')
  }

  return (
    <ErrorBoundary resetKey={`${screen}-${role}`}>
      {/* 1. Authentic NTA JEE Main CBT Fullscreen Engine */}
      {screen === 'jee_player' && (
        <JEEMainPlayer
          testTitle={activeTest?.title || 'JEE (Main) 2026 Paper 1'}
          studentName={MOCK_STUDENT.name}
          questions={activeTest?.questions}
          onFinish={handleTestFinish}
          onExit={handleExitExam}
        />
      )}

      {/* 2. Authentic MHT-CET CBT Fullscreen Engine */}
      {screen === 'cet_player' && (
        <MHTCETPlayer
          testTitle={activeTest?.title || 'MHT-CET 2026 PCM Examination'}
          studentName={MOCK_STUDENT.name}
          questions={activeTest?.questions}
          onFinish={handleTestFinish}
          onExit={handleExitExam}
        />
      )}

      {/* 3. Main Platform Workspace (Student & Teacher) */}
      {screen === 'main' && (
        <div className="eas-app-root">
          {/* Global Institutional App Header */}
          <header className="global-app-header">
            <div className="container global-header-inner">
              <div className="brand-wrapper">
                <div className="brand-logo-icon">E</div>
                <div className="brand-text">
                  <h1>EAS Examination Suite</h1>
                  <span>Apex Engineering & Science Academy</span>
                </div>
              </div>

              {/* Role Switcher Pill */}
              <div className="role-switcher-container">
                <button
                  className={`role-btn ${role === 'student' ? 'active' : ''}`}
                  onClick={() => setRole('student')}
                >
                  <UserIcon style={{ width: 16, height: 16 }} />
                  <span>Student Workspace</span>
                </button>
                <button
                  className={`role-btn ${role === 'teacher' ? 'active' : ''}`}
                  onClick={() => setRole('teacher')}
                >
                  <UsersIcon style={{ width: 16, height: 16 }} />
                  <span>Teacher Console</span>
                </button>
              </div>

              {/* User Identity Chip */}
              <div className="header-user-badge">
                <div className="avatar-dot">
                  {role === 'student' ? 'AS' : 'DR'}
                </div>
                <div>
                  <strong>{role === 'student' ? MOCK_STUDENT.name : 'Dr. Rajiv Menon'}</strong>
                  <span className="user-sub">
                    {role === 'student' ? 'JEE Candidate' : 'Faculty / Academic Head'}
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Persona Workspaces */}
          {role === 'student' ? (
            <StudentHome
              key={studentInitialTab}
              initialTab={studentInitialTab}
              onLaunchTest={handleLaunchTest}
            />
          ) : (
            <TeacherDashboard
              onPreviewExam={handleLaunchTest}
            />
          )}
        </div>
      )}
    </ErrorBoundary>
  )
}

export default App
