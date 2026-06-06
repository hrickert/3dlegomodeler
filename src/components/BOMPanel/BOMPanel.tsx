import { observer } from 'mobx-react-lite'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import DownloadIcon from '@mui/icons-material/Download'
import { useStore } from '../../contexts/StoreContext'
import { generateBricklinkXml, generateCsv, downloadFile } from '../../utils/bricklink-xml'
import { LEGO_COLORS_BY_ID } from '../../lib/lego-colors'

export const BOMPanel = observer(() => {
  const { bomStore } = useStore()

  if (bomStore.totalPieces === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.disabled">
          Convert a model to LEGO to see the bill of materials.
        </Typography>
      </Box>
    )
  }

  const handleExportXml = () => {
    const xml = generateBricklinkXml(bomStore.items)
    downloadFile(xml, 'lego-model-wanted-list.xml', 'text/xml')
  }

  const handleExportCsv = () => {
    const csv = generateCsv(bomStore.items)
    downloadFile(csv, 'lego-model-bom.csv', 'text/csv')
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom>Bill of Materials</Typography>
        <Typography variant="body2" color="text.secondary">
          {bomStore.totalPieces.toLocaleString()} pieces — Est. ${bomStore.estimatedTotalCost.toFixed(2)} USD
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <Button size="small" variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportXml}>
            BrickLink XML
          </Button>
          <Button size="small" variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportCsv}>
            CSV
          </Button>
        </Stack>
      </Box>

      <TableContainer sx={{ flexGrow: 1, overflow: 'auto' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Color</TableCell>
              <TableCell>Part</TableCell>
              <TableCell align="right">Qty</TableCell>
              <TableCell align="right">Unit</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bomStore.items.map((item, i) => {
              const color = LEGO_COLORS_BY_ID.get(item.colorId)
              return (
                <TableRow key={i} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: color?.hex ?? '#888', flexShrink: 0 }} />
                      <Typography variant="caption" noWrap sx={{ maxWidth: 80 }}>{item.colorName}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">{item.brickName}</Typography>
                    <Typography variant="caption" color="text.disabled" display="block">
                      #{item.bricklinkPartId}
                    </Typography>
                  </TableCell>
                  <TableCell align="right"><Typography variant="caption">{item.quantity}</Typography></TableCell>
                  <TableCell align="right"><Typography variant="caption">${item.unitPriceUsd.toFixed(2)}</Typography></TableCell>
                  <TableCell align="right"><Typography variant="caption">${(item.unitPriceUsd * item.quantity).toFixed(2)}</Typography></TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
})
