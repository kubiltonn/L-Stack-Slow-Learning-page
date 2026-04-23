import type { Metadata } from "next";
import Navigation from "@/components/Navigation";
import "./globals.css";

export const metadata: Metadata = {
  title: "L-Stack — Learning Stack",
  description: "Günde tek soru, tek düşünce. Bilgi yığınını oluştur.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="h-full antialiased">
      <head />
      <body className="grain min-h-full flex flex-col">
        {/* Dekoratif arka plan gradyanları */}
        <div className="fixed inset-0 pointer-events-none -z-10">
          <div
            className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-[0.04]"
            style={{
              background: 'radial-gradient(circle, #2D6A4F 0%, transparent 70%)',
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.03]"
            style={{
              background: 'radial-gradient(circle, #D4A373 0%, transparent 70%)',
            }}
          />
        </div>

        <Navigation />

        <main className="flex-1 w-full max-w-3xl mx-auto px-6 sm:px-8 lg:px-4 py-8">
          {children}
        </main>

        <footer className="w-full max-w-3xl mx-auto px-6 sm:px-8 lg:px-4 py-8 border-t border-border">
          <p className="text-sm text-muted text-center" style={{ fontFamily: 'var(--font-body)' }}>
            L-Stack — Her gün bir adım
          </p>
        </footer>
      </body>
    </html>
  );
}
