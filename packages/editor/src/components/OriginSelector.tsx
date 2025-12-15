import { Grid, ToggleButton, Tooltip } from '@mui/material';
import {
  CenterFocusStrong,
  East,
  North,
  NorthEast,
  NorthWest,
  South,
  SouthEast,
  SouthWest,
  West,
} from '@mui/icons-material';
import { useMemo } from 'react';

type Origin = 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

const origins: { name: Origin; x: number; y: number; icon: JSX.Element }[] = [
  { name: 'top-left', x: 0, y: 0, icon: <NorthWest fontSize="small" /> },
  { name: 'top-center', x: 0.5, y: 0, icon: <North fontSize="small" /> },
  { name: 'top-right', x: 1, y: 0, icon: <NorthEast fontSize="small" /> },
  { name: 'center-left', x: 0, y: 0.5, icon: <West fontSize="small" /> },
  { name: 'center', x: 0.5, y: 0.5, icon: <CenterFocusStrong fontSize="small" /> },
  { name: 'center-right', x: 1, y: 0.5, icon: <East fontSize="small" /> },
  { name: 'bottom-left', x: 0, y: 1, icon: <SouthWest fontSize="small" /> },
  { name: 'bottom-center', x: 0.5, y: 1, icon: <South fontSize="small" /> },
  { name: 'bottom-right', x: 1, y: 1, icon: <SouthEast fontSize="small" /> },
];

interface OriginSelectorProps {
  anchorX: number;
  anchorY: number;
  onChange: (x: number, y: number) => void;
}

export function OriginSelector({ anchorX, anchorY, onChange }: OriginSelectorProps) {
  const selectedOrigin = useMemo(() => {
    // Find the closest origin to handle potential floating point inaccuracies
    let closest: Origin = 'center';
    let minDistance = Infinity;

    for (const origin of origins) {
      const distance = Math.sqrt(Math.pow(anchorX - origin.x, 2) + Math.pow(anchorY - origin.y, 2));
      if (distance < minDistance) {
        minDistance = distance;
        closest = origin.name;
      }
    }
    return closest;
  }, [anchorX, anchorY]);

  const handleChange = (origin: (typeof origins)[number]) => {
    onChange(origin.x, origin.y);
  };

  return (
    <Grid container spacing={0.5} sx={{ width: 92, height: 92 }}>
      {origins.map(origin => (
        <Grid item xs={4} key={origin.name}>
          <Tooltip title={origin.name} placement="top">
            <ToggleButton selected={selectedOrigin === origin.name} value={origin.name} aria-label={origin.name} sx={{ p: 0.5, width: '100%', height: '100%' }} onClick={() => handleChange(origin)}>
              {origin.icon}
            </ToggleButton>
          </Tooltip>
        </Grid>
      ))}
    </Grid>
  );
}