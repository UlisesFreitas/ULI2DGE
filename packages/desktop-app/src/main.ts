import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';

// Obtenemos la URL del servidor de desarrollo de Vite de los argumentos de la línea de comandos.
const viteArg = process.argv.find((arg) =>
  arg.startsWith('--VITE_DEV_SERVER_URL')
);
const VITE_DEV_SERVER_URL = viteArg ? viteArg.split('=')[1] : undefined;

function createWindow() {
  // Crea la ventana del navegador.
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      // Usamos un script de 'preload' para exponer de forma segura APIs de Node
      // al proceso de renderizado.
      preload: path.join(__dirname, 'preload.js'),
      // Estas son configuraciones de seguridad recomendadas.
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  
  // Deshabilita el menú por defecto de Electron para usar nuestro menú personalizado de la UI.
  win.setMenu(null);

  if (VITE_DEV_SERVER_URL) {
    // Si estamos en desarrollo, cargamos la URL de Vite.
    win.loadURL(VITE_DEV_SERVER_URL);
    // Abrimos las herramientas de desarrollo automáticamente.
    win.webContents.openDevTools();
  } else {
    // En producción, cargaremos un archivo estático (lo configuraremos más adelante).
    win.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
  }
}

// Este método se llamará cuando Electron haya finalizado
// la inicialización y esté listo para crear ventanas.
app.whenReady().then(createWindow);

// Maneja la llamada desde el proceso de renderizado para cerrar la aplicación.
ipcMain.handle('app:quit', () => app.quit());

// Sal de la aplicación cuando todas las ventanas estén cerradas (excepto en macOS).
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
