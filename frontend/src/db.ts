import Dexie, { type Table } from 'dexie'

export interface LocalEvent {
  id?: number
  sessionId: string
  clientInstanceId: string
  clientSeq: number
  partId: string | null
  type: string
  clientTs: string
  payload: Record<string, unknown>
  synced: 0 | 1
}

class EasDB extends Dexie {
  events!: Table<LocalEvent, number>

  constructor() {
    super('eas')
    this.version(1).stores({
      // compound index gives refresh-time replay (by session) and dedupe
      // (session+clientSeq) without a second table
      events: '++id, sessionId, synced, [sessionId+clientSeq], [sessionId+synced]',
    })
  }
}

export const db = new EasDB()

export function getClientInstanceId(): string {
  const key = 'eas_client_instance_id'
  let id = localStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(key, id)
  }
  return id
}

export async function nextClientSeq(sessionId: string): Promise<number> {
  const last = await db.events.where('sessionId').equals(sessionId).last()
  return last ? last.clientSeq + 1 : 1
}

export async function recordEvent(
  sessionId: string,
  partId: string | null,
  type: string,
  payload: Record<string, unknown>,
): Promise<LocalEvent> {
  const clientSeq = await nextClientSeq(sessionId)
  const event: LocalEvent = {
    sessionId,
    clientInstanceId: getClientInstanceId(),
    clientSeq,
    partId,
    type,
    clientTs: new Date().toISOString(),
    payload,
    synced: 0,
  }
  const id = await db.events.add(event)
  return { ...event, id }
}

export async function replayAnswers(sessionId: string): Promise<Map<string, number | null>> {
  const events = await db.events.where('sessionId').equals(sessionId).sortBy('clientSeq')
  const answers = new Map<string, number | null>()
  for (const ev of events) {
    if (ev.type === 'answer_selected') {
      answers.set(ev.payload.question_id as string, ev.payload.selected_option as number)
    } else if (ev.type === 'answer_cleared') {
      answers.set(ev.payload.question_id as string, null)
    }
  }
  return answers
}
