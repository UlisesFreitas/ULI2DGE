import { GameObject, Renderer, Scene } from '@uli2dge/engine';
import { Container, FederatedPointerEvent, Graphics, Ticker } from 'pixi.js';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

// Clase de demostración para tener algo que mostrar en la escena.
class Square extends GameObject {
  protected _create(): void {
    const graphics = new Graphics().rect(0, 0, 100, 100).fill(0xde3249);
    this.view = graphics;
  }

  public _update(ticker: Ticker): void {
    this.rotation += 0.01 * ticker.deltaTime;
  }
}

// Define un tipo para el estado que guardaremos de cada GameObject.
type GameObjectTransform = {
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  anchorX: number;
  anchorY: number;
};

type GridSize = { x: number; y: number };

interface EditorContextState {
  renderer: Renderer;
  scene: Scene;
  gizmoContainer: Container;
  // Un contador que se incrementa para forzar actualizaciones en los consumidores del contexto.
  sceneVersion: number;
  gameObjectVersion: number;
  addGameObject: (type: 'Square') => void;
  selectedGameObject: GameObject | null;
  setSelectedGameObject: (go: GameObject | null) => void;
  updateSelectedGameObject: () => void;
  isPlaying: boolean;
  togglePlay: () => void;
  isRendererInitialized: boolean;
  setRendererInitialized: (isInitialized: boolean) => void;
  zoom: number;
  setZoom: (zoom: number | ((prevZoom: number) => number)) => void;
  pan: { x: number; y: number };
  setPan: (pan: { x: number; y: number } | ((prevPan: { x: number; y: number }) => { x: number; y: number })) => void;
  gridSize: GridSize;
  setGridSize: (size: GridSize | ((prevSize: GridSize) => GridSize)) => void;
  snapToGrid: boolean;
  setSnapToGrid: (snap: boolean | ((prevSnap: boolean) => boolean)) => void;
}

const EditorContext = createContext<EditorContextState | undefined>(undefined);

interface EditorProviderProps {
  children: ReactNode;
}

export function EditorProvider({ children }: EditorProviderProps) {
  const [sceneVersion, setSceneVersion] = useState(0);
  const [gameObjectVersion, setGameObjectVersion] = useState(0);
  const [selectedGameObject, setSelectedGameObject] =
    useState<GameObject | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [editModeTransforms, setEditModeTransforms] = useState<Map<
    number,
    GameObjectTransform
  > | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [gridSize, setGridSize] = useState<GridSize>({ x: 50, y: 50 });
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [isRendererInitialized, setRendererInitialized] = useState(false);

  // El renderer y la escena principal se crean una sola vez.
  const { renderer, scene, gizmoContainer } = useMemo(() => {
    const renderer = new Renderer();
    const scene = new Scene();
    const gizmoContainer = new Container();
    gizmoContainer.zIndex = 1; // Asegura que el gizmo se renderice por encima de los GameObjects (que tienen zIndex 0 por defecto)
    scene.container.addChild(gizmoContainer);
    return { renderer, scene, gizmoContainer };
  }, []);

  const addGameObject = useCallback(
    (type: 'Square') => {
      if (type === 'Square') {
        const newSquare = new Square();
        newSquare.x = 100 + Math.random() * 400;
        newSquare.y = 100 + Math.random() * 300;
        scene.addGameObject(newSquare);
        // Forzamos la actualización de los componentes que dependen de la escena
        setSceneVersion((v) => v + 1);
      }
    },
    [scene]
  );

  // Esta función simplemente incrementa la versión para notificar a los componentes
  // que las propiedades del objeto seleccionado han cambiado.
  const updateSelectedGameObject = useCallback(() => {
    setGameObjectVersion((v) => v + 1);
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((prevIsPlaying) => {
      const nextIsPlaying = !prevIsPlaying;

      if (nextIsPlaying) {
        // --- Entrando en Play Mode ---
        // 1. Deseleccionamos cualquier objeto para ocultar el gizmo.
        setSelectedGameObject(null);

        // 2. Guardamos el estado actual de las transformaciones de todos los objetos.
        const transformsToSave = new Map<number, GameObjectTransform>();
        scene.gameObjects.forEach((go) => {
          transformsToSave.set(go.id, {
            x: go.x,
            y: go.y,
            rotation: go.rotation,
            scaleX: go.scaleX,
            scaleY: go.scaleY,
            anchorX: go.anchorX,
            anchorY: go.anchorY,
          });
        });
        setEditModeTransforms(transformsToSave);
      } else {
        // --- Saliendo de Play Mode ---
        // 1. Restauramos el estado guardado.
        if (editModeTransforms) {
          scene.gameObjects.forEach((go) => {
            const savedTransform = editModeTransforms.get(go.id);
            if (savedTransform) {
              // Restaurar manualmente para evitar efectos secundarios de los setters.
              // Específicamente, `setAnchor` modifica la posición, por lo que debemos
              // establecer el ancla primero y luego sobrescribir la posición con el valor guardado.
              go.anchorX = savedTransform.anchorX;
              go.anchorY = savedTransform.anchorY;
              go.x = savedTransform.x;
              go.y = savedTransform.y;
              go.rotation = savedTransform.rotation;
              go.scaleX = savedTransform.scaleX;
              go.scaleY = savedTransform.scaleY;
            }
          });
          updateSelectedGameObject(); // Notificamos a la UI que la escena ha cambiado.
        }
      }

      return nextIsPlaying;
    });
  }, [scene, editModeTransforms, updateSelectedGameObject]);

  // Efecto para sincronizar el estado de React con el Renderer del motor.
  useEffect(() => {
    renderer.setPlaying(isPlaying);
  }, [isPlaying, renderer]);

  // Añadimos el objeto inicial usando nuestra función para asegurar que es interactivo.
  useEffect(() => {
    addGameObject('Square');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Se ejecuta solo una vez al montar.

  const value = {
    renderer,
    scene,
    gizmoContainer,
    sceneVersion,
    gameObjectVersion,
    addGameObject,
    selectedGameObject,
    setSelectedGameObject,
    updateSelectedGameObject,
    isPlaying,
    togglePlay,
    isRendererInitialized,
    setRendererInitialized,
    zoom,
    setZoom,
    pan,
    setPan,
    gridSize,
    setGridSize,
    snapToGrid,
    setSnapToGrid,
  };

  return (
    <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
  );
}

export function useEditorContext(): EditorContextState {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditorContext must be used within an EditorProvider');
  }
  return context;
}