export type BrickId =
  | 'brick-1x1' | 'brick-1x2' | 'brick-1x3' | 'brick-1x4'
  | 'brick-2x2' | 'brick-2x3' | 'brick-2x4'
  | 'plate-1x1' | 'plate-1x2' | 'plate-1x4' | 'plate-2x2' | 'plate-2x4'
  | 'slope-1x1-45' | 'slope-1x2-45' | 'slope-2x2-45'
  | 'slope-1x2-33' | 'slope-2x3-33'

export interface BrickType {
  id: BrickId
  name: string
  ldrawPartId: string
  bricklinkPartId: string
  studsX: number
  studsZ: number
  heightInPlates: number
  isSlope: boolean
  slopeAngle?: 45 | 33
  estimatedPriceUsd: number
}

export const ALL_BRICK_TYPES: BrickType[] = [
  { id: 'brick-1x1',   name: 'Brick 1x1',   ldrawPartId: '3005', bricklinkPartId: '3005', studsX: 1, studsZ: 1, heightInPlates: 3, isSlope: false, estimatedPriceUsd: 0.08 },
  { id: 'brick-1x2',   name: 'Brick 1x2',   ldrawPartId: '3004', bricklinkPartId: '3004', studsX: 1, studsZ: 2, heightInPlates: 3, isSlope: false, estimatedPriceUsd: 0.07 },
  { id: 'brick-1x3',   name: 'Brick 1x3',   ldrawPartId: '3622', bricklinkPartId: '3622', studsX: 1, studsZ: 3, heightInPlates: 3, isSlope: false, estimatedPriceUsd: 0.09 },
  { id: 'brick-1x4',   name: 'Brick 1x4',   ldrawPartId: '3010', bricklinkPartId: '3010', studsX: 1, studsZ: 4, heightInPlates: 3, isSlope: false, estimatedPriceUsd: 0.10 },
  { id: 'brick-2x2',   name: 'Brick 2x2',   ldrawPartId: '3003', bricklinkPartId: '3003', studsX: 2, studsZ: 2, heightInPlates: 3, isSlope: false, estimatedPriceUsd: 0.10 },
  { id: 'brick-2x3',   name: 'Brick 2x3',   ldrawPartId: '3002', bricklinkPartId: '3002', studsX: 2, studsZ: 3, heightInPlates: 3, isSlope: false, estimatedPriceUsd: 0.12 },
  { id: 'brick-2x4',   name: 'Brick 2x4',   ldrawPartId: '3001', bricklinkPartId: '3001', studsX: 2, studsZ: 4, heightInPlates: 3, isSlope: false, estimatedPriceUsd: 0.14 },
  { id: 'plate-1x1',   name: 'Plate 1x1',   ldrawPartId: '3024', bricklinkPartId: '3024', studsX: 1, studsZ: 1, heightInPlates: 1, isSlope: false, estimatedPriceUsd: 0.06 },
  { id: 'plate-1x2',   name: 'Plate 1x2',   ldrawPartId: '3023', bricklinkPartId: '3023', studsX: 1, studsZ: 2, heightInPlates: 1, isSlope: false, estimatedPriceUsd: 0.06 },
  { id: 'plate-1x4',   name: 'Plate 1x4',   ldrawPartId: '3710', bricklinkPartId: '3710', studsX: 1, studsZ: 4, heightInPlates: 1, isSlope: false, estimatedPriceUsd: 0.07 },
  { id: 'plate-2x2',   name: 'Plate 2x2',   ldrawPartId: '3022', bricklinkPartId: '3022', studsX: 2, studsZ: 2, heightInPlates: 1, isSlope: false, estimatedPriceUsd: 0.07 },
  { id: 'plate-2x4',   name: 'Plate 2x4',   ldrawPartId: '3020', bricklinkPartId: '3020', studsX: 2, studsZ: 4, heightInPlates: 1, isSlope: false, estimatedPriceUsd: 0.09 },
  { id: 'slope-1x1-45', name: 'Slope 45° 1x1', ldrawPartId: '54200', bricklinkPartId: '54200', studsX: 1, studsZ: 1, heightInPlates: 3, isSlope: true, slopeAngle: 45, estimatedPriceUsd: 0.09 },
  { id: 'slope-1x2-45', name: 'Slope 45° 1x2', ldrawPartId: '3040b', bricklinkPartId: '3040', studsX: 1, studsZ: 2, heightInPlates: 3, isSlope: true, slopeAngle: 45, estimatedPriceUsd: 0.09 },
  { id: 'slope-2x2-45', name: 'Slope 45° 2x2', ldrawPartId: '3039', bricklinkPartId: '3039', studsX: 2, studsZ: 2, heightInPlates: 3, isSlope: true, slopeAngle: 45, estimatedPriceUsd: 0.10 },
  { id: 'slope-1x2-33', name: 'Slope 33° 1x2', ldrawPartId: '4286', bricklinkPartId: '4286', studsX: 1, studsZ: 2, heightInPlates: 3, isSlope: true, slopeAngle: 33, estimatedPriceUsd: 0.09 },
  { id: 'slope-2x3-33', name: 'Slope 33° 2x3', ldrawPartId: '4287', bricklinkPartId: '4287', studsX: 2, studsZ: 3, heightInPlates: 3, isSlope: true, slopeAngle: 33, estimatedPriceUsd: 0.11 },
]

export const BRICK_TYPES_BY_ID: Map<BrickId, BrickType> = new Map(
  ALL_BRICK_TYPES.map(b => [b.id, b])
)

export const STANDARD_BRICKS: BrickType[] = ALL_BRICK_TYPES.filter(b => !b.isSlope && b.heightInPlates === 3)

// Physical constants (world units = studs)
export const STUD_SIZE = 0.8       // 8mm / 10mm pitch
export const PLATE_HEIGHT = 0.32   // 3.2mm
export const BRICK_HEIGHT = 0.96   // 9.6mm = 3 plates
