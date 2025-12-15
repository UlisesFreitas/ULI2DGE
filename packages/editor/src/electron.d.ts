// Importa los tipos de la API que definiremos en el preload.
import { IElectronAPI } from '../../desktop-app/src/preload';

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}

