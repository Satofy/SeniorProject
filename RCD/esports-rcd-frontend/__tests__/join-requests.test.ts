import { api } from '../lib/api'

describe('Join request workflow', () => {
  const teamId = 'team123'
  const reqId = 'req789'
  beforeEach(() => {
    // @ts-ignore
    global.fetch = jest.fn((url: string, init?: any) => {
      if (url.endsWith(`/api/teams/${teamId}/requests`) && init?.method === 'POST') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ message: 'Request submitted' }) })
      }
      if (url.endsWith(`/api/teams/${teamId}/requests/${reqId}/approve`) && init?.method === 'POST') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ message: 'Request approved' }) })
      }
      if (url.endsWith(`/api/teams/${teamId}/requests/${reqId}/decline`) && init?.method === 'POST') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ message: 'Request declined' }) })
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    })
  })

  it('submits a join request', async () => {
    const res = await api.requestToJoinTeam(teamId, 'Hi manager!')
    expect(res.message).toMatch(/submitted/i)
  })

  it('approves a join request', async () => {
    const res = await api.approveJoinRequest(teamId, reqId)
    expect(res.message).toMatch(/approved/i)
  })

  it('declines a join request', async () => {
    const res = await api.declineJoinRequest(teamId, reqId)
    expect(res.message).toMatch(/declined/i)
  })
})
