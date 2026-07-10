import { useCallback, useEffect, useMemo, useState } from "react";
import { useDragControls, type PanInfo } from "framer-motion";

interface UseBottomSheetDismissOptions {
  onClose: () => void;
  /**
   * Si es `false`, ni el clic-fuera ni el drag-down cierran el sheet. Útil
   * mientras hay un request en curso que no queremos interrumpir.
   */
  canDismiss?: boolean;
  /**
   * Habilita drag-to-close. Por defecto, sólo en viewports angostos
   * (`max-width: 767px`), porque normalmente los sheets se centran en
   * desktop. Si el sheet está anclado a la parte inferior incluso en
   * desktop, pasa `true` para habilitar siempre.
   */
  dragEnabled?: boolean | "mobile";
  /**
   * Media query que define "mobile" para este sheet. Por defecto coincide
   * con el breakpoint `md` de Tailwind (767px hacia abajo). Sheets que usan
   * `sm:items-center` deberían pasar `"(max-width: 639px)"` para que el
   * drag se desactive a partir de `sm`, cuando el sheet pasa a estar
   * centrado.
   */
  mobileMediaQuery?: string;
}

const DRAG_DISMISS_OFFSET = 100;
const DRAG_DISMISS_VELOCITY = 500;
const DEFAULT_MOBILE_MEDIA_QUERY = "(max-width: 767px)";

/**
 * Hook compartido por todos los bottom sheets para implementar dos gestos de
 * cierre con la misma física y umbrales:
 *  - Tap en el backdrop.
 *  - Drag hacia abajo desde el handle (la pildora superior), con cierre al
 *    superar el umbral de offset o velocidad.
 *
 * Devuelve props listas para esparcir sobre el backdrop, el `motion.div` del
 * sheet y el contenedor del handle.
 */
export function useBottomSheetDismiss({
  onClose,
  canDismiss = true,
  dragEnabled = "mobile",
  mobileMediaQuery = DEFAULT_MOBILE_MEDIA_QUERY,
}: UseBottomSheetDismissOptions) {
  const [isMobile, setIsMobile] = useState(false);
  const dragControls = useDragControls();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(mobileMediaQuery);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [mobileMediaQuery]);

  const dragActive =
    canDismiss && (dragEnabled === "mobile" ? isMobile : dragEnabled);

  const handleDragEnd = useCallback(
    (_: PointerEvent, info: PanInfo) => {
      if (!canDismiss) return;
      if (
        info.offset.y > DRAG_DISMISS_OFFSET ||
        info.velocity.y > DRAG_DISMISS_VELOCITY
      ) {
        onClose();
      }
    },
    [canDismiss, onClose],
  );

  const sheetMotionProps = useMemo(
    () => ({
      drag: dragActive ? ("y" as const) : (false as const),
      dragListener: false,
      dragControls,
      dragConstraints: { top: 0, bottom: 0 },
      dragElastic: { top: 0, bottom: 0.5 },
      dragMomentum: false,
      onDragEnd: handleDragEnd,
    }),
    [dragActive, dragControls, handleDragEnd],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (dragActive) dragControls.start(e);
    },
    [dragActive, dragControls],
  );

  const handleProps = useMemo(
    () => ({
      onPointerDown: handlePointerDown,
      style: dragActive
        ? ({ touchAction: "none", cursor: "grab" } as const)
        : undefined,
    }),
    [handlePointerDown, dragActive],
  );

  const backdropProps = useMemo(
    () => ({
      onClick: canDismiss ? onClose : undefined,
    }),
    [canDismiss, onClose],
  );

  return {
    isMobile,
    sheetMotionProps,
    handleProps,
    backdropProps,
  };
}
