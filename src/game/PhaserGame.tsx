import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { MainScene } from './scenes/MainScene';

export default function PhaserGame() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: ref.current,
      backgroundColor: '#050b18',
      scale: { mode: Phaser.Scale.RESIZE, width: '100%', height: '100%' },
      physics: { default: 'arcade', arcade: { debug: false } },
      render: { antialias: true, roundPixels: false },
      input: { keyboard: true, touch: true },
      scene: [MainScene],
      banner: false,
    });
    return () => {
      game.destroy(true);
    };
  }, []);

  return <div ref={ref} className="phaser-root" />;
}

