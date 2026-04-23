export function bugunTarih(): string {
  const simdi = new Date()
  const turkiyeSaati = new Date(simdi.getTime() + 3 * 60 * 60 * 1000)
  return turkiyeSaati.toISOString().split('T')[0]
}

export function tarihStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function seriHesapla(tarihler: string[]): { mevcutSeri: number; enUzunSeri: number } {
  if (tarihler.length === 0) return { mevcutSeri: 0, enUzunSeri: 0 }

  const benzersiz = [...new Set(tarihler)].sort().reverse()
  let mevcutSeri = 1
  let enUzunSeri = 1
  let geciciSeri = 1

  const bugunStr = bugunTarih()
  const [by, ba, bg] = bugunStr.split('-').map(Number)
  const bugun = new Date(by, ba - 1, bg)
  const [sy, sa, sg] = benzersiz[0].split('-').map(Number)
  const sonTarih = new Date(sy, sa - 1, sg)

  const fark = Math.round((bugun.getTime() - sonTarih.getTime()) / (1000 * 60 * 60 * 24))
  if (fark > 1) {
    mevcutSeri = 0
  } else {
    for (let i = 1; i < benzersiz.length; i++) {
      const [oy, oa, og] = benzersiz[i - 1].split('-').map(Number)
      const [sy2, sa2, sg2] = benzersiz[i].split('-').map(Number)
      const onceki = new Date(oy, oa - 1, og)
      const simdiki = new Date(sy2, sa2 - 1, sg2)
      const gunFark = Math.round((onceki.getTime() - simdiki.getTime()) / (1000 * 60 * 60 * 24))
      if (gunFark === 1) {
        mevcutSeri++
      } else {
        break
      }
    }
  }

  for (let i = 1; i < benzersiz.length; i++) {
    const [oy, oa, og] = benzersiz[i - 1].split('-').map(Number)
    const [sy2, sa2, sg2] = benzersiz[i].split('-').map(Number)
    const onceki = new Date(oy, oa - 1, og)
    const simdiki = new Date(sy2, sa2 - 1, sg2)
    const gunFark = Math.round((onceki.getTime() - simdiki.getTime()) / (1000 * 60 * 60 * 24))
    if (gunFark === 1) {
      geciciSeri++
      enUzunSeri = Math.max(enUzunSeri, geciciSeri)
    } else {
      geciciSeri = 1
    }
  }

  return { mevcutSeri, enUzunSeri: Math.max(enUzunSeri, mevcutSeri) }
}
