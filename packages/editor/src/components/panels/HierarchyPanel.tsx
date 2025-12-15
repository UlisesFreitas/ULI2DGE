import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Box,
} from '@mui/material';
import { useEditorContext } from '../../contexts/EditorContext';

export function HierarchyPanel() {
  // Consumimos sceneVersion para que el panel se re-renderice cuando cambie.
  const {
    scene,
    sceneVersion,
    selectedGameObject,
    setSelectedGameObject,
  } = useEditorContext();

  if (!scene) {
    return <Typography p={2}>No active scene.</Typography>;
  }

  // La dependencia implícita de `sceneVersion` del contexto fuerza la re-renderización.
  const gameObjects = Array.from(scene.gameObjects);

  return (
    <Box>
      <List dense>
        {gameObjects.map((go) => (
          <ListItem key={go.id} disablePadding>
            <ListItemButton
              selected={selectedGameObject?.id === go.id}
              onClick={() => setSelectedGameObject(go)}
            >
              <ListItemText primary={go.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}