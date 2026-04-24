'use client'

import { useState, useEffect, useCallback } from 'react'
import { SoruOnerisi } from '@/lib/types'

type Durum = 'beklemede' | 'onaylandi' | 'reddedildi'

export default function AdminOneriler() {
  const [oneriler, setOneriler] = useState<SoruOnerisi[]>([])
  const [yukleniyor, setYukleniyor] = useState(true)
  const [filtre, setFiltre] = useState<Durum | ''>('')
  const [islem, setIslem] = useState<string | null>(null)
  const [notId, setNotId] = useState<string | null>(null)
  const [adminNotu, setAdminNotu] = useState('')

  const yukle = useCallback(async () => {
    setYukleniyor(true)
    const params = filtre ? `?durum=${filtre}` : ''
    const res = await fetch(`/api/admin/oneriler${params}`)
    const { data } = await res.json()
    setOneriler(data || [])
    setYukleniyor(false)
  }, [filtre])

  useEffect(() => { yukle() }, [yukle])

  const durumGuncelle = async (id: string, durum: 'onaylandi' | 'reddedildi') => {
    setIslem(id)
    await fetch('/api/admin/oneriler', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        durum,
        admin_notu: notId === id ? adminNotu : undefined,
      }),
    })
    setIslem(null)
    setNotId(null)
    setAdminNotu('')
    yukle()
  }

  const durumRenk = (durum: string) => {
    switch (durum) {
      case 'beklemede': return { color: 'var(--color-warning)', bg: 'rgba(245,158,11,0.1)' }
      case 'onaylandi': return { color: 'var(--color-success)', bg: 'rgba(5,150,105,0.1)' }
      case 'reddedildi': return { color: 'var(--color-danger)', bg: 'rgba(220,38,38,0.1)' }
      default: return { color: 'var(--color-muted)', bg: 'transparent' }
    }
  }

  const durumMetin = (durum: string) => {
    switch (durum) {
      case 'beklemede': return 'Beklemede'
      case 'onaylandi': return 'Onaylandı'
      case 'reddedildi': return 'Reddedildi'
      default: return durum
    }
  }

  return (
    <div className="space-y-4">
      {/* Filtre */}
      <div className="flex gap-2">
        {(['', 'beklemede', 'onaylandi', 'reddedildi'] as const).map((d) => (
          <button
            key={d}
            onClick={() => setFiltre(d)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors"
            style={{
              borderColor: filtre === d ? 'var(--color-secondary)' : 'var(--color-border)',
              backgroundColor: filtre === d ? 'var(--color-secondary)' : 'transparent',
              color: filtre === d ? '#fff' : 'var(--color-body)',
            }}
          >
            {d === '' ? 'Tümü' : durumMetin(d)}
          </button>
        ))}
      </div>

      {/* Liste */}
      {yukleniyor ? (
        <p className="text-muted text-sm text-center py-8">Yükleniyor...</p>
      ) : oneriler.length === 0 ? (
        <p className="text-muted text-sm text-center py-8">Öneri bulunamadı.</p>
      ) : (
        <div className="space-y-3">
          {oneriler.map((oneri) => {
            const renk = durumRenk(oneri.durum)
            const profil = (oneri as unknown as Record<string, unknown>).profiller as { kullanici_adi: string } | undefined
            return (
              <div
                key={oneri.id}
                className="rounded-xl border border-border bg-card p-4 shadow-base space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ color: renk.color, backgroundColor: renk.bg }}
                      >
                        {durumMetin(oneri.durum)}
                      </span>
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ color: 'var(--color-accent)', backgroundColor: 'rgba(212,163,115,0.1)' }}
                      >
                        {oneri.kategori}
                      </span>
                      {profil && (
                        <span className="text-xs text-muted">
                          @{profil.kullanici_adi}
                        </span>
                      )}
                      <span className="text-xs text-muted tabular-nums">
                        {new Date(oneri.created_at).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{oneri.soru_metni}</p>
                    {oneri.admin_notu && (
                      <p className="text-xs text-muted mt-1 italic">
                        Admin notu: {oneri.admin_notu}
                      </p>
                    )}
                  </div>
                </div>

                {oneri.durum === 'beklemede' && (
                  <div className="space-y-2">
                    {notId === oneri.id && (
                      <input
                        type="text"
                        value={adminNotu}
                        onChange={(e) => setAdminNotu(e.target.value)}
                        placeholder="Admin notu (opsiyonel)..."
                        className="w-full border border-border rounded-lg px-3 py-1.5 text-sm bg-background/50 text-foreground placeholder:text-muted/50"
                      />
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (notId !== oneri.id) {
                            setNotId(oneri.id)
                            setAdminNotu('')
                          }
                        }}
                        className="px-2.5 py-1 text-xs text-muted hover:text-foreground border border-border rounded-lg transition-colors"
                      >
                        {notId === oneri.id ? 'Not eklendi' : 'Not ekle'}
                      </button>
                      <button
                        onClick={() => durumGuncelle(oneri.id, 'onaylandi')}
                        disabled={islem === oneri.id}
                        className="px-3 py-1 text-xs font-medium text-white rounded-lg"
                        style={{ backgroundColor: 'var(--color-success)' }}
                      >
                        Onayla
                      </button>
                      <button
                        onClick={() => durumGuncelle(oneri.id, 'reddedildi')}
                        disabled={islem === oneri.id}
                        className="px-3 py-1 text-xs font-medium text-danger border border-danger/20 rounded-lg hover:bg-danger hover:text-white transition-colors"
                      >
                        Reddet
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
