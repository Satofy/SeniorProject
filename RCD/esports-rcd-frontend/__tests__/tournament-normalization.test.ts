import { api, type Tournament } from '../lib/api'

describe('Tournament normalization', () => {
  beforeEach(() => {
    // @ts-ignore
    global.fetch = jest.fn((url: string) => {
      if (url.includes('/api/tournaments')) {
        const now = new Date()
        const past = new Date(now.getTime() - 60 * 60 * 1000).toISOString() // 1h ago
        const future = new Date(now.getTime() + 60 * 60 * 1000).toISOString() // 1h ahead
        const payload = [
          // Missing status -> fallback based on date (future -> upcoming)
          { _id: 'a', title: 'Future Cup', date: future, game: undefined, participants: [] },
          // Missing status + past end -> ongoing/completed fallback: since only date field, treat as ongoing if now between begin and end not known; our client sets 'ongoing' for past date w/out end
          { _id: 'b', title: 'Past Brawl', date: past, type: 'team', participants: ['x','y'] },
          // Explicit status retained
          { _id: 'c', title: 'Set Status', date: future, status: 'completed', game: 'Valorant' },
        ]
        return Promise.resolve({ ok: true, json: () => Promise.resolve(payload) })
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    })
  })

  it('applies sensible defaults for status and maps fields', async () => {
    const list = await api.getTournaments()
    const byId = Object.fromEntries(list.map(t => [t.id, t])) as Record<string, Tournament>

    expect(byId['a'].status).toBe('upcoming')
    expect(byId['a'].game).toBeUndefined()
    expect(byId['a'].currentParticipants).toBe(0)

    // With past date and participants length -> currentParticipants inferred
    expect(byId['b'].status === 'ongoing' || byId['b'].status === 'completed').toBe(true)
    expect(byId['b'].currentParticipants).toBe(2)

    // Explicit status respected
    expect(byId['c'].status).toBe('completed')
    expect(byId['c'].game).toBe('Valorant')
  })
})
