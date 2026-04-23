'use client'

import { useEffect, useState, useCallback } from 'react'
import { SoruOnerisi } from '@/lib/types'
import OneriFormu from '@/components/OneriFormu'
import OneriListesi from '@/components/OneriListesi'

export default function OnerilerSayfasi() {
  const [oneriler, setOneriler] = useState<SoruOnerisi[]>([])
  const [yukleniyor, setYukleniyor] = useState(true)

  useEffect(() => {
    fetch('/api/oneri')
      .then(res => res.json())
      .then(res => {
        if (res.data) setOneriler(res.data)
      })
      .catch(() => {})
      .finally(() => setYukleniyor(false))
  }, [])

  const yeniOneriEklendi = useCallback((oneri: SoruOnerisi) => {
    setOneriler(prev => [oneri, ...prev])
  }, [])

  const bekleyenSayisi = oneriler.filter(o => o.durum === 'beklemede').length

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Başlık */}
      <div>
        <h1
          className="text-2xl sm:text-3xl text-primary mb-1"
          style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, letterSpacing: '-0.02em' }}
        >
          Soru Öner
        </h1>
        <p className="text-body text-sm">
          Topluluk için düşündürücü sorular öner. Onaylanan sorular günlük soru havuzuna eklenir.
        </p>
      </div>

      {/* Öneri formu */}
      <OneriFormu onBasarili={yeniOneriEklendi} bekleyenSayisi={bekleyenSayisi} />

      {/* Öneriler listesi */}
      <div className="space-y-3">
        <h2
          className="text-lg text-primary"
          style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
        >
          Önerilerin
        </h2>
        {yukleniyor ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-border/20 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <OneriListesi oneriler={oneriler} />
        )}
      </div>
    </div>
  )
}
