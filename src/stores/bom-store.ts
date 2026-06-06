import { makeAutoObservable, computed } from 'mobx'
import { BRICK_TYPES_BY_ID } from '../lib/brick-types'
import { LEGO_COLORS_BY_ID } from '../lib/lego-colors'
import type { VoxelStore } from './voxel-store'

export interface BOMItem {
  bricklinkPartId: string
  brickName: string
  colorId: number
  colorName: string
  quantity: number
  unitPriceUsd: number
}

export class BOMStore {
  constructor(private voxelStore: VoxelStore) {
    makeAutoObservable(this, {
      items: computed,
      totalPieces: computed,
      estimatedTotalCost: computed,
    }, { autoBind: true })
  }

  get items(): BOMItem[] {
    const map = new Map<string, BOMItem>()
    for (const brick of this.voxelStore.optimizedBricks) {
      const brickType = BRICK_TYPES_BY_ID.get(brick.brickTypeId as Parameters<typeof BRICK_TYPES_BY_ID.get>[0])
      const color = LEGO_COLORS_BY_ID.get(brick.colorId)
      if (!brickType || !color) continue
      const key = `${brickType.bricklinkPartId}-${color.id}`
      const existing = map.get(key)
      if (existing) {
        existing.quantity++
      } else {
        map.set(key, {
          bricklinkPartId: brickType.bricklinkPartId,
          brickName: brickType.name,
          colorId: color.id,
          colorName: color.name,
          quantity: 1,
          unitPriceUsd: brickType.estimatedPriceUsd,
        })
      }
    }
    return Array.from(map.values()).sort((a, b) => b.quantity - a.quantity)
  }

  get totalPieces(): number {
    return this.items.reduce((s, i) => s + i.quantity, 0)
  }

  get estimatedTotalCost(): number {
    return this.items.reduce((s, i) => s + i.quantity * i.unitPriceUsd, 0)
  }
}
