import { useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'
import IconButton from '@mui/material/IconButton'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import CloseIcon from '@mui/icons-material/Close'
import { useStore } from '../../contexts/StoreContext'

export const FileImport = observer(() => {
  const { modelStore } = useStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = (file: File) => {
    modelStore.loadFile(file)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  return (
    <Box>
      <Box
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        sx={{
          border: '2px dashed',
          borderColor: dragOver ? 'primary.main' : 'divider',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'border-color 0.2s',
          '&:hover': { borderColor: 'primary.main' },
          bgcolor: dragOver ? 'action.hover' : 'transparent',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".stl,.obj"
          style={{ display: 'none' }}
          onChange={onInputChange}
        />
        <CloudUploadIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
        <Typography variant="body2" color="text.secondary">
          Drop .STL or .OBJ here
        </Typography>
        <Typography variant="caption" color="text.disabled">
          or click to browse
        </Typography>
      </Box>

      {modelStore.isLoading && (
        <Box sx={{ mt: 1 }}>
          <LinearProgress />
          <Typography variant="caption" color="text.secondary">Loading model…</Typography>
        </Box>
      )}

      {modelStore.errorMessage && (
        <Alert severity="error" sx={{ mt: 1 }} onClose={() => modelStore.clear()}>
          {modelStore.errorMessage}
        </Alert>
      )}

      {modelStore.hasModel && !modelStore.isLoading && (
        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" color="success.main" sx={{ flexGrow: 1 }}>
            {modelStore.file?.name}
          </Typography>
          <IconButton size="small" onClick={() => modelStore.clear()}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
    </Box>
  )
})
