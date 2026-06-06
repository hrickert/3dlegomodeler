import { observer } from 'mobx-react-lite'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Slider from '@mui/material/Slider'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import { useStore } from '../../contexts/StoreContext'

export const ScaleControls = observer(() => {
  const { modelStore, voxelStore, editorStore } = useStore()

  const canVoxelize = modelStore.hasModel && !voxelStore.isProcessing

  const handleVoxelize = () => {
    voxelStore.runVoxelization(modelStore).then(() => {
      editorStore.setMaxLayer(voxelStore.layers.length - 1)
      editorStore.setViewMode('lego')
    })
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box>
        <Typography variant="caption" color="text.secondary" gutterBottom display="block">
          Resolution — {modelStore.resolution} studs
        </Typography>
        <Slider
          min={8} max={128} step={4}
          value={modelStore.resolution}
          onChange={(_, v) => modelStore.setResolution(v as number)}
          disabled={!modelStore.hasModel}
          size="small"
        />
        {modelStore.hasModel && (
          <Typography variant="caption" color="text.disabled">
            ~{modelStore.estimatedVoxelCount.toLocaleString()} voxels
          </Typography>
        )}
      </Box>

      <Box>
        <Typography variant="caption" color="text.secondary" gutterBottom display="block">
          Scale multiplier
        </Typography>
        <TextField
          size="small"
          type="number"
          value={modelStore.scaleMultiplier}
          onChange={(e) => modelStore.setScaleMultiplier(parseFloat(e.target.value) || 1)}
          inputProps={{ min: 0.1, max: 10, step: 0.1 }}
          disabled={!modelStore.hasModel}
          fullWidth
        />
      </Box>

      {voxelStore.isProcessing && (
        <Box>
          <LinearProgress variant="determinate" value={voxelStore.progress} />
          <Typography variant="caption" color="text.secondary">
            Voxelizing… {voxelStore.progress}%
          </Typography>
        </Box>
      )}

      {voxelStore.errorMessage && (
        <Typography variant="caption" color="error">
          {voxelStore.errorMessage}
        </Typography>
      )}

      <Button
        variant="contained"
        fullWidth
        disabled={!canVoxelize}
        onClick={handleVoxelize}
      >
        {voxelStore.isProcessing ? 'Processing…' : 'Convert to LEGO'}
      </Button>

      {voxelStore.totalBrickCount > 0 && (
        <Typography variant="caption" color="text.secondary" textAlign="center">
          {voxelStore.totalBrickCount.toLocaleString()} bricks
        </Typography>
      )}
    </Box>
  )
})
