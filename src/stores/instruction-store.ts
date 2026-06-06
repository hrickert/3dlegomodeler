import { makeAutoObservable, computed } from 'mobx'
import type { PlacedBrick, VoxelStore } from './voxel-store'

export interface InstructionStep {
  stepNumber: number
  layerIndex: number
  newBricks: PlacedBrick[]
  cumulativeBricks: PlacedBrick[]
  description: string
}

export class InstructionStore {
  currentStep = 0
  pdfProgress = 0
  isGeneratingPdf = false

  constructor(private voxelStore: VoxelStore) {
    makeAutoObservable(this, {
      steps: computed,
      totalSteps: computed,
    }, { autoBind: true })
  }

  get steps(): InstructionStep[] {
    const layers = this.voxelStore.layers
    const steps: InstructionStep[] = []
    let cumulative: PlacedBrick[] = []
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i] ?? []
      if (layer.length === 0) continue
      cumulative = [...cumulative, ...layer]
      steps.push({
        stepNumber: steps.length + 1,
        layerIndex: i,
        newBricks: layer,
        cumulativeBricks: [...cumulative],
        description: `Layer ${i + 1} — ${layer.length} piece${layer.length !== 1 ? 's' : ''}`,
      })
    }
    return steps
  }

  get totalSteps(): number {
    return this.steps.length
  }

  get currentStepData(): InstructionStep | null {
    return this.steps[this.currentStep] ?? null
  }

  goToStep(n: number) {
    this.currentStep = Math.max(0, Math.min(this.totalSteps - 1, n))
  }

  nextStep() {
    if (this.currentStep < this.totalSteps - 1) this.currentStep++
  }

  prevStep() {
    if (this.currentStep > 0) this.currentStep--
  }
}
