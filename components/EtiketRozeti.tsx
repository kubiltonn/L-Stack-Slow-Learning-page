'use client'

import { Etiket } from '@/lib/types'

interface EtiketRozetiProps {
  etiket: Etiket
  onKaldir?: () => void
  boyut?: 'sm' | 'md'
}

function etiketRengi(etiket: Etiket): string {
  if (etiket.renk) return etiket.renk
  let hash = 0
  for (let i = 0; i < etiket.ad.length; i++) {
    hash = etiket.ad.charCodeAt(i) + ((hash << 5) - hash)
  }
  const renkler = ['#8B5CF6', '#F59E0B', '#3B82F6', '#10B981', '#6366F1', '#06B6D4', '#EC4899', '#EF4444']
  return renkler[Math.abs(hash) % renkler.length]
}

export default function EtiketRozeti({ etiket, onKaldir, boyut = 'sm' }: EtiketRozetiProps) {
  const renk = etiketRengi(etiket)
  const kucuk = boyut === 'sm'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${
        kucuk ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      }`}
      style={{
        backgroundColor: `${renk}10`,
        borderColor: `${renk}30`,
        color: renk,
      }}
    >
      {etiket.ad}
      {onKaldir && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onKaldir()
          }}
          className="ml-0.5 hover:opacity-70 transition-opacity"
          aria-label={`${etiket.ad} etiketini kaldır`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  )
}
