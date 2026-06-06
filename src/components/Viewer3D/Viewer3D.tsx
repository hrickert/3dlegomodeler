import { Suspense, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, GizmoHelper, GizmoViewport, Grid } from '@react-three/drei'
import { observer } from 'mobx-react-lite'
import Box from '@mui/material/Box'
import { ModelMesh } from './ModelMesh'
import { LegoScene } from './LegoScene'
import { useStore } from '../../contexts/StoreContext'

function CameraRig() {
  const { camera } = useThree()
  const { modelStore } = useStore()
  const initialized = useRef(false)

  if (!initialized.current && modelStore.boundingBox) {
    const size = modelStore.boundingBox.max.clone().sub(modelStore.boundingBox.min)
    const maxDim = Math.max(size.x, size.y, size.z)
    camera.position.set(maxDim * 1.5, maxDim, maxDim * 1.5)
    camera.lookAt(0, 0, 0)
    initialized.current = true
  }
  return null
}

export const Viewer3D = observer(() => {
  const { modelStore } = useStore()

  return (
    <Box sx={{ width: '100%', height: '100%', bgcolor: '#0d0d0f' }}>
      <Canvas
        camera={{ position: [5, 5, 5], fov: 50, near: 0.01, far: 10000 }}
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        shadows
      >
        <color attach="background" args={['#0d0d0f']} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow />
        <directionalLight position={[-10, -5, -10]} intensity={0.3} />

        <OrbitControls makeDefault enableDamping dampingFactor={0.05} />

        <Suspense fallback={null}>
          {modelStore.hasModel && <CameraRig />}
          <ModelMesh />
          <LegoScene />
        </Suspense>

        <Grid
          args={[50, 50]}
          cellSize={0.8}
          cellThickness={0.4}
          cellColor="#2a2a2a"
          sectionSize={8}
          sectionThickness={1}
          sectionColor="#3a3a3a"
          fadeDistance={80}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid
        />

        <GizmoHelper alignment="bottom-right" margin={[60, 60]}>
          <GizmoViewport axisColors={['#e74c3c', '#2ecc71', '#3498db']} labelColor="white" />
        </GizmoHelper>
      </Canvas>

      {!modelStore.hasModel && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
            color: 'text.disabled',
          }}
        >
        </Box>
      )}
    </Box>
  )
})
