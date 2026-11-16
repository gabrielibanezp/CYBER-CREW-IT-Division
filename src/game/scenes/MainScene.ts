import Phaser from 'phaser';
import { MISSIONS, ROOMS, RoomDef, MissionId } from '../../data/missions';
import { DoorDef, INFO_POINTS, MAP_H, MAP_W, SPAWN, TILE, doors, furniture, grid, roomAt } from '../mapData';
import { drawFurniture, generateCharacterTextures, FurnitureArt, Dir } from '../art';
import { EventBus, playerLive, virtualInput, worldLock } from '../EventBus';
import { getState, savePlayerPos } from '../../state/store';
import { audio } from '../../audio/audio';

interface Interactable {
  kind: 'mission' | 'info';
  id: string;
  label: string;
  x: number;
  y: number;
  radius: number;
  target?: Phaser.GameObjects.Container;
}

interface StationMarker {
  id: MissionId;
  ring: Phaser.GameObjects.Graphics;
  bubble: Phaser.GameObjects.Container;
  iconGfx: Phaser.GameObjects.Graphics;
  badge: Phaser.GameObjects.Text;
  badgeBg: Phaser.GameObjects.Arc;
  art?: FurnitureArt;
  color: number;
  x: number;
  y: number;
  particles?: Phaser.GameObjects.Particles.ParticleEmitter;
}

interface DoorArt {
  def: DoorDef;
  left: Phaser.GameObjects.Rectangle;
  right: Phaser.GameObjects.Rectangle;
  cx: number;
  cy: number;
  open: number;
  baseLeftX: number;
  baseRightX: number;
  panelW: number;
}

const hex = (c: string) => parseInt(c.replace('#', ''), 16);

export class MainScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private facing: Dir = 'down';
  private interactables: Interactable[] = [];
  private nearby: Interactable | null = null;
  private prompt!: Phaser.GameObjects.Container;
  private promptText!: Phaser.GameObjects.Text;
  private promptKey!: Phaser.GameObjects.Text;
  private promptBg!: Phaser.GameObjects.Graphics;
  private markers: StationMarker[] = [];
  private doorArts: DoorArt[] = [];
  private leds: Phaser.GameObjects.Rectangle[] = [];
  private screens: Phaser.GameObjects.Rectangle[] = [];
  private lastRoom = '';
  private stepTimer = 0;
  private saveTimer = 0;
  private offFns: Array<() => void> = [];
  private dust!: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor() {
    super('MainScene');
  }

  create() {
    generateCharacterTextures(this);
    this.cameras.main.setBackgroundColor('#050b18');

    this.drawFloors();
    this.drawWalls();
    this.drawDoors();
    this.drawRoomLabels();
    const solids = this.physics.add.staticGroup();
    this.buildWallColliders(solids);
    this.buildFurniture(solids);
    this.buildStations();
    this.buildInfoPoints();
    this.buildPlayer();
    this.physics.add.collider(this.player, solids);
    this.buildPrompt();
    this.setupCamera();
    this.setupInput();
    this.setupAmbient();

    this.offFns.push(EventBus.on('interact-request', () => this.tryInteract()));
    this.offFns.push(EventBus.on('missions-changed', () => this.refreshMarkers()));
    this.offFns.push(EventBus.on('reset-player', () => {
      this.player.setPosition(SPAWN.x, SPAWN.y);
    }));
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.offFns.forEach((f) => f()));
    this.refreshMarkers();
    EventBus.emit('scene-ready');
  }

  /* ---------------------------------------------------------------- */
  private roomDefAt(tx: number, ty: number): RoomDef | undefined {
    const id = roomAt(tx, ty);
    return ROOMS.find((r) => r.id === id);
  }

  private drawFloors() {
    const g = this.add.graphics().setDepth(0);
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        if (grid[y][x] !== 1) continue;
        const room = this.roomDefAt(x, y);
        const px = x * TILE;
        const py = y * TILE;
        if (!room || room.id === 'corridor') {
          // corridor: steel panels
          g.fillStyle((x + y) % 2 === 0 ? 0x26344d : 0x223047, 1);
          g.fillRect(px, py, TILE, TILE);
          g.lineStyle(1, 0x34466a, 0.6);
          g.strokeRect(px + 0.5, py + 0.5, TILE - 1, TILE - 1);
        } else {
          const base = room.floorTint;
          const alt = Phaser.Display.Color.IntegerToColor(base).brighten(6).color;
          g.fillStyle((x + y) % 2 === 0 ? base : alt, 1);
          g.fillRect(px, py, TILE, TILE);
          g.lineStyle(1, hex(room.color), 0.08);
          g.strokeRect(px + 0.5, py + 0.5, TILE - 1, TILE - 1);
        }
      }
    }
    // corridor guide stripes & arrows
    const cor = ROOMS.find((r) => r.id === 'corridor')!.bounds;
    const midY = (cor.y + cor.h / 2) * TILE;
    g.fillStyle(0x22d3ee, 0.18);
    for (let x = (cor.x + 1) * TILE + 20; x < (cor.x + cor.w - 1) * TILE - 20; x += 48) {
      g.fillRoundedRect(x, midY - 3, 26, 6, 3);
    }
    g.lineStyle(2, 0x22d3ee, 0.12);
    g.lineBetween((cor.x + 1) * TILE, (cor.y + 0.25) * TILE, (cor.x + cor.w - 1) * TILE, (cor.y + 0.25) * TILE);
    g.lineBetween((cor.x + 1) * TILE, (cor.y + cor.h - 0.25) * TILE, (cor.x + cor.w - 1) * TILE, (cor.y + cor.h - 0.25) * TILE);

    // room glow patches (soft light)
    for (const r of ROOMS) {
      if (r.id === 'corridor') continue;
      const b = r.bounds;
      const glow = this.add.image((b.x + b.w / 2) * TILE, (b.y + b.h / 2) * TILE, 'glow');
      glow.setTint(hex(r.color)).setAlpha(0.18).setDisplaySize(b.w * TILE * 0.9, b.h * TILE * 0.9).setDepth(0.5).setBlendMode(Phaser.BlendModes.ADD);
    }
  }

  private drawWalls() {
    const g = this.add.graphics().setDepth(2);
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const v = grid[y][x];
        const px = x * TILE;
        const py = y * TILE;
        if (v === 0) {
          // outside: subtle starfield/space grid
          g.fillStyle(0x050b18, 1);
          g.fillRect(px, py, TILE, TILE);
          if ((x * 7 + y * 13) % 11 === 0) {
            g.fillStyle(0x1e3a5f, 0.8);
            g.fillCircle(px + 12 + ((x * 5) % 20), py + 10 + ((y * 7) % 24), 1.4);
          }
          continue;
        }
        if (v !== 2) continue;
        const room = this.roomDefAt(x, y) ?? this.roomDefAt(x, y + 1) ?? this.roomDefAt(x, y - 1);
        const accent = room ? hex(room.color) : 0x64748b;
        const below = y + 1 < MAP_H ? grid[y + 1][x] : 0;
        g.fillStyle(0x16213a, 1);
        g.fillRect(px, py, TILE, TILE);
        g.fillStyle(0x1f2d4d, 1);
        g.fillRect(px + 2, py + 2, TILE - 4, TILE - 4);
        if (below === 1) {
          // front face visible
          g.fillStyle(0x0d1630, 1);
          g.fillRect(px, py + TILE * 0.45, TILE, TILE * 0.55);
          g.fillStyle(accent, 0.85);
          g.fillRect(px, py + TILE * 0.45, TILE, 3);
          g.fillStyle(accent, 0.22);
          g.fillRect(px, py + TILE - 8, TILE, 2);
          g.fillStyle(0x000000, 0.25);
          g.fillRect(px, py + TILE, TILE, 8);
        }
        // top highlight edge if exposed above
        const above = y > 0 ? grid[y - 1][x] : 0;
        if (above === 1) {
          g.fillStyle(accent, 0.6);
          g.fillRect(px, py, TILE, 2);
        }
      }
    }
  }

  private drawDoors() {
    for (const d of doors) {
      const room = ROOMS.find((r) => r.id === d.roomId)!;
      const accent = hex(room.color);
      const x0 = d.x * TILE;
      const y0 = d.y * TILE;
      const w = d.w * TILE;
      const g = this.add.graphics().setDepth(2.5);
      // posts
      g.fillStyle(0x0f172a, 1);
      g.fillRect(x0 - 8, y0, 8, TILE);
      g.fillRect(x0 + w, y0, 8, TILE);
      g.fillStyle(accent, 1);
      g.fillRect(x0 - 6, y0 + 4, 3, TILE - 8);
      g.fillRect(x0 + w + 3, y0 + 4, 3, TILE - 8);
      // threshold
      g.fillStyle(accent, 0.25);
      g.fillRect(x0, y0 + TILE / 2 - 3, w, 6);
      // sliding panels
      const panelW = w / 2;
      const left = this.add.rectangle(x0, y0 + TILE / 2, panelW, 12, 0x334155).setOrigin(0, 0.5).setDepth(2.6).setStrokeStyle(2, accent, 0.9);
      const right = this.add.rectangle(x0 + panelW, y0 + TILE / 2, panelW, 12, 0x334155).setOrigin(0, 0.5).setDepth(2.6).setStrokeStyle(2, accent, 0.9);
      this.doorArts.push({ def: d, left, right, cx: x0 + w / 2, cy: y0 + TILE / 2, open: 0, baseLeftX: x0, baseRightX: x0 + panelW, panelW });
    }
  }

  private drawRoomLabels() {
    for (const r of ROOMS) {
      if (r.id === 'corridor') continue;
      const b = r.bounds;
      const door = doors.find((d) => d.roomId === r.id)!;
      // floor watermark inside room
      this.add
        .text((b.x + b.w / 2) * TILE, (b.y + b.h / 2 + (door.side === 'bottom' ? 2.6 : -2.2)) * TILE, r.name.toUpperCase(), {
          fontFamily: 'Orbitron, sans-serif',
          fontSize: '22px',
          fontStyle: '800',
          color: r.color,
        })
        .setOrigin(0.5)
        .setAlpha(0.13)
        .setDepth(0.6);
      // door sign in corridor
      const sy = door.side === 'bottom' ? (door.y + 1) * TILE + 16 : door.y * TILE - 16;
      const sx = (door.x + door.w / 2) * TILE;
      const label = this.add
        .text(sx, sy, `${r.name}`, {
          fontFamily: 'Poppins, sans-serif',
          fontSize: '13px',
          fontStyle: '700',
          color: '#ffffff',
        })
        .setOrigin(0.5)
        .setDepth(4);
      const bg = this.add.graphics().setDepth(3.9);
      bg.fillStyle(0x0b1530, 0.9);
      bg.fillRoundedRect(sx - label.width / 2 - 12, sy - 13, label.width + 24, 26, 13);
      bg.lineStyle(2, hex(r.color), 1);
      bg.strokeRoundedRect(sx - label.width / 2 - 12, sy - 13, label.width + 24, 26, 13);
    }
  }

  private buildWallColliders(group: Phaser.Physics.Arcade.StaticGroup) {
    for (let y = 0; y < MAP_H; y++) {
      let start = -1;
      for (let x = 0; x <= MAP_W; x++) {
        const solid = x < MAP_W && grid[y][x] !== 1;
        if (solid && start < 0) start = x;
        if (!solid && start >= 0) {
          const w = (x - start) * TILE;
          // walls: bottom portion only slightly shorter so player can stand near front face
          const z = this.add.zone(start * TILE + w / 2, y * TILE + TILE / 2, w, TILE);
          this.physics.add.existing(z, true);
          group.add(z);
          start = -1;
        }
      }
    }
  }

  private buildFurniture(group: Phaser.Physics.Arcade.StaticGroup) {
    for (const f of furniture) {
      const art = drawFurniture(this, f);
      this.leds.push(...art.leds);
      this.screens.push(...art.screens);
      const station = MISSIONS.find(
        (m) => m.roomId === f.room && Math.abs(m.stationTile.x + 0.5 - (f.x + f.w / 2)) < 0.01 && Math.abs(m.stationTile.y + 0.5 - (f.y + f.h / 2)) < 0.01,
      );
      if (station) {
        (art.container as any).__station = station.id;
        this.stationArts.set(station.id, art);
      }
      if (f.solid) {
        const inset = f.type === 'npc' ? 4 : 3;
        const z = this.add.zone((f.x + f.w / 2) * TILE, (f.y + f.h / 2) * TILE, f.w * TILE - inset * 2, f.h * TILE - inset * 2);
        this.physics.add.existing(z, true);
        group.add(z);
      }
    }
  }
  private stationArts = new Map<string, FurnitureArt>();

  private drawStationIcon(g: Phaser.GameObjects.Graphics, id: MissionId, done: boolean, col: number) {
    g.clear();
    if (done) {
      g.lineStyle(3, 0x22c55e, 1);
      g.beginPath();
      g.moveTo(-8, 1);
      g.lineTo(-2, 7);
      g.lineTo(9, -6);
      g.strokePath();
      return;
    }
    g.lineStyle(2.2, col, 1);
    switch (id) {
      case 'cable_assembly':
        g.strokeRoundedRect(-7, -9, 14, 9, 2);
        g.lineBetween(-4, -9, -4, -5);
        g.lineBetween(0, -9, 0, -5);
        g.lineBetween(4, -9, 4, -5);
        g.lineBetween(0, 0, 0, 10);
        break;
      case 'hardware_assembly':
        g.strokeRoundedRect(-8, -8, 16, 16, 2);
        g.strokeRect(-4, -4, 8, 8);
        break;
      case 'network_config':
        g.strokeCircle(0, -6, 3.5);
        g.strokeCircle(-7, 6, 3.5);
        g.strokeCircle(7, 6, 3.5);
        g.lineBetween(0, -2.5, -5, 3);
        g.lineBetween(0, -2.5, 5, 3);
        break;
      case 'server_config':
        g.strokeRoundedRect(-9, -8, 18, 5, 1.5);
        g.strokeRoundedRect(-9, -1, 18, 5, 1.5);
        g.strokeRoundedRect(-9, 6, 18, 5, 1.5);
        break;
      case 'software_troubleshoot':
        g.strokeRoundedRect(-9, -7, 18, 12, 2);
        g.lineBetween(-5, 9, 5, 9);
        g.lineBetween(0, 5, 0, 9);
        break;
      case 'helpdesk_ticket':
        g.beginPath();
        g.arc(0, 1, 8, Math.PI, 0, false);
        g.strokePath();
        g.fillStyle(col, 1);
        g.fillRoundedRect(-10, 0, 4, 7, 1.5);
        g.fillRoundedRect(6, 0, 4, 7, 1.5);
        break;
    }
  }

  private buildStations() {
    for (const m of MISSIONS) {
      const x = (m.stationTile.x + 0.5) * TILE;
      const y = (m.stationTile.y + 0.5) * TILE;
      const color = hex(m.color);
      const ring = this.add.graphics().setDepth(1.2);
      ring.setPosition(x, y + 6);
      const bubble = this.add.container(x, y - 70).setDepth(5000);
      const glow = this.add.image(0, 0, 'glow').setTint(color).setScale(1.4).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.8);
      const bg = this.add.circle(0, 0, 22, 0x0b1530, 0.95).setStrokeStyle(3, color);
      const iconGfx = this.add.graphics();
      this.drawStationIcon(iconGfx, m.id, false, color);
      const badgeBg = this.add.circle(17, -17, 10, 0xef4444).setStrokeStyle(2, 0xffffff);
      const badge = this.add.text(17, -17, '!', { fontFamily: 'Poppins', fontSize: '13px', fontStyle: '800', color: '#ffffff' }).setOrigin(0.5);
      const tag = this.add
        .text(0, 34, `MISI ${m.number}`, { fontFamily: 'Orbitron, sans-serif', fontSize: '11px', fontStyle: '800', color: '#ffffff', backgroundColor: '#0b1530', padding: { x: 6, y: 2 } })
        .setOrigin(0.5);
      bubble.add([glow, bg, iconGfx, badgeBg, badge, tag]);
      this.tweens.add({ targets: bubble, y: y - 78, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      const particles = this.add.particles(x, y, 'dot', {
        speedY: { min: -40, max: -15 },
        speedX: { min: -10, max: 10 },
        lifespan: 1400,
        scale: { start: 0.6, end: 0 },
        alpha: { start: 0.8, end: 0 },
        tint: color,
        frequency: 160,
        emitZone: { type: 'random', source: new Phaser.Geom.Rectangle(-50, -20, 100, 40) } as any,
        blendMode: 'ADD',
      });
      particles.setDepth(4999);
      this.markers.push({ id: m.id, ring, bubble, iconGfx, badge, badgeBg, color, x, y, particles, art: this.stationArts.get(m.id) });
      this.interactables.push({ kind: 'mission', id: m.id, label: `Mulai Misi: ${m.title}`, x, y, radius: TILE * 2 });
    }
    // pulsing rings redraw
    this.time.addEvent({
      delay: 33,
      loop: true,
      callback: () => {
        const t = this.time.now / 1000;
        for (const mk of this.markers) {
          const done = !!getState().progress.completed[mk.id];
          const col = done ? 0x22c55e : mk.color;
          mk.ring.clear();
          const p = (t * 0.8) % 1;
          mk.ring.lineStyle(3, col, 0.9 - p * 0.9);
          mk.ring.strokeEllipse(0, 0, 90 + p * 70, 50 + p * 38);
          mk.ring.lineStyle(2, col, 0.5);
          mk.ring.strokeEllipse(0, 0, 96, 54);
          mk.ring.fillStyle(col, 0.1);
          mk.ring.fillEllipse(0, 0, 96, 54);
        }
      },
    });
  }

  private buildInfoPoints() {
    for (const p of INFO_POINTS) {
      const x = p.x * TILE;
      const y = p.y * TILE;
      const isNpc = p.id.startsWith('npc');
      const c = this.add.container(x, y - (isNpc ? 54 : 44)).setDepth(4990);
      const bg = this.add.circle(0, 0, 11, isNpc ? 0xfacc15 : 0x0ea5e9, 1).setStrokeStyle(2, 0xffffff);
      const t = this.add.text(0, 0, isNpc ? '?' : 'i', { fontFamily: 'Orbitron, sans-serif', fontSize: '12px', fontStyle: '900', color: isNpc ? '#0f172a' : '#ffffff' }).setOrigin(0.5);
      c.add([bg, t]);
      this.tweens.add({ targets: c, y: c.y - 5, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      this.interactables.push({ kind: 'info', id: p.id, label: p.label, x, y, radius: TILE * 1.6, target: c });
    }
  }

  private buildPlayer() {
    const saved = getState().progress.playerPos;
    let sx = SPAWN.x;
    let sy = SPAWN.y;
    if (saved) {
      const tx = Math.floor(saved.x / TILE);
      const ty = Math.floor(saved.y / TILE);
      if (grid[ty]?.[tx] === 1) {
        sx = saved.x;
        sy = saved.y;
      }
    }
    this.player = this.physics.add.sprite(sx, sy, 'tech_down_0');
    this.player.setOrigin(0.5, 0.88);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setCircle(13, 11, 42);
    this.player.setCollideWorldBounds(true);
    this.physics.world.setBounds(0, 0, MAP_W * TILE, MAP_H * TILE);

    // dust trail
    this.dust = this.add.particles(0, 0, 'dot', {
      lifespan: 400,
      speed: { min: 5, max: 20 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.35, end: 0 },
      tint: 0x94a3b8,
      emitting: false,
    });
    this.dust.setDepth(1.5);
  }

  private buildPrompt() {
    this.prompt = this.add.container(0, 0).setDepth(6000).setVisible(false);
    this.promptBg = this.add.graphics();
    this.promptKey = this.add.text(0, 0, 'E', { fontFamily: 'Orbitron, sans-serif', fontSize: '14px', fontStyle: '900', color: '#0b1530' }).setOrigin(0.5);
    this.promptText = this.add.text(0, 0, '', { fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontStyle: '700', color: '#ffffff' }).setOrigin(0, 0.5);
    this.prompt.add([this.promptBg, this.promptKey, this.promptText]);
  }

  private setPrompt(it: Interactable | null) {
    if (!it) {
      this.prompt.setVisible(false);
      return;
    }
    const keyLabel = 'E';
    this.promptKey.setText(keyLabel);
    this.promptText.setText(it.label);
    const w = this.promptText.width + 52;
    this.promptBg.clear();
    this.promptBg.fillStyle(0x0b1530, 0.95);
    this.promptBg.fillRoundedRect(-w / 2, -17, w, 34, 17);
    this.promptBg.lineStyle(2, 0x22d3ee, 1);
    this.promptBg.strokeRoundedRect(-w / 2, -17, w, 34, 17);
    this.promptBg.fillStyle(0x22d3ee, 1);
    this.promptBg.fillRoundedRect(-w / 2 + 6, -12, 24, 24, 7);
    this.promptKey.setPosition(-w / 2 + 18, 0);
    this.promptText.setPosition(-w / 2 + 38, 0);
    this.prompt.setVisible(true);
    this.prompt.setScale(0.6);
    this.tweens.add({ targets: this.prompt, scale: 1, duration: 180, ease: 'Back.out' });
  }

  private setupCamera() {
    const cam = this.cameras.main;
    cam.setBounds(-TILE * 2, -TILE * 2, MAP_W * TILE + TILE * 4, MAP_H * TILE + TILE * 4);
    cam.startFollow(this.player, true, 0.12, 0.12);
    const fit = () => {
      const w = this.scale.width;
      const h = this.scale.height;
      const z = Phaser.Math.Clamp(Math.min(w / 1050, h / 720) * 1.05, 0.55, 1.35);
      cam.setZoom(z);
    };
    fit();
    this.scale.on('resize', fit);
    cam.fadeIn(600, 5, 11, 24);
  }

  private setupInput() {
    const kb = this.input.keyboard!;
    this.keys = kb.addKeys(
      { up: 'UP', down: 'DOWN', left: 'LEFT', right: 'RIGHT', w: 'W', a: 'A', s: 'S', d: 'D' },
      false,
    ) as Record<string, Phaser.Input.Keyboard.Key>;
    kb.on('keydown-E', () => this.tryInteract());
    kb.on('keydown-ENTER', () => this.tryInteract());
  }

  private setupAmbient() {
    this.time.addEvent({
      delay: 120,
      loop: true,
      callback: () => {
        for (let i = 0; i < 6; i++) {
          const l = this.leds[Math.floor(Math.random() * this.leds.length)];
          if (l) l.setAlpha(l.alpha > 0.5 ? 0.25 : 1);
        }
      },
    });
    this.screens.forEach((s, i) => {
      this.tweens.add({ targets: s, alpha: 0.75, duration: 1200 + (i % 5) * 300, yoyo: true, repeat: -1, ease: 'Sine.inOut', delay: i * 90 });
    });
  }

  /* ---------------------------------------------------------------- */
  private refreshMarkers() {
    const completed = getState().progress.completed;
    for (const mk of this.markers) {
      const done = !!completed[mk.id];
      this.drawStationIcon(mk.iconGfx, mk.id, done, mk.color);
      mk.badge.setText(done ? 'OK' : '!');
      mk.badge.setFontSize(done ? 9 : 13);
      mk.badgeBg.setFillStyle(done ? 0x22c55e : 0xef4444);
      if (mk.particles) mk.particles.emitting = !done;
      if (mk.art?.alert) {
        this.tweens.killTweensOf(mk.art.alert);
        mk.art.alert.setFillStyle(done ? 0x22c55e : 0xef4444);
        mk.art.alert.setAlpha(1);
        if (!done) this.tweens.add({ targets: mk.art.alert, alpha: 0.2, duration: 400, yoyo: true, repeat: -1 });
      }
      const it = this.interactables.find((i) => i.id === mk.id);
      const m = MISSIONS.find((x) => x.id === mk.id)!;
      if (it) it.label = done ? `Ulangi Misi: ${m.title}` : `Mulai Misi: ${m.title}`;
    }
    if (this.nearby) this.setPrompt(this.nearby);
  }

  private tryInteract() {
    if (worldLock.locked || !this.nearby) return;
    const it = this.nearby;
    audio.play('open');
    // object interaction animation
    const mk = this.markers.find((m) => m.id === it.id);
    if (mk) {
      this.tweens.add({ targets: mk.bubble, scale: 1.35, duration: 140, yoyo: true, ease: 'Quad.out' });
      if (mk.art) this.tweens.add({ targets: mk.art.container, y: -4, duration: 90, yoyo: true, repeat: 1 });
      this.cameras.main.flash(180, 34, 211, 238, false);
    } else if (it.target) {
      this.tweens.add({ targets: it.target, scale: 1.5, duration: 140, yoyo: true });
    }
    this.player.setVelocity(0, 0);
    EventBus.emit('interact', { kind: it.kind, id: it.id });
  }

  update(_time: number, delta: number) {
    if (!this.player?.body) return;
    let vx = 0;
    let vy = 0;
    if (!worldLock.locked) {
      const k = this.keys;
      if (k.left.isDown || k.a.isDown) vx -= 1;
      if (k.right.isDown || k.d.isDown) vx += 1;
      if (k.up.isDown || k.w.isDown) vy -= 1;
      if (k.down.isDown || k.s.isDown) vy += 1;
      if (vx === 0 && vy === 0 && (Math.abs(virtualInput.x) > 0.15 || Math.abs(virtualInput.y) > 0.15)) {
        vx = virtualInput.x;
        vy = virtualInput.y;
      }
    }
    const len = Math.hypot(vx, vy);
    const speed = 230;
    if (len > 0) {
      const scale = Math.min(1, len) / len;
      this.player.setVelocity(vx * scale * speed, vy * scale * speed);
      let dir: Dir;
      if (Math.abs(vx) > Math.abs(vy) * 1.05) dir = 'side';
      else dir = vy < 0 ? 'up' : 'down';
      if (dir === 'side') this.player.setFlipX(vx < 0);
      else this.player.setFlipX(false);
      this.facing = dir;
      this.player.anims.play(`tech_walk_${dir}`, true);
      this.stepTimer -= delta;
      if (this.stepTimer <= 0) {
        this.stepTimer = 300;
        if (getState().settings.footsteps) audio.play('step');
        this.dust.emitParticleAt(this.player.x, this.player.y, 2);
      }
    } else {
      this.player.setVelocity(0, 0);
      this.player.anims.stop();
      this.player.setTexture(`tech_${this.facing}_0`);
      this.stepTimer = 0;
    }
    this.player.setDepth(this.player.y);

    // live position
    playerLive.x = this.player.x;
    playerLive.y = this.player.y;
    const tx = Math.floor(this.player.x / TILE);
    const ty = Math.floor(this.player.y / TILE);
    const room = this.roomDefAt(tx, ty);
    if (room && room.id !== this.lastRoom) {
      this.lastRoom = room.id;
      playerLive.room = room.id;
      EventBus.emit('room', room.id);
    }

    this.saveTimer += delta;
    if (this.saveTimer > 2000) {
      this.saveTimer = 0;
      savePlayerPos(this.player.x, this.player.y);
    }

    // nearest interactable
    let best: Interactable | null = null;
    let bestD = Infinity;
    for (const it of this.interactables) {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y - 10, it.x, it.y);
      if (d < it.radius && d < bestD) {
        best = it;
        bestD = d;
      }
    }
    if (best !== this.nearby) {
      this.nearby = best;
      this.setPrompt(best);
      EventBus.emit('nearby', best ? { kind: best.kind, id: best.id, label: best.label } : null);
    }
    if (this.nearby) {
      this.prompt.setPosition(this.nearby.x, this.nearby.y - (this.nearby.kind === 'mission' ? 128 : 84));
    }

    // doors
    for (const d of this.doorArts) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, d.cx, d.cy);
      const target = dist < TILE * 2.6 ? 1 : 0;
      d.open += (target - d.open) * Math.min(1, delta / 120);
      const pw = Math.max(3, d.panelW * (1 - d.open * 0.92));
      d.left.setSize(pw, 12);
      d.right.setSize(pw, 12);
      d.right.x = d.baseRightX + d.panelW - pw;
      d.left.setAlpha(1 - d.open * 0.3);
      d.right.setAlpha(1 - d.open * 0.3);
    }
  }
}
