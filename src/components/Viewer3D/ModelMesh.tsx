import { useRef } from 'react'
import { observer } from 'mobx-react-lite'
import type { Mesh } from 'three'
import { useStore } from '../../contexts/StoreContext'

export const ModelMesh = observer(() => {
  const { modelStore, editorStore } = useStore()
  const meshRef = useRef<Mesh>(null)

  if (!modelStore.geometry) return null
  if (editorStore.viewMode === 'lego') return null

  const wireframe = editorStore.viewMode === 'wireframe'

  return (
    <mesh ref={meshRef} geometry={modelStore.geometry}>
      <meshStandardMaterial
        color="#888"
        wireframe={wireframe}
        vertexColors={modelStore.hasColors}
      />
    </mesh>
  )
})
