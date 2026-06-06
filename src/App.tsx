import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Fab from '@mui/material/Fab'
import Badge from '@mui/material/Badge'
import MenuIcon from '@mui/icons-material/Menu'
import { Viewer3D } from './components/Viewer3D/Viewer3D'
import { PanelContent } from './components/PanelContent/PanelContent'
import { useStore } from './contexts/StoreContext'

const PANEL_WIDTH = 360

export const App = observer(() => {
  const { modelStore } = useStore()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [drawerOpen, setDrawerOpen] = useState(false)

  if (isMobile) {
    return (
      <Box sx={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', bgcolor: 'background.default' }}>
        {/* Full-screen 3D canvas */}
        <Box sx={{ width: '100%', height: '100%' }}>
          <Viewer3D />
        </Box>

        {/* FAB para abrir el panel */}
        <Badge
          color="success"
          variant="dot"
          invisible={!modelStore.hasModel}
          sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1200 }}
        >
          <Fab
            color="primary"
            onClick={() => setDrawerOpen(true)}
            sx={{ boxShadow: 4 }}
          >
            <MenuIcon />
          </Fab>
        </Badge>

        {/* Bottom drawer */}
        <Drawer
          anchor="bottom"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          PaperProps={{
            sx: {
              height: '82vh',
              borderRadius: '16px 16px 0 0',
              overflow: 'hidden',
            }
          }}
        >
          {/* Drag handle */}
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.5, pb: 0.5, flexShrink: 0 }}>
            <Box sx={{ width: 36, height: 4, borderRadius: 2, bgcolor: 'divider' }} />
          </Box>
          <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
            <PanelContent />
          </Box>
        </Drawer>
      </Box>
    )
  }

  // Desktop layout
  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
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
        <PanelContent />
      </Box>

      <Box sx={{ flexGrow: 1, position: 'relative', overflow: 'hidden' }}>
        <Viewer3D />
      </Box>
    </Box>
  )
})
