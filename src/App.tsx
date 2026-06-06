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
import { Viewer3D } from './components/Viewer3D/Viewer3D'
import { FileImport } from './components/FileImport/FileImport'
import { ScaleControls } from './components/ScaleControls/ScaleControls'
import { BrickPalette } from './components/BrickPalette/BrickPalette'
import { BOMPanel } from './components/BOMPanel/BOMPanel'
import { Instructions } from './components/Instructions/Instructions'
import { useStore } from './contexts/StoreContext'
import type { ViewMode } from './stores/editor-store'

const PANEL_WIDTH = 360

export const App = observer(() => {
  const { editorStore, voxelStore } = useStore()
  const [tab, setTab] = useState(0)

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: PANEL_WIDTH,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" fontWeight={700} color="primary">
            🧱 LEGO 3D Modeler
          </Typography>
          <Typography variant="caption" color="text.disabled">
            STL / OBJ → LEGO bricks
          </Typography>
        </Box>

        {/* View mode toggle */}
        <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
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

        <Divider />

        {/* Import + Scale */}
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FileImport />
          <ScaleControls />
        </Box>

        <Divider />

        {/* Tabs: Palette / BOM / Instructions */}
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="fullWidth"
          sx={{ borderBottom: '1px solid', borderColor: 'divider', minHeight: 40 }}
          TabIndicatorProps={{ style: { backgroundColor: '#f97316' } }}
        >
          <Tab label="Palette" sx={{ minHeight: 40, fontSize: '0.75rem' }} />
          <Tab label="BOM" sx={{ minHeight: 40, fontSize: '0.75rem' }} />
          <Tab label="Steps" sx={{ minHeight: 40, fontSize: '0.75rem' }} />
        </Tabs>

        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          {tab === 0 && (
            <Box sx={{ p: 2 }}>
              <BrickPalette />
            </Box>
          )}
          {tab === 1 && <BOMPanel />}
          {tab === 2 && <Instructions />}
        </Box>
      </Box>

      {/* 3D Viewport */}
      <Box sx={{ flexGrow: 1, position: 'relative', overflow: 'hidden' }}>
        <Viewer3D />
      </Box>
    </Box>
  )
})
