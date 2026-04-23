'use client'

import { Soru } from '@/lib/types'

const kategoriEtiketleri: Record<string, { renk: string; arkaplan: string }> = {
  felsefe: { renk: '#7C3AED', arkaplan: 'rgba(124, 58, 237, 0.08)' },
  bilim: { renk: '#0891B2', arkaplan: 'rgba(8, 145, 178, 0.08)' },
  sanat: { renk: '#DB2777', arkaplan: 'rgba(219, 39, 119, 0.08)' },
  teknoloji: { renk: '#2D6A4F', arkaplan: 'rgba(45, 106, 79, 0.08)' },
  hayat: { renk: '#D4A373', arkaplan: 'rgba(212, 163, 115, 0.12)' },
  tarih: { renk: '#92400E', arkaplan: 'rgba(146, 64, 14, 0.08)' },
  spor: { renk: '#DC2626', arkaplan: 'rgba(220, 38, 38, 0.08)' },
  'sosyal-medya': { renk: '#2563EB', arkaplan: 'rgba(37, 99, 235, 0.08)' },
  oyun: { renk: '#7C3AED', arkaplan: 'rgba(124, 58, 237, 0.06)' },
  muzik: { renk: '#C026D3', arkaplan: 'rgba(192, 38, 211, 0.08)' },
  sinema: { renk: '#EA580C', arkaplan: 'rgba(234, 88, 12, 0.08)' },
  yemek: { renk: '#16A34A', arkaplan: 'rgba(22, 163, 74, 0.08)' },
  psikoloji: { renk: '#0D9488', arkaplan: 'rgba(13, 148, 136, 0.08)' },
  'dogal-yasam': { renk: '#65A30D', arkaplan: 'rgba(101, 163, 13, 0.08)' },
  tartisma: { renk: '#E11D48', arkaplan: 'rgba(225, 29, 72, 0.08)' },
}

interface SoruKartiProps {
  soru: Soru
}

export default function SoruKarti({ soru }: SoruKartiProps) {
  const etiket = kategoriEtiketleri[soru.kategori] || kategoriEtiketleri.hayat

  const tarih = new Date(soru.tarih + 'T00:00:00')
  const formatliTarih = tarih.toLocaleDateString('tr-TR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="animate-fade-in-up relative">
      <div
        className="absolute -left-4 top-8 w-1 h-12 rounded-full bg-secondary/20 hidden sm:block"
        style={{
          animation: 'expandWidth 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both',
          transformOrigin: 'top',
        }}
      />

      <div className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <time
            className="text-sm text-muted tracking-wide animate-fade-in"
            dateTime={soru.tarih}
            style={{ animationDelay: '0.1s', opacity: 0 }}
          >
            {formatliTarih}
          </time>
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide animate-bounce-in"
            style={{
              color: etiket.renk,
              backgroundColor: etiket.arkaplan,
              animationDelay: '0.2s',
              opacity: 0,
              transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.08)'
              e.currentTarget.style.boxShadow = `0 2px 8px ${etiket.arkaplan}`
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            {soru.kategori}
          </span>
        </div>

        <h1
          className="text-2xl sm:text-3xl lg:text-[32px] text-primary leading-snug animate-fade-in-up"
          style={{
            fontFamily: 'var(--font-heading)',
            fontStyle: 'italic',
            fontWeight: 500,
            letterSpacing: '-0.02em',
            animationDelay: '0.15s',
            opacity: 0,
          }}
        >
          {soru.soru_metni}
        </h1>

        <div className="flex items-center gap-3 pt-2">
          <div
            className="h-px flex-1 bg-gradient-to-r from-border to-transparent"
            style={{
              animation: 'expandWidth 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s both',
              transformOrigin: 'left',
            }}
          />
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            className="text-accent/40 animate-bounce-in"
            style={{ animationDelay: '0.5s', opacity: 0 }}
          >
            <circle cx="8" cy="8" r="2" fill="currentColor" />
          </svg>
          <div
            className="h-px flex-1 bg-gradient-to-l from-border to-transparent"
            style={{
              animation: 'expandWidth 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s both',
              transformOrigin: 'right',
            }}
          />
        </div>
      </div>
    </div>
  )
}
