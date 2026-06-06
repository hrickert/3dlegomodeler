import { makeAutoObservable, runInAction } from 'mobx'
import { getErrorMessage } from '../utils/errors'
import type { ModelStore } from './model-store'

export interface PlacedBrick {
  id: string
  x: number
  y: number
  z: number
  width: number
  depth: number
  heightInPlates: number
  colorId: number
  brickTypeId: string
  isSlope: boolean
}

interface VoxelizerOutput {
  voxels: Uint8Array
  width: number
  height: number
  depth: number
  voxelSize: number
  colorMap: Float32Array
}

export class VoxelStore {
  grid: Uint8Array | null = null
  gridDims: { w: number; h: number; d: number } | null = null
  voxelSize = 0
  colorMap: Float32Array | null = null
  optimizedBricks: PlacedBrick[] = []
  layers: PlacedBrick[][] = []
  isProcessing = false
  progress = 0
  errorMessage: string | null = null

  private worker: Worker | null = null

  constructor() {
    makeAutoObservable<VoxelStore, 'worker'>(this, {
      grid: false,
      colorMap: false,
      worker: false,
    }, { autoBind: true })
  }

  async runVoxelization(modelStore: ModelStore) {
    if (!modelStore.geometry || !modelStore.boundingBox) return
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }

    this.isProcessing = true
    this.progress = 0
    this.errorMessage = null
    this.optimizedBricks = []
    this.layers = []

    try {
      const geo = modelStore.geometry.toNonIndexed()
      geo.computeVertexNormals()
      const positions = new Float32Array(geo.attributes['position']!.array)
      const normals = new Float32Array(geo.attributes['normal']!.array)
      const colorAttr = geo.attributes['color']
      const colors = colorAttr ? new Float32Array(colorAttr.array) : null
      const bbox = modelStore.boundingBox
      const input = {
        positions,
        normals,
        colors,
        resolution: modelStore.resolution,
        boundingBox: {
          min: [bbox.min.x, bbox.min.y, bbox.min.z] as [number, number, number],
          max: [bbox.max.x, bbox.max.y, bbox.max.z] as [number, number, number],
        },
        scaleMultiplier: modelStore.scaleMultiplier,
      }
      geo.dispose()

      const worker = new Worker(
        new URL('../workers/voxelizer.worker.ts', import.meta.url),
        { type: 'module' }
      )
      this.worker = worker

      const transferables: Transferable[] = [positions.buffer, normals.buffer]
      if (colors) transferables.push(colors.buffer)

      await new Promise<void>((resolve, reject) => {
        worker.onmessage = (e: MessageEvent<{ type: string; percent?: number; payload?: VoxelizerOutput; message?: string }>) => {
          const msg = e.data
          if (msg.type === 'progress') {
            runInAction(() => { this.progress = msg.percent ?? 0 })
          } else if (msg.type === 'result' && msg.payload) {
            const out = msg.payload
            runInAction(() => {
              this.grid = out.voxels
              this.gridDims = { w: out.width, h: out.height, d: out.depth }
              this.voxelSize = out.voxelSize
              this.colorMap = out.colorMap
            })
            resolve()
          } else if (msg.type === 'error') {
            reject(new Error(msg.message))
          }
        }
        worker.onerror = (e) => reject(new Error(e.message))
        worker.postMessage(input, transferables)
      })

      worker.terminate()
      this.worker = null

      await this.runOptimizer()

      runInAction(() => {
        this.isProcessing = false
        this.progress = 100
      })
    } catch (err) {
      runInAction(() => {
        this.errorMessage = getErrorMessage(err)
        this.isProcessing = false
      })
    }
  }

  private async runOptimizer() {
    if (!this.grid || !this.gridDims || !this.colorMap) return
    const { optimizeBricks } = await import('../utils/brick-optimizer')
    const bricks = optimizeBricks(
      this.grid,
      this.gridDims.w,
      this.gridDims.h,
      this.gridDims.d,
      this.colorMap
    )
    runInAction(() => {
      this.optimizedBricks = bricks
      this.layers = this.buildLayers(bricks)
    })
  }

  private buildLayers(bricks: PlacedBrick[]): PlacedBrick[][] {
    const maxY = bricks.reduce((m, b) => Math.max(m, b.y), 0)
    const layers: PlacedBrick[][] = Array.from({ length: maxY + 1 }, () => [])
    for (const brick of bricks) {
      layers[brick.y]?.push(brick)
    }
    return layers
  }

  editBrick(id: string, newBrickTypeId: string, newColorId: number) {
    const idx = this.optimizedBricks.findIndex(b => b.id === id)
    if (idx === -1) return
    const brick = this.optimizedBricks[idx]!
    this.optimizedBricks[idx] = { ...brick, brickTypeId: newBrickTypeId, colorId: newColorId }
    this.layers = this.buildLayers(this.optimizedBricks)
  }

  get totalBrickCount(): number {
    return this.optimizedBricks.length
  }
}
