import { makeAutoObservable } from 'mobx'

export type ViewMode = 'solid' | 'wireframe' | 'lego'

export class EditorStore {
  viewMode: ViewMode = 'solid'
  activeLayer = 0
  maxLayer = 0
  isLayerMode = false
  selectedBrickId: string | null = null
  hoveredBrickId: string | null = null

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  setViewMode(mode: ViewMode) {
    this.viewMode = mode
    if (mode === 'lego') this.isLayerMode = false
  }

  setMaxLayer(max: number) {
    this.maxLayer = max
    if (this.activeLayer > max) this.activeLayer = max
  }

  setActiveLayer(layer: number) {
    this.activeLayer = Math.max(0, Math.min(this.maxLayer, layer))
  }

  toggleLayerMode() {
    this.isLayerMode = !this.isLayerMode
    if (this.isLayerMode) this.viewMode = 'lego'
  }

  nextLayer() {
    if (this.activeLayer < this.maxLayer) this.activeLayer++
  }

  prevLayer() {
    if (this.activeLayer > 0) this.activeLayer--
  }

  selectBrick(id: string | null) {
    this.selectedBrickId = id
  }

  hoverBrick(id: string | null) {
    this.hoveredBrickId = id
  }
}
