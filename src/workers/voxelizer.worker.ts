/// <reference lib="webworker" />

interface VoxelizerInput {
  positions: Float32Array
  normals: Float32Array
  colors: Float32Array | null
  resolution: number
  boundingBox: { min: [number, number, number]; max: [number, number, number] }
  scaleMultiplier: number
}

interface Triangle {
  ax: number; ay: number; az: number
  bx: number; by: number; bz: number
  cx: number; cy: number; cz: number
  cr: number; cg: number; cb: number
}

function buildTriangles(positions: Float32Array, colors: Float32Array | null): Triangle[] {
  const count = positions.length / 9
  const tris: Triangle[] = new Array(count)
  for (let i = 0; i < count; i++) {
    const p = i * 9
    tris[i] = {
      ax: positions[p]!, ay: positions[p+1]!, az: positions[p+2]!,
      bx: positions[p+3]!, by: positions[p+4]!, bz: positions[p+5]!,
      cx: positions[p+6]!, cy: positions[p+7]!, cz: positions[p+8]!,
      cr: colors ? colors[p]! : 0.8,
      cg: colors ? colors[p+1]! : 0.8,
      cb: colors ? colors[p+2]! : 0.8,
    }
  }
  return tris
}

// Ray-triangle intersection along Y axis (Möller–Trumbore adapted)
// Returns the Y coordinate of the intersection, or null if no hit.
function rayHitY(tri: Triangle, rx: number, rz: number): number | null {
  const e1x = tri.bx - tri.ax, e1y = tri.by - tri.ay, e1z = tri.bz - tri.az
  const e2x = tri.cx - tri.ax, e2y = tri.cy - tri.ay, e2z = tri.cz - tri.az
  // h = rayDir(0,1,0) × e2
  const hx = -e2z, hz = e2x
  const det = e1x * hx + e1z * hz
  if (Math.abs(det) < 1e-10) return null
  const inv = 1 / det
  const sx = rx - tri.ax, sz = rz - tri.az
  const u = inv * (sx * hx + sz * hz)
  if (u < 0 || u > 1) return null
  // q = s × e1 (only Y component needed for v, full for t)
  const qy = sx * e1z - sz * e1x
  const v = inv * qy
  if (v < 0 || u + v > 1) return null
  // t: Y intersection = ay + u*e1y + v*e2y
  return tri.ay + u * e1y + v * e2y
}

self.onmessage = (e: MessageEvent<VoxelizerInput>) => {
  const { positions, colors, resolution, boundingBox, scaleMultiplier } = e.data

  const bmin = boundingBox.min
  const bmax = boundingBox.max
  const sx = (bmax[0] - bmin[0]) * scaleMultiplier
  const sy = (bmax[1] - bmin[1]) * scaleMultiplier
  const sz = (bmax[2] - bmin[2]) * scaleMultiplier
  const maxDim = Math.max(sx, sy, sz)
  if (maxDim === 0) {
    self.postMessage({ type: 'error', message: 'Model has zero size' })
    return
  }

  const voxelSize = maxDim / resolution
  const W = Math.max(1, Math.ceil(sx / voxelSize))
  const H = Math.max(1, Math.ceil(sy / voxelSize))
  const D = Math.max(1, Math.ceil(sz / voxelSize))

  const grid = new Uint8Array(W * H * D)
  const colorMap = new Float32Array(W * H * D * 3).fill(0.8)

  const tris = buildTriangles(positions, colors)

  for (let xi = 0; xi < W; xi++) {
    for (let zi = 0; zi < D; zi++) {
      const rx = bmin[0] + (xi + 0.5) * voxelSize / scaleMultiplier
      const rz = bmin[2] + (zi + 0.5) * voxelSize / scaleMultiplier

      // Collect all Y intersections
      const hitYs: number[] = []
      const hitTris: Triangle[] = []
      for (const tri of tris) {
        const minX = Math.min(tri.ax, tri.bx, tri.cx)
        const maxX = Math.max(tri.ax, tri.bx, tri.cx)
        if (rx < minX - 1e-6 || rx > maxX + 1e-6) continue
        const minZ = Math.min(tri.az, tri.bz, tri.cz)
        const maxZ = Math.max(tri.az, tri.bz, tri.cz)
        if (rz < minZ - 1e-6 || rz > maxZ + 1e-6) continue
        const hy = rayHitY(tri, rx, rz)
        if (hy !== null) {
          hitYs.push(hy)
          hitTris.push(tri)
        }
      }

      // Sort by Y
      const order = hitYs.map((_, i) => i).sort((a, b) => hitYs[a]! - hitYs[b]!)
      const sorted = order.map(i => hitYs[i]!)
      const sortedTris = order.map(i => hitTris[i]!)

      // Even-odd fill
      for (let k = 0; k + 1 < sorted.length; k += 2) {
        const y0 = sorted[k]!
        const y1 = sorted[k + 1]!
        const tri = sortedTris[k]!
        const yi0 = Math.max(0, Math.floor((y0 - bmin[1]) * scaleMultiplier / voxelSize))
        const yi1 = Math.min(H, Math.ceil((y1 - bmin[1]) * scaleMultiplier / voxelSize))
        for (let yi = yi0; yi < yi1; yi++) {
          const idx = xi + yi * W + zi * W * H
          grid[idx] = 1
          colorMap[idx * 3] = tri.cr
          colorMap[idx * 3 + 1] = tri.cg
          colorMap[idx * 3 + 2] = tri.cb
        }
      }
    }

    if (xi % 4 === 0) {
      self.postMessage({ type: 'progress', percent: Math.round(xi / W * 100) })
    }
  }

  self.postMessage(
    { type: 'result', payload: { voxels: grid, width: W, height: H, depth: D, voxelSize, colorMap } },
    [grid.buffer, colorMap.buffer]
  )
}
