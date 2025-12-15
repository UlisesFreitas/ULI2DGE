import React, { useState, ReactElement } from 'react';
import { AboutDialog } from './AboutDialog';
import {
  AppBar,
  Toolbar,
  Button,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';

interface MenuButtonProps {
  label: string;
  children: React.ReactNode;
}

function MenuButton({ label, children }: MenuButtonProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button color="inherit" onClick={handleClick}>
        {label}
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {/*
          Envolvemos el onClick de cada hijo para que, además de ejecutar
          su propia acción, también cierre el menú.
        */}
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) {
            return child;
          }
          const originalOnClick = child.props.onClick;

          const newOnClick = (event: React.MouseEvent<HTMLElement>) => {
            if (originalOnClick) {
              originalOnClick(event);
            }
            handleClose(); // Siempre cerramos el menú después de un clic.
          };
          return React.cloneElement(child as ReactElement<any>, { onClick: newOnClick });
        })}
      </Menu>
    </>
  );
}

interface MainMenuProps {
  onResetLayout: () => void;
  onAddGameObject: (type: 'Square') => void;
}

export function MainMenu({ onResetLayout, onAddGameObject }: MainMenuProps) {
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <>
      <AppBar position="static" elevation={1} sx={{ backgroundColor: 'background.paper' }}>
        <Toolbar variant="dense">
          <MenuButton label="File">
            <MenuItem onClick={() => console.log('Action: New Project')}>
              New Project
            </MenuItem>
            <MenuItem onClick={() => console.log('Action: Open Project')}>
              Open Project
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => console.log('Action: Save Project')}>
              Save Project
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => window.electronAPI.closeApp()}>
              Exit
            </MenuItem>
          </MenuButton>
          <MenuButton label="Edit">
            <MenuItem disabled>Undo</MenuItem>
            <MenuItem disabled>Redo</MenuItem>
          </MenuButton>
          <MenuButton label="GameObject">
            <MenuItem onClick={() => onAddGameObject('Square')}>
              Create Square
            </MenuItem>
          </MenuButton>
          <MenuButton label="View">
            <MenuItem onClick={onResetLayout}>Reset Layout</MenuItem>
          </MenuButton>
          <MenuButton label="Help">
            <MenuItem onClick={() => setAboutOpen(true)}>About</MenuItem>
          </MenuButton>
        </Toolbar>
      </AppBar>
      <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </>
  );
}