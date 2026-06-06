import { makeAutoObservable, computed } from 'mobx'
import { ALL_BRICK_TYPES, type BrickType } from '../lib/brick-types'
import { ALL_LEGO_COLORS, type LegoColor } from '../lib/lego-colors'

export class PaletteStore {
  selectedBrickType: BrickType = ALL_BRICK_TYPES[0]!
  selectedColorId = 1
  colorSearchText = ''

  constructor() {
    makeAutoObservable(this, {
      filteredColors: computed,
    }, { autoBind: true })
  }

  get brickTypes(): BrickType[] {
    return ALL_BRICK_TYPES
  }

  get legoColors(): LegoColor[] {
    return ALL_LEGO_COLORS
  }

  get selectedColor(): LegoColor {
    return ALL_LEGO_COLORS.find(c => c.id === this.selectedColorId) ?? ALL_LEGO_COLORS[0]!
  }

  get filteredColors(): LegoColor[] {
    if (!this.colorSearchText) return ALL_LEGO_COLORS
    const q = this.colorSearchText.toLowerCase()
    return ALL_LEGO_COLORS.filter(c => c.name.toLowerCase().includes(q))
  }

  selectBrickType(type: BrickType) {
    this.selectedBrickType = type
  }

  selectColor(id: number) {
    this.selectedColorId = id
  }

  setColorSearch(text: string) {
    this.colorSearchText = text
  }
}
