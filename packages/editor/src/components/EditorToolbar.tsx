import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Divider,
  TextField,
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  GridOn,
  GridOff,
  Remove,
  Add,
} from '@mui/icons-material';
import { useEditorContext } from '../contexts/EditorContext';

export function EditorToolbar() {
  const {
    isPlaying,
    togglePlay,
    zoom,
    setZoom,
    gridSize,
    setGridSize,
    snapToGrid,
    setSnapToGrid,
  } = useEditorContext();

  const handleZoomIn = () => {
    setZoom(prev => prev * 1.2);
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(0.1, prev / 1.2));
  };

  const handleGridSizeChange = (axis: 'x' | 'y', value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0) {
      setGridSize(prev => ({ ...prev, [axis]: numValue }));
    }
  };

  return (
    <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Toolbar variant="dense">
        <IconButton color="inherit" onClick={togglePlay} title={isPlaying ? 'Stop' : 'Play'}>
          {isPlaying ? <Stop /> : <PlayArrow />}
        </IconButton>

        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        <IconButton color="inherit" onClick={handleZoomOut} title="Zoom Out">
          <Remove />
        </IconButton>
        <Typography variant="body2" sx={{ width: '50px', textAlign: 'center', cursor: 'pointer' }} title="Reset Zoom" onClick={() => setZoom(1)}>
          {`${Math.round(zoom * 100)}%`}
        </Typography>
        <IconButton color="inherit" onClick={handleZoomIn} title="Zoom In">
          <Add />
        </IconButton>

        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        <Typography variant="body2" sx={{ mr: 1, color: 'text.secondary' }}>
          Grid:
        </Typography>
        <TextField
          label="X"
          type="number"
          size="small"
          variant="outlined"
          value={gridSize.x}
          onChange={(e) => handleGridSizeChange('x', e.target.value)}
          sx={{ width: '5em', mr: 1 }}
          inputProps={{ min: 1, style: { textAlign: 'center' } }}
        />
        <TextField
          label="Y"
          type="number"
          size="small"
          variant="outlined"
          value={gridSize.y}
          onChange={(e) => handleGridSizeChange('y', e.target.value)}
          sx={{ width: '5em', mr: 1 }}
          inputProps={{ min: 1, style: { textAlign: 'center' } }}
        />
        <IconButton
          color="inherit"
          onClick={() => setSnapToGrid(s => !s)}
          title="Snap to Grid"
        >
          {snapToGrid ? <GridOn sx={{ color: 'primary.main' }} /> : <GridOff />}
        </IconButton>

        <Box sx={{ flexGrow: 1 }} />
      </Toolbar>
    </AppBar>
  );
}