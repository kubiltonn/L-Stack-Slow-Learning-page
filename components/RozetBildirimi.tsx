'use client'

import { useEffect, useState } from 'react'
import { RozetTipi } from '@/lib/types'

interface RozetBildirimiProps {
  rozetler: RozetTipi[]
  onKapat: () => void
}

export default function RozetBildirimi({ rozetler, onKapat }: RozetBildirimiProps) {
  const [gorunen, setGorunen] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setGorunen(false)
      setTimeout(onKapat, 300)
    }, 5000)
    return () => clearTimeout(timer)
  }, [onKapat])

  if (rozetler.length === 0) return null

  return (
    <div
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:bottom-6 sm:right-6 z-50 max-w-sm"
      style={{
        animation: gorunen ? 'bounceIn 0.5s ease forwards' : 'fadeIn 0.3s ease reverse forwards',
      }}
    >
      <div className="rounded-xl border border-secondary/30 bg-card p-4 shadow-floating">
        <div className="flex items-start gap-3">
          <div className="text-2xl">{rozetler[0].ikon}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">
              {rozetler.length === 1
                ? 'Yeni rozet kazandın!'
                : `${rozetler.length} yeni rozet kazandın!`}
            </p>
            <div className="mt-1 space-y-0.5">
              {rozetler.map(rozet => (
                <p key={rozet.id} className="text-xs text-body">
                  {rozet.ikon} <span className="font-medium">{rozet.ad}</span> — {rozet.aciklama}
                </p>
              ))}
            </div>
          </div>
          <button
            onClick={() => {
              setGorunen(false)
              setTimeout(onKapat, 300)
            }}
            className="text-muted hover:text-foreground transition-colors flex-shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
