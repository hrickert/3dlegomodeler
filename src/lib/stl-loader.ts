import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import * as THREE from 'three'

export interface LoadResult {
  geometry: THREE.BufferGeometry
  hasColors: boolean
  boundingBox: THREE.Box3
}

export async function loadGeometry(file: File): Promise<LoadResult> {
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (ext === 'stl') return loadStl(file)
  if (ext === 'obj') return loadObj(file)
  throw new Error(`Unsupported file type: .${ext}. Use .stl or .obj`)
}

async function loadStl(file: File): Promise<LoadResult> {
  const buffer = await file.arrayBuffer()
  const loader = new STLLoader()
  const geometry = loader.parse(buffer)
  geometry.computeVertexNormals()
  geometry.center()
  const hasColors = geometry.hasAttribute('color')
  const boundingBox = new THREE.Box3().setFromBufferAttribute(
    geometry.attributes['position'] as THREE.BufferAttribute
  )
  return { geometry, hasColors, boundingBox }
}

async function loadObj(file: File): Promise<LoadResult> {
  const text = await file.text()
  const loader = new OBJLoader()
  const group = loader.parse(text)
  const geometries: THREE.BufferGeometry[] = []
  group.traverse((child) => {
    if (child instanceof THREE.Mesh && child.geometry) {
      geometries.push(child.geometry as THREE.BufferGeometry)
    }
  })
  if (geometries.length === 0) throw new Error('No geometry found in OBJ file')
  const merged = geometries.length === 1
    ? geometries[0]!
    : mergeGeometries(geometries)
  merged.computeVertexNormals()
  merged.center()
  const hasColors = merged.hasAttribute('color')
  const boundingBox = new THREE.Box3().setFromBufferAttribute(
    merged.attributes['position'] as THREE.BufferAttribute
  )
  return { geometry: merged, hasColors, boundingBox }
}

function mergeGeometries(geos: THREE.BufferGeometry[]): THREE.BufferGeometry {
  let totalVerts = 0
  for (const g of geos) totalVerts += (g.attributes['position']?.count ?? 0)
  const positions = new Float32Array(totalVerts * 3)
  let offset = 0
  for (const g of geos) {
    const pos = g.attributes['position']?.array
    if (pos) {
      positions.set(pos, offset)
      offset += pos.length
    }
  }
  const merged = new THREE.BufferGeometry()
  merged.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  return merged
}
