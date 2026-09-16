export interface Question {
  id: string
  subject: 'Physics' | 'Chemistry' | 'Mathematics'
  chapter: string
  concept: string
  text: string
  type: 'mcq' | 'numerical'
  options?: { id: number; text: string }[]
  correctAnswer: number | string
  difficulty: 'easy' | 'medium' | 'hard'
  marksPositive: number
  marksNegative: number
  pyqInfo?: string
  explanation: string
}

export interface TestDef {
  id: string
  title: string
  pattern: 'jee_main' | 'mht_cet' | 'neet' | 'custom'
  patternLabel: string
  targetExam: string
  totalQuestions: number
  totalMarks: number
  durationMinutes: number
  partsCount: number
  status: 'assigned' | 'in_progress' | 'completed' | 'draft' | 'scheduled'
  assignedDate: string
  dueDate: string
  score?: number
  percentile?: number
  rank?: number
  totalStudents?: number
  questions: Question[]
  partsConfig: {
    ordinal: number
    title: string
    durationMinutes: number
    subjects: string[]
    lockedOnSubmit: boolean
  }[]
}

export interface StudentProfile {
  id: string
  name: string
  rollNo: string
  avatar: string
  batch: string
  targetExam: string
  currentPercentile: number
  testsTaken: number
  attendanceRate: number
  accuracyRate: number
  avgScore: number
  trend: 'rising' | 'stable' | 'needs_attention'
  lastActive: string
}

export interface ConceptMastery {
  subject: string
  chapter: string
  masteryPercentage: number
  totalAttempted: number
  accuracy: number
  difficultyGrade: 'Strong' | 'Moderate' | 'Weak'
  classLevel: 11 | 12
}

export const MOCK_STUDENT: StudentProfile = {
  id: 'std_01',
  name: 'Aarav Sharma',
  rollNo: '2026-JEE-0482',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  batch: 'JEE Super-30 (Alpha Batch)',
  targetExam: 'JEE Main + Advanced 2026',
  currentPercentile: 98.42,
  testsTaken: 14,
  attendanceRate: 96,
  accuracyRate: 78.5,
  avgScore: 218,
  trend: 'rising',
  lastActive: '10 mins ago',
}

export const MOCK_ROSTER: StudentProfile[] = [
  {
    id: 'std_01',
    name: 'Aarav Sharma',
    rollNo: '2026-JEE-0482',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    batch: 'JEE Super-30 (Alpha)',
    targetExam: 'JEE Main 2026',
    currentPercentile: 98.42,
    testsTaken: 14,
    attendanceRate: 96,
    accuracyRate: 78.5,
    avgScore: 218,
    trend: 'rising',
    lastActive: '10 mins ago',
  },
  {
    id: 'std_02',
    name: 'Ananya Deshmukh',
    rollNo: '2026-CET-0119',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    batch: 'MHT-CET Champions',
    targetExam: 'MHT-CET PCM 2026',
    currentPercentile: 99.15,
    testsTaken: 16,
    attendanceRate: 100,
    accuracyRate: 84.2,
    avgScore: 174,
    trend: 'rising',
    lastActive: '1 hour ago',
  },
  {
    id: 'std_03',
    name: 'Rohan Kulkarni',
    rollNo: '2026-JEE-0512',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    batch: 'JEE Super-30 (Alpha)',
    targetExam: 'JEE Main 2026',
    currentPercentile: 94.6,
    testsTaken: 12,
    attendanceRate: 88,
    accuracyRate: 71.0,
    avgScore: 182,
    trend: 'stable',
    lastActive: 'Yesterday',
  },
  {
    id: 'std_04',
    name: 'Pooja Iyer',
    rollNo: '2026-JEE-0309',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    batch: 'JEE Droppers Intensive',
    targetExam: 'JEE Main 2026',
    currentPercentile: 96.8,
    testsTaken: 15,
    attendanceRate: 94,
    accuracyRate: 76.8,
    avgScore: 204,
    trend: 'rising',
    lastActive: '3 hours ago',
  },
  {
    id: 'std_05',
    name: 'Aditya Patil',
    rollNo: '2026-CET-0881',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    batch: 'MHT-CET Champions',
    targetExam: 'MHT-CET PCM 2026',
    currentPercentile: 82.3,
    testsTaken: 8,
    attendanceRate: 72,
    accuracyRate: 56.4,
    avgScore: 114,
    trend: 'needs_attention',
    lastActive: '4 days ago',
  },
  {
    id: 'std_06',
    name: 'Sneha Verma',
    rollNo: '2026-JEE-0914',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    batch: 'JEE Droppers Intensive',
    targetExam: 'JEE Main 2026',
    currentPercentile: 86.4,
    testsTaken: 11,
    attendanceRate: 81,
    accuracyRate: 62.0,
    avgScore: 146,
    trend: 'needs_attention',
    lastActive: '2 days ago',
  },
  {
    id: 'std_07',
    name: 'Vikramaditya Joshi',
    rollNo: '2026-JEE-0103',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    batch: 'JEE Super-30 (Alpha)',
    targetExam: 'JEE Main 2026',
    currentPercentile: 99.81,
    testsTaken: 17,
    attendanceRate: 100,
    accuracyRate: 89.6,
    avgScore: 268,
    trend: 'rising',
    lastActive: 'Just now',
  },
]

export const SAMPLE_JEE_QUESTIONS: Question[] = [
  {
    id: 'q_phy_01',
    subject: 'Physics',
    chapter: 'Kinematics & Projectile Motion',
    concept: '2D Motion under gravity',
    text: 'A particle is projected at an angle of 60° with the ground. When the projectile makes an angle of 45° with the horizontal, its speed becomes 20 m/s. The initial velocity of projection is:',
    type: 'mcq',
    options: [
      { id: 0, text: '20√2 m/s' },
      { id: 1, text: '10√2 m/s' },
      { id: 2, text: '5√5 m/s' },
      { id: 3, text: '10√5 m/s' },
    ],
    correctAnswer: 0,
    difficulty: 'medium',
    marksPositive: 4,
    marksNegative: 1,
    pyqInfo: 'JEE Main 2024 Jan Shift 1',
    explanation:
      'The horizontal component of velocity remains constant throughout the motion: u_x = u cos(60°) = v cos(45°). Therefore, u (1/2) = 20 (1/√2) => u = 40 / √2 = 20√2 m/s.',
  },
  {
    id: 'q_phy_02',
    subject: 'Physics',
    chapter: 'Thermodynamics',
    concept: 'Adiabatic expansion of ideal gas',
    text: 'For an ideal gas in a reversible adiabatic process (dQ = 0), the volume becomes 8 times and absolute temperature becomes 1/4 times the initial value. Identify the nature of the gas:',
    type: 'mcq',
    options: [
      { id: 0, text: 'CO₂ (Triatomic linear)' },
      { id: 1, text: 'O₂ (Diatomic)' },
      { id: 2, text: 'NH₃ (Polyatomic nonlinear)' },
      { id: 3, text: 'He (Monoatomic)' },
    ],
    correctAnswer: 3,
    difficulty: 'medium',
    marksPositive: 4,
    marksNegative: 1,
    pyqInfo: 'JEE Main 2023 Apr Shift 2',
    explanation:
      'For an adiabatic process: T · V^(γ-1) = const. Thus T₁ V₁^(γ-1) = T₂ V₂^(γ-1) => (T₁/T₂) = (V₂/V₁)^(γ-1). 4 = 8^(γ-1) => 2^2 = (2^3)^(γ-1) => 2 = 3(γ-1) => γ - 1 = 2/3 => γ = 5/3 ≈ 1.67. This corresponds to monoatomic gas (Helium).',
  },
  {
    id: 'q_phy_03',
    subject: 'Physics',
    chapter: 'Electrostatics',
    concept: 'Electric Potential and Conservative Field',
    text: 'The electric potential is V = 500 volts at the point (10, 20) meters and the electric field is given by E = 10x î + 5y ĵ (N/C). Calculate the electric potential at the origin (0, 0) in volts.',
    type: 'numerical',
    correctAnswer: '2000',
    difficulty: 'hard',
    marksPositive: 4,
    marksNegative: 1,
    pyqInfo: 'JEE Main 2024 Jan Shift 2',
    explanation:
      'dV = -E · dr = -(10x dx + 5y dy). Integrating from (0,0) to (10,20): V(10,20) - V(0,0) = - [ 5x² + 2.5y² ] = -(500 + 1000) = -1500 V. Thus V(0,0) = V(10,20) + 1500 = 500 + 1500 = 2000 V.',
  },
  {
    id: 'q_chem_01',
    subject: 'Chemistry',
    chapter: 'Periodic Table & Periodicity',
    concept: 'First Ionization Enthalpy Anomalies',
    text: 'Four second-period elements from Boron to Oxygen have first ionization enthalpy (IE₁) values: 800.6, 1086.5, 1313.9, and 1402.3 kJ/mol. The IE₁ value for Nitrogen (in kJ/mol) is:',
    type: 'mcq',
    options: [
      { id: 0, text: '800.6' },
      { id: 1, text: '1086.5' },
      { id: 2, text: '1402.3' },
      { id: 3, text: '1313.9' },
    ],
    correctAnswer: 2,
    difficulty: 'easy',
    marksPositive: 4,
    marksNegative: 1,
    pyqInfo: 'JEE Main 2025 Jan Shift 1',
    explanation:
      'Due to the extra stability of half-filled 2p³ electronic configuration of Nitrogen (1s² 2s² 2p³), its first ionization enthalpy is higher than Oxygen (2p⁴), Carbon (2p²), and Boron (2p¹). Hence Nitrogen has 1402.3 kJ/mol.',
  },
  {
    id: 'q_chem_02',
    subject: 'Chemistry',
    chapter: 'Chemical Kinetics',
    concept: 'Arrhenius Equation & Activation Energy',
    text: 'For a reaction, the rate constant doubles when the temperature increases from 300 K to 310 K. Calculate the activation energy Ea in kJ/mol (Take R = 8.314 J/mol·K, ln 2 = 0.693). Round to the nearest integer.',
    type: 'numerical',
    correctAnswer: '54',
    difficulty: 'medium',
    marksPositive: 4,
    marksNegative: 1,
    pyqInfo: 'JEE Main 2023 Jan Shift 1',
    explanation:
      'ln(k₂/k₁) = (Ea / R) * ((T₂ - T₁) / (T₁ * T₂)). 0.693 = (Ea / 8.314) * (10 / (300 * 310)). Ea = (0.693 * 8.314 * 93000) / 10 = 53580 J/mol = 53.58 kJ/mol ≈ 54 kJ/mol.',
  },
  {
    id: 'q_math_01',
    subject: 'Mathematics',
    chapter: 'Quadratic Equations & Modulus',
    concept: 'Equations with multiple modulus terms',
    text: 'The number of real solutions of the equation x|x + 4| + 3|x + 2| + 10 = 0 is:',
    type: 'mcq',
    options: [
      { id: 0, text: '0 (No real solutions)' },
      { id: 1, text: '1' },
      { id: 2, text: '2' },
      { id: 3, text: '4' },
    ],
    correctAnswer: 0,
    difficulty: 'hard',
    marksPositive: 4,
    marksNegative: 1,
    pyqInfo: 'JEE Main 2024 Jan Shift 1',
    explanation:
      'Checking intervals: x >= -2 gives x² + 7x + 16 = 0 (D < 0). -4 <= x < -2 gives x² + x + 4 = 0 (D < 0). x < -4 gives -x² - 7x + 4 = 0 => x² + 7x - 4 = 0 whose roots (-7 ± √65)/2 do not satisfy the original equation. Thus 0 real roots.',
  },
  {
    id: 'q_math_02',
    subject: 'Mathematics',
    chapter: 'Definite Integration',
    concept: "King's Property of Definite Integrals",
    text: 'Evaluate the value of I = ∫₀^(π/2) (sin³(x) / (sin³(x) + cos³(x))) dx. If I = π/k, find k.',
    type: 'numerical',
    correctAnswer: '4',
    difficulty: 'medium',
    marksPositive: 4,
    marksNegative: 1,
    pyqInfo: 'JEE Main 2025 Jan Shift 2',
    explanation:
      'Using King Property ∫₀ᵃ f(x)dx = ∫₀ᵃ f(a-x)dx: I = ∫₀^(π/2) (cos³(x) / (cos³(x) + sin³(x))) dx. Adding both: 2I = ∫₀^(π/2) 1 dx = π/2 => I = π/4. Hence k = 4.',
  },
]

export const SAMPLE_CET_QUESTIONS: Question[] = [
  {
    id: 'cet_phy_01',
    subject: 'Physics',
    chapter: 'Rotational Dynamics',
    concept: 'Moment of inertia of disc about tangent in its plane',
    text: 'The moment of inertia of a uniform circular disc of mass M and radius R about a tangent in the plane of the disc is:',
    type: 'mcq',
    options: [
      { id: 0, text: '(5/4) M R²' },
      { id: 1, text: '(3/2) M R²' },
      { id: 2, text: '(1/2) M R²' },
      { id: 3, text: '(7/4) M R²' },
    ],
    correctAnswer: 0,
    difficulty: 'easy',
    marksPositive: 1,
    marksNegative: 0,
    pyqInfo: 'MHT-CET 2024 May Shift 1',
    explanation:
      'By perpendicular axis theorem, I_diameter = (1/4) M R². Using parallel axis theorem for tangent in plane: I = I_diameter + M R² = (1/4) M R² + M R² = (5/4) M R².',
  },
  {
    id: 'cet_chem_01',
    subject: 'Chemistry',
    chapter: 'Solid State',
    concept: 'Packing efficiency of Body Centered Cubic (BCC) lattice',
    text: 'The percentage of free space (void percentage) in a Body Centered Cubic (BCC) unit cell is:',
    type: 'mcq',
    options: [
      { id: 0, text: '32%' },
      { id: 1, text: '68%' },
      { id: 2, text: '26%' },
      { id: 3, text: '74%' },
    ],
    correctAnswer: 0,
    difficulty: 'easy',
    marksPositive: 1,
    marksNegative: 0,
    pyqInfo: 'MHT-CET 2023 May Shift 2',
    explanation:
      'Packing efficiency of BCC lattice is 68%. Therefore, void space = 100% - 68% = 32%.',
  },
  {
    id: 'cet_math_01',
    subject: 'Mathematics',
    chapter: 'Matrices & Determinants',
    concept: 'Inverse and Adjoint of 2x2 Matrix',
    text: 'If A = [[2, 3], [1, 4]], then the value of |adj(A)| is:',
    type: 'mcq',
    options: [
      { id: 0, text: '5' },
      { id: 1, text: '25' },
      { id: 2, text: '1/5' },
      { id: 3, text: '10' },
    ],
    correctAnswer: 0,
    difficulty: 'easy',
    marksPositive: 2,
    marksNegative: 0,
    pyqInfo: 'MHT-CET 2024 May Shift 3',
    explanation:
      '|A| = (2*4) - (3*1) = 8 - 3 = 5. For an n×n matrix, |adj(A)| = |A|^(n-1). Here n=2, so |adj(A)| = |A|^(2-1) = |A| = 5.',
  },
]

export const MOCK_TESTS: TestDef[] = [
  {
    id: 'test_jee_01',
    title: 'NTA JEE Main 2026 - All India Full Mock Paper 01',
    pattern: 'jee_main',
    patternLabel: 'NTA JEE Main 2026',
    targetExam: 'JEE Main (B.E./B.Tech)',
    totalQuestions: 75,
    totalMarks: 300,
    durationMinutes: 180,
    partsCount: 1,
    status: 'assigned',
    assignedDate: '15 Sep 2026',
    dueDate: '20 Sep 2026, 11:59 PM',
    questions: SAMPLE_JEE_QUESTIONS,
    partsConfig: [
      {
        ordinal: 1,
        title: 'Complete Paper (Phy + Chem + Math)',
        durationMinutes: 180,
        subjects: ['Physics', 'Chemistry', 'Mathematics'],
        lockedOnSubmit: false,
      },
    ],
  },
  {
    id: 'test_cet_01',
    title: 'MHT-CET 2026 PCM Full Mock Test (State Ranker Series)',
    pattern: 'mht_cet',
    patternLabel: 'MHT-CET PCM Pattern',
    targetExam: 'MHT-CET Engineering 2026',
    totalQuestions: 150,
    totalMarks: 200,
    durationMinutes: 180,
    partsCount: 2,
    status: 'assigned',
    assignedDate: '14 Sep 2026',
    dueDate: '22 Sep 2026, 06:00 PM',
    questions: SAMPLE_CET_QUESTIONS,
    partsConfig: [
      {
        ordinal: 1,
        title: 'Part 1: Physics & Chemistry (Strict 90 Min Lock)',
        durationMinutes: 90,
        subjects: ['Physics', 'Chemistry'],
        lockedOnSubmit: true,
      },
      {
        ordinal: 2,
        title: 'Part 2: Mathematics (Strict 90 Min Lock)',
        durationMinutes: 90,
        subjects: ['Mathematics'],
        lockedOnSubmit: true,
      },
    ],
  },
  {
    id: 'test_past_01',
    title: 'JEE Main 2026 Shift 1 Simulation Test',
    pattern: 'jee_main',
    patternLabel: 'NTA JEE Main',
    targetExam: 'JEE Main 2026',
    totalQuestions: 75,
    totalMarks: 300,
    durationMinutes: 180,
    partsCount: 1,
    status: 'completed',
    assignedDate: '08 Sep 2026',
    dueDate: '08 Sep 2026',
    score: 232,
    percentile: 98.85,
    rank: 4,
    totalStudents: 312,
    questions: SAMPLE_JEE_QUESTIONS,
    partsConfig: [
      {
        ordinal: 1,
        title: 'Paper 1',
        durationMinutes: 180,
        subjects: ['Physics', 'Chemistry', 'Mathematics'],
        lockedOnSubmit: false,
      },
    ],
  },
  {
    id: 'test_past_02',
    title: 'MHT-CET PCM Diagnostic Drill 03',
    pattern: 'mht_cet',
    patternLabel: 'MHT-CET PCM',
    targetExam: 'MHT-CET 2026',
    totalQuestions: 150,
    totalMarks: 200,
    durationMinutes: 180,
    partsCount: 2,
    status: 'completed',
    assignedDate: '01 Sep 2026',
    dueDate: '01 Sep 2026',
    score: 168,
    percentile: 97.4,
    rank: 8,
    totalStudents: 280,
    questions: SAMPLE_CET_QUESTIONS,
    partsConfig: [
      {
        ordinal: 1,
        title: 'Part 1: Physics & Chemistry',
        durationMinutes: 90,
        subjects: ['Physics', 'Chemistry'],
        lockedOnSubmit: true,
      },
      {
        ordinal: 2,
        title: 'Part 2: Mathematics',
        durationMinutes: 90,
        subjects: ['Mathematics'],
        lockedOnSubmit: true,
      },
    ],
  },
]

export const CONCEPT_MASTERY_LIST: ConceptMastery[] = [
  {
    subject: 'Physics',
    chapter: 'Rotational Dynamics',
    masteryPercentage: 88,
    totalAttempted: 45,
    accuracy: 82,
    difficultyGrade: 'Strong',
    classLevel: 11,
  },
  {
    subject: 'Physics',
    chapter: 'Electrostatics & Capacitance',
    masteryPercentage: 74,
    totalAttempted: 38,
    accuracy: 71,
    difficultyGrade: 'Moderate',
    classLevel: 12,
  },
  {
    subject: 'Physics',
    chapter: 'Wave Optics & Interference',
    masteryPercentage: 58,
    totalAttempted: 24,
    accuracy: 54,
    difficultyGrade: 'Weak',
    classLevel: 12,
  },
  {
    subject: 'Chemistry',
    chapter: 'General Organic Chemistry (GOC)',
    masteryPercentage: 92,
    totalAttempted: 52,
    accuracy: 94,
    difficultyGrade: 'Strong',
    classLevel: 11,
  },
  {
    subject: 'Chemistry',
    chapter: 'Chemical Thermodynamics',
    masteryPercentage: 80,
    totalAttempted: 35,
    accuracy: 77,
    difficultyGrade: 'Strong',
    classLevel: 11,
  },
  {
    subject: 'Chemistry',
    chapter: 'Coordination Compounds',
    masteryPercentage: 62,
    totalAttempted: 28,
    accuracy: 60,
    difficultyGrade: 'Moderate',
    classLevel: 12,
  },
  {
    subject: 'Mathematics',
    chapter: 'Differential Calculus & Maxima',
    masteryPercentage: 86,
    totalAttempted: 60,
    accuracy: 83,
    difficultyGrade: 'Strong',
    classLevel: 12,
  },
  {
    subject: 'Mathematics',
    chapter: 'Definite Integrals & Areas',
    masteryPercentage: 78,
    totalAttempted: 42,
    accuracy: 76,
    difficultyGrade: 'Moderate',
    classLevel: 12,
  },
  {
    subject: 'Mathematics',
    chapter: 'Vectors & 3D Geometry',
    masteryPercentage: 52,
    totalAttempted: 30,
    accuracy: 50,
    difficultyGrade: 'Weak',
    classLevel: 12,
  },
]

export const ALL_QB_QUESTIONS: Question[] = [
  ...SAMPLE_JEE_QUESTIONS,
  ...SAMPLE_CET_QUESTIONS,
  {
    id: 'qb_phy_04',
    subject: 'Physics',
    chapter: 'Current Electricity',
    concept: 'Kirchhoff Laws & Wheatstone Bridge',
    text: 'In a Wheatstone network, the four resistances are P = 10 Ω, Q = 20 Ω, R = 15 Ω, and S = 30 Ω. The battery connected across the network has emf 6V and zero internal resistance. The current through the galvanometer of resistance 50 Ω is:',
    type: 'mcq',
    options: [
      { id: 0, text: '0 A (Bridge is balanced)' },
      { id: 1, text: '0.1 A' },
      { id: 2, text: '0.25 A' },
      { id: 3, text: '0.05 A' },
    ],
    correctAnswer: 0,
    difficulty: 'easy',
    marksPositive: 4,
    marksNegative: 1,
    pyqInfo: 'JEE Main 2022 July',
    explanation:
      'P/Q = 10/20 = 1/2. R/S = 15/30 = 1/2. Since P/Q = R/S, the bridge is balanced. Hence potential difference across galvanometer is zero and current is 0 A.',
  },
  {
    id: 'qb_chem_03',
    subject: 'Chemistry',
    chapter: 'Electrochemistry',
    concept: 'Nernst Equation and Cell EMF',
    text: 'Calculate the standard cell potential E°_cell for the cell: Zn(s) | Zn²⁺(1M) || Cu²⁺(1M) | Cu(s). Given E°(Zn²⁺/Zn) = -0.76 V and E°(Cu²⁺/Cu) = +0.34 V.',
    type: 'mcq',
    options: [
      { id: 0, text: '+1.10 V' },
      { id: 1, text: '-0.42 V' },
      { id: 2, text: '+0.42 V' },
      { id: 3, text: '-1.10 V' },
    ],
    correctAnswer: 0,
    difficulty: 'easy',
    marksPositive: 4,
    marksNegative: 1,
    pyqInfo: 'MHT-CET 2023',
    explanation:
      'E°_cell = E°_cathode - E°_anode = E°(Cu²⁺/Cu) - E°(Zn²⁺/Zn) = 0.34 - (-0.76) = +1.10 V.',
  },
  {
    id: 'qb_math_03',
    subject: 'Mathematics',
    chapter: 'Probability',
    concept: 'Bayes Theorem and Conditional Probability',
    text: 'Bag A contains 3 red and 2 white balls, and Bag B contains 2 red and 5 white balls. A ball is drawn at random from one of the bags and is found to be red. The probability that it was drawn from Bag A is (as a fraction p/q in simplest form where p+q is):',
    type: 'numerical',
    correctAnswer: '38',
    difficulty: 'hard',
    marksPositive: 4,
    marksNegative: 1,
    pyqInfo: 'JEE Main 2024',
    explanation:
      'P(A) = 1/2, P(B) = 1/2. P(Red|A) = 3/5, P(Red|B) = 2/7. By Bayes Theorem: P(A|Red) = (1/2 * 3/5) / (1/2 * 3/5 + 1/2 * 2/7) = (3/5) / (3/5 + 2/7) = (21/35) / (31/35) = 21/31. Here p=21, q=31 => p+q = 21+31 = 52.',
  },
]
