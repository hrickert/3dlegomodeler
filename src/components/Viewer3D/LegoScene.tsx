import { useRef, useMemo, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import * as THREE from 'three'
import { useStore } from '../../contexts/StoreContext'
import type { ThreeEvent } from '@react-three/fiber'
import type { PlacedBrick } from '../../stores/voxel-store'
import { LEGO_COLORS_BY_ID } from '../../lib/lego-colors'
import { STUD_SIZE, PLATE_HEIGHT, BRICK_HEIGHT } from '../../lib/brick-types'

interface BrickBatch {
  key: string
  brickTypeId: string
  colorId: number
  geometry: THREE.BoxGeometry
  color: THREE.Color
  instances: PlacedBrick[]
}

function batchKey(b: PlacedBrick): string {
  return `${b.brickTypeId}_${b.colorId}_${b.width}_${b.depth}_${b.heightInPlates}`
}

function getBrickHeight(heightInPlates: number): number {
  return heightInPlates === 3 ? BRICK_HEIGHT : heightInPlates * PLATE_HEIGHT
}

export const LegoScene = observer(() => {
  const { voxelStore, editorStore, paletteStore } = useStore()

  const visibleBricks = useMemo(() => {
    if (!editorStore.isLayerMode) {
      return voxelStore.optimizedBricks
    }
    // Show bricks up to active layer
    const activeLayers = voxelStore.layers.slice(0, editorStore.activeLayer + 1)
    return activeLayers.flat()
  }, [
    voxelStore.optimizedBricks,
    voxelStore.layers,
    editorStore.isLayerMode,
    editorStore.activeLayer,
  ])

  const batches = useMemo((): BrickBatch[] => {
    const map = new Map<string, BrickBatch>()
    for (const brick of visibleBricks) {
      const key = batchKey(brick)
      if (!map.has(key)) {
        const color = LEGO_COLORS_BY_ID.get(brick.colorId)
        const h = getBrickHeight(brick.heightInPlates)
        map.set(key, {
          key,
          brickTypeId: brick.brickTypeId,
          colorId: brick.colorId,
          geometry: new THREE.BoxGeometry(
            brick.width * STUD_SIZE,
            h,
            brick.depth * STUD_SIZE
          ),
          color: new THREE.Color(color?.hex ?? '#888888'),
          instances: [],
        })
      }
      map.get(key)!.instances.push(brick)
    }
    return Array.from(map.values())
  }, [visibleBricks])

  // Cleanup geometries on unmount or when batches change
  const prevBatches = useRef<BrickBatch[]>([])
  useEffect(() => {
    return () => {
      for (const batch of prevBatches.current) batch.geometry.dispose()
    }
  }, [batches])
  useEffect(() => { prevBatches.current = batches }, [batches])

  // Build per-batch instanceId → brick lookup
  const instanceMaps = useMemo(() => {
    const maps = new Map<string, PlacedBrick[]>()
    for (const batch of batches) maps.set(batch.key, batch.instances)
    return maps
  }, [batches])

  const handleClick = (batchKey: string, instanceId: number) => {
    const instances = instanceMaps.get(batchKey)
    if (!instances) return
    const brick = instances[instanceId]
    if (!brick) return
    if (editorStore.selectedBrickId === brick.id) {
      editorStore.selectBrick(null)
    } else {
      editorStore.selectBrick(brick.id)
      voxelStore.editBrick(brick.id, paletteStore.selectedBrickType.id, paletteStore.selectedColorId)
    }
  }

  return (
    <>
      {batches.map((batch) => (
        <InstancedBatch
          key={batch.key}
          batch={batch}
          selectedBrickId={editorStore.selectedBrickId}
          onClick={(instanceId) => handleClick(batch.key, instanceId)}
        />
      ))}
    </>
  )
})

interface InstancedBatchProps {
  batch: BrickBatch
  selectedBrickId: string | null
  onClick: (instanceId: number) => void
}

function InstancedBatch({ batch, onClick }: InstancedBatchProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    for (let i = 0; i < batch.instances.length; i++) {
      const b = batch.instances[i]!
      const h = getBrickHeight(b.heightInPlates)
      dummy.position.set(
        b.x * STUD_SIZE + (b.width * STUD_SIZE) / 2,
        b.y * PLATE_HEIGHT * 3 + h / 2,
        b.z * STUD_SIZE + (b.depth * STUD_SIZE) / 2
      )
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  }, [batch.instances, dummy])

  return (
    <instancedMesh
      ref={meshRef}
      args={[batch.geometry, undefined, batch.instances.length]}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation()
        if (e.instanceId !== undefined) onClick(e.instanceId)
      }}
    >
      <meshStandardMaterial color={batch.color} />
    </instancedMesh>
  )
}
