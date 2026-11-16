import Phaser from 'phaser';
import { Furniture, TILE } from './mapData';

/* ------------------------------------------------------------------ */
/*  Character textures (procedurally drawn, original design)          */
/* ------------------------------------------------------------------ */

export type Dir = 'down' | 'up' | 'side';

const SKIN = 0xf2c6a0;
const HAIR = 0x2b1d14;
const PANTS = 0x1e3a8a;
const SHOE = 0x0f172a;

function drawCharacter(g: Phaser.GameObjects.Graphics, dir: Dir, frame: number, shirt: number, opts: { headset?: boolean; cap?: number } = {}) {
  const cx = 24;
  const step = frame === 1 ? 1 : frame === 3 ? -1 : 0;
  const bob = frame === 1 || frame === 3 ? -1.5 : 0;

  // shadow
  g.fillStyle(0x000000, 0.28);
  g.fillEllipse(cx, 60, 30, 9);

  // legs
  if (dir === 'side') {
    g.fillStyle(PANTS, 1);
    g.fillRoundedRect(cx - 6 + step * 4, 44, 7, 12, 3);
    g.fillRoundedRect(cx - 1 - step * 4, 44, 7, 12, 3);
    g.fillStyle(SHOE, 1);
    g.fillRoundedRect(cx - 7 + step * 4, 54, 10, 5, 2);
    g.fillRoundedRect(cx - 2 - step * 4, 54, 10, 5, 2);
  } else {
    g.fillStyle(PANTS, 1);
    g.fillRoundedRect(cx - 9, 44 - (step > 0 ? 2 : 0), 7, 12, 3);
    g.fillRoundedRect(cx + 2, 44 - (step < 0 ? 2 : 0), 7, 12, 3);
    g.fillStyle(SHOE, 1);
    g.fillRoundedRect(cx - 10, 54 - (step > 0 ? 2 : 0), 9, 5, 2);
    g.fillRoundedRect(cx + 1, 54 - (step < 0 ? 2 : 0), 9, 5, 2);
  }

  const by = bob;
  // arms (behind body for side)
  const armSwing = step * 3;
  g.fillStyle(shirt, 1);
  if (dir === 'side') {
    g.fillRoundedRect(cx - 3 - armSwing, 29 + by, 7, 14, 3);
  } else {
    g.fillRoundedRect(cx - 17, 29 + by + armSwing * 0.5, 6, 14, 3);
    g.fillRoundedRect(cx + 11, 29 + by - armSwing * 0.5, 6, 14, 3);
    g.fillStyle(SKIN, 1);
    g.fillCircle(cx - 14, 44 + by + armSwing * 0.5, 3);
    g.fillCircle(cx + 14, 44 + by - armSwing * 0.5, 3);
  }

  // torso
  g.fillStyle(shirt, 1);
  g.fillRoundedRect(cx - 12, 26 + by, 24, 21, 8);
  // darker side shading
  g.fillStyle(0x000000, 0.12);
  g.fillRoundedRect(cx + 4, 28 + by, 8, 18, 6);
  // belt
  g.fillStyle(0x0f172a, 1);
  g.fillRect(cx - 12, 42 + by, 24, 4);
  g.fillStyle(0xfacc15, 1);
  if (dir !== 'up') g.fillRect(cx - 2, 42 + by, 4, 4);

  if (dir === 'down') {
    // collar + id badge
    g.fillStyle(0xffffff, 0.9);
    g.fillTriangle(cx - 5, 26 + by, cx, 31 + by, cx + 5, 26 + by);
    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(cx + 3, 32 + by, 6, 8, 1);
    g.fillStyle(0x22d3ee, 1);
    g.fillRect(cx + 4, 33 + by, 4, 2);
  }
  if (dir === 'up') {
    // tool bag strap
    g.fillStyle(0x0f172a, 0.7);
    g.lineStyle(3, 0x0f172a, 0.7);
    g.lineBetween(cx - 10, 28 + by, cx + 9, 42 + by);
  }
  if (dir === 'side') {
    g.fillStyle(shirt, 1);
    g.fillRoundedRect(cx - 2 + armSwing, 29 + by, 7, 14, 3);
    g.fillStyle(SKIN, 1);
    g.fillCircle(cx + 1.5 + armSwing, 44 + by, 3);
  }

  // head
  const hy = 16 + by;
  g.fillStyle(SKIN, 1);
  g.fillCircle(cx, hy, 11);
  g.fillStyle(HAIR, 1);
  if (dir === 'down') {
    g.slice(cx, hy, 11.5, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(360), false);
    g.fillPath();
    g.fillCircle(cx - 6, hy - 3, 5);
    g.fillCircle(cx + 5, hy - 4, 5);
    // eyes
    g.fillStyle(0x111827, 1);
    g.fillCircle(cx - 4, hy + 2, 1.8);
    g.fillCircle(cx + 4, hy + 2, 1.8);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(cx - 3.4, hy + 1.4, 0.6);
    g.fillCircle(cx + 4.6, hy + 1.4, 0.6);
    // blush & smile
    g.fillStyle(0xf87171, 0.35);
    g.fillCircle(cx - 7, hy + 5, 2);
    g.fillCircle(cx + 7, hy + 5, 2);
    g.lineStyle(1.5, 0x7c2d12, 1);
    g.beginPath();
    g.arc(cx, hy + 4.5, 3, Phaser.Math.DegToRad(20), Phaser.Math.DegToRad(160));
    g.strokePath();
  } else if (dir === 'up') {
    g.fillCircle(cx, hy - 1, 11.5);
  } else {
    g.slice(cx, hy, 11.5, Phaser.Math.DegToRad(150), Phaser.Math.DegToRad(380), false);
    g.fillPath();
    g.fillCircle(cx - 5, hy - 2, 6.5);
    g.fillStyle(0x111827, 1);
    g.fillCircle(cx + 6, hy + 2, 1.8);
    g.fillStyle(SKIN, 1);
    g.fillCircle(cx + 11, hy + 4, 2);
  }

  if (opts.cap !== undefined) {
    g.fillStyle(opts.cap, 1);
    g.slice(cx, hy - 1, 12, Phaser.Math.DegToRad(190), Phaser.Math.DegToRad(350), false);
    g.fillPath();
  }

  if (opts.headset) {
    g.lineStyle(3, 0x1f2937, 1);
    g.beginPath();
    g.arc(cx, hy, 12.5, Phaser.Math.DegToRad(dir === 'side' ? 200 : 190), Phaser.Math.DegToRad(dir === 'side' ? 330 : 350));
    g.strokePath();
    g.fillStyle(0x22d3ee, 1);
    if (dir === 'side') {
      g.fillRoundedRect(cx - 4, hy - 4, 7, 9, 3);
      g.lineStyle(2, 0x1f2937, 1);
      g.lineBetween(cx + 2, hy + 4, cx + 9, hy + 8);
      g.fillStyle(0x1f2937, 1);
      g.fillCircle(cx + 9, hy + 8, 1.8);
    } else {
      g.fillRoundedRect(cx - 14, hy - 4, 5, 9, 2);
      g.fillRoundedRect(cx + 9, hy - 4, 5, 9, 2);
      if (dir === 'down') {
        g.lineStyle(2, 0x1f2937, 1);
        g.lineBetween(cx - 11, hy + 5, cx - 5, hy + 9);
        g.fillStyle(0x1f2937, 1);
        g.fillCircle(cx - 5, hy + 9, 1.8);
      }
    }
  }
}

export function generateCharacterTextures(scene: Phaser.Scene) {
  const dirs: Dir[] = ['down', 'up', 'side'];
  const make = (key: string, shirt: number, opts: { headset?: boolean; cap?: number }) => {
    for (const d of dirs) {
      for (let f = 0; f < 4; f++) {
        const g = scene.make.graphics({ x: 0, y: 0 }, false);
        drawCharacter(g, d, f, shirt, opts);
        g.generateTexture(`${key}_${d}_${f}`, 48, 64);
        g.destroy();
      }
    }
  };
  make('tech', 0x06b6d4, { headset: true });
  for (const c of [0xf97316, 0x84cc16, 0xec4899, 0x14b8a6]) make(`npc_${c.toString(16)}`, c, { cap: undefined });

  // Animations
  for (const key of ['tech']) {
    for (const d of dirs) {
      scene.anims.create({
        key: `${key}_walk_${d}`,
        frames: [0, 1, 2, 3].map((f) => ({ key: `${key}_${d}_${f}` })),
        frameRate: 9,
        repeat: -1,
      });
    }
  }

  // glow / particle helpers
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(0xffffff, 1);
  g.fillCircle(4, 4, 4);
  g.generateTexture('dot', 8, 8);
  g.clear();
  for (let r = 32; r > 0; r -= 2) {
    g.fillStyle(0xffffff, 0.04);
    g.fillCircle(32, 32, r);
  }
  g.generateTexture('glow', 64, 64);
  g.destroy();
}

/* ------------------------------------------------------------------ */
/*  Furniture                                                          */
/* ------------------------------------------------------------------ */

export interface FurnitureArt {
  container: Phaser.GameObjects.Container;
  leds: Phaser.GameObjects.Rectangle[];
  screens: Phaser.GameObjects.Rectangle[];
  alert?: Phaser.GameObjects.Rectangle;
}

function box(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, top: number, front: number, d = 10, r = 6) {
  g.fillStyle(0x000000, 0.25);
  g.fillRoundedRect(x + 3, y + 6, w, h, r);
  g.fillStyle(front, 1);
  g.fillRoundedRect(x, y, w, h, r);
  g.fillStyle(top, 1);
  g.fillRoundedRect(x, y, w, h - d, r);
  g.fillStyle(0xffffff, 0.08);
  g.fillRoundedRect(x + 3, y + 2, w - 6, 3, 2);
}

function monitor(scene: Phaser.Scene, c: Phaser.GameObjects.Container, g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, screenColor: number, screens: Phaser.GameObjects.Rectangle[]) {
  g.fillStyle(0x1f2937, 1);
  g.fillRect(x + w / 2 - 3, y + h, 6, 6);
  g.fillRoundedRect(x + w / 2 - 9, y + h + 4, 18, 4, 2);
  g.fillStyle(0x0b1220, 1);
  g.fillRoundedRect(x, y, w, h, 3);
  const s = scene.add.rectangle(x + 2, y + 2, w - 4, h - 4, screenColor, 1).setOrigin(0, 0);
  c.add(s);
  screens.push(s);
  return s;
}

function addLed(scene: Phaser.Scene, c: Phaser.GameObjects.Container, leds: Phaser.GameObjects.Rectangle[], x: number, y: number, color: number, size = 3) {
  const l = scene.add.rectangle(x, y, size, size, color).setOrigin(0, 0);
  c.add(l);
  leds.push(l);
  return l;
}

function chair(g: Phaser.GameObjects.Graphics, x: number, y: number, color = 0x334155) {
  g.fillStyle(0x000000, 0.25);
  g.fillEllipse(x + 2, y + 4, 26, 14);
  g.fillStyle(color, 1);
  g.fillRoundedRect(x - 11, y - 9, 22, 18, 7);
  g.fillStyle(0x0f172a, 1);
  g.fillRoundedRect(x - 10, y + 5, 20, 6, 3);
}

export function drawFurniture(scene: Phaser.Scene, f: Furniture): FurnitureArt {
  const T = TILE;
  const X = f.x * T;
  const Y = f.y * T;
  const W = f.w * T;
  const H = f.h * T;
  const c = scene.add.container(0, 0);
  const g = scene.add.graphics();
  c.add(g);
  const leds: Phaser.GameObjects.Rectangle[] = [];
  const screens: Phaser.GameObjects.Rectangle[] = [];
  let alert: Phaser.GameObjects.Rectangle | undefined;

  switch (f.type) {
    case 'desk_pc':
    case 'desk_dual':
    case 'software_desk': {
      const vertical = f.h > f.w;
      box(g, X, Y, W, H, 0xcbd5e1, 0x94a3b8, 10);
      if (vertical) {
        monitor(scene, c, g, X + 8, Y + 10, W - 20, 30, 0x38bdf8, screens);
        monitor(scene, c, g, X + 8, Y + H / 2 + 4, W - 20, 30, 0x22d3ee, screens);
        chair(g, X - 14, Y + H / 2);
      } else {
        const n = f.type === 'desk_dual' ? 2 : Math.max(1, Math.floor(f.w));
        const seg = W / n;
        for (let i = 0; i < n; i++) {
          const sx = X + seg * i + seg / 2;
          const col = f.type === 'software_desk' ? (i % 2 ? 0x2563eb : 0x10b981) : i % 2 ? 0x22d3ee : 0x38bdf8;
          monitor(scene, c, g, sx - 20, Y + 4, 40, 24, col, screens);
          g.fillStyle(0x334155, 1);
          g.fillRoundedRect(sx - 16, Y + H - 22, 32, 8, 2);
          g.fillStyle(0x64748b, 1);
          for (let k = 0; k < 6; k++) g.fillRect(sx - 14 + k * 5, Y + H - 20, 4, 4);
          chair(g, sx, Y + H + 14, f.type === 'software_desk' ? 0x065f46 : 0x1e3a8a);
        }
      }
      break;
    }
    case 'crimp_table': {
      box(g, X, Y, W, H, 0x0e7490, 0x155e75, 12);
      g.fillStyle(0x164e63, 1);
      g.fillRoundedRect(X + 8, Y + 6, W - 16, H - 24, 6);
      // cable coil
      const colors = [0xffffff, 0xf97316, 0x22c55e, 0x3b82f6, 0x92400e];
      colors.forEach((col, i) => {
        g.lineStyle(3, col, 1);
        g.strokeCircle(X + 30, Y + 22, 14 - i * 2);
      });
      // RJ45 connectors
      for (let i = 0; i < 3; i++) {
        g.fillStyle(0xe0f2fe, 0.9);
        g.fillRoundedRect(X + 60 + i * 14, Y + 14, 10, 14, 2);
        g.fillStyle(0xfacc15, 1);
        g.fillRect(X + 61 + i * 14, Y + 15, 8, 3);
      }
      // crimp tool
      g.fillStyle(0xef4444, 1);
      g.fillRoundedRect(X + W - 46, Y + 12, 30, 7, 3);
      g.fillRoundedRect(X + W - 46, Y + 23, 30, 7, 3);
      g.fillStyle(0x94a3b8, 1);
      g.fillRect(X + W - 22, Y + 14, 12, 14);
      break;
    }
    case 'net_rack':
    case 'server_rack':
    case 'main_rack': {
      const main = f.type === 'main_rack';
      box(g, X, Y, W, H, main ? 0x312e81 : 0x1e293b, main ? 0x1e1b4b : 0x0f172a, 8, 4);
      g.fillStyle(0x020617, 1);
      g.fillRoundedRect(X + 5, Y + 4, W - 10, H - 16, 3);
      const rows = Math.max(3, Math.floor((H - 18) / 9));
      for (let r = 0; r < rows; r++) {
        const ry = Y + 7 + r * 9;
        g.fillStyle(0x334155, 1);
        g.fillRect(X + 8, ry, W - 16, 6);
        const ledCount = Math.max(2, Math.floor((W - 20) / 7));
        for (let k = 0; k < ledCount; k++) {
          const col = f.type === 'net_rack' ? (k % 3 === 0 ? 0xfacc15 : 0x22c55e) : k % 4 === 0 ? 0x38bdf8 : 0x22c55e;
          addLed(scene, c, leds, X + 10 + k * 7, ry + 1.5, col, 3);
        }
      }
      if (main) {
        alert = scene.add.rectangle(X + W / 2, Y - 4, W - 12, 5, 0xef4444).setOrigin(0.5, 0.5);
        c.add(alert);
        g.fillStyle(0x0f172a, 1);
        g.fillRoundedRect(X - 16, Y + H - 4, W + 32, 18, 4);
        monitor(scene, c, g, X + W / 2 - 18, Y + H - 2, 36, 12, 0xa78bfa, screens);
      }
      break;
    }
    case 'cable_spool': {
      g.fillStyle(0x000000, 0.25);
      g.fillCircle(X + W / 2 + 2, Y + H / 2 + 4, W / 2);
      g.fillStyle(0x78350f, 1);
      g.fillCircle(X + W / 2, Y + H / 2, W / 2);
      g.fillStyle(0x2563eb, 1);
      g.fillCircle(X + W / 2, Y + H / 2, W / 2 - 5);
      g.lineStyle(1, 0x93c5fd, 0.7);
      for (let r = W / 2 - 7; r > 6; r -= 3) g.strokeCircle(X + W / 2, Y + H / 2, r);
      g.fillStyle(0xd6d3d1, 1);
      g.fillCircle(X + W / 2, Y + H / 2, 5);
      break;
    }
    case 'whiteboard': {
      g.fillStyle(0xe2e8f0, 1);
      g.fillRoundedRect(X, Y, W, H, 4);
      g.fillStyle(0xffffff, 1);
      g.fillRoundedRect(X + 4, Y + 4, W - 8, H - 8, 3);
      g.lineStyle(2, 0x2563eb, 1);
      g.strokeRect(X + 14, Y + 12, 18, 12);
      g.strokeRect(X + W - 34, Y + 12, 18, 12);
      g.lineBetween(X + 32, Y + 18, X + W - 34, Y + 18);
      g.lineStyle(2, 0xef4444, 1);
      g.lineBetween(X + W / 2 - 14, Y + 26, X + W / 2 + 14, Y + 26);
      break;
    }
    case 'plant': {
      g.fillStyle(0x000000, 0.25);
      g.fillEllipse(X + W / 2 + 2, Y + H - 2, W, 10);
      g.fillStyle(0xf8fafc, 1);
      g.fillRoundedRect(X + 6, Y + H / 2, W - 12, H / 2, 4);
      g.fillStyle(0x16a34a, 1);
      g.fillCircle(X + W / 2, Y + H / 2 - 2, W / 2.6);
      g.fillStyle(0x22c55e, 1);
      g.fillCircle(X + W / 2 - 7, Y + H / 2 - 6, W / 4);
      g.fillCircle(X + W / 2 + 7, Y + H / 2 - 8, W / 4.4);
      g.fillStyle(0x4ade80, 1);
      g.fillCircle(X + W / 2, Y + H / 2 - 12, W / 5);
      break;
    }
    case 'workbench': {
      box(g, X, Y, W, H, 0xa16207, 0x713f12, 10);
      g.fillStyle(0x15803d, 1);
      g.fillRoundedRect(X + 10, Y + 6, 34, 22, 2);
      g.fillStyle(0x0f172a, 1);
      g.fillRect(X + 18, Y + 12, 10, 10);
      g.fillStyle(0xfacc15, 1);
      for (let k = 0; k < 4; k++) g.fillRect(X + 32, Y + 9 + k * 4, 8, 2);
      g.fillStyle(0x1e40af, 1);
      g.fillRoundedRect(X + 56, Y + 8, 40, 6, 2);
      g.fillStyle(0x64748b, 1);
      g.fillRoundedRect(X + W - 50, Y + 8, 34, 18, 3);
      g.fillStyle(0xef4444, 1);
      g.fillRect(X + W - 70, Y + 10, 14, 4);
      chair(g, X + W / 2, Y + H + 14, 0x7c2d12);
      break;
    }
    case 'assembly_table': {
      box(g, X, Y, W, H, 0x1e40af, 0x1e3a8a, 12);
      g.fillStyle(0x15803d, 1);
      g.fillRoundedRect(X + 18, Y + 6, 52, 30, 3);
      g.fillStyle(0x0f172a, 1);
      g.fillRect(X + 30, Y + 12, 12, 12);
      g.fillStyle(0x1e293b, 1);
      g.fillRect(X + 48, Y + 9, 4, 22);
      g.fillRect(X + 55, Y + 9, 4, 22);
      g.fillStyle(0x334155, 1);
      g.fillRoundedRect(X + 82, Y + 8, 30, 14, 2);
      g.fillStyle(0x22c55e, 1);
      g.fillRect(X + 86, Y + 12, 6, 6);
      break;
    }
    case 'shelf_cases': {
      box(g, X, Y, W, H, 0x57534e, 0x44403c, 8, 3);
      for (let k = 0; k < 3; k++) {
        g.fillStyle(0x111827, 1);
        g.fillRoundedRect(X + 8, Y + 6 + k * 42, W - 16, 32, 3);
        addLed(scene, c, leds, X + W / 2 - 2, Y + 12 + k * 42, 0x38bdf8, 4);
      }
      break;
    }
    case 'pc_case': {
      box(g, X, Y, W, H, 0x1f2937, 0x111827, 8, 4);
      g.fillStyle(0x334155, 1);
      for (let k = 0; k < 4; k++) g.fillRect(X + 8, Y + 10 + k * 6, W - 16, 2);
      addLed(scene, c, leds, X + W / 2 - 2, Y + H - 18, 0x22d3ee, 4);
      break;
    }
    case 'pegboard': {
      g.fillStyle(0xd6b98c, 1);
      g.fillRoundedRect(X, Y, W, H, 4);
      g.fillStyle(0x8b6b3d, 0.5);
      for (let i = 0; i < W / 10; i++) for (let j = 0; j < H / 10; j++) g.fillCircle(X + 6 + i * 10, Y + 6 + j * 10, 1);
      g.fillStyle(0xef4444, 1);
      g.fillRoundedRect(X + 12, Y + 8, 6, 22, 2);
      g.fillStyle(0xfacc15, 1);
      g.fillRoundedRect(X + 28, Y + 8, 6, 20, 2);
      g.fillStyle(0x3b82f6, 1);
      g.fillRoundedRect(X + 44, Y + 10, 20, 6, 2);
      g.fillStyle(0x64748b, 1);
      g.fillRoundedRect(X + 76, Y + 6, 10, 26, 2);
      break;
    }
    case 'wall_screen': {
      g.fillStyle(0x0b1220, 1);
      g.fillRoundedRect(X, Y, W, H, 4);
      const s = scene.add.rectangle(X + 4, Y + 4, W - 8, H - 8, 0x0c4a6e).setOrigin(0, 0);
      c.add(s);
      screens.push(s);
      const g2 = scene.add.graphics();
      c.add(g2);
      g2.lineStyle(2, 0x22d3ee, 1);
      const nodes = [
        [X + 20, Y + 20],
        [X + W / 2, Y + 12],
        [X + W - 24, Y + 22],
        [X + W / 2 - 30, Y + 28],
        [X + W / 2 + 40, Y + 28],
      ];
      g2.lineBetween(nodes[0][0], nodes[0][1], nodes[1][0], nodes[1][1]);
      g2.lineBetween(nodes[1][0], nodes[1][1], nodes[2][0], nodes[2][1]);
      g2.lineBetween(nodes[1][0], nodes[1][1], nodes[3][0], nodes[3][1]);
      g2.lineBetween(nodes[1][0], nodes[1][1], nodes[4][0], nodes[4][1]);
      g2.fillStyle(0x67e8f9, 1);
      nodes.forEach((n) => g2.fillCircle(n[0], n[1], 4));
      break;
    }
    case 'console_desk': {
      box(g, X, Y, W, H, 0x0c4a6e, 0x082f49, 12);
      monitor(scene, c, g, X + 8, Y + 4, 34, 22, 0x0ea5e9, screens);
      monitor(scene, c, g, X + W / 2 - 20, Y + 2, 40, 24, 0x22d3ee, screens);
      monitor(scene, c, g, X + W - 42, Y + 4, 34, 22, 0x0ea5e9, screens);
      chair(g, X + W / 2, Y + H + 14, 0x0369a1);
      break;
    }
    case 'router_desk': {
      box(g, X, Y, W, H, 0x94a3b8, 0x64748b, 10);
      // router
      g.fillStyle(0x0f172a, 1);
      g.fillRoundedRect(X + 10, Y + 12, 40, 14, 3);
      g.lineStyle(3, 0x0f172a, 1);
      g.lineBetween(X + 14, Y + 12, X + 10, Y - 4);
      g.lineBetween(X + 46, Y + 12, X + 50, Y - 4);
      for (let k = 0; k < 4; k++) addLed(scene, c, leds, X + 16 + k * 7, Y + 17, 0x22c55e, 3);
      // switch
      g.fillStyle(0x1e293b, 1);
      g.fillRoundedRect(X + 60, Y + 10, W - 70, 12, 2);
      for (let k = 0; k < 8; k++) addLed(scene, c, leds, X + 64 + k * 6, Y + 14, k % 2 ? 0xfacc15 : 0x22c55e, 3);
      break;
    }
    case 'ac_unit': {
      box(g, X, Y, W, H, 0xf1f5f9, 0xcbd5e1, 10);
      g.fillStyle(0x94a3b8, 1);
      for (let k = 0; k < 5; k++) g.fillRect(X + 10, Y + 8 + k * 5, W - 20, 2);
      addLed(scene, c, leds, X + W - 14, Y + 6, 0x38bdf8, 4);
      break;
    }
    case 'ups': {
      box(g, X, Y, W, H, 0x1f2937, 0x111827, 10);
      const s = scene.add.rectangle(X + 10, Y + 8, W - 20, 12, 0x16a34a).setOrigin(0, 0);
      c.add(s);
      screens.push(s);
      break;
    }
    case 'disc_shelf': {
      box(g, X, Y, W, H, 0x78716c, 0x57534e, 8, 3);
      const cols = [0x2563eb, 0xef4444, 0x22c55e, 0xfacc15, 0x8b5cf6, 0x06b6d4, 0xf97316];
      for (let k = 0; k < 10; k++) {
        g.fillStyle(cols[k % cols.length], 1);
        g.fillRect(X + 6 + k * 8.5, Y + 6, 6, H - 22);
      }
      break;
    }
    case 'sofa': {
      g.fillStyle(0x000000, 0.25);
      g.fillRoundedRect(X + 3, Y + 6, W, H, 10);
      g.fillStyle(0x0f766e, 1);
      g.fillRoundedRect(X, Y, W, H, 10);
      g.fillStyle(0x14b8a6, 1);
      g.fillRoundedRect(X + 8, Y + 10, W / 2 - 10, H - 16, 6);
      g.fillRoundedRect(X + W / 2 + 2, Y + 10, W / 2 - 10, H - 16, 6);
      break;
    }
    case 'helpdesk_counter': {
      box(g, X, Y, W, H, 0xbe185d, 0x831843, 14, 10);
      g.fillStyle(0xfdf2f8, 0.9);
      g.fillRoundedRect(X + 6, Y + 4, W - 12, 8, 3);
      monitor(scene, c, g, X + 16, Y + 12, 36, 20, 0xf9a8d4, screens);
      monitor(scene, c, g, X + W - 52, Y + 12, 36, 20, 0x38bdf8, screens);
      // headset on desk
      g.lineStyle(3, 0x0f172a, 1);
      g.beginPath();
      g.arc(X + W / 2, Y + 26, 8, Math.PI, 0);
      g.strokePath();
      g.fillStyle(0x0f172a, 1);
      g.fillCircle(X + W / 2 - 8, Y + 27, 3);
      g.fillCircle(X + W / 2 + 8, Y + 27, 3);
      addLed(scene, c, leds, X + W / 2 - 2, Y + 36, 0x22c55e, 4);
      break;
    }
    case 'chair_row': {
      g.fillStyle(0x475569, 1);
      g.fillRect(X, Y + H / 2 - 2, W, 4);
      for (let k = 0; k < 3; k++) {
        const cx = X + W / 6 + (k * W) / 3;
        chair(g, cx, Y + H / 2, 0xdb2777);
      }
      break;
    }
    case 'printer': {
      box(g, X, Y, W, H, 0xe2e8f0, 0x94a3b8, 12, 5);
      g.fillStyle(0xffffff, 1);
      g.fillRect(X + 10, Y + 4, W - 20, 12);
      g.fillStyle(0x334155, 1);
      g.fillRect(X + 8, Y + 18, W - 16, 4);
      addLed(scene, c, leds, X + W - 12, Y + 24, 0xf59e0b, 4);
      break;
    }
    case 'cubicle': {
      g.fillStyle(0x000000, 0.2);
      g.fillRect(X + 3, Y + 6, W, H);
      g.fillStyle(0x9d174d, 1);
      g.fillRect(X, Y, W, 6);
      g.fillRect(X, Y, 6, H);
      g.fillRect(X + W - 6, Y, 6, H);
      g.fillStyle(0xe2e8f0, 1);
      g.fillRect(X + 10, Y + 10, W - 20, 22);
      monitor(scene, c, g, X + 20, Y + 6, 34, 18, 0x38bdf8, screens);
      monitor(scene, c, g, X + W - 56, Y + 6, 34, 18, 0x22d3ee, screens);
      chair(g, X + 38, Y + H - 12, 0x334155);
      chair(g, X + W - 38, Y + H - 12, 0x334155);
      break;
    }
    case 'vending': {
      box(g, X, Y, W, H, 0x1d4ed8, 0x1e3a8a, 10, 4);
      g.fillStyle(0xe0f2fe, 0.85);
      g.fillRect(X + 6, Y + 5, W - 18, H - 22);
      const cols = [0xef4444, 0xfacc15, 0x22c55e, 0xf97316];
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
        g.fillStyle(cols[(i + j) % 4], 1);
        g.fillRect(X + 9 + i * 8, Y + 8 + j * 7, 5, 4);
      }
      addLed(scene, c, leds, X + W - 9, Y + 10, 0x22d3ee, 3);
      break;
    }
    case 'bench': {
      g.fillStyle(0x000000, 0.25);
      g.fillRoundedRect(X + 3, Y + 5, W, H, 6);
      g.fillStyle(0x334155, 1);
      g.fillRoundedRect(X, Y, W, H, 6);
      g.fillStyle(0x0ea5e9, 1);
      g.fillRoundedRect(X + 4, Y + 4, W - 8, H - 12, 4);
      break;
    }
    case 'water': {
      g.fillStyle(0x000000, 0.25);
      g.fillEllipse(X + W / 2 + 2, Y + H, W, 10);
      g.fillStyle(0xe2e8f0, 1);
      g.fillRoundedRect(X + 4, Y + H / 3, W - 8, (H * 2) / 3, 4);
      g.fillStyle(0x38bdf8, 0.85);
      g.fillCircle(X + W / 2, Y + H / 3, W / 2.6);
      g.fillStyle(0xffffff, 0.6);
      g.fillCircle(X + W / 2 - 4, Y + H / 3 - 4, 3);
      break;
    }
    case 'locker': {
      box(g, X, Y, W, H, 0x64748b, 0x475569, 8, 3);
      g.lineStyle(1, 0x334155, 1);
      g.lineBetween(X + W / 2, Y + 4, X + W / 2, Y + H - 10);
      g.fillStyle(0xcbd5e1, 1);
      g.fillRect(X + W / 2 - 6, Y + H / 2 - 4, 3, 8);
      g.fillRect(X + W / 2 + 3, Y + H / 2 - 4, 3, 8);
      break;
    }
    case 'floor_cable': {
      g.lineStyle(4, f.color ?? 0x3b82f6, 0.85);
      g.beginPath();
      g.moveTo(X, Y);
      const steps = 12;
      for (let i = 1; i <= steps; i++) {
        g.lineTo(X + (W * i) / steps, Y + Math.sin(i * 1.3) * 3);
      }
      g.strokePath();
      break;
    }
    case 'npc': {
      const key = `npc_${(f.npcColor ?? 0xf97316).toString(16)}_down_0`;
      const s = scene.add.image(X + W / 2, Y + H / 2 + 6, key).setOrigin(0.5, 0.85);
      if (f.flip) s.setFlipX(true);
      c.add(s);
      scene.tweens.add({ targets: s, y: s.y - 2, duration: 900 + Math.random() * 400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      break;
    }
  }

  c.setDepth(f.type === 'floor_cable' ? 1 : f.type === 'whiteboard' || f.type === 'pegboard' || f.type === 'wall_screen' ? 3 : Y + H);
  return { container: c, leds, screens, alert };
}

