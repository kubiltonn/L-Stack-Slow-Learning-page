import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, fireEvent, within, cleanup } from '@testing-library/react'
import NotEditor from '../NotEditor'

// createPortal mock — modal icerigi inline render edilsin
vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom')
  return {
    ...actual,
    createPortal: (node: React.ReactNode) => node,
  }
})

afterEach(() => {
  cleanup()
})

function renderEditor(props: Partial<Parameters<typeof NotEditor>[0]> = {}) {
  const defaultProps = {
    soruId: 'soru-1',
    mevcutNot: null as Parameters<typeof NotEditor>[0]['mevcutNot'],
    girisYapildi: true,
    ...props,
  }
  const result = render(<NotEditor {...defaultProps} />)
  return { ...result, scope: within(result.container) }
}

describe('NotEditor', () => {
  it('textarea renderlar', () => {
    const { scope } = renderEditor()
    expect(scope.getByPlaceholderText('Öğrenme yoluna başla...')).toBeInTheDocument()
  })

  it('kelime sayacini gosterir', () => {
    const { scope } = renderEditor()
    expect(scope.getByText('0 / 300')).toBeInTheDocument()
  })

  it('yazinca kelime sayacini gunceller', () => {
    const { scope } = renderEditor()
    const textarea = scope.getByPlaceholderText('Öğrenme yoluna başla...')
    fireEvent.change(textarea, { target: { value: 'bir iki uc dort bes' } })
    expect(scope.getByText('5 / 300')).toBeInTheDocument()
  })

  it('bos icerikle Kaydet butonu disabled', () => {
    const { scope } = renderEditor()
    const buton = scope.getByRole('button', { name: 'Kaydet' })
    expect(buton).toBeDisabled()
  })

  it('icerik girince Kaydet butonu aktif olur', () => {
    const { scope } = renderEditor()
    const textarea = scope.getByPlaceholderText('Öğrenme yoluna başla...')
    fireEvent.change(textarea, { target: { value: 'test icerik' } })
    const buton = scope.getByRole('button', { name: 'Kaydet' })
    expect(buton).not.toBeDisabled()
  })

  it('300 kelime asiminda buton disabled ve uyari gosterir', () => {
    const { scope } = renderEditor()
    const textarea = scope.getByPlaceholderText('Öğrenme yoluna başla...')
    const uzunMetin = Array(301).fill('kelime').join(' ')
    fireEvent.change(textarea, { target: { value: uzunMetin } })
    const buton = scope.getByRole('button', { name: '300 kelime sınırını aştın' })
    expect(buton).toBeDisabled()
  })

  it('mevcut not varken Guncelle butonu gosterir', () => {
    const mevcutNot = {
      id: 'not-1',
      kullanici_id: 'user-1',
      soru_id: 'soru-1',
      icerik: 'mevcut not',
      kelime_sayisi: 2,
      paylasim: false,
      created_at: '2026-04-20T00:00:00Z',
      updated_at: '2026-04-20T00:00:00Z',
    }
    const { scope } = renderEditor({ mevcutNot })
    expect(scope.getByRole('button', { name: 'Güncelle' })).toBeInTheDocument()
  })

  it('giris yapilmamissa tiklayinca giris modali gosterir', () => {
    const { scope } = renderEditor({ girisYapildi: false })
    const textarea = scope.getByPlaceholderText('Öğrenme yoluna başla...')
    fireEvent.change(textarea, { target: { value: 'test' } })

    const buton = scope.getByRole('button', { name: 'Kaydet' })
    fireEvent.click(buton)
    // createPortal mock'landigindan modal container icinde render edilir
    expect(scope.getByText('Düşüncelerini kaydet')).toBeInTheDocument()
  })

  it('paylasim toggle sadece giris yapmissa gorunur', () => {
    const { scope, unmount } = renderEditor({ girisYapildi: true })
    expect(scope.getByText('Toplulukla paylaş')).toBeInTheDocument()
    unmount()

    const { scope: scope2 } = renderEditor({ girisYapildi: false })
    expect(scope2.queryByText('Toplulukla paylaş')).not.toBeInTheDocument()
  })
})
