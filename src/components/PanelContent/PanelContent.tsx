import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Divider from '@mui/material/Divider'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Tooltip from '@mui/material/Tooltip'
import ViewInArIcon from '@mui/icons-material/ViewInAr'
import GridOnIcon from '@mui/icons-material/GridOn'
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt'
import { FileImport } from '../FileImport/FileImport'
import { ScaleControls } from '../ScaleControls/ScaleControls'
import { BrickPalette } from '../BrickPalette/BrickPalette'
import { BOMPanel } from '../BOMPanel/BOMPanel'
import { Instructions } from '../Instructions/Instructions'
import { useStore } from '../../contexts/StoreContext'
import type { ViewMode } from '../../stores/editor-store'

export const PanelContent = observer(() => {
  const { editorStore, voxelStore } = useStore()
  const [tab, setTab] = useState(0)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
        <Typography variant="h6" fontWeight={700} color="primary">
          🧱 LEGO 3D Modeler
        </Typography>
        <Typography variant="caption" color="text.disabled">
          STL / OBJ → LEGO bricks
        </Typography>
      </Box>

      {/* View mode toggle */}
      <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ flexGrow: 1 }}>View</Typography>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={editorStore.viewMode}
          onChange={(_, v: ViewMode) => v && editorStore.setViewMode(v)}
        >
          <Tooltip title="Solid mesh">
            <ToggleButton value="solid"><ViewInArIcon fontSize="small" /></ToggleButton>
          </Tooltip>
          <Tooltip title="Wireframe">
            <ToggleButton value="wireframe"><GridOnIcon fontSize="small" /></ToggleButton>
          </Tooltip>
          <Tooltip title="LEGO bricks">
            <span>
              <ToggleButton value="lego" disabled={voxelStore.totalBrickCount === 0}>
                <ViewQuiltIcon fontSize="small" />
              </ToggleButton>
            </span>
          </Tooltip>
        </ToggleButtonGroup>
      </Box>

      <Divider sx={{ flexShrink: 0 }} />

      {/* Import + Scale */}
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
        <FileImport />
        <ScaleControls />
      </Box>

      <Divider sx={{ flexShrink: 0 }} />

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="fullWidth"
        sx={{ borderBottom: '1px solid', borderColor: 'divider', minHeight: 40, flexShrink: 0 }}
        TabIndicatorProps={{ style: { backgroundColor: '#f97316' } }}
      >
        <Tab label="Palette" sx={{ minHeight: 40, fontSize: '0.75rem' }} />
        <Tab label="BOM" sx={{ minHeight: 40, fontSize: '0.75rem' }} />
        <Tab label="Steps" sx={{ minHeight: 40, fontSize: '0.75rem' }} />
      </Tabs>

      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {tab === 0 && <Box sx={{ p: 2 }}><BrickPalette /></Box>}
        {tab === 1 && <BOMPanel />}
        {tab === 2 && <Instructions />}
      </Box>
    </Box>
  )
})
