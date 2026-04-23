'use client'

import { useEffect, useState } from 'react'
import { Not } from '@/lib/types'

interface TakvimGorunuProps {
  notlar: Not[]
}

function hucreRengi(kelimeSayisi: number | undefined): string {
  if (!kelimeSayisi) return 'var(--color-heatmap-0)'
  if (kelimeSayisi <= 75) return 'var(--color-heatmap-1)'
  if (kelimeSayisi <= 150) return 'var(--color-heatmap-2)'
  if (kelimeSayisi <= 225) return 'var(--color-heatmap-3)'
  return 'var(--color-heatmap-4)'
}

function gunleriOlustur(haftaSayisi: number): Date[] {
  const bugun = new Date()
  bugun.setHours(0, 0, 0, 0)

  const gunSayisi = haftaSayisi * 7
  const baslangic = new Date(bugun)
  baslangic.setDate(bugun.getDate() - gunSayisi + 1)

  // pazartesiye hizala
  const gun = baslangic.getDay()
  const fark = gun === 0 ? -6 : 1 - gun
  baslangic.setDate(baslangic.getDate() + fark)

  const gunler: Date[] = []
  const tarih = new Date(baslangic)
  while (tarih <= bugun) {
    gunler.push(new Date(tarih))
    tarih.setDate(tarih.getDate() + 1)
  }

  return gunler
}

function tarihStr(d: Date): string {
  return d.toISOString().split('T')[0]
}

const gunIsimleri = ['Pzt', '', 'Çar', '', 'Cum', '', '']
const ayIsimleri = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']

export default function TakvimGorunu({ notlar }: TakvimGorunuProps) {
  const [haftaSayisi, setHaftaSayisi] = useState(52)
  const [seciliTarih, setSeciliTarih] = useState<string | null>(null)

  useEffect(() => {
    const guncelle = () => setHaftaSayisi(window.innerWidth < 640 ? 12 : 52)
    guncelle()
    window.addEventListener('resize', guncelle)
    return () => window.removeEventListener('resize', guncelle)
  }, [])

  const gunler = gunleriOlustur(haftaSayisi)

  const notHaritasi = new Map<string, Not>()
  notlar.forEach(not => {
    const tarih = not.created_at.split('T')[0]
    notHaritasi.set(tarih, not)
  })

  const haftalar: Date[][] = []
  for (let i = 0; i < gunler.length; i += 7) {
    haftalar.push(gunler.slice(i, i + 7))
  }

  const ayEtiketleri: { ay: string; index: number }[] = []
  let sonAy = -1
  haftalar.forEach((hafta, i) => {
    const ilkGunAy = hafta[0]?.getMonth()
    if (ilkGunAy !== undefined && ilkGunAy !== sonAy) {
      ayEtiketleri.push({ ay: ayIsimleri[ilkGunAy], index: i })
      sonAy = ilkGunAy
    }
  })

  const seciliNot = seciliTarih ? notHaritasi.get(seciliTarih) : null

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto -mx-1 px-1 pb-2">
        <div style={{ minWidth: 'fit-content' }}>
          <div className="flex mb-1" style={{ paddingLeft: '30px' }}>
            {ayEtiketleri.map((etiket, i) => {
              const sonrakiIndex = i < ayEtiketleri.length - 1 ? ayEtiketleri[i + 1].index : haftalar.length
              const genislik = (sonrakiIndex - etiket.index) * 14
              return (
                <span
                  key={i}
                  className="text-[10px] sm:text-xs text-muted inline-block"
                  style={{ width: `${genislik}px` }}
                >
                  {etiket.ay}
                </span>
              )
            })}
          </div>

          <div className="flex gap-0.5">
            <div className="flex flex-col gap-0.5 mr-1 pt-0.5 flex-shrink-0">
              {gunIsimleri.map((isim, i) => (
                <div key={i} className="h-[11px] sm:h-[13px] flex items-center">
                  <span className="text-[9px] sm:text-[10px] text-muted w-5 sm:w-6 text-right">{isim}</span>
                </div>
              ))}
            </div>

            {haftalar.map((hafta, haftaIdx) => (
              <div key={haftaIdx} className="flex flex-col gap-0.5">
                {Array.from({ length: 7 }).map((_, gunIdx) => {
                  const gun = hafta[gunIdx]
                  if (!gun) {
                    return <div key={gunIdx} className="w-[11px] h-[11px] sm:w-[13px] sm:h-[13px]" />
                  }

                  const tarih = tarihStr(gun)
                  const not = notHaritasi.get(tarih)
                  const renk = hucreRengi(not?.kelime_sayisi)
                  const bugun = tarihStr(new Date())
                  const bugunMu = tarih === bugun
                  const seciliMi = seciliTarih === tarih

                  return (
                    <button
                      key={gunIdx}
                      onClick={() => setSeciliTarih(seciliMi ? null : tarih)}
                      className="heatmap-cell w-[11px] h-[11px] sm:w-[13px] sm:h-[13px] rounded-[2px] hover:scale-150 focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-secondary"
                      style={{
                        backgroundColor: renk,
                        animationDelay: `${(haftaIdx * 7 + gunIdx) * 8}ms`,
                        outline: bugunMu ? '2px solid var(--color-secondary)' : seciliMi ? '2px solid var(--color-accent)' : 'none',
                        outlineOffset: bugunMu || seciliMi ? '1px' : '0',
                        transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      }}
                      title={`${gun.toLocaleDateString('tr-TR')}${not ? ` — ${not.kelime_sayisi} kelime` : ''}`}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted">
        <span>Az</span>
        {['var(--color-heatmap-0)', 'var(--color-heatmap-1)', 'var(--color-heatmap-2)', 'var(--color-heatmap-3)', 'var(--color-heatmap-4)'].map((renk, i) => (
          <div
            key={i}
            className="w-[11px] h-[11px] sm:w-[13px] sm:h-[13px] rounded-[2px]"
            style={{ backgroundColor: renk }}
          />
        ))}
        <span>Çok</span>
      </div>

      {seciliTarih && (
        <div className="animate-scale-in rounded-xl border border-border bg-card p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <p className="text-sm text-muted mb-2">
            {new Date(seciliTarih + 'T00:00:00').toLocaleDateString('tr-TR', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
          {seciliNot ? (
            <p className="text-body leading-relaxed">{seciliNot.icerik}</p>
          ) : (
            <p className="text-muted italic">Bu gün için not yazılmamış.</p>
          )}
        </div>
      )}
    </div>
  )
}
