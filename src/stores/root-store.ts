import { ModelStore } from './model-store'
import { VoxelStore } from './voxel-store'
import { EditorStore } from './editor-store'
import { PaletteStore } from './palette-store'
import { BOMStore } from './bom-store'
import { InstructionStore } from './instruction-store'

export class RootStore {
  modelStore: ModelStore
  voxelStore: VoxelStore
  editorStore: EditorStore
  paletteStore: PaletteStore
  bomStore: BOMStore
  instructionStore: InstructionStore

  constructor() {
    this.modelStore = new ModelStore()
    this.voxelStore = new VoxelStore()
    this.editorStore = new EditorStore()
    this.paletteStore = new PaletteStore()
    this.bomStore = new BOMStore(this.voxelStore)
    this.instructionStore = new InstructionStore(this.voxelStore)
  }
}

export const rootStore = new RootStore()
