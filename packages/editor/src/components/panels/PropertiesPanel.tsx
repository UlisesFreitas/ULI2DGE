import { GameObject } from '@uli2dge/engine';
import { Box, Divider, Stack, TextField, Typography } from '@mui/material';
import { useEditorContext } from '../../contexts/EditorContext';
import { OriginSelector } from '../OriginSelector';

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

function NumberInput({ label, value, onChange }: NumberInputProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = parseFloat(event.target.value);
    if (!isNaN(numValue)) {
      onChange(numValue);
    }
  };

  return (
    <TextField
      label={label}
      type="number"
      value={value}
      onChange={handleChange}
      size="small"
      fullWidth
      inputProps={{
        step: 0.1,
        style: {
          // Mejora la apariencia del input numérico
          MozAppearance: 'textfield',
        },
      }}
      sx={{
        '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button':
          {
            WebkitAppearance: 'none',
            margin: 0,
          },
      }}
    />
  );
}

export function PropertiesPanel() {
  const { selectedGameObject, updateSelectedGameObject, gameObjectVersion } =
    useEditorContext();

  if (!selectedGameObject) {
    return (
      <Box p={2}>
        <Typography>No object selected</Typography>
      </Box>
    );
  }

  const createHandler = (prop: keyof GameObject) => (value: number) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (selectedGameObject as any)[prop] = value;
    updateSelectedGameObject();
  };

  const handleRotationChange = (degrees: number) => {
    if (selectedGameObject) {
      // Convertimos los grados de la UI a los radianes que usa el motor
      selectedGameObject.rotation = degrees * (Math.PI / 180);
      updateSelectedGameObject();
    }
  };

  const handleOriginChange = (x: number, y: number) => {
    if (selectedGameObject) {
      // Usamos el método setAnchor que ya existe en el GameObject
      selectedGameObject.setAnchor(x, y);
      updateSelectedGameObject();
    }
  };

  return (
    <Box p={2} key={`${selectedGameObject.id}-${gameObjectVersion}`}>
      <Typography variant="h6" gutterBottom>
        Transform
      </Typography>
      <Stack spacing={2}>
        <Stack direction="row" spacing={1}>
          <NumberInput label="X" value={selectedGameObject.x} onChange={createHandler('x')} />
          <NumberInput label="Y" value={selectedGameObject.y} onChange={createHandler('y')} />
        </Stack>
        <NumberInput
          label="Rotation"
          value={parseFloat(
            (selectedGameObject.rotation * (180 / Math.PI)).toFixed(2)
          )}
          onChange={handleRotationChange}
        />
        <Stack direction="row" spacing={1}>
          <NumberInput label="Scale X" value={selectedGameObject.scaleX} onChange={createHandler('scaleX')} />
          <NumberInput label="Scale Y" value={selectedGameObject.scaleY} onChange={createHandler('scaleY')} />
        </Stack>
        <Divider sx={{ pt: 1 }} />
        <Typography variant="overline">Origin</Typography>
        <OriginSelector
          anchorX={selectedGameObject.anchorX}
          anchorY={selectedGameObject.anchorY}
          onChange={handleOriginChange}
        />
      </Stack>
    </Box>
  );
}