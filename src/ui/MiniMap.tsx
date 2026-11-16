import { useEffect, useRef } from 'react';
import { MISSIONS, ROOMS } from '../data/missions';
import { MAP_H, MAP_W, TILE } from '../game/mapData';
import { playerLive } from '../game/EventBus';
import { useGame } from '../state/store';
import { Icon } from './Icon';

export default function MiniMap({ onClick }: { onClick?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const completed = useGame((s) => s.progress.completed);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d')!;
    let raf = 0;
    const scale = 4;
    cvs.width = MAP_W * scale;
    cvs.height = MAP_H * scale;

    const render = (t: number) => {
      ctx.fillStyle = '#071024';
      ctx.fillRect(0, 0, cvs.width, cvs.height);

      // corridor
      const cor = ROOMS.find((r) => r.id === 'corridor')!.bounds;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(cor.x * scale, cor.y * scale, cor.w * scale, cor.h * scale);

      // rooms
      for (const r of ROOMS) {
        if (r.id === 'corridor') continue;
        const b = r.bounds;
        const done = r.missionId ? !!completed[r.missionId] : false;
        ctx.fillStyle = done ? '#064e3b' : '#112240';
        ctx.fillRect(b.x * scale, b.y * scale, b.w * scale, b.h * scale);
        ctx.strokeStyle = done ? '#22c55e' : r.color;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(b.x * scale + 0.5, b.y * scale + 0.5, b.w * scale - 1, b.h * scale - 1);
      }

      // mission dots
      const pulse = (Math.sin(t / 220) + 1) / 2;
      for (const m of MISSIONS) {
        const done = !!completed[m.id];
        const mx = (m.stationTile.x + 0.5) * scale;
        const my = (m.stationTile.y + 0.5) * scale;
        if (!done) {
          ctx.beginPath();
          ctx.arc(mx, my, 3 + pulse * 3, 0, Math.PI * 2);
          ctx.strokeStyle = m.color;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(mx, my, 2.8, 0, Math.PI * 2);
        ctx.fillStyle = done ? '#22c55e' : '#facc15';
        ctx.fill();
      }

      // player dot
      const px = (playerLive.x / TILE) * scale;
      const py = (playerLive.y / TILE) * scale;
      ctx.beginPath();
      ctx.arc(px, py, 4.2, 0, Math.PI * 2);
      ctx.fillStyle = '#22d3ee';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [completed]);

  return (
    <button className="minimap-card" onClick={onClick} title="Klik untuk melihat Peta Gedung & Daftar Misi">
      <div className="minimap-header">
        <span className="row center-v gap"><Icon name="map" size={13} color="#22d3ee" /> MINI MAP</span>
        <small>Perbesar</small>
      </div>
      <canvas ref={canvasRef} className="minimap-canvas" />
      <div className="minimap-legend">
        <span><i className="dot-you" /> Kamu</span>
        <span><i className="dot-todo" /> Misi Aktif</span>
        <span><i className="dot-done" /> Selesai</span>
      </div>
    </button>
  );
}

