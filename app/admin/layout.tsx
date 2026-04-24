import { redirect } from 'next/navigation'
import { adminKontrol } from '@/lib/admin'
import Link from 'next/link'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { admin, user } = await adminKontrol()

  if (!user) redirect('/giris')
  if (!admin) redirect('/')

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1
          className="text-2xl sm:text-3xl text-primary mb-1"
          style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, letterSpacing: '-0.02em' }}
        >
          Admin Paneli
        </h1>
        <p className="text-body text-sm">Soruları, havuzu, önerileri ve notları yönet</p>
      </div>

      <nav className="flex gap-1 rounded-lg border border-border bg-card p-1">
        <AdminTab href="/admin" label="Genel" />
        <AdminTab href="/admin/sorular" label="Sorular" />
        <AdminTab href="/admin/havuz" label="Havuz" />
        <AdminTab href="/admin/oneriler" label="Öneriler" />
        <AdminTab href="/admin/notlar" label="Notlar" />
      </nav>

      {children}
    </div>
  )
}

function AdminTab({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex-1 text-center px-3 py-2 text-sm font-medium rounded-md text-body hover:text-primary hover:bg-background/50 transition-colors"
    >
      {label}
    </Link>
  )
}
