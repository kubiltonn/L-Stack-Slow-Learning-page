'use client'

import { useState } from 'react'

interface IlhamButonuProps {
  notId: string
  ilhamSayisi: number
  ilhamVerilmis: boolean
  girisYapildi: boolean
}

export default function IlhamButonu({ notId, ilhamSayisi, ilhamVerilmis, girisYapildi }: IlhamButonuProps) {
  const [aktif, setAktif] = useState(ilhamVerilmis)
  const [sayi, setSayi] = useState(ilhamSayisi)
  const [yukleniyor, setYukleniyor] = useState(false)

  const toggle = async () => {
    if (!girisYapildi || yukleniyor) return

    setYukleniyor(true)
    const oncekiAktif = aktif
    const oncekiSayi = sayi

    setAktif(!aktif)
    setSayi(aktif ? sayi - 1 : sayi + 1)

    try {
      const res = await fetch('/api/ilham', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ not_id: notId }),
      })

      if (!res.ok) {
        setAktif(oncekiAktif)
        setSayi(oncekiSayi)
      }
    } catch {
      setAktif(oncekiAktif)
      setSayi(oncekiSayi)
    } finally {
      setYukleniyor(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={!girisYapildi || yukleniyor}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
        aktif
          ? 'bg-accent/15 text-accent border border-accent/20'
          : 'bg-background/50 text-muted border border-border hover:border-accent/30 hover:text-accent'
      } ${!girisYapildi ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      style={{
        transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.2s ease, color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease',
        boxShadow: aktif ? '0 2px 8px rgba(212,163,115,0.15)' : 'none',
      }}
      onMouseOver={(e) => {
        if (girisYapildi) e.currentTarget.style.transform = 'scale(1.06)'
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
      }}
      title={girisYapildi ? (aktif ? 'İlhamını geri al' : 'İlham aldım') : 'İlham vermek için giriş yap'}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill={aktif ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: aktif ? 'scale(1.15) rotate(-8deg)' : 'scale(1) rotate(0deg)',
        }}
      >
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
      {sayi > 0 && <span>{sayi}</span>}
    </button>
  )
}
