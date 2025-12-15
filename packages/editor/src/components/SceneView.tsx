import { Box } from '@mui/material';
import { useEffect, useMemo, useRef } from 'react';
import { useEditorContext } from '../contexts/EditorContext';
import { GameObject, Scene } from '@uli2dge/engine';
import { FederatedPointerEvent, Graphics } from 'pixi.js';
import { TransformGizmo } from '../scene/TransformGizmo'; // Ruta corregida

export function SceneView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    renderer,
    scene,
    selectedGameObject,
    gameObjectVersion,
    sceneVersion,
    updateSelectedGameObject,
    gizmoContainer,
    setSelectedGameObject,
    isPlaying,
    zoom,
    isRendererInitialized,
    setRendererInitialized,
    setZoom,
    pan,
    setPan,
    gridSize,
    snapToGrid,
  } = useEditorContext();

  // Usamos un ref para mantener la instancia del gizmo.
  const transformGizmoRef = useRef<TransformGizmo | null>(null);
  const gridRef = useRef<Graphics | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !renderer || !scene || !gizmoContainer) {
      return;
    }

    let isCancelled = false;
    let resizeObserver: ResizeObserver | undefined;

    const setup = async () => {
      await renderer.init({
        width: container.clientWidth,
        height: container.clientHeight,
        backgroundColor: 0x1a1a1a,
      });

      if (isCancelled) return;

      // Notificamos a React que el renderer está listo.
      setRendererInitialized(true);

      // Creamos el gizmo AQUÍ, después de que el renderer y su stage existen,
      // y le pasamos la referencia correcta al stage.
      const transformGizmo = new TransformGizmo(gizmoContainer, renderer.app.stage, updateSelectedGameObject);
      transformGizmoRef.current = transformGizmo;

      // Creamos el grid y lo añadimos al fondo de la escena
      gridRef.current = new Graphics();
      scene.backgroundContainer.addChild(gridRef.current);

      renderer.setScene(scene);
      container.appendChild(renderer.view);

      // Deselección al hacer clic en el fondo
      renderer.app.stage.eventMode = 'static';
      renderer.app.stage.on('pointerdown', () => {
        setSelectedGameObject(null);
      });

      resizeObserver = new ResizeObserver((entries) => {
        const { width, height } = entries[0].contentRect;
        renderer.resize(width, height);
      });
      resizeObserver.observe(container);
    };

    setup();

    return () => {
      isCancelled = true;
      resizeObserver?.disconnect();
      if (
        container &&
        renderer.isInitialized &&
        renderer.view.parentNode === container
      ) {
        container.removeChild(renderer.view);
      }
      // Limpiamos el gizmo usando la referencia, que es la forma segura
      // y notificamos que el renderer ya no está inicializado.
      setRendererInitialized(false);
      // de acceder a él desde la función de limpieza.
      if (transformGizmoRef.current) {
        transformGizmoRef.current._destroy();
        transformGizmoRef.current = null;
      }
      if (gridRef.current) {
        gridRef.current.destroy();
        gridRef.current = null;
      }
    };
  }, [renderer, scene, gizmoContainer, setSelectedGameObject, updateSelectedGameObject, setRendererInitialized]);

  useEffect(() => {
    const transformGizmo = transformGizmoRef.current;
    if (!transformGizmo) return;

    if (selectedGameObject && !isPlaying) {
      // Actualizamos el gizmo para que siga al objeto
      transformGizmo.update(selectedGameObject);
      gizmoContainer.visible = true;
      gizmoContainer.eventMode = 'static'; // El contenedor es interactivo para que el gizmo funcione
    } else {
      // Ocultamos el gizmo si no hay nada seleccionado o estamos en Play Mode
      transformGizmo.hide();
      gizmoContainer.visible = false; // ¡LA CLAVE! Ocultamos el contenedor para que no intercepte clics.
      gizmoContainer.eventMode = 'none'; // ¡LA CLAVE! Desactivamos la capa invisible.
    }
    // La dependencia gameObjectVersion asegura que el gizmo y el cuadro se redibujen
    // si las propiedades del objeto cambian desde el panel de propiedades.
  }, [selectedGameObject, gameObjectVersion, isPlaying, zoom, pan, gizmoContainer]);

  // Este efecto pasa el estado de la rejilla al gizmo
  useEffect(() => {
    const transformGizmo = transformGizmoRef.current;
    if (!transformGizmo) return;

    transformGizmo.gridSize = gridSize;
    transformGizmo.snapToGrid = snapToGrid;

  }, [gridSize, snapToGrid]);

  // Este efecto dibuja la rejilla de fondo
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || !isRendererInitialized || !scene) return;

    grid.clear();

    const lineThickness = 1 / zoom;
    const lineStyle = { width: lineThickness, color: 0xcccccc, alpha: 0.2 };

    // Calculamos los límites visibles del mundo para dibujar solo lo necesario
    const screenWidth = renderer.app.screen.width;
    const screenHeight = renderer.app.screen.height;

    const worldTopLeft = scene.container.toLocal({ x: 0, y: 0 });
    const worldBottomRight = scene.container.toLocal({ x: screenWidth, y: screenHeight });

    // Dibujamos las líneas verticales
    const startX = Math.floor(worldTopLeft.x / gridSize.x) * gridSize.x;
    const endX = Math.ceil(worldBottomRight.x / gridSize.x) * gridSize.x;
    for (let x = startX; x <= endX; x += gridSize.x) {
      grid.moveTo(x, worldTopLeft.y).lineTo(x, worldBottomRight.y).stroke(lineStyle);
    }

    // Dibujamos las líneas horizontales
    const startY = Math.floor(worldTopLeft.y / gridSize.y) * gridSize.y;
    const endY = Math.ceil(worldBottomRight.y / gridSize.y) * gridSize.y;
    for (let y = startY; y <= endY; y += gridSize.y) {
      grid.moveTo(worldTopLeft.x, y).lineTo(worldBottomRight.x, y).stroke(lineStyle);
    }

  }, [renderer, isRendererInitialized, scene, zoom, pan, gridSize]);

  // Este efecto aplica el zoom y pan del contexto a la escena
  useEffect(() => {
    if (!scene) return;
    scene.container.scale.set(zoom);
    scene.container.position.set(pan.x, pan.y);
  }, [scene, zoom, pan]);

  // Este efecto añade los listeners para el paneo y zoom
  useEffect(() => {
    // El error ocurre porque se accede a `renderer.view` antes de que `renderer.init()`
    // haya completado su ejecución asíncrona.
    // Para solucionarlo, primero comprobamos si el renderer está inicializado.
    if (!isRendererInitialized) {
      return;
    }
    // Ahora que sabemos que está inicializado, es seguro acceder a `renderer.view`.
    const canvas = renderer.view;

    let isPanning = false;
    let lastPanPosition = { x: 0, y: 0 };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = 0.1;
      const direction = e.deltaY < 0 ? 1 : -1;
      setZoom(prevZoom => Math.max(0.1, prevZoom + direction * zoomFactor * prevZoom));
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button === 1) { // Middle mouse button
        isPanning = true;
        lastPanPosition = { x: e.clientX, y: e.clientY };
        canvas.style.cursor = 'grabbing';
        e.preventDefault();
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (isPanning) {
        const dx = e.clientX - lastPanPosition.x;
        const dy = e.clientY - lastPanPosition.y;
        setPan(prevPan => ({
          x: prevPan.x + dx,
          y: prevPan.y + dy,
        }));
        lastPanPosition = { x: e.clientX, y: e.clientY };
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (e.button === 1) {
        isPanning = false;
        canvas.style.cursor = 'default';
      }
    };

    canvas.addEventListener('wheel', onWheel);
    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    return () => {
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    // La dependencia `renderer.view` causaba el error al ser evaluada antes de tiempo.
    // La dependencia correcta es `renderer.isInitialized`, que asegura que este efecto
    // se ejecute solo cuando el canvas esté listo.
  }, [renderer, isRendererInitialized, setPan, setZoom]);

  // Este efecto se encarga de hacer que los GameObjects sean seleccionables directamente en la escena.

  useEffect(() => {
    if (!scene) return;

    const handleSelect = (event: FederatedPointerEvent, go: GameObject) => {
      // ¡Muy importante! Detenemos la propagación para que el clic no llegue
      // al fondo del escenario y deseleccione el objeto inmediatamente.
      event.stopPropagation();
      setSelectedGameObject(go);
    };

    // Hacemos que cada GameObject sea seleccionable
    scene.gameObjects.forEach(go => {
      // Los objetos solo son interactivos si NO estamos en Play Mode.
      go.view.eventMode = isPlaying ? 'none' : 'static';
      go.view.cursor = isPlaying ? 'default' : 'pointer';
      // Limpiamos listeners anteriores para evitar duplicados al re-renderizar.
      go.view.off('pointerdown');
      if (!isPlaying) {
        go.view.on('pointerdown', (e) => handleSelect(e, go));
      }
    });

    // Esta dependencia asegura que los listeners se re-apliquen si se añaden/eliminan GameObjects.

  }, [scene, sceneVersion, setSelectedGameObject, isPlaying]);


  return (
    <Box
      ref={containerRef}
      sx={{ width: '100%', height: '100%', overflow: 'hidden' }}
    />
  );
}
