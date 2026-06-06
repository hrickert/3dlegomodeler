import { observer } from 'mobx-react-lite'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepButton from '@mui/material/StepButton'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import { useStore } from '../../contexts/StoreContext'
import { useCallback } from 'react'

export const Instructions = observer(() => {
  const { instructionStore, editorStore, voxelStore } = useStore()

  const handleToggleLayerMode = useCallback(() => {
    editorStore.toggleLayerMode()
    if (!editorStore.isLayerMode) {
      editorStore.setActiveLayer(instructionStore.currentStep)
    }
  }, [editorStore, instructionStore])

  const handleStepChange = (step: number) => {
    instructionStore.goToStep(step)
    editorStore.setActiveLayer(instructionStore.steps[step]?.layerIndex ?? 0)
  }

  const handlePrev = () => {
    instructionStore.prevStep()
    const step = instructionStore.currentStepData
    if (step) editorStore.setActiveLayer(step.layerIndex)
  }

  const handleNext = () => {
    instructionStore.nextStep()
    const step = instructionStore.currentStepData
    if (step) editorStore.setActiveLayer(step.layerIndex)
  }

  const handleExportPdf = async () => {
    const { generateInstructionsPdf } = await import('../../utils/pdf-generator')
    await generateInstructionsPdf(instructionStore, editorStore)
  }

  if (voxelStore.totalBrickCount === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.disabled">
          Convert a model to LEGO to generate instructions.
        </Typography>
      </Box>
    )
  }

  const step = instructionStore.currentStepData
  const maxVisible = 8

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2, gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">Instructions</Typography>
        <Button
          size="small"
          variant={editorStore.isLayerMode ? 'contained' : 'outlined'}
          onClick={handleToggleLayerMode}
        >
          {editorStore.isLayerMode ? 'Exit Step Mode' : 'Step Mode'}
        </Button>
      </Box>

      {editorStore.isLayerMode && step && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={handlePrev} disabled={instructionStore.currentStep === 0}>
              <NavigateBeforeIcon />
            </IconButton>
            <Box sx={{ flexGrow: 1, textAlign: 'center' }}>
              <Typography variant="subtitle1" fontWeight={600}>
                Step {step.stepNumber} / {instructionStore.totalSteps}
              </Typography>
              <Typography variant="caption" color="text.secondary">{step.description}</Typography>
            </Box>
            <IconButton onClick={handleNext} disabled={instructionStore.currentStep === instructionStore.totalSteps - 1}>
              <NavigateNextIcon />
            </IconButton>
          </Box>

          <Stepper
            nonLinear
            activeStep={instructionStore.currentStep}
            alternativeLabel
            sx={{ overflowX: 'auto', flexWrap: 'nowrap' }}
          >
            {instructionStore.steps.slice(0, maxVisible).map((_, i) => (
              <Step key={i} completed={i < instructionStore.currentStep}>
                <StepButton onClick={() => handleStepChange(i)}>
                  <Typography variant="caption">{i + 1}</Typography>
                </StepButton>
              </Step>
            ))}
            {instructionStore.totalSteps > maxVisible && (
              <Step>
                <Typography variant="caption" color="text.disabled" sx={{ px: 1 }}>
                  +{instructionStore.totalSteps - maxVisible} more
                </Typography>
              </Step>
            )}
          </Stepper>

          <Box>
            <Typography variant="caption" color="text.secondary">
              New pieces this step: <strong>{step.newBricks.length}</strong>
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Total so far: <strong>{step.cumulativeBricks.length}</strong>
            </Typography>
          </Box>
        </>
      )}

      {instructionStore.isGeneratingPdf && (
        <Box>
          <LinearProgress variant="determinate" value={instructionStore.pdfProgress} />
          <Typography variant="caption" color="text.secondary">
            Generating PDF… {instructionStore.pdfProgress}%
          </Typography>
        </Box>
      )}

      <Button
        variant="outlined"
        startIcon={<PictureAsPdfIcon />}
        onClick={handleExportPdf}
        disabled={instructionStore.isGeneratingPdf}
        fullWidth
      >
        Export PDF
      </Button>
    </Box>
  )
})
