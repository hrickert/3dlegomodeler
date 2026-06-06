import { makeAutoObservable, runInAction } from 'mobx'
import type { BufferGeometry, Box3 } from 'three'
import { getErrorMessage } from '../utils/errors'

export class ModelStore {
  file: File | null = null
  geometry: BufferGeometry | null = null
  hasColors = false
  boundingBox: Box3 | null = null
  resolution = 32
  scaleMultiplier = 1.0
  isLoading = false
  errorMessage: string | null = null

  constructor() {
    makeAutoObservable(this, {
      geometry: false,
      boundingBox: false,
    }, { autoBind: true })
  }

  setResolution(n: number) {
    this.resolution = Math.max(8, Math.min(128, n))
  }

  setScaleMultiplier(n: number) {
    this.scaleMultiplier = Math.max(0.1, Math.min(10, n))
  }

  async loadFile(file: File) {
    this.isLoading = true
    this.errorMessage = null
    try {
      const { loadGeometry } = await import('../lib/stl-loader')
      const result = await loadGeometry(file)
      runInAction(() => {
        this.file = file
        this.geometry = result.geometry
        this.hasColors = result.hasColors
        this.boundingBox = result.boundingBox
        this.isLoading = false
      })
    } catch (err) {
      runInAction(() => {
        this.errorMessage = getErrorMessage(err)
        this.isLoading = false
      })
    }
  }

  clear() {
    this.file = null
    this.geometry?.dispose()
    this.geometry = null
    this.hasColors = false
    this.boundingBox = null
    this.errorMessage = null
  }

  get hasModel(): boolean {
    return this.geometry !== null
  }

  get estimatedVoxelCount(): number {
    if (!this.boundingBox) return 0
    const size = { x: 0, y: 0, z: 0 }
    this.boundingBox.getSize({ x: 0, y: 0, z: 0 } as Parameters<Box3['getSize']>[0])
    const bbox = this.boundingBox
    const sx = bbox.max.x - bbox.min.x
    const sy = bbox.max.y - bbox.min.y
    const sz = bbox.max.z - bbox.min.z
    const maxDim = Math.max(sx, sy, sz)
    if (maxDim === 0) return 0
    const voxelSize = maxDim / this.resolution
    const wx = Math.ceil(sx / voxelSize)
    const wy = Math.ceil(sy / voxelSize)
    const wz = Math.ceil(sz / voxelSize)
    void size
    return wx * wy * wz
  }
}
