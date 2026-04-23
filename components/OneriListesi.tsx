'use client'

import { SoruOnerisi } from '@/lib/types'

interface OneriListesiProps {
  oneriler: SoruOnerisi[]
}

const durumStilleri: Record<string, { renk: string; metin: string; ikon: string }> = {
  beklemede: { renk: 'var(--color-warning)', metin: 'Beklemede', ikon: '⏳' },
  onaylandi: { renk: 'var(--color-success)', metin: 'Onaylandı', ikon: '✅' },
  reddedildi: { renk: 'var(--color-danger)', metin: 'Reddedildi', ikon: '❌' },
}

export default function OneriListesi({ oneriler }: OneriListesiProps) {
  if (oneriler.length === 0) {
    return (
      <p className="text-sm text-muted text-center py-8 italic">
        Henüz bir öneri göndermedin.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {oneriler.map((oneri, i) => {
        const stil = durumStilleri[oneri.durum] || durumStilleri.beklemede
        return (
          <div
            key={oneri.id}
            className="rounded-xl border border-border bg-card p-4 shadow-base animate-fade-in not-card-hover"
            style={{ animationDelay: `${i * 60}ms`, opacity: 0 }}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm text-body leading-relaxed flex-1">{oneri.soru_metni}</p>
              <span
                className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
                style={{
                  backgroundColor: `${stil.renk}10`,
                  color: stil.renk,
                  border: `1px solid ${stil.renk}25`,
                }}
              >
                {stil.ikon} {stil.metin}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] text-muted px-1.5 py-0.5 rounded bg-background/80">
                {oneri.kategori}
              </span>
              <span className="text-[11px] text-muted">
                {new Date(oneri.created_at).toLocaleDateString('tr-TR', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </span>
            </div>
            {oneri.admin_notu && (
              <p className="text-xs text-muted mt-2 pl-3 border-l-2 border-border italic">
                {oneri.admin_notu}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
