import { describe, it, expect, vi, afterEach } from 'vitest'
import { bugunTarih, tarihStr, seriHesapla } from '../utils'

describe('bugunTarih', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('UTC+3 formatinda YYYY-MM-DD doner', () => {
    // 2026-04-20 21:00 UTC = 2026-04-21 00:00 Turkiye
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-20T21:00:00Z'))
    expect(bugunTarih()).toBe('2026-04-21')
  })

  it('UTC gece yarisi oncesi Turkiye tarihini doner', () => {
    // 2026-04-20 20:59 UTC = 2026-04-20 23:59 Turkiye
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-20T20:59:00Z'))
    expect(bugunTarih()).toBe('2026-04-20')
  })
})

describe('tarihStr', () => {
  it('tarihi YYYY-MM-DD formatina cevirir', () => {
    const d = new Date(2026, 0, 5) // 5 Ocak 2026
    expect(tarihStr(d)).toBe('2026-01-05')
  })

  it('tek haneli ay ve gunu sifirla doldurur', () => {
    const d = new Date(2026, 2, 3) // 3 Mart 2026
    expect(tarihStr(d)).toBe('2026-03-03')
  })
})

describe('seriHesapla', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  function bugununTarihiniAyarla(tarih: string) {
    // bugunTarih() UTC+3 kullanir, o yuzden UTC saatini ayarliyoruz
    const [y, m, d] = tarih.split('-').map(Number)
    // Turkiye gunu icin UTC'de 00:00 = Turkiye 03:00
    vi.useFakeTimers()
    vi.setSystemTime(new Date(Date.UTC(y, m - 1, d, 0, 0, 0)))
  }

  it('bos dizi icin 0/0 doner', () => {
    bugununTarihiniAyarla('2026-04-20')
    expect(seriHesapla([])).toEqual({ mevcutSeri: 0, enUzunSeri: 0 })
  })

  it('sadece bugun varsa seri 1', () => {
    bugununTarihiniAyarla('2026-04-20')
    expect(seriHesapla(['2026-04-20'])).toEqual({ mevcutSeri: 1, enUzunSeri: 1 })
  })

  it('ardisik 3 gun seri hesaplar', () => {
    bugununTarihiniAyarla('2026-04-20')
    const tarihler = ['2026-04-18', '2026-04-19', '2026-04-20']
    expect(seriHesapla(tarihler)).toEqual({ mevcutSeri: 3, enUzunSeri: 3 })
  })

  it('bosluklu seride mevcut seri kirilir', () => {
    bugununTarihiniAyarla('2026-04-20')
    // 15-16-17 ardisik, 19-20 ardisik (18 bos)
    const tarihler = ['2026-04-15', '2026-04-16', '2026-04-17', '2026-04-19', '2026-04-20']
    const sonuc = seriHesapla(tarihler)
    expect(sonuc.mevcutSeri).toBe(2)
    expect(sonuc.enUzunSeri).toBe(3)
  })

  it('dun yazildiysa seri devam eder', () => {
    bugununTarihiniAyarla('2026-04-20')
    const tarihler = ['2026-04-19']
    expect(seriHesapla(tarihler)).toEqual({ mevcutSeri: 1, enUzunSeri: 1 })
  })

  it('2 gun once yazildiysa mevcut seri 0', () => {
    bugununTarihiniAyarla('2026-04-20')
    const tarihler = ['2026-04-18']
    expect(seriHesapla(tarihler)).toEqual({ mevcutSeri: 0, enUzunSeri: 1 })
  })

  it('tekrar eden tarihleri benzersizlestirir', () => {
    bugununTarihiniAyarla('2026-04-20')
    const tarihler = ['2026-04-20', '2026-04-20', '2026-04-19']
    expect(seriHesapla(tarihler)).toEqual({ mevcutSeri: 2, enUzunSeri: 2 })
  })

  it('eski uzun seri enUzunSeri olarak doner', () => {
    bugununTarihiniAyarla('2026-04-20')
    // Eski seri: 10-11-12-13-14 (5 gun), mevcut: 20 (1 gun)
    const tarihler = [
      '2026-04-10', '2026-04-11', '2026-04-12', '2026-04-13', '2026-04-14',
      '2026-04-20',
    ]
    const sonuc = seriHesapla(tarihler)
    expect(sonuc.mevcutSeri).toBe(1)
    expect(sonuc.enUzunSeri).toBe(5)
  })
})
