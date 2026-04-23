'use client'

import { useState } from 'react'
import { Not, Etiket } from '@/lib/types'
import EtiketRozeti from './EtiketRozeti'

interface GunlukNotListesiProps {
  notlar: Not[]
  notEtiketMap: Record<string, Etiket[]>
  etiketler: Etiket[]
}

export default function GunlukNotListesi({ notlar, notEtiketMap, etiketler }: GunlukNotListesiProps) {
  const [seciliEtiket, setSeciliEtiket] = useState<string | null>(null)

  const filtrelenmis = seciliEtiket
    ? notlar.filter(not => notEtiketMap[not.id]?.some(e => e.id === seciliEtiket))
    : notlar

  return (
    <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.4s', opacity: 0 }}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2
          className="text-lg text-primary"
          style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
        >
          Notların
        </h2>

        {etiketler.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setSeciliEtiket(null)}
              className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                !seciliEtiket
                  ? 'bg-secondary/10 border-secondary/30 text-secondary font-medium'
                  : 'bg-transparent border-border text-muted hover:text-body hover:border-body/30'
              }`}
            >
              Tümü
            </button>
            {etiketler.filter(e =>
              notlar.some(n => notEtiketMap[n.id]?.some(ne => ne.id === e.id))
            ).map(etiket => (
              <button
                key={etiket.id}
                type="button"
                onClick={() => setSeciliEtiket(seciliEtiket === etiket.id ? null : etiket.id)}
                className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                  seciliEtiket === etiket.id
                    ? 'font-medium'
                    : 'bg-transparent hover:opacity-80'
                }`}
                style={{
                  backgroundColor: seciliEtiket === etiket.id ? `${etiket.renk || '#6B7280'}15` : 'transparent',
                  borderColor: seciliEtiket === etiket.id ? `${etiket.renk || '#6B7280'}40` : 'var(--color-border)',
                  color: seciliEtiket === etiket.id ? (etiket.renk || 'var(--color-body)') : 'var(--color-muted)',
                }}
              >
                {etiket.ad}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {filtrelenmis.length > 0 ? (
          filtrelenmis.map((not, i) => {
            const notEtiketleri = notEtiketMap[not.id] || []
            return (
              <div
                key={not.id}
                className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-base not-card-hover animate-fade-in"
                style={{ animationDelay: `${i * 60}ms`, opacity: 0 }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="text-xs text-muted">
                    {new Date(not.created_at).toLocaleDateString('tr-TR', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </p>
                  <span className="text-xs text-muted tabular-nums">{not.kelime_sayisi} kelime</span>
                </div>
                <p className="text-body text-sm leading-relaxed line-clamp-3">{not.icerik}</p>
                {notEtiketleri.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {notEtiketleri.map(etiket => (
                      <EtiketRozeti key={etiket.id} etiket={etiket} />
                    ))}
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <p className="text-sm text-muted text-center py-8">
            {seciliEtiket ? 'Bu etikete sahip not bulunamadı.' : 'Henüz not yok.'}
          </p>
        )}
      </div>
    </div>
  )
}
