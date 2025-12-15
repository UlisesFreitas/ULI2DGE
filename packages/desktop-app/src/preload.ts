import { contextBridge, ipcRenderer } from 'electron';


// Define la forma de nuestra API para que el editor la conozca y pueda
// usarla de forma segura con TypeScript.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IElectronAPI {
  // Aquí añadiremos las funciones que comunican con el proceso principal, por ejemplo:
  // getAppVersion: () => Promise<string>;
  closeApp: () => Promise<void>,
}

// La implementación real de la API que se expone.
// Al tiparla con la interfaz, TypeScript nos obligará a que coincidan.
const electronAPI: IElectronAPI = {
    closeApp: () => ipcRenderer.invoke('app:quit'),
};

// Exponer la API de forma segura al proceso de renderizado bajo `window.electronAPI`
// Exponemos un objeto 'electronAPI' al objeto 'window' del renderizador.
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

