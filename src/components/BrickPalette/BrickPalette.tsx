import { observer } from 'mobx-react-lite'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import { useStore } from '../../contexts/StoreContext'
import type { BrickType } from '../../lib/brick-types'
import type { LegoColor } from '../../lib/lego-colors'

function BrickIcon({ brick, selected, onClick }: { brick: BrickType; selected: boolean; onClick: () => void }) {
  const cellSize = 10
  const gap = 1
  const w = brick.studsX * (cellSize + gap) - gap + 4
  const d = brick.studsZ * (cellSize + gap) - gap + 4
  return (
    <Tooltip title={brick.name} arrow>
      <Box
        component="button"
        onClick={onClick}
        sx={{
          background: selected ? 'primary.main' : '#2a2a2a',
          border: selected ? '2px solid' : '2px solid transparent',
          borderColor: selected ? 'primary.main' : 'transparent',
          borderRadius: 1,
          p: 0.5,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&:hover': { borderColor: 'primary.main' },
          transition: 'border-color 0.15s',
        }}
      >
        <svg width={w} height={d} viewBox={`0 0 ${w} ${d}`}>
          {Array.from({ length: brick.studsX }, (_, xi) =>
            Array.from({ length: brick.studsZ }, (_, zi) => (
              <rect
                key={`${xi}-${zi}`}
                x={2 + xi * (cellSize + gap)}
                y={2 + zi * (cellSize + gap)}
                width={cellSize}
                height={cellSize}
                rx={2}
                fill={selected ? '#f97316' : '#555'}
                stroke={selected ? '#c2600a' : '#333'}
                strokeWidth={1}
              />
            ))
          )}
        </svg>
      </Box>
    </Tooltip>
  )
}

function ColorSwatch({ color, selected, onClick }: { color: LegoColor; selected: boolean; onClick: () => void }) {
  return (
    <Tooltip title={color.name} arrow>
      <Box
        component="button"
        onClick={onClick}
        sx={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          bgcolor: color.hex,
          border: selected ? '2px solid white' : '2px solid transparent',
          cursor: 'pointer',
          outline: selected ? '2px solid' : 'none',
          outlineColor: 'primary.main',
          outlineOffset: 1,
          transition: 'outline 0.1s',
          '&:hover': { outline: '2px solid', outlineColor: 'primary.light', outlineOffset: 1 },
        }}
      />
    </Tooltip>
  )
}

export const BrickPalette = observer(() => {
  const { paletteStore } = useStore()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Typography variant="caption" color="text.secondary" fontWeight={600} letterSpacing={1} textTransform="uppercase">
        Brick Type
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {paletteStore.brickTypes.map((brick) => (
          <BrickIcon
            key={brick.id}
            brick={brick}
            selected={paletteStore.selectedBrickType.id === brick.id}
            onClick={() => paletteStore.selectBrickType(brick)}
          />
        ))}
      </Box>

      <Typography variant="caption" color="text.secondary" fontWeight={600} letterSpacing={1} textTransform="uppercase" sx={{ mt: 1 }}>
        Color
      </Typography>
      <TextField
        size="small"
        placeholder="Search colors…"
        value={paletteStore.colorSearchText}
        onChange={(e) => paletteStore.setColorSearch(e.target.value)}
        fullWidth
      />
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxHeight: 120, overflowY: 'auto' }}>
        {paletteStore.filteredColors.map((color) => (
          <ColorSwatch
            key={color.id}
            color={color}
            selected={paletteStore.selectedColorId === color.id}
            onClick={() => paletteStore.selectColor(color.id)}
          />
        ))}
      </Box>

      {paletteStore.selectedColor && (
        <Typography variant="caption" color="text.secondary">
          Selected: {paletteStore.selectedColor.name}
        </Typography>
      )}
    </Box>
  )
})
