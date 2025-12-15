import { Application, Ticker } from 'pixi.js';
import { Scene } from './Scene';

export interface RendererOptions {
  width?: number;
  height?: number;
  backgroundColor?: number;
}

export class Renderer {
  public readonly app: Application;
  private _isInitialized = false;
  private _initPromise: Promise<void> | null = null;
  private _currentScene: Scene | null = null;
  private _isPlaying = false; // Por defecto, el motor está pausado.

  constructor() {
    this.app = new Application();
  }

  public async init(options: RendererOptions = {}): Promise<void> {
    // Si la inicialización ya está en progreso o completada, devolvemos la promesa existente.
    if (this._initPromise) {
      return this._initPromise;
    }

    // Creamos y guardamos la promesa de inicialización para que las llamadas concurrentes la esperen.
    this._initPromise = (async () => {
      const {
        width = 800,
        height = 600,
        backgroundColor = 0x1099bb,
      } = options;

      await this.app.init({
        width,
        height,
        backgroundColor,
        antialias: true,
      });

      this._isInitialized = true;
      // Inicia el bucle de juego para que el ticker comience a ejecutarse.
      this.app.ticker.add(this.update.bind(this));
      this.app.start();
    })();

    return this._initPromise;
  }

  public get isInitialized(): boolean {
    return this._isInitialized;
  }

  public get view(): HTMLCanvasElement {
    return this.app.canvas;
  }

  private update(ticker: Ticker): void {
    if (this._isPlaying) {
      this._currentScene?._update(ticker);
    }
  }

  public destroy(): void {
    if (this._isInitialized) {
      // Primero, destruimos la escena actual para limpiar los GameObjects.
      this._currentScene?._destroy();
      this._currentScene = null;

      // app.destroy() también detiene el ticker.
      this.app.destroy(true, true);
      this._isInitialized = false;
      this._initPromise = null;
    }
  }

  public setScene(newScene: Scene): void {
    if (this._currentScene) {
      this.app.stage.removeChild(this._currentScene.container);
      // No destruimos la escena anterior. El renderer solo gestiona qué escena está activa,
      // no es el propietario de las escenas. Quien crea la escena es responsable de destruirla.
    }

    this._currentScene = newScene;
    this.app.stage.addChild(this._currentScene.container);
  }

  public resize(width: number, height: number): void {
    if (this._isInitialized) {
      this.app.renderer.resize(width, height);
    }
  }

  public setPlaying(isPlaying: boolean): void {
    this._isPlaying = isPlaying;
  }
}