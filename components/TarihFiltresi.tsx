'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export default function TarihFiltresi({ bugun }: { bugun: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const seciliTarih = searchParams.get('tarih') || bugun

  const degistir = (yeniTarih: string) => {
    if (yeniTarih === bugun) {
      router.push('/kesfet')
    } else {
      router.push(`/kesfet?tarih=${yeniTarih}`)
    }
  }

  const oncekiGun = () => {
    const [yil, ay, gun] = seciliTarih.split('-').map(Number)
    const d = new Date(yil, ay - 1, gun - 1)
    const yeni = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    degistir(yeni)
  }

  const sonrakiGun = () => {
    const [yil, ay, gun] = seciliTarih.split('-').map(Number)
    const d = new Date(yil, ay - 1, gun + 1)
    const yeni = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    if (yeni <= bugun) degistir(yeni)
  }

  const bugunMu = seciliTarih === bugun

  const [fy, fm, fd] = seciliTarih.split('-').map(Number)
  const formatliTarih = new Date(fy, fm - 1, fd).toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="flex items-center justify-between">
      <button
        onClick={oncekiGun}
        className="p-2 rounded-lg border border-border text-body hover:bg-secondary/5 hover:text-primary transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
        aria-label="Önceki gün"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <div className="text-center">
        <p className="text-sm font-medium text-foreground capitalize">{formatliTarih}</p>
        {!bugunMu && (
          <button
            onClick={() => degistir(bugun)}
            className="text-xs text-secondary hover:text-primary transition-colors duration-200 mt-0.5"
          >
            Bugüne dön
          </button>
        )}
      </div>

      <button
        onClick={sonrakiGun}
        disabled={bugunMu}
        className="p-2 rounded-lg border border-border text-body hover:bg-secondary/5 hover:text-primary transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
        aria-label="Sonraki gün"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  )
}
