import { ALL_LEGO_COLORS, type LegoColor } from '../lib/lego-colors'

function labDistance(a: [number, number, number], b: [number, number, number]): number {
  const dL = a[0] - b[0], da = a[1] - b[1], db = a[2] - b[2]
  return Math.sqrt(dL * dL + da * da + db * db)
}

function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  let R = r / 255, G = g / 255, B = b / 255
  R = R > 0.04045 ? Math.pow((R + 0.055) / 1.055, 2.4) : R / 12.92
  G = G > 0.04045 ? Math.pow((G + 0.055) / 1.055, 2.4) : G / 12.92
  B = B > 0.04045 ? Math.pow((B + 0.055) / 1.055, 2.4) : B / 12.92
  let x = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047
  let y = (R * 0.2126 + G * 0.7152 + B * 0.0722) / 1.00000
  let z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883
  const f = (t: number) => t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))]
}

export function matchLegoColor(r: number, g: number, b: number): LegoColor {
  const inputLab = rgbToLab(r, g, b)
  let best = ALL_LEGO_COLORS[0]
  let bestDist = Infinity
  for (const color of ALL_LEGO_COLORS) {
    if (Math.abs(color.lab[0] - inputLab[0]) > bestDist) continue
    const d = labDistance(inputLab, color.lab)
    if (d < bestDist) {
      bestDist = d
      best = color
    }
  }
  return best
}

export function matchLegoColorIndex(r: number, g: number, b: number): number {
  return matchLegoColor(r, g, b).id
}
