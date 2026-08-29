const BASE = '/api'

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!res.ok) throw new Error(`${init?.method ?? 'GET'} ${path} -> ${res.status}`)
  return res.json()
}

export interface MeResponse {
  student: { id: string; name: string }
  session_id: string
  session_state: string
  current_part_ordinal: number
  test_title: string
  parts: { ordinal: number; title: string; duration_seconds: number; state: string }[]
}

export interface BundleQuestion {
  question_id: string
  ordinal: number
  subject: string
  text: string
  answer_type: string
  options: { ordinal: number; text: string }[]
}

export interface Bundle {
  part_ordinal: number
  part_id: string
  title: string
  duration_seconds: number
  state: string
  remaining_seconds: number | null
  questions: BundleQuestion[]
}

export const api = {
  me: () => req<MeResponse>('/me'),
  bundle: (sessionId: string, ordinal: number) =>
    req<Bundle>(`/sessions/${sessionId}/parts/${ordinal}/bundle`),
  start: (sessionId: string, ordinal: number) =>
    req<Bundle>(`/sessions/${sessionId}/parts/${ordinal}/start`, { method: 'POST' }),
  heartbeat: (sessionId: string, ordinal: number) =>
    req<{ state: string; remaining_seconds: number | null; server_time: string }>(
      `/sessions/${sessionId}/heartbeat?ordinal=${ordinal}`,
      { method: 'POST' },
    ),
  postEvents: (sessionId: string, events: unknown[]) =>
    req<{ accepted: number; received: number }>(`/sessions/${sessionId}/events`, {
      method: 'POST',
      body: JSON.stringify({ events }),
    }),
  submit: (sessionId: string, ordinal: number) =>
    req<{ part_state: string; session_state: string }>(
      `/sessions/${sessionId}/parts/${ordinal}/submit`,
      { method: 'POST' },
    ),
  report: (sessionId: string) =>
    req<{ status: string; [key: string]: unknown }>(`/sessions/${sessionId}/report`),
}
