'use client'

import { useState, useEffect, useCallback } from 'react'

interface NotDetay {
  id: string
  kullanici_id: string
  soru_id: string
  icerik: string
  kelime_sayisi: number
  paylasim: boolean
  created_at: string
  updated_at: string
  kullanici_adi: string
  soru_metni: string
}

type Filtre = 'hepsi' | 'paylasilan' | 'ozel'

export default function AdminNotlar() {
  const [notlar, setNotlar] = useState<NotDetay[]>([])
  const [yukleniyor, setYukleniyor] = useState(true)
  const [duzenleId, setDuzenleId] = useState<string | null>(null)
  const [duzenleForm, setDuzenleForm] = useState({ icerik: '', paylasim: false })
  const [islem, setIslem] = useState<string | null>(null)
  const [filtre, setFiltre] = useState<Filtre>('hepsi')
  const [sayfa, setSayfa] = useState(1)
  const [toplam, setToplam] = useState(0)

  const yukle = useCallback(async () => {
    setYukleniyor(true)
    const params = new URLSearchParams({ sayfa: String(sayfa) })
    if (filtre === 'paylasilan') params.set('paylasim', 'true')
    if (filtre === 'ozel') params.set('paylasim', 'false')

    const res = await fetch(`/api/admin/notlar?${params}`)
    const { data, count } = await res.json()
    setNotlar(data || [])
    setToplam(count || 0)
    setYukleniyor(false)
  }, [sayfa, filtre])

  useEffect(() => { yukle() }, [yukle])

  const filtreDegisti = (yeniFiltre: Filtre) => {
    setFiltre(yeniFiltre)
    setSayfa(1)
  }

  const duzenleBasla = (not: NotDetay) => {
    setDuzenleId(not.id)
    setDuzenleForm({ icerik: not.icerik, paylasim: not.paylasim })
  }

  const duzenleKaydet = async () => {
    if (!duzenleId) return
    setIslem(duzenleId)
    await fetch('/api/admin/notlar', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: duzenleId, ...duzenleForm }),
    })
    setDuzenleId(null)
    setIslem(null)
    yukle()
  }

  const sil = async (id: string) => {
    if (!confirm('Bu notu silmek istediğine emin misin?')) return
    setIslem(id)
    await fetch('/api/admin/notlar', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setIslem(null)
    yukle()
  }

  const filtreler: { key: Filtre; label: string }[] = [
    { key: 'hepsi', label: 'Hepsi' },
    { key: 'paylasilan', label: 'Paylaşılan' },
    { key: 'ozel', label: 'Özel' },
  ]

  const toplamSayfa = Math.ceil(toplam / 20)

  if (yukleniyor) {
    return <p className="text-muted text-sm text-center py-8">Yükleniyor...</p>
  }

  return (
    <div className="space-y-4">
      {/* Filtre */}
      <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
        {filtreler.map(f => (
          <button
            key={f.key}
            onClick={() => filtreDegisti(f.key)}
            className={`flex-1 text-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              filtre === f.key
                ? 'bg-background text-primary shadow-sm'
                : 'text-body hover:text-primary'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Toplam */}
      <p className="text-xs text-muted">{toplam} not bulundu</p>

      {/* Not listesi */}
      {notlar.length === 0 ? (
        <p className="text-muted text-sm text-center py-8">Not bulunamadı.</p>
      ) : (
        notlar.map((not) => (
          <div
            key={not.id}
            className="rounded-xl border border-border bg-card p-4 shadow-base"
          >
            {duzenleId === not.id ? (
              <div className="space-y-3">
                <textarea
                  value={duzenleForm.icerik}
                  onChange={(e) => setDuzenleForm(f => ({ ...f, icerik: e.target.value }))}
                  rows={4}
                  className="w-full resize-none border border-border rounded-lg p-3 text-foreground bg-background/50 text-sm"
                />
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={duzenleForm.paylasim}
                      onChange={(e) => setDuzenleForm(f => ({ ...f, paylasim: e.target.checked }))}
                      className="rounded border-border"
                    />
                    <span className="text-sm text-body">Paylaşılan</span>
                  </label>
                  <button
                    onClick={duzenleKaydet}
                    disabled={islem === not.id}
                    className="px-3 py-1.5 text-sm font-medium text-white rounded-lg"
                    style={{ backgroundColor: 'var(--color-secondary)' }}
                  >
                    Kaydet
                  </button>
                  <button
                    onClick={() => setDuzenleId(null)}
                    className="px-3 py-1.5 text-sm text-muted hover:text-foreground"
                  >
                    İptal
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center">
                    <span className="text-xs font-medium text-secondary">
                      {not.kullanici_adi?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{not.kullanici_adi}</span>
                  <span className="text-xs text-muted">·</span>
                  <span className="text-xs text-muted tabular-nums">
                    {new Date(not.created_at).toLocaleDateString('tr-TR')}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      not.paylasim
                        ? 'text-success bg-success/10'
                        : 'text-muted bg-muted/10'
                    }`}
                  >
                    {not.paylasim ? 'Paylaşılan' : 'Özel'}
                  </span>
                  <span className="text-xs text-muted">{not.kelime_sayisi} kelime</span>
                </div>

                <p className="text-xs text-muted italic mb-1" title={not.soru_metni}>
                  {not.soru_metni.length > 80 ? not.soru_metni.slice(0, 80) + '...' : not.soru_metni}
                </p>

                <p className="text-sm text-foreground mb-3">
                  {not.icerik.length > 150 ? not.icerik.slice(0, 150) + '...' : not.icerik}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => duzenleBasla(not)}
                    className="px-2.5 py-1 text-xs font-medium text-body hover:text-primary border border-border rounded-lg hover:border-secondary/50 transition-colors"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => sil(not.id)}
                    disabled={islem === not.id}
                    className="px-2.5 py-1 text-xs font-medium text-danger hover:text-white border border-danger/20 rounded-lg hover:bg-danger hover:border-danger transition-colors"
                  >
                    Sil
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      )}

      {/* Sayfalama */}
      {toplamSayfa > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setSayfa(s => Math.max(1, s - 1))}
            disabled={sayfa <= 1}
            className="px-3 py-1.5 text-sm font-medium text-body border border-border rounded-lg hover:border-secondary/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Önceki
          </button>
          <span className="text-xs text-muted tabular-nums">
            {sayfa} / {toplamSayfa}
          </span>
          <button
            onClick={() => setSayfa(s => Math.min(toplamSayfa, s + 1))}
            disabled={sayfa >= toplamSayfa}
            className="px-3 py-1.5 text-sm font-medium text-body border border-border rounded-lg hover:border-secondary/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Sonraki
          </button>
        </div>
      )}
    </div>
  )
}
