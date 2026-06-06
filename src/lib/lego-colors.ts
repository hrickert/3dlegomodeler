export interface LegoColor {
  id: number
  name: string
  hex: string
  rgb: [number, number, number]
  lab: [number, number, number]
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

function c(id: number, name: string, hex: string): LegoColor {
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  return { id, name, hex: `#${hex}`, rgb: [r, g, b], lab: rgbToLab(r, g, b) }
}

export const ALL_LEGO_COLORS: LegoColor[] = [
  c(1,  'White',               'F2F3F2'),
  c(2,  'Tan',                 'E4CD9E'),
  c(3,  'Yellow',              'F2CD37'),
  c(4,  'Orange',              'FE8A18'),
  c(5,  'Red',                 'C91A09'),
  c(6,  'Dark Red',            '720E0F'),
  c(7,  'Bright Pink',         'FF9ECD'),
  c(8,  'Pink',                'FC97AC'),
  c(9,  'Magenta',             '923978'),
  c(10, 'Purple',              '400040'),
  c(11, 'Blue',                '0055BF'),
  c(12, 'Medium Blue',         '5A93DB'),
  c(13, 'Sky Blue',            '68C3E2'),
  c(14, 'Cyan',                '00BCD4'),
  c(15, 'Dark Azure',          '078BC9'),
  c(16, 'Sand Blue',           '6074A1'),
  c(17, 'Dark Blue',           '003152'),
  c(18, 'Green',               '237841'),
  c(19, 'Bright Green',        '4DBB45'),
  c(20, 'Lime',                'BBE90B'),
  c(21, 'Yellowish Green',     'DFEEA5'),
  c(22, 'Olive Green',         '9B9A5A'),
  c(23, 'Dark Green',          '184632'),
  c(24, 'Sand Green',          'A0BCAC'),
  c(25, 'Dark Tan',            '958A73'),
  c(26, 'Brown',               '583927'),
  c(27, 'Reddish Brown',       '582A12'),
  c(28, 'Dark Brown',          '352100'),
  c(29, 'Light Gray',          'A0A5A9'),
  c(30, 'Medium Stone Gray',   '9B9A9C'),
  c(31, 'Dark Stone Gray',     '6C6E68'),
  c(32, 'Very Light Bluish Gray','E3E3E0'),
  c(33, 'Light Bluish Gray',   'AFB5C7'),
  c(34, 'Dark Bluish Gray',    '595D60'),
  c(35, 'Black',               '05131D'),
  c(36, 'Trans Clear',         'FCFCFC'),
  c(37, 'Trans Red',           'C91A09'),
  c(38, 'Trans Orange',        'F08F1C'),
  c(39, 'Trans Yellow',        'F5CD2F'),
  c(40, 'Trans Green',         '84B68D'),
  c(41, 'Trans Blue',          '43819E'),
  c(42, 'Trans Dark Blue',     '0020A0'),
  c(43, 'Trans Purple',        'A5A5CB'),
  c(44, 'Trans Pink',          'FC97AC'),
  c(45, 'Pearl Gold',          'AA7F2E'),
  c(46, 'Pearl Light Gold',    'DCBC81'),
  c(47, 'Pearl Dark Gold',     'AA7444'),
  c(48, 'Pearl Silver',        'A0A5A9'),
  c(49, 'Pearl White',         'F2F3F2'),
  c(50, 'Flat Silver',         '898788'),
  c(51, 'Flat Dark Gold',      'B48455'),
  c(52, 'Chrome Silver',       'E0E0E0'),
  c(53, 'Chrome Gold',         'BBA53D'),
  c(54, 'Metallic Silver',     'A5A9B4'),
  c(55, 'Metallic Gold',       'DBAC34'),
  c(56, 'Glow in Dark Trans',  'BDC6AD'),
  c(57, 'Glow in Dark Opaque', 'E0FFB0'),
  c(58, 'Coral',               'FF698F'),
  c(59, 'Neon Orange',         'FF800D'),
  c(60, 'Neon Green',          'D9E4A7'),
  c(61, 'Sand Red',            'D67572'),
  c(62, 'Sand Purple',         '845E84'),
  c(63, 'Fabuland Orange',     'EF9121'),
  c(64, 'Fabuland Brown',      'C27F53'),
  c(65, 'Medium Nougat',       'AA7D55'),
  c(66, 'Light Nougat',        'F6D7B3'),
  c(67, 'Dark Nougat',         'AD6140'),
  c(68, 'Medium Lilac',        '3A3592'),
  c(69, 'Lavender',            'E1D5ED'),
  c(70, 'Medium Lavender',     'AC78BA'),
  c(71, 'Aqua',                'B0E0DA'),
  c(72, 'Dark Turquoise',      '00838F'),
  c(73, 'Medium Turquoise',    '73DDE5'),
  c(74, 'Maersk Blue',         '5AACAC'),
  c(75, 'Earth Orange',        'FA9C1C'),
]

export const LEGO_COLORS_BY_ID: Map<number, LegoColor> = new Map(
  ALL_LEGO_COLORS.map(c => [c.id, c])
)

export const DEFAULT_COLOR = ALL_LEGO_COLORS[0]
