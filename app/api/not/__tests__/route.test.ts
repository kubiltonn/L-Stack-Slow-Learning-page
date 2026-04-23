import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST, PUT } from '../route'

// Supabase mock
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
}

vi.mock('@/lib/supabase-server', () => ({
  createServerSupabaseClient: vi.fn(() => Promise.resolve(mockSupabase)),
}))

function jsonRequest(method: string, body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/not', {
    method,
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('POST /api/not', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('401 doner - giris yapilmamissa', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Not authenticated' },
    })

    const res = await POST(jsonRequest('POST', { soru_id: '1', icerik: 'test' }))
    expect(res.status).toBe(401)

    const json = await res.json()
    expect(json.error).toBe('Giriş yapman gerekiyor.')
  })

  it('400 doner - soru_id eksikse', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })

    const res = await POST(jsonRequest('POST', { icerik: 'test' }))
    expect(res.status).toBe(400)

    const json = await res.json()
    expect(json.error).toBe('Soru ID ve içerik gerekli.')
  })

  it('400 doner - icerik bossa', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })

    const res = await POST(jsonRequest('POST', { soru_id: '1', icerik: '   ' }))
    expect(res.status).toBe(400)
  })

  it('400 doner - 300 kelimeden fazlaysa', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })

    const uzunIcerik = Array(301).fill('kelime').join(' ')
    const res = await POST(jsonRequest('POST', { soru_id: '1', icerik: uzunIcerik }))
    expect(res.status).toBe(400)

    const json = await res.json()
    expect(json.error).toBe('Not en fazla 300 kelime olabilir.')
  })

  it('404 doner - gecersiz soru_id', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })

    const selectChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    }
    mockSupabase.from.mockReturnValue(selectChain)

    const res = await POST(jsonRequest('POST', { soru_id: 'invalid', icerik: 'test not' }))
    expect(res.status).toBe(404)
  })

  it('403 doner - yazma suresi dolmussa', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })

    // 5 gun onceki soru
    const eskiTarih = new Date()
    eskiTarih.setDate(eskiTarih.getDate() - 5)
    const tarihStr = eskiTarih.toISOString().split('T')[0]

    const selectChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { tarih: tarihStr }, error: null }),
    }
    mockSupabase.from.mockReturnValue(selectChain)

    const res = await POST(jsonRequest('POST', { soru_id: '1', icerik: 'test not' }))
    expect(res.status).toBe(403)

    const json = await res.json()
    expect(json.error).toBe('Bu sorunun yazma süresi dolmuş.')
  })

  it('201 doner - basarili kayit', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })

    // Bugunun tarihi
    const bugun = new Date().toISOString().split('T')[0]

    // from('sorular').select().eq().single()
    const soruChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { tarih: bugun }, error: null }),
    }

    // from('notlar').insert().select().single()
    const notData = { id: 'not-1', icerik: 'test not', kelime_sayisi: 2 }
    const notChain = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: notData, error: null }),
    }

    let callCount = 0
    mockSupabase.from.mockImplementation(() => {
      callCount++
      return callCount === 1 ? soruChain : notChain
    })

    const res = await POST(jsonRequest('POST', { soru_id: '1', icerik: 'test not' }))
    expect(res.status).toBe(201)

    const json = await res.json()
    expect(json.data).toEqual(notData)
    expect(json.error).toBeNull()
  })

  it('409 doner - zaten not varsa', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })

    const bugun = new Date().toISOString().split('T')[0]

    const soruChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { tarih: bugun }, error: null }),
    }

    const notChain = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { code: '23505' } }),
    }

    let callCount = 0
    mockSupabase.from.mockImplementation(() => {
      callCount++
      return callCount === 1 ? soruChain : notChain
    })

    const res = await POST(jsonRequest('POST', { soru_id: '1', icerik: 'test not' }))
    expect(res.status).toBe(409)
  })
})

describe('PUT /api/not', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('401 doner - giris yapilmamissa', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Not authenticated' },
    })

    const res = await PUT(jsonRequest('PUT', { soru_id: '1', icerik: 'test' }))
    expect(res.status).toBe(401)
  })

  it('400 doner - 300 kelime asiminda', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })

    const uzunIcerik = Array(301).fill('kelime').join(' ')
    const res = await PUT(jsonRequest('PUT', { soru_id: '1', icerik: uzunIcerik }))
    expect(res.status).toBe(400)
  })

  it('200 doner - basarili guncelleme', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })

    const guncellenmis = { id: 'not-1', icerik: 'guncellenmis', kelime_sayisi: 1 }
    const updateChain = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: guncellenmis, error: null }),
    }
    mockSupabase.from.mockReturnValue(updateChain)

    const res = await PUT(jsonRequest('PUT', { soru_id: '1', icerik: 'guncellenmis' }))
    expect(res.status).toBe(200)

    const json = await res.json()
    expect(json.data).toEqual(guncellenmis)
  })
})
