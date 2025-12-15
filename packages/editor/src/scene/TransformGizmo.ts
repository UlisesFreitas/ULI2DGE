import { GameObject } from '@uli2dge/engine';
import { Container, Graphics, FederatedPointerEvent, Point } from 'pixi.js';
import * as PIXI from 'pixi.js';

type HandleType = 'move' | 'scale-tl' | 'scale-t' | 'scale-tr' | 'scale-r' | 'scale-br' | 'scale-b' | 'scale-bl' | 'scale-l' | 'rotate';

export class TransformGizmo extends Container {
  private target: GameObject | null = null;
  private updateCallback: () => void;
  private stage: Container;

  // Elementos visuales del Gizmo
  private selectionBox: Graphics = new Graphics();
  private rotationLine: Graphics = new Graphics();
  private handles: Map<HandleType, Graphics> = new Map();

  // Propiedades para el snap-to-grid
  public snapToGrid = false;
  public gridSize = { x: 50, y: 50 };

  // Propiedades para el snap-to-grid
  private readonly PADDING = 5; // Píxeles de margen para que los selectores sean más fáciles de usar.
  private readonly ROTATION_PADDING = 20; // Margen para los selectores de rotación.
  private readonly HANDLE_SIZE = 8;

  // Estado del arrastre
  private draggingHandle: HandleType | null = null;
  private dragStartPos = new Point();
  // Almacenamos el estado completo del objeto al iniciar el arrastre
  private targetInitialTransform = {
    x: 0, y: 0, scaleX: 1, scaleY: 1, width: 0, height: 0, rotation: 0
  };

  constructor(gizmoContainer: Container, stage: Container, updateCallback: () => void) {
    super();
    this.eventMode = 'none'; // El gizmo solo debe ser interactivo cuando está visible.
    this.on('pointerdown', e => e.stopPropagation()); // para que los clics dentro de él no deseleccionen el objeto.
    this.updateCallback = updateCallback;
    this.stage = stage; // Guardamos la referencia al stage principal
    gizmoContainer.addChild(this);

    this.visible = false;
    this.setupHandles();
  }

  private setupHandles(): void {
    // 1. Cuadro de selección (es solo visual, no interactivo)
    this.addChild(this.selectionBox);
    this.addChild(this.rotationLine);

    // 2. Crear los 9 handles interactivos
    const handleTypes: { type: HandleType, cursor: string }[] = [
        { type: 'move', cursor: 'move' },
        { type: 'scale-tl', cursor: 'nwse-resize' },
        { type: 'scale-t', cursor: 'ns-resize' },
        { type: 'scale-tr', cursor: 'nesw-resize' },
        { type: 'scale-r', cursor: 'ew-resize' },
        { type: 'scale-br', cursor: 'nwse-resize' },
        { type: 'scale-b', cursor: 'ns-resize' },
        { type: 'scale-bl', cursor: 'nesw-resize' },
        { type: 'scale-l', cursor: 'ew-resize' },
        { type: 'rotate', cursor: 'grab' },
    ];

    handleTypes.forEach(({ type, cursor }) => {
        const handle = new Graphics();
        if (type === 'rotate') {
            handle.circle(0, 0, this.HANDLE_SIZE / 2).fill(0xffaa00); // Círculos naranjas para rotación
        } else {
            handle.rect(-this.HANDLE_SIZE / 2, -this.HANDLE_SIZE / 2, this.HANDLE_SIZE, this.HANDLE_SIZE)
                .fill(0x00aaff); // Cuadrados azules para escala/movimiento
        }
        handle.eventMode = 'static';
        handle.cursor = cursor;
        handle.on('pointerdown', (e) => this.onDragStart(e, type));
        this.handles.set(type, handle);
        this.addChild(handle);
    });

    // 3. Listeners globales para el arrastre y fin del arrastre
    this.stage.eventMode = 'static';
    this.stage.on('pointerup', this.onDragEnd, this);
    this.stage.on('pointerupoutside', this.onDragEnd, this);
    this.stage.on('globalpointermove', this.onDragMove, this);
  }

  private onDragStart(event: FederatedPointerEvent, type: HandleType): void {
    if (!this.target) return;
    event.stopPropagation();

    this.draggingHandle = type;
    this.dragStartPos.copyFrom(this.parent.toLocal(event.global));

    // Guardamos el estado inicial del objeto para calcular los deltas
    const bounds = this.target.view.getLocalBounds();
    this.targetInitialTransform = {
        x: this.target.x,
        y: this.target.y,
        scaleX: this.target.scaleX,
        scaleY: this.target.scaleY,
        width: bounds.width, // Ancho sin escalar
        height: bounds.height, // Alto sin escalar
        rotation: this.target.rotation,
    };
  }

  private onDragEnd(): void {
    this.draggingHandle = null;
  }

  private onDragMove(event: FederatedPointerEvent): void {
    if (!this.target || !this.draggingHandle) return;

    // toLocal() devuelve un objeto simple {x, y}, no una instancia de Point.
    // Por eso, calculamos el delta manualmente para evitar el error.
    const currentPosData = this.parent.toLocal(event.global);
    const delta = new Point(
        currentPosData.x - this.dragStartPos.x,
        currentPosData.y - this.dragStartPos.y
    );

    if (this.draggingHandle === 'move') {
        let finalX = this.targetInitialTransform.x + delta.x;
        let finalY = this.targetInitialTransform.y + delta.y;

        if (this.snapToGrid) {
            finalX = Math.round(finalX / this.gridSize.x) * this.gridSize.x;
            finalY = Math.round(finalY / this.gridSize.y) * this.gridSize.y;
        }

        this.target.x = finalX;
        this.target.y = finalY;
    } else if (this.draggingHandle === 'rotate') {
        // Lógica de rotación
        const center = this.target.position;

        const startVec = new Point(
            this.dragStartPos.x - center.x,
            this.dragStartPos.y - center.y
        );
        const currentVec = new Point(
            currentPosData.x - center.x,
            currentPosData.y - center.y
        );

        const startAngle = Math.atan2(startVec.y, startVec.x);
        const currentAngle = Math.atan2(currentVec.y, currentVec.x);
        const deltaAngle = currentAngle - startAngle;
        this.target.rotation = this.targetInitialTransform.rotation + deltaAngle;
    } else { // Lógica de escala
        // Para escalar, rotamos el vector de movimiento a las coordenadas locales del objeto
        const cos = Math.cos(-this.rotation);
        const sin = Math.sin(-this.rotation);
        const localDelta = new Point(
            delta.x * cos - delta.y * sin,
            delta.x * sin + delta.y * cos
        );

        let dx = 0, dy = 0, dw = 0, dh = 0;
        // Determinar el cambio en ancho y alto basado en el handle que se arrastra
        if (this.draggingHandle.includes('l')) { dw = -localDelta.x; dx = localDelta.x; }
        if (this.draggingHandle.includes('r')) { dw = localDelta.x; }
        if (this.draggingHandle.includes('t')) { dh = -localDelta.y; dy = localDelta.y; }
        if (this.draggingHandle.includes('b')) { dh = localDelta.y; }

        // Calculamos la nueva escala
        const initialW = this.targetInitialTransform.width * this.targetInitialTransform.scaleX;
        const initialH = this.targetInitialTransform.height * this.targetInitialTransform.scaleY;
        
        // Lógica para mantener la proporción si se presiona Shift en una esquina
        const isCornerHandle = this.draggingHandle === 'scale-tl' || this.draggingHandle === 'scale-tr' || this.draggingHandle === 'scale-br' || this.draggingHandle === 'scale-bl';

        if (event.shiftKey && isCornerHandle) {
            const aspect = initialW / initialH;
            // Usamos el delta mayor (en valor absoluto) para determinar el nuevo tamaño
            if (Math.abs(dw) > Math.abs(dh)) {
                dh = (initialW + dw) / aspect - initialH;
                if (this.draggingHandle.includes('t')) { dy = -dh; } // Actualizar dy si escalamos desde arriba
            } else {
                dw = (initialH + dh) * aspect - initialW;
                if (this.draggingHandle.includes('l')) { dx = -dw; } // Actualizar dx si escalamos desde la izquierda
            }
        }

        // Calculamos la nueva escala
        
        this.target.scaleX = (initialW + dw) / this.targetInitialTransform.width;
        this.target.scaleY = (initialH + dh) / this.targetInitialTransform.height;

        // Corregimos la posición para que el objeto parezca escalar desde el lado opuesto (el pivote)
        const pivotOffset = new Point(dx / 2, dy / 2);
        const rotatedPivotOffset = new Point(
            pivotOffset.x * cos - pivotOffset.y * -sin,
            pivotOffset.x * -sin + pivotOffset.y * cos
        );
        this.target.x = this.targetInitialTransform.x + rotatedPivotOffset.x;
        this.target.y = this.targetInitialTransform.y + rotatedPivotOffset.y;
    }

    // Actualizamos el gizmo y notificamos a React
    this.update(this.target);
    this.updateCallback();
  }

  public update(target: GameObject): void {
    this.target = target;
    this.position.copyFrom(target.position);
    this.rotation = target.rotation;
    this.eventMode = 'static';
    this.visible = true;
    this.rotationLine.visible = true;

    // El contenedor del gizmo (this) se escala junto con la escena.
    // Para que los elementos visuales del gizmo (líneas, selectores) mantengan un tamaño constante
    // en la pantalla, debemos calcular una escala inversa y aplicarla a ellos.
    this.scale.set(1);

    let inverseScale = 1;
    if (this.parent) {
      // Para obtener la escala mundial del padre, necesitamos descomponer su matriz de transformación mundial.
      const parentWorldTransform = this.parent.worldTransform;
      const parentWorldScaleX = Math.sqrt(parentWorldTransform.a * parentWorldTransform.a + parentWorldTransform.b * parentWorldTransform.b);
      if (parentWorldScaleX > 0) {
        inverseScale = 1 / parentWorldScaleX;
      }
    }

    // Actualizamos la apariencia del gizmo para que coincida con el objeto.
    // getLocalBounds() devuelve un objeto 'Bounds'. Lo convertimos a 'Rectangle'
    // para que sea compatible con los métodos que lo usan.
    const bounds = target.view.getLocalBounds();
    const rectangleBounds = new PIXI.Rectangle(bounds.x, bounds.y, bounds.width, bounds.height);
    this.updateSelectionBox(rectangleBounds, inverseScale);
    this.updateHandles(rectangleBounds, inverseScale);
  }

  private updateSelectionBox(bounds: PIXI.Rectangle, inverseScale: number): void {
    if (!this.target) return; // Añadimos un null-check para seguridad de tipos.

    const w = bounds.width * this.target.scaleX;
    const h = bounds.height * this.target.scaleY;
    // El punto de origen (pivote) del objeto desplaza su apariencia visual.
    // Debemos compensar este desplazamiento al dibujar el gizmo para que se alinee correctamente.
    const x = (bounds.x - this.target.view.pivot.x) * this.target.scaleX;
    const y = (bounds.y - this.target.view.pivot.y) * this.target.scaleY;

    // El cuadro de selección se ajusta al objeto, sin padding.
    this.selectionBox.clear()
        .rect(x, y, w, h)
        .stroke({ width: 1 * inverseScale, color: 0x00aaff, alpha: 0.8 });
  }

  private updateHandles(bounds: PIXI.Rectangle, inverseScale: number): void {
    if (!this.target) return; // Añadimos un null-check para seguridad de tipos.

    const w = bounds.width * this.target.scaleX;
    const h = bounds.height * this.target.scaleY;
    // Compensamos por el pivote para que los selectores rodeen la apariencia visual del objeto.
    const x = (bounds.x - this.target.view.pivot.x) * this.target.scaleX;
    const y = (bounds.y - this.target.view.pivot.y) * this.target.scaleY;

    // Aplicamos el padding para que los selectores queden por fuera y sean más fáciles de seleccionar.
    const p = this.PADDING * inverseScale;
    const rp = this.ROTATION_PADDING * inverseScale;

    // Dibujamos la línea que conecta el selector de escala superior con el de rotación
    const topCenterScalePos = new Point(x + w / 2, y - p);
    const rotateHandlePos = new Point(x + w / 2, y - rp);

    this.rotationLine.clear()
        .moveTo(topCenterScalePos.x, topCenterScalePos.y)
        .lineTo(rotateHandlePos.x, rotateHandlePos.y)
        .stroke({ width: 1 * inverseScale, color: 0xffaa00, alpha: 0.8 });

    const handlePositions: Record<HandleType, Point> = {
        'move':     new Point(x + w / 2, y + h / 2),
        'scale-tl': new Point(x - p, y - p),
        'scale-t':  new Point(x + w / 2, y - p),
        'scale-tr': new Point(x + w + p, y - p),
        'scale-r':  new Point(x + w + p, y + h / 2),
        'scale-br': new Point(x + w + p, y + h + p),
        'scale-b':  new Point(x + w / 2, y + h + p),
        'scale-bl': new Point(x - p, y + h + p),
        'scale-l':  new Point(x - p, y + h / 2),

        'rotate':   rotateHandlePos,
    };

    this.handles.forEach((handle, type) => {
        handle.position.copyFrom(handlePositions[type]);
        handle.scale.set(inverseScale);
    });
  }

  public hide(): void {
    this.target = null;
    this.eventMode = 'none';
    this.visible = false;
    this.rotationLine.visible = false;
  }

  public _destroy(): void {
    if (this.stage) {
      this.stage.off('pointerup', this.onDragEnd, this);
      this.stage.off('pointerupoutside', this.onDragEnd, this);
      this.stage.off('globalpointermove', this.onDragMove, this);
    }
    super.destroy({ children: true });
  }
}
