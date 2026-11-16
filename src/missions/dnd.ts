/**
 * Pointer-based drag & drop that works with mouse AND touch
 * (HTML5 DnD does not work on mobile browsers).
 *
 * Usage: onPointerDown={(e) => startDrag(e, { payload, onDrop, onClick })}
 * Drop targets: any element with data-drop="<id>".
 */
export interface DragOptions {
  payload: string;
  onDrop: (dropId: string | null, payload: string) => void;
  onClick?: () => void;
  onStart?: () => void;
}

export function startDrag(e: React.PointerEvent<HTMLElement>, opts: DragOptions) {
  if (e.button !== 0 && e.pointerType === 'mouse') return;
  const src = e.currentTarget;
  const startX = e.clientX;
  const startY = e.clientY;
  const rect = src.getBoundingClientRect();
  const offX = startX - rect.left;
  const offY = startY - rect.top;
  let ghost: HTMLElement | null = null;
  let dragging = false;
  let hover: Element | null = null;
  e.preventDefault();

  const begin = () => {
    dragging = true;
    ghost = src.cloneNode(true) as HTMLElement;
    ghost.classList.add('drag-ghost');
    Object.assign(ghost.style, {
      position: 'fixed',
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      pointerEvents: 'none',
      zIndex: '99999',
      margin: '0',
    } as CSSStyleDeclaration);
    document.body.appendChild(ghost);
    src.classList.add('drag-source');
    opts.onStart?.();
  };

  const findDrop = (x: number, y: number) => {
    const el = document.elementFromPoint(x, y);
    return el ? el.closest('[data-drop]') : null;
  };

  const move = (ev: PointerEvent) => {
    const dx = ev.clientX - startX;
    const dy = ev.clientY - startY;
    if (!dragging && Math.hypot(dx, dy) > 6) begin();
    if (!dragging || !ghost) return;
    ghost.style.left = `${ev.clientX - offX}px`;
    ghost.style.top = `${ev.clientY - offY}px`;
    const d = findDrop(ev.clientX, ev.clientY);
    if (d !== hover) {
      hover?.classList.remove('drop-hover');
      d?.classList.add('drop-hover');
      hover = d;
    }
  };

  const up = (ev: PointerEvent) => {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
    window.removeEventListener('pointercancel', up);
    hover?.classList.remove('drop-hover');
    src.classList.remove('drag-source');
    if (!dragging) {
      opts.onClick?.();
      return;
    }
    const d = findDrop(ev.clientX, ev.clientY);
    ghost?.remove();
    opts.onDrop(d ? d.getAttribute('data-drop') : null, opts.payload);
  };

  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', up);
}

