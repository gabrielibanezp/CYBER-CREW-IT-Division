import { useRef, useState } from 'react';
import { EventBus, virtualInput } from '../game/EventBus';
import { useGame } from '../state/store';

export default function MobileControls() {
  const nearby = useGame((s) => s.nearby);
  const showJoystick = useGame((s) => s.settings.showJoystick);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const baseRef = useRef<HTMLDivElement>(null);

  if (showJoystick === 'off') return null;

  const maxR = 42;

  const handleDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = baseRef.current;
    if (!el) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const update = (clientX: number, clientY: number) => {
      let dx = clientX - cx;
      let dy = clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist > maxR) {
        dx = (dx / dist) * maxR;
        dy = (dy / dist) * maxR;
      }
      setKnob({ x: dx, y: dy });
      virtualInput.x = dx / maxR;
      virtualInput.y = dy / maxR;
    };

    update(e.clientX, e.clientY);

    const onMove = (ev: PointerEvent) => update(ev.clientX, ev.clientY);
    const onUp = () => {
      setKnob({ x: 0, y: 0 });
      virtualInput.x = 0;
      virtualInput.y = 0;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  };

  return (
    <div className={`mobile-controls mode-${showJoystick}`}>
      <div ref={baseRef} className="joy-base" onPointerDown={handleDown}>
        <div className="joy-arrows">
          <span className="ja-up">▲</span>
          <span className="ja-down">▼</span>
          <span className="ja-left">◀</span>
          <span className="ja-right">▶</span>
        </div>
        <div
          className="joy-knob"
          style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }}
        />
      </div>

      <button
        className={`mobile-action-btn ${nearby ? 'ready' : ''}`}
        disabled={!nearby}
        onClick={() => EventBus.emit('interact-request')}
      >
        <span className="mab-key">E</span>
        <span className="mab-label">{nearby ? 'INTERAKSI' : 'DEKATI OBJEK'}</span>
      </button>
    </div>
  );
}

