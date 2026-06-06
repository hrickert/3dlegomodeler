import type { PlacedBrick } from '../stores/voxel-store'
import { matchLegoColorIndex } from './color-matching'

// Brick candidates ordered largest→smallest for greedy
const BRICK_CANDIDATES: Array<{ w: number; d: number; id: string; plates: number }> = [
  { w: 2, d: 4, id: 'brick-2x4', plates: 3 },
  { w: 4, d: 2, id: 'brick-2x4', plates: 3 },
  { w: 2, d: 3, id: 'brick-2x3', plates: 3 },
  { w: 3, d: 2, id: 'brick-2x3', plates: 3 },
  { w: 2, d: 2, id: 'brick-2x2', plates: 3 },
  { w: 1, d: 4, id: 'brick-1x4', plates: 3 },
  { w: 4, d: 1, id: 'brick-1x4', plates: 3 },
  { w: 1, d: 3, id: 'brick-1x3', plates: 3 },
  { w: 3, d: 1, id: 'brick-1x3', plates: 3 },
  { w: 1, d: 2, id: 'brick-1x2', plates: 3 },
  { w: 2, d: 1, id: 'brick-1x2', plates: 3 },
  { w: 1, d: 1, id: 'brick-1x1', plates: 3 },
]

let brickCounter = 0
function newId(): string {
  return `b${++brickCounter}`
}

export function optimizeBricks(
  grid: Uint8Array,
  W: number,
  H: number,
  D: number,
  colorMap: Float32Array
): PlacedBrick[] {
  brickCounter = 0
  const bricks: PlacedBrick[] = []

  // Process layer by layer
  for (let y = 0; y < H; y++) {
    const remaining = new Uint8Array(W * D)
    // Copy this layer's occupied cells
    for (let x = 0; x < W; x++) {
      for (let z = 0; z < D; z++) {
        remaining[x + z * W] = grid[x + y * W + z * W * H] ?? 0
      }
    }

    // For each occupied cell, try to place largest brick
    for (let z = 0; z < D; z++) {
      for (let x = 0; x < W; x++) {
        if (!remaining[x + z * W]) continue
        const voxIdx = x + y * W + z * W * H
        const r = Math.round((colorMap[voxIdx * 3] ?? 0.8) * 255)
        const g = Math.round((colorMap[voxIdx * 3 + 1] ?? 0.8) * 255)
        const b = Math.round((colorMap[voxIdx * 3 + 2] ?? 0.8) * 255)
        const colorId = matchLegoColorIndex(r, g, b)

        let placed = false
        for (const cand of BRICK_CANDIDATES) {
          if (x + cand.w > W || z + cand.d > D) continue
          // Check all cells are filled
          let fits = true
          for (let dx = 0; dx < cand.w && fits; dx++) {
            for (let dz = 0; dz < cand.d && fits; dz++) {
              if (!remaining[(x + dx) + (z + dz) * W]) fits = false
            }
          }
          if (!fits) continue

          // Remove cells
          for (let dx = 0; dx < cand.w; dx++) {
            for (let dz = 0; dz < cand.d; dz++) {
              remaining[(x + dx) + (z + dz) * W] = 0
            }
          }

          bricks.push({
            id: newId(),
            x, y, z,
            width: cand.w,
            depth: cand.d,
            heightInPlates: cand.plates,
            colorId,
            brickTypeId: cand.id,
            isSlope: false,
          })
          placed = true
          break
        }

        if (!placed) {
          // Fallback 1x1
          remaining[x + z * W] = 0
          bricks.push({
            id: newId(),
            x, y, z,
            width: 1, depth: 1, heightInPlates: 3,
            colorId,
            brickTypeId: 'brick-1x1',
            isSlope: false,
          })
        }
      }
    }
  }

  return mergeVerticalBricks(bricks, W, H, D)
}

function mergeVerticalBricks(bricks: PlacedBrick[], _W: number, _H: number, _D: number): PlacedBrick[] {
  // Build lookup: footprint key → bricks sorted by Y
  const byFootprint = new Map<string, PlacedBrick[]>()
  for (const brick of bricks) {
    if (brick.isSlope) continue
    const key = `${brick.x}_${brick.z}_${brick.width}_${brick.depth}_${brick.colorId}_${brick.brickTypeId}`
    const arr = byFootprint.get(key) ?? []
    arr.push(brick)
    byFootprint.set(key, arr)
  }

  const merged = new Set<string>()
  const result: PlacedBrick[] = []

  for (const [, group] of byFootprint) {
    group.sort((a, b) => a.y - b.y)
    let i = 0
    while (i < group.length) {
      const base = group[i]!
      // Try to merge 3 consecutive layers (same footprint) into standard brick
      if (
        i + 2 < group.length &&
        group[i + 1]!.y === base.y + 1 &&
        group[i + 2]!.y === base.y + 2
      ) {
        merged.add(base.id)
        merged.add(group[i + 1]!.id)
        merged.add(group[i + 2]!.id)
        result.push({
          ...base,
          id: newId(),
          heightInPlates: 3,
        })
        i += 3
      } else {
        i++
      }
    }
  }

  // Add non-merged bricks (as plates, height=1)
  for (const brick of bricks) {
    if (!merged.has(brick.id)) {
      result.push({ ...brick, heightInPlates: brick.isSlope ? brick.heightInPlates : 1, brickTypeId: brick.isSlope ? brick.brickTypeId : brick.brickTypeId.replace('brick-', 'plate-') })
    }
  }

  return result
}
