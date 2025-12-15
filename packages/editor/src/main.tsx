/**
 * Uli2dGE Editor
 *
 * @package @uli2dge/editor
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'rc-dock/dist/rc-dock.css';
import './dock-overrides.css';
import { EditorProvider } from './contexts/EditorContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <EditorProvider>
      <App />
    </EditorProvider>
  </React.StrictMode>
);
