'use client'

import { useState, useEffect, useCallback } from 'react'
import { SoruHavuzu } from '@/lib/types'

const kategoriler = ['felsefe','bilim','sanat','teknoloji','hayat','tarih','spor','sosyal-medya','oyun','muzik','sinema','yemek','psikoloji','dogal-yasam','tartisma']

export default function AdminHavuz() {
  const [havuz, setHavuz] = useState<SoruHavuzu[]>([])
  const [yukleniyor, setYukleniyor] = useState(true)
  const [yeniForm, setYeniForm] = useState({ soru_metni: '', kategori: 'hayat' })
  const [ekleniyor, setEkleniyor] = useState(false)
  const [duzenleId, setDuzenleId] = useState<string | null>(null)
  const [duzenleForm, setDuzenleForm] = useState({ soru_metni: '', kategori: '' })
  const [islem, setIslem] = useState<string | null>(null)

  const yukle = useCallback(async () => {
    setYukleniyor(true)
    const res = await fetch('/api/admin/havuz')
    const { data } = await res.json()
    setHavuz(data || [])
    setYukleniyor(false)
  }, [])

  useEffect(() => { yukle() }, [yukle])

  const ekle = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!yeniForm.soru_metni.trim()) return
    setEkleniyor(true)
    await fetch('/api/admin/havuz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(yeniForm),
    })
    setYeniForm({ soru_metni: '', kategori: 'hayat' })
    setEkleniyor(false)
    yukle()
  }

  const duzenleKaydet = async () => {
    if (!duzenleId) return
    setIslem(duzenleId)
    await fetch('/api/admin/havuz', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: duzenleId, ...duzenleForm }),
    })
    setDuzenleId(null)
    setIslem(null)
    yukle()
  }

  const sil = async (id: string) => {
    if (!confirm('Bu soruyu havuzdan silmek istediğine emin misin?')) return
    setIslem(id)
    await fetch('/api/admin/havuz', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setIslem(null)
    yukle()
  }

  return (
    <div className="space-y-6">
      {/* Yeni soru ekleme formu */}
      <form
        onSubmit={ekle}
        className="rounded-xl border border-border bg-card p-5 shadow-base space-y-3"
      >
        <p className="text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
          Havuza Yeni Soru Ekle
        </p>
        <textarea
          value={yeniForm.soru_metni}
          onChange={(e) => setYeniForm(f => ({ ...f, soru_metni: e.target.value }))}
          placeholder="Soru metnini yaz..."
          rows={2}
          className="w-full resize-none border border-border rounded-lg p-3 text-foreground bg-background/50 placeholder:text-muted/50 text-sm"
        />
        <div className="flex items-center gap-3">
          <select
            value={yeniForm.kategori}
            onChange={(e) => setYeniForm(f => ({ ...f, kategori: e.target.value }))}
            className="border border-border rounded-lg px-3 py-1.5 text-sm bg-background/50 text-foreground"
          >
            {kategoriler.map(k => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={ekleniyor || !yeniForm.soru_metni.trim()}
            className="px-4 py-1.5 text-sm font-medium text-white rounded-lg disabled:opacity-40"
            style={{ backgroundColor: 'var(--color-secondary)' }}
          >
            {ekleniyor ? 'Ekleniyor...' : 'Ekle'}
          </button>
        </div>
      </form>

      {/* Havuz listesi */}
      {yukleniyor ? (
        <p className="text-muted text-sm text-center py-8">Yükleniyor...</p>
      ) : havuz.length === 0 ? (
        <p className="text-muted text-sm text-center py-8">Havuz boş.</p>
      ) : (
        <div className="space-y-3">
          {havuz.map((soru) => (
            <div
              key={soru.id}
              className="rounded-xl border border-border bg-card p-4 shadow-base"
            >
              {duzenleId === soru.id ? (
                <div className="space-y-3">
                  <textarea
                    value={duzenleForm.soru_metni}
                    onChange={(e) => setDuzenleForm(f => ({ ...f, soru_metni: e.target.value }))}
                    rows={2}
                    className="w-full resize-none border border-border rounded-lg p-3 text-foreground bg-background/50 text-sm"
                  />
                  <div className="flex items-center gap-3">
                    <select
                      value={duzenleForm.kategori}
                      onChange={(e) => setDuzenleForm(f => ({ ...f, kategori: e.target.value }))}
                      className="border border-border rounded-lg px-3 py-1.5 text-sm bg-background/50 text-foreground"
                    >
                      {kategoriler.map(k => (
                        <option key={k} value={k}>{k}</option>
                      ))}
                    </select>
                    <button
                      onClick={duzenleKaydet}
                      disabled={islem === soru.id}
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
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ color: 'var(--color-accent)', backgroundColor: 'rgba(212,163,115,0.1)' }}
                      >
                        {soru.kategori}
                      </span>
                      {soru.kullanildi && (
                        <span className="text-xs text-muted">kullanıldı</span>
                      )}
                    </div>
                    <p className="text-sm text-foreground">{soru.soru_metni}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => {
                        setDuzenleId(soru.id)
                        setDuzenleForm({ soru_metni: soru.soru_metni, kategori: soru.kategori })
                      }}
                      className="px-2.5 py-1 text-xs font-medium text-body hover:text-primary border border-border rounded-lg hover:border-secondary/50 transition-colors"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => sil(soru.id)}
                      disabled={islem === soru.id}
                      className="px-2.5 py-1 text-xs font-medium text-danger hover:text-white border border-danger/20 rounded-lg hover:bg-danger hover:border-danger transition-colors"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
