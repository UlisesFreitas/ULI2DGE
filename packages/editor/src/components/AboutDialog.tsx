import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

interface AboutDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AboutDialog({ open, onClose }: AboutDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>About Uli2dGE</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Uli2dGE (Ulises 2D Game Engine)
          <br />
          A custom game engine and editor built with TypeScript, React, and Pixi.js.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}