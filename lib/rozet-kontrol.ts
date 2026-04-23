import { RozetTipi } from './types'

export function kazanilacakRozetler(
  rozetTipleri: RozetTipi[],
  mevcutRozetIdler: string[],
  istatistikler: {
    toplamNot: number
    mevcutSeri: number
    enUzunSeri: number
    paylasimSayisi: number
    enUzunNot: number
  }
): RozetTipi[] {
  const yeniRozetler: RozetTipi[] = []

  for (const rozet of rozetTipleri) {
    if (mevcutRozetIdler.includes(rozet.id)) continue

    let kazanildi = false

    switch (rozet.kosul_tipi) {
      case 'not_sayisi':
        kazanildi = istatistikler.toplamNot >= rozet.kosul_degeri
        break
      case 'seri':
        kazanildi = istatistikler.mevcutSeri >= rozet.kosul_degeri || istatistikler.enUzunSeri >= rozet.kosul_degeri
        break
      case 'paylasim':
        kazanildi = istatistikler.paylasimSayisi >= rozet.kosul_degeri
        break
      case 'kelime':
        kazanildi = istatistikler.enUzunNot >= rozet.kosul_degeri
        break
    }

    if (kazanildi) {
      yeniRozetler.push(rozet)
    }
  }

  return yeniRozetler
}
