import { Container, Point, Ticker } from 'pixi.js';

let nextId = 0;

export abstract class GameObject {
  public view: Container;
  public readonly id: number;
  public name: string;
  private _anchor: Point = new Point(0, 0); // Default to top-left

  constructor() {
    // La vista debe ser asignada por una subclase en su método _create.
    // La inicializamos con un objeto vacío para satisfacer la inicialización estricta de TypeScript.
    this.view = new Container();
    this._create();
    this.id = nextId++;
    this.name = `${this.constructor.name}_${this.id}`;
  }

  // Posición
  public get x(): number {
    return this.view.x;
  }
  public set x(value: number) {
    this.view.x = value;
  }

  public get y(): number {
    return this.view.y;
  }
  public set y(value: number) {
    this.view.y = value;
  }

  public get position(): Point {
    return this.view.position;
  }

  // Rotación (en radianes)
  public get rotation(): number {
    return this.view.rotation;
  }
  public set rotation(value: number) {
    this.view.rotation = value;
  }

  public get scaleX(): number {
    return this.view.scale.x;
  }

  public set scaleX(value: number) {
    this.view.scale.x = value;
  }

  public get scaleY(): number {
    return this.view.scale.y;
  }

  public set scaleY(value: number) {
    this.view.scale.y = value;
  }

  public get anchorX(): number {
    return this._anchor.x;
  }

  public set anchorX(value: number) {
    this.setAnchor(value, this._anchor.y);
  }

  public get anchorY(): number {
    return this._anchor.y;
  }

  public set anchorY(value: number) {
    this.setAnchor(this._anchor.x, value);
  }

  /**
   * Sets the anchor point of the object.
   * @param x The normalized x position of the anchor (0 = left, 0.5 = center, 1 = right).
   * @param y The normalized y position of the anchor (0 = top, 0.5 = center, 1 = bottom).
   */
  public setAnchor(x: number, y: number): void {
    if (this._anchor.x === x && this._anchor.y === y) {
      return;
    }

    const bounds = this.view.getLocalBounds();
    const width = bounds.width;
    const height = bounds.height;

    const oldPivotX = this._anchor.x * width;
    const oldPivotY = this._anchor.y * height;

    this._anchor.set(x, y);

    const newPivotX = this._anchor.x * width;
    const newPivotY = this._anchor.y * height;

    this.view.pivot.set(newPivotX, newPivotY);

    const dx = (newPivotX - oldPivotX) * this.scaleX;
    const dy = (newPivotY - oldPivotY) * this.scaleY;

    const cos = Math.cos(this.rotation);
    const sin = Math.sin(this.rotation);

    this.x += dx * cos - dy * sin;
    this.y += dx * sin + dy * cos;
  }
  
  // Métodos de ciclo de vida para que las subclases los sobreescriban
  protected _create(): void {
    // A ser implementado por las subclases
  }

  public _update(_ticker: Ticker): void {
    // A ser implementado por las subclases
  }

  public _destroy(): void {
    // A ser implementado por las subclases
    // Al ser un Container, podemos destruir a sus hijos también.
    this.view.destroy({ children: true });
  }
}