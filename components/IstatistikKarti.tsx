'use client'

interface IstatistikKartiProps {
  baslik: string
  deger: string | number
  aciklama?: string
  ikon: React.ReactNode
  index?: number
}

export default function IstatistikKarti({ baslik, deger, aciklama, ikon, index = 0 }: IstatistikKartiProps) {
  return (
    <div
      className="rounded-xl border border-border bg-card p-5 shadow-base animate-fade-in-up"
      style={{
        animationDelay: `${index * 100}ms`,
        opacity: 0,
        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06), 0 12px 32px rgba(27,67,50,0.08)'
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = ''
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm text-muted font-medium">{baslik}</span>
        <div
          className="w-8 h-8 rounded-lg bg-secondary/5 flex items-center justify-center text-secondary"
          style={{
            transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.2s ease',
          }}
        >
          {ikon}
        </div>
      </div>
      <p
        className="text-2xl text-primary font-semibold"
        style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}
      >
        {deger}
      </p>
      {aciklama && (
        <p className="text-xs text-muted mt-1">{aciklama}</p>
      )}
    </div>
  )
}
