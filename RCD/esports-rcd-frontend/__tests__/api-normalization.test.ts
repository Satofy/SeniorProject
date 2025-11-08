import { api } from '../lib/api'

// Mock fetch for getTeams normalization test
const mockTeams = [
  { _id: '1', name: 'Alpha', tag: 'A', managerId: 'm1', members: ['m1'], games: ['valorant'], social: {}, balance: 0, createdAt: '2025-11-08T00:00:00Z' },
  { _id: '2', name: 'Bravo', tag: 'B', managerId: 'm2', members: ['m2','u3'], games: [], social: {}, balance: 100, createdAt: '2025-11-08T00:00:00Z' }
];

describe('API normalization', () => {
  beforeAll(() => {
    // @ts-ignore
    global.fetch = jest.fn((url: string) => {
      if (url.includes('/api/teams')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockTeams) })
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    })
  })

  it('normalizes teams with id string and retains fields', async () => {
    const teams = await api.getTeams()
    expect(teams).toHaveLength(2)
    expect(teams[0].id).toBe('1')
    expect(teams[0].name).toBe('Alpha')
    expect(teams[0].managerId).toBe('m1')
    expect(teams[0].createdAt).toBe('2025-11-08T00:00:00Z')
  })
})
