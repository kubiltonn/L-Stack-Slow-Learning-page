'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { Soru } from '@/lib/types'

const kategoriler = ['felsefe','bilim','sanat','teknoloji','hayat','tarih','spor','sosyal-medya','oyun','muzik','sinema','yemek','psikoloji','dogal-yasam','tartisma']

export default function AdminSorular() {
  const [sorular, setSorular] = useState<Soru[]>([])
  const [yukleniyor, setYukleniyor] = useState(true)
  const [duzenleId, setDuzenleId] = useState<string | null>(null)
  const [duzenleForm, setDuzenleForm] = useState({ soru_metni: '', kategori: '' })
  const [islem, setIslem] = useState<string | null>(null)

  const yukle = useCallback(async () => {
    setYukleniyor(true)
    const res = await fetch('/api/admin/sorular')
    const { data } = await res.json()
    setSorular(data || [])
    setYukleniyor(false)
  }, [])

  useEffect(() => { yukle() }, [yukle])

  const duzenleBasla = (soru: Soru) => {
    setDuzenleId(soru.id)
    setDuzenleForm({ soru_metni: soru.soru_metni, kategori: soru.kategori })
  }

  const duzenleKaydet = async () => {
    if (!duzenleId) return
    setIslem(duzenleId)
    await fetch('/api/admin/sorular', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: duzenleId, ...duzenleForm }),
    })
    setDuzenleId(null)
    setIslem(null)
    yukle()
  }

  const sil = async (id: string) => {
    if (!confirm('Bu soruyu silmek istediğine emin misin? Bağlı notlar da silinecek.')) return
    setIslem(id)
    await fetch('/api/admin/sorular', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setIslem(null)
    yukle()
  }

  if (yukleniyor) {
    return <p className="text-muted text-sm text-center py-8">Yükleniyor...</p>
  }

  return (
    <div className="space-y-4">
      {sorular.length === 0 ? (
        <p className="text-muted text-sm text-center py-8">Henüz soru yok.</p>
      ) : (
        sorular.map((soru) => (
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
                    <span className="text-xs text-muted tabular-nums">{soru.tarih}</span>
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ color: 'var(--color-accent)', backgroundColor: 'rgba(212,163,115,0.1)' }}
                    >
                      {soru.kategori}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{soru.soru_metni}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => duzenleBasla(soru)}
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
        ))
      )}
    </div>
  )
}
