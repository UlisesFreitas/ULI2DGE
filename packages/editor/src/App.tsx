import { useRef } from 'react';
import { Box, CssBaseline, GlobalStyles, ThemeProvider } from '@mui/material';
import DockLayout, { LayoutData } from 'rc-dock';
import { useEditorContext } from './contexts/EditorContext';
import theme from './theme';
import { SceneView } from './components/SceneView';
import { PlaceholderPanel } from './components/PlaceholderPanel';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HierarchyPanel } from './components/panels/HierarchyPanel';
import { PropertiesPanel } from './components/panels/PropertiesPanel';
import { MainMenu } from './components/MainMenu';
import { EditorToolbar } from './components/EditorToolbar';

// 1. Definir el layout por defecto de nuestros paneles.
// Esta estructura define un panel de assets a la izquierda, la escena en el centro,
// y un panel de propiedades a la derecha.
const layout: LayoutData = {
  dockbox: {
    mode: 'horizontal',
    children: [
      {
        mode: 'vertical',
        size: 250,
        children: [
          {
            tabs: [
              {
                id: 'assets',
                title: 'Assets',
                content: (
                  <ErrorBoundary>
                    <PlaceholderPanel title="Assets Panel" />
                  </ErrorBoundary>
                ),
              },
            ],
          },
          {
            tabs: [
              {
                id: 'hierarchy',
                title: 'Hierarchy',
                content: (
                  <ErrorBoundary><HierarchyPanel /></ErrorBoundary>
                ),
              },
            ],
          },
        ],
      },
      {
        mode: 'vertical',
        children: [
          {
            size: 500,
            tabs: [
              {
                id: 'scene',
                title: 'Scene View',
                content: <SceneView />,
              },
            ],
          },
          {
            size: 200,
            tabs: [
              {
                id: 'console',
                title: 'Console',
                content: <PlaceholderPanel title="Console Panel" />,
              },
            ],
          },
        ],
      },
      {
        size: 300,
        tabs: [
          {
            id: 'properties',
            title: 'Properties',
            content: (
              <ErrorBoundary>
                <PropertiesPanel />
              </ErrorBoundary>
            ),
          },
        ],
      },
    ],
  },
};

function App() {
  const dockLayoutRef = useRef<DockLayout>(null);
  const { addGameObject } = useEditorContext();

  const handleResetLayout = () => {
    dockLayoutRef.current?.loadLayout(layout);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'background.default' }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles
          styles={{
            ':root': {
              '--dock-bg': theme.palette.background.paper,
              '--dock-divider-bg': '#000000',
              '--dock-tab-bg': '#2d2d2d',
              '--dock-tab-color': theme.palette.text.secondary,
              '--dock-tab-active-bg': theme.palette.background.default,
              '--dock-tab-active-color': theme.palette.text.primary,
            '--dock-panel-color': theme.palette.text.primary,
              '--dock-border-color': '#000000',
            },
          }}
        />
        <MainMenu onResetLayout={handleResetLayout} onAddGameObject={addGameObject} />
        <EditorToolbar />
        <Box sx={{ flexGrow: 1, position: 'relative' }}>
          <DockLayout
            defaultLayout={layout}
            ref={dockLayoutRef}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              right: 0,
              bottom: 0,
            }}
          />
        </Box>
      </ThemeProvider>
    </Box>
  );
}

export default App;
