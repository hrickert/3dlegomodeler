import type { InstructionStore } from '../stores/instruction-store'
import type { EditorStore } from '../stores/editor-store'
import { runInAction } from 'mobx'

export async function generateInstructionsPdf(
  instructionStore: InstructionStore,
  editorStore: EditorStore
): Promise<void> {
  const { default: jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  runInAction(() => {
    instructionStore.isGeneratingPdf = true
    instructionStore.pdfProgress = 0
  })

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const canvas = document.querySelector('canvas') as HTMLCanvasElement | null

  const savedMode = editorStore.isLayerMode
  const savedLayer = editorStore.activeLayer
  runInAction(() => { editorStore.isLayerMode = true })

  const steps = instructionStore.steps
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]!
    runInAction(() => {
      editorStore.activeLayer = step.layerIndex
      instructionStore.currentStep = i
      instructionStore.pdfProgress = Math.round((i / steps.length) * 90)
    })

    // Wait a frame for the canvas to update
    await new Promise<void>(resolve => {
      requestAnimationFrame(() => { requestAnimationFrame(() => { resolve() }) })
    })

    if (i > 0) doc.addPage()

    doc.setFontSize(16)
    doc.setTextColor(249, 115, 22)
    doc.text(`Step ${step.stepNumber} of ${steps.length}`, 14, 15)
    doc.setFontSize(10)
    doc.setTextColor(150, 150, 150)
    doc.text(step.description, 14, 22)

    if (canvas) {
      try {
        const imgData = canvas.toDataURL('image/jpeg', 0.85)
        doc.addImage(imgData, 'JPEG', 14, 28, 140, 90)
      } catch {
        // Canvas capture failed — continue without image
      }
    }

    const tableData = step.newBricks.reduce((acc, brick) => {
      const key = `${brick.brickTypeId}_${brick.colorId}`
      const existing = acc.get(key)
      if (existing) {
        existing[2] = String(Number(existing[2]) + 1)
      } else {
        acc.set(key, [brick.brickTypeId, String(brick.colorId), '1'])
      }
      return acc
    }, new Map<string, string[]>())

    autoTable(doc, {
      startY: 28,
      margin: { left: 165 },
      head: [['Piece', 'Color', 'Qty']],
      body: Array.from(tableData.values()),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [249, 115, 22] },
    })
  }

  runInAction(() => {
    editorStore.isLayerMode = savedMode
    editorStore.activeLayer = savedLayer
    instructionStore.currentStep = 0
    instructionStore.isGeneratingPdf = false
    instructionStore.pdfProgress = 100
  })

  doc.save('lego-instructions.pdf')
}
