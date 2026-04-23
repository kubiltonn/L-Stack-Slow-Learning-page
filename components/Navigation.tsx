'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function Navigation() {
  const [girisYapildi, setGirisYapildi] = useState(false)
  const [yukleniyor, setYukleniyor] = useState(true)
  const [menuAcik, setMenuAcik] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      setGirisYapildi(!!user)
      setYukleniyor(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setGirisYapildi(!!session?.user)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (menuAcik) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [menuAcik])

  const cikisYap = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
      <div className="max-w-3xl mx-auto px-4 sm:px-8 lg:px-4 h-14 sm:h-16 flex items-center justify-between">
        <a href="/" className="group flex items-center gap-2">
          <svg
            width="28"
            height="28"
            viewBox="0 0 32 32"
            fill="none"
            style={{ transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'rotate(8deg) scale(1.1)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'rotate(0deg) scale(1)')}
          >
            <path
              d="M16 4C9 4 5 10 5 16c0 7 5 12 11 12 1 0 1.5-0.5 1.5-1s0-1.5-0.5-2.5C16 23 15 22 15 20c0-2 1.5-3 4-3h3c3 0 6-2.5 6-6C28 6 22 4 16 4z"
              fill="#2D6A4F"
            />
            <text x="16" y="19.5" textAnchor="middle" fontFamily="Georgia, serif" fontSize="13" fontWeight="700" fill="#FEFCF3">?</text>
          </svg>
          <span
            className="text-lg font-semibold text-primary tracking-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            L-Stack
          </span>
        </a>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-1">
          <NavLink href="/">Bugün</NavLink>
          <NavLink href="/gunluk">Günlük</NavLink>
          <NavLink href="/kesfet">Keşfet</NavLink>
          <NavLink href="/oneriler">Öner</NavLink>

          {!yukleniyor && (
            girisYapildi ? (
              <>
                <NavLink href="/profil">Profil</NavLink>
                <button
                  onClick={cikisYap}
                  className="px-3 py-1.5 text-sm font-medium text-muted rounded-lg hover:bg-danger/5 hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger active:scale-[0.97]"
                  style={{ transition: 'color 0.2s ease, background-color 0.2s ease, transform 0.15s ease' }}
                >
                  Çıkış
                </button>
              </>
            ) : (
              <a
                href="/giris"
                className="px-4 py-1.5 text-sm font-medium text-white rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary hover:-translate-y-[1px] active:scale-[0.97]"
                style={{
                  backgroundColor: 'var(--color-secondary)',
                  boxShadow: '0 1px 2px rgba(45,106,79,0.2)',
                  transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease',
                }}
                onMouseOver={(e) => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(45,106,79,0.3)')}
                onMouseOut={(e) => (e.currentTarget.style.boxShadow = '0 1px 2px rgba(45,106,79,0.2)')}
              >
                Giriş Yap
              </a>
            )
          )}
        </div>

        {/* Hamburger butonu (mobil) */}
        <button
          onClick={() => setMenuAcik(!menuAcik)}
          className="sm:hidden flex items-center justify-center w-10 h-10 -mr-2 rounded-lg text-body hover:bg-border/30 active:scale-95"
          style={{ transition: 'background-color 0.2s, transform 0.15s' }}
          aria-label="Menü"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {menuAcik ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobil menü */}
      {menuAcik && (
        <>
          <div
            className="sm:hidden fixed inset-0 top-14 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setMenuAcik(false)}
          />
          <div
            className="sm:hidden fixed top-14 left-0 right-0 z-50 bg-card border-b border-border shadow-elevated animate-scale-in"
          >
            <div className="flex flex-col py-2 px-4">
              <MobilLink href="/" onClick={() => setMenuAcik(false)}>Bugün</MobilLink>
              <MobilLink href="/gunluk" onClick={() => setMenuAcik(false)}>Günlük</MobilLink>
              <MobilLink href="/kesfet" onClick={() => setMenuAcik(false)}>Keşfet</MobilLink>
              <MobilLink href="/oneriler" onClick={() => setMenuAcik(false)}>Öner</MobilLink>

              {!yukleniyor && (
                girisYapildi ? (
                  <>
                    <MobilLink href="/profil" onClick={() => setMenuAcik(false)}>Profil</MobilLink>
                    <div className="border-t border-border mt-1 pt-1">
                      <button
                        onClick={() => { setMenuAcik(false); cikisYap() }}
                        className="w-full text-left px-3 py-3 text-sm font-medium text-danger/80 hover:text-danger hover:bg-danger/5 rounded-lg"
                        style={{ transition: 'color 0.2s, background-color 0.2s' }}
                      >
                        Çıkış Yap
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="border-t border-border mt-1 pt-2 pb-1">
                    <a
                      href="/giris"
                      onClick={() => setMenuAcik(false)}
                      className="block w-full text-center py-2.5 rounded-lg text-white font-medium text-sm"
                      style={{
                        backgroundColor: 'var(--color-secondary)',
                        boxShadow: '0 1px 2px rgba(45,106,79,0.2)',
                      }}
                    >
                      Giriş Yap
                    </a>
                  </div>
                )
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="relative px-3 py-1.5 text-sm font-medium text-body rounded-lg hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary group"
      style={{ transition: 'color 0.2s ease' }}
    >
      {children}
      <span
        className="absolute bottom-0 left-1/2 h-[2px] w-0 rounded-full bg-secondary/40 group-hover:w-3/5"
        style={{
          transition: 'width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: 'translateX(-50%)',
        }}
      />
    </a>
  )
}

function MobilLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="px-3 py-3 text-sm font-medium text-body hover:text-primary hover:bg-background/80 rounded-lg"
      style={{ transition: 'color 0.2s, background-color 0.2s' }}
    >
      {children}
    </a>
  )
}
