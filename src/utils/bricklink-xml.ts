import type { BOMItem } from '../stores/bom-store'

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export function generateBricklinkXml(items: BOMItem[]): string {
  const lines: string[] = ['<?xml version="1.0" encoding="UTF-8"?>', '<INVENTORY>']
  for (const item of items) {
    lines.push('  <ITEM>')
    lines.push('    <ITEMTYPE>P</ITEMTYPE>')
    lines.push(`    <ITEMID>${escapeXml(item.bricklinkPartId)}</ITEMID>`)
    lines.push(`    <COLOR>${item.colorId}</COLOR>`)
    lines.push(`    <MINQTY>${item.quantity}</MINQTY>`)
    lines.push('    <CONDITION>N</CONDITION>')
    lines.push(`    <REMARKS>${escapeXml(item.colorName + ' ' + item.brickName)}</REMARKS>`)
    lines.push('  </ITEM>')
  }
  lines.push('</INVENTORY>')
  return lines.join('\n')
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function generateCsv(items: BOMItem[]): string {
  const header = 'Part Number,Name,Color,Color ID,Quantity,Unit Price (USD),Total Price (USD)'
  const rows = items.map(item =>
    [
      item.bricklinkPartId,
      `"${item.brickName}"`,
      `"${item.colorName}"`,
      item.colorId,
      item.quantity,
      item.unitPriceUsd.toFixed(2),
      (item.unitPriceUsd * item.quantity).toFixed(2)
    ].join(',')
  )
  return [header, ...rows].join('\n')
}
