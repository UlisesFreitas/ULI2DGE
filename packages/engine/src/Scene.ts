import { Container, Ticker } from 'pixi.js';
import { GameObject } from './GameObject';

export class Scene {
  public readonly container: Container;
  public readonly backgroundContainer: Container;
  private readonly _gameObjects: Set<GameObject> = new Set();

  constructor() {
    this.container = new Container();
    this.backgroundContainer = new Container();
    // Añadimos el contenedor de fondo primero para que esté detrás de todo.
    this.container.addChild(this.backgroundContainer);
    this.container.sortableChildren = true;
  }

  public get gameObjects(): ReadonlySet<GameObject> {
    return this._gameObjects;
  }

  public addGameObject(gameObject: GameObject): void {
    this._gameObjects.add(gameObject);
    this.container.addChild(gameObject.view);
  }

  public removeGameObject(gameObject: GameObject): void {
    if (this._gameObjects.has(gameObject)) {
      this._gameObjects.delete(gameObject);
      this.container.removeChild(gameObject.view);
    }
  }

  public _update(ticker: Ticker): void {
    this._gameObjects.forEach((gameObject) => {
      gameObject._update(ticker);
    });
  }

  public _destroy(): void {
    this._gameObjects.forEach((gameObject) => gameObject._destroy());
    this.container.destroy({ children: true });
  }
}