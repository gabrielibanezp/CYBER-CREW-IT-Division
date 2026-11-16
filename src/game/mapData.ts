import { MISSIONS, ROOMS, RoomId } from '../data/missions';

export const TILE = 48;
export const MAP_W = 44;
export const MAP_H = 30;

/** 0 = void (outside building), 1 = floor, 2 = wall */
export type Cell = 0 | 1 | 2;

export interface DoorDef {
  roomId: RoomId;
  x: number; // tile x of first door tile
  y: number; // wall row
  w: number; // tiles
  side: 'top' | 'bottom';
}

export type FurnitureType =
  | 'desk_pc'
  | 'desk_dual'
  | 'crimp_table'
  | 'net_rack'
  | 'cable_spool'
  | 'whiteboard'
  | 'plant'
  | 'workbench'
  | 'assembly_table'
  | 'shelf_cases'
  | 'pc_case'
  | 'pegboard'
  | 'wall_screen'
  | 'console_desk'
  | 'router_desk'
  | 'server_rack'
  | 'main_rack'
  | 'ac_unit'
  | 'ups'
  | 'software_desk'
  | 'disc_shelf'
  | 'helpdesk_counter'
  | 'chair_row'
  | 'printer'
  | 'cubicle'
  | 'vending'
  | 'bench'
  | 'water'
  | 'sofa'
  | 'floor_cable'
  | 'locker'
  | 'npc';

export interface Furniture {
  type: FurnitureType;
  x: number; // tile coords (top-left)
  y: number;
  w: number;
  h: number;
  solid: boolean;
  room: RoomId;
  color?: number;
  /** for npc */
  npcColor?: number;
  flip?: boolean;
}

export interface InfoPoint {
  id: string;
  room: RoomId;
  x: number; // tile coords of centre
  y: number;
  label: string;
  title: string;
  icon: string;
  text: string;
  bullets: string[];
}

export const grid: Cell[][] = [];
export const doors: DoorDef[] = [];
export const furniture: Furniture[] = [];

function buildGrid() {
  for (let y = 0; y < MAP_H; y++) {
    grid.push(new Array(MAP_W).fill(0));
  }
  const setRect = (x: number, y: number, w: number, h: number, v: Cell) => {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (grid[j] && i >= 0 && i < MAP_W) grid[j][i] = v;
  };

  // corridor (with walls on far left/right handled by room walls + outer)
  const corridor = ROOMS.find((r) => r.id === 'corridor')!;
  const cb = corridor.bounds;
  setRect(cb.x, cb.y - 1, cb.w, cb.h + 2, 2);
  setRect(cb.x + 1, cb.y, cb.w - 2, cb.h, 1);

  for (const r of ROOMS) {
    if (r.id === 'corridor') continue;
    const b = r.bounds;
    setRect(b.x, b.y, b.w, b.h, 2);
    setRect(b.x + 1, b.y + 1, b.w - 2, b.h - 2, 1);
    const top = b.y < cb.y;
    const doorX = b.x + 4;
    const doorW = 4;
    const wallY = top ? b.y + b.h - 1 : b.y;
    for (let i = doorX; i < doorX + doorW; i++) grid[wallY][i] = 1;
    doors.push({ roomId: r.id, x: doorX, y: wallY, w: doorW, side: top ? 'bottom' : 'top' });
  }
}

function f(room: RoomId, type: FurnitureType, rx: number, ry: number, w: number, h: number, solid = true, extra: Partial<Furniture> = {}) {
  const r = ROOMS.find((x) => x.id === room)!;
  furniture.push({ type, room, x: r.bounds.x + rx, y: r.bounds.y + ry, w, h, solid, ...extra });
}

function buildFurniture() {
  // ---------- IT LAB ----------
  f('it_lab', 'desk_dual', 1, 1, 3, 1);
  f('it_lab', 'desk_dual', 8, 1, 3, 1);
  f('it_lab', 'whiteboard', 4.4, 0.1, 3.2, 0.8, false);
  f('it_lab', 'net_rack', 1, 3.6, 1, 2);
  f('it_lab', 'cable_spool', 9.6, 6.6, 0.9, 0.9);
  f('it_lab', 'cable_spool', 8.6, 7.1, 0.8, 0.8);
  f('it_lab', 'plant', 1, 7.8, 0.8, 0.8);
  f('it_lab', 'floor_cable', 2, 5.6, 5, 0.3, false, { color: 0x3b82f6 });
  f('it_lab', 'floor_cable', 2, 6.2, 4, 0.3, false, { color: 0xf97316 });
  f('it_lab', 'desk_pc', 10, 3.5, 1, 2);

  // ---------- HARDWARE WORKSHOP ----------
  f('hardware_workshop', 'workbench', 1, 1, 4, 1);
  f('hardware_workshop', 'pegboard', 5.4, 0.1, 3, 0.8, false);
  f('hardware_workshop', 'workbench', 8, 1, 3, 1);
  f('hardware_workshop', 'shelf_cases', 10, 3.2, 1, 3);
  f('hardware_workshop', 'pc_case', 1.2, 6.8, 0.8, 1.1);
  f('hardware_workshop', 'pc_case', 2.3, 6.8, 0.8, 1.1);
  f('hardware_workshop', 'locker', 1, 3.4, 1, 2);
  f('hardware_workshop', 'plant', 10.1, 7.8, 0.8, 0.8);

  // ---------- NETWORK ROOM ----------
  f('network_room', 'wall_screen', 3.6, 0.1, 4.8, 0.8, false);
  f('network_room', 'net_rack', 1, 1, 1, 2);
  f('network_room', 'net_rack', 1, 3.2, 1, 2);
  f('network_room', 'router_desk', 8.5, 1, 2.5, 1);
  f('network_room', 'desk_pc', 10, 4, 1, 2);
  f('network_room', 'floor_cable', 2, 2.2, 6, 0.25, false, { color: 0x22d3ee });
  f('network_room', 'floor_cable', 2, 4.4, 4, 0.25, false, { color: 0xfacc15 });
  f('network_room', 'plant', 1, 7.8, 0.8, 0.8);
  f('network_room', 'cable_spool', 9.8, 7.4, 0.8, 0.8);

  // ---------- SERVER ROOM ----------
  for (let i = 0; i < 4; i++) f('server_room', 'server_rack', 1, 3 + i * 1.2, 1, 1.1);
  for (let i = 0; i < 4; i++) f('server_room', 'server_rack', 9, 3 + i * 1.2, 1, 1.1);
  for (let i = 0; i < 4; i++) f('server_room', 'server_rack', 10, 3 + i * 1.2, 1, 1.1);
  f('server_room', 'ac_unit', 9, 1.1, 2, 1);
  f('server_room', 'ups', 1, 1.1, 1.2, 1);
  f('server_room', 'floor_cable', 2, 7.6, 7, 0.25, false, { color: 0xa78bfa });

  // ---------- SOFTWARE ROOM ----------
  f('software_room', 'software_desk', 1, 3, 3, 1);
  f('software_room', 'software_desk', 1, 6, 3, 1);
  f('software_room', 'software_desk', 8, 3, 3, 1);
  f('software_room', 'software_desk', 8, 6, 3, 1);
  f('software_room', 'disc_shelf', 9, 1.1, 2, 0.9);
  f('software_room', 'sofa', 1, 1.1, 2, 0.9);
  f('software_room', 'plant', 10.1, 7.9, 0.8, 0.8);

  // ---------- HELPDESK ----------
  f('helpdesk_office', 'chair_row', 1, 7.4, 3, 0.8);
  f('helpdesk_office', 'printer', 10, 1.2, 1, 1);
  f('helpdesk_office', 'cubicle', 8, 6, 3, 1.4);
  f('helpdesk_office', 'water', 1, 1.2, 0.8, 0.8);
  f('helpdesk_office', 'plant', 2.2, 1.2, 0.8, 0.8);
  f('helpdesk_office', 'npc', 1.7, 6.5, 0.7, 0.7, true, { npcColor: 0xf97316 });
  f('helpdesk_office', 'npc', 3.1, 6.6, 0.7, 0.7, true, { npcColor: 0x84cc16, flip: true });
  f('helpdesk_office', 'npc', 9.1, 3, 0.7, 0.7, true, { npcColor: 0xec4899 });

  // ---------- CORRIDOR ----------
  f('corridor', 'vending', 1, 0, 1, 1);
  f('corridor', 'water', 2.2, 0.1, 0.8, 0.8);
  f('corridor', 'bench', 11.3, 0.1, 2.2, 0.7);
  f('corridor', 'plant', 13.7, 0.1, 0.8, 0.8);
  f('corridor', 'bench', 25.3, 0.1, 2.2, 0.7);
  f('corridor', 'plant', 27.7, 0.1, 0.8, 0.8);
  f('corridor', 'bench', 11.3, 5.2, 2.2, 0.7);
  f('corridor', 'plant', 13.7, 5.1, 0.8, 0.8);
  f('corridor', 'bench', 25.3, 5.2, 2.2, 0.7);
  f('corridor', 'plant', 27.7, 5.1, 0.8, 0.8);
  f('corridor', 'vending', 37, 0, 1, 1);
  f('corridor', 'plant', 1.1, 5.1, 0.8, 0.8);
  f('corridor', 'npc', 20, 2.6, 0.7, 0.7, true, { npcColor: 0x14b8a6 });

  // mission stations
  for (const m of MISSIONS) {
    const type: FurnitureType =
      m.id === 'cable_assembly'
        ? 'crimp_table'
        : m.id === 'hardware_assembly'
          ? 'assembly_table'
          : m.id === 'network_config'
            ? 'console_desk'
            : m.id === 'server_config'
              ? 'main_rack'
              : m.id === 'software_troubleshoot'
                ? 'software_desk'
                : 'helpdesk_counter';
    const w = type === 'main_rack' ? 1.6 : 2.6;
    const h = type === 'main_rack' ? 1.3 : 1.2;
    furniture.push({
      type,
      room: m.roomId,
      x: m.stationTile.x + 0.5 - w / 2,
      y: m.stationTile.y + 0.5 - h / 2,
      w,
      h,
      solid: true,
    });
  }
}

export const INFO_POINTS: InfoPoint[] = [
  {
    id: 'info_switch',
    room: 'it_lab',
    x: 3 + 0.5,
    y: 2 + 4.6,
    label: 'Rak Switch & Patch Panel',
    title: 'Switch & Patch Panel',
    icon: 'switch',
    text: 'Switch menghubungkan banyak perangkat dalam satu LAN dan meneruskan frame berdasarkan MAC Address (Layer 2).',
    bullets: [
      'Patch panel merapikan terminasi kabel dari setiap ruangan sebelum masuk ke switch.',
      'PC ke switch menggunakan kabel UTP Straight-Through.',
      'Lampu LED port menyala hijau ketika link aktif dan berkedip saat ada trafik.',
    ],
  },
  {
    id: 'info_tester',
    room: 'it_lab',
    x: 2 + 10.5,
    y: 2 + 4.5,
    label: 'PC Lab & LAN Tester',
    title: 'Alat Kerja Kabel LAN',
    icon: 'wrench',
    text: 'Teknisi jaringan memakai beberapa alat utama untuk membuat dan menguji kabel UTP.',
    bullets: [
      'Crimping tool: menjepit konektor RJ45 agar pin tembaga menembus isolasi kabel.',
      'Cable stripper: mengupas jaket luar kabel UTP tanpa merusak inti.',
      'LAN tester: menguji kontinuitas pin 1–8 pada kedua ujung kabel.',
    ],
  },
  {
    id: 'info_psu',
    room: 'hardware_workshop',
    x: 16 + 10.5,
    y: 2 + 4.7,
    label: 'Rak Casing & PSU',
    title: 'Casing & Power Supply',
    icon: 'battery',
    text: 'Power Supply Unit (PSU) mengubah arus AC dari listrik PLN menjadi arus DC (12V, 5V, 3.3V) untuk komponen.',
    bullets: [
      'Pilih PSU dengan daya cukup + sertifikasi efisiensi (80+ Bronze/Gold).',
      'Konektor utama: 24-pin ATX (motherboard), 8-pin EPS (CPU), 6+2 pin PCIe (GPU), SATA power.',
      'Selalu gunakan gelang anti-statis saat menyentuh komponen.',
    ],
  },
  {
    id: 'info_router',
    room: 'network_room',
    x: 30 + 9.75,
    y: 2 + 1.5,
    label: 'Router & Modem',
    title: 'Router',
    icon: 'router',
    text: 'Router menghubungkan jaringan yang berbeda (mis. LAN ke Internet) dan menentukan jalur terbaik paket berdasarkan IP Address (Layer 3).',
    bullets: [
      'Alamat LAN router biasanya menjadi Default Gateway bagi klien.',
      'Router rumahan umumnya juga menjalankan DHCP Server, NAT, dan firewall.',
      'Router ke switch menggunakan kabel Straight-Through.',
    ],
  },
  {
    id: 'info_ups',
    room: 'server_room',
    x: 2 + 1.6,
    y: 18 + 1.6,
    label: 'UPS Server',
    title: 'Uninterruptible Power Supply',
    icon: 'power',
    text: 'UPS menyediakan daya cadangan dari baterai ketika listrik padam sehingga server bisa dimatikan dengan aman.',
    bullets: [
      'Server room membutuhkan pendingin (AC presisi) agar suhu stabil 18–27°C.',
      'Rak server diukur dalam satuan U (1U = 1,75 inci).',
      'Gunakan label kabel dan dokumentasi agar mudah ditelusuri.',
    ],
  },
  {
    id: 'info_os',
    room: 'software_room',
    x: 16 + 10,
    y: 18 + 1.6,
    label: 'Rak Installer OS',
    title: 'Media Instalasi & Lisensi',
    icon: 'disc',
    text: 'Teknisi software menyiapkan media instalasi (USB bootable) untuk instalasi ulang atau perbaikan sistem operasi.',
    bullets: [
      'Selalu backup data pengguna sebelum melakukan instalasi ulang.',
      'Gunakan driver resmi dari situs produsen perangkat.',
      'Catat lisensi dan versi software pada dokumen inventaris.',
    ],
  },
  {
    id: 'info_printer',
    room: 'helpdesk_office',
    x: 30 + 10.5,
    y: 18 + 1.7,
    label: 'Printer Kantor',
    title: 'Printer Jaringan',
    icon: 'printer',
    text: 'Printer jaringan dibagikan ke banyak pengguna melalui IP Address statis atau print server.',
    bullets: [
      'Masalah umum: offline, kertas macet (paper jam), antrean cetak macet (spooler).',
      'Restart layanan Print Spooler untuk membersihkan antrean yang tersangkut.',
      'Pastikan driver printer sesuai dengan versi sistem operasi.',
    ],
  },
  {
    id: 'npc_staff',
    room: 'helpdesk_office',
    x: 30 + 2.4,
    y: 18 + 6.9,
    label: 'Bicara dengan Staf',
    title: 'Staf Keuangan',
    icon: 'user',
    text: '"Halo teknisi! Banyak laporan masuk hari ini — PC saya mati, printer tidak terdeteksi, bahkan ada yang kena blue screen. Tolong cek antrean tiket di meja Helpdesk ya!"',
    bullets: ['Tip: Helpdesk selalu memulai dari pemeriksaan paling sederhana — daya, kabel, dan koneksi fisik.'],
  },
  {
    id: 'npc_corridor',
    room: 'corridor',
    x: 2 + 20.35,
    y: 12 + 2.95,
    label: 'Bicara dengan Supervisor',
    title: 'Supervisor IT — Bu Rina',
    icon: 'user',
    text: '"Selamat datang di gedung IT Support! Ada 6 ruangan yang butuh bantuanmu. Ikuti penanda misi yang bersinar, dan cek mini map di pojok kanan atas. Semangat!"',
    bullets: [
      'Ruangan atas: IT Laboratory, Hardware Workshop, Network Control Room.',
      'Ruangan bawah: Server Room, Software Support Room, Helpdesk Office.',
      'Tekan E (atau tombol aksi di HP) di dekat objek bersinar untuk berinteraksi.',
    ],
  },
];

buildGrid();
buildFurniture();

export function roomAt(tx: number, ty: number): RoomId | null {
  for (const r of ROOMS) {
    if (r.id === 'corridor') continue;
    const b = r.bounds;
    if (tx >= b.x && tx < b.x + b.w && ty >= b.y && ty < b.y + b.h) return r.id;
  }
  const c = ROOMS.find((r) => r.id === 'corridor')!.bounds;
  if (tx >= c.x && tx < c.x + c.w && ty >= c.y - 1 && ty < c.y + c.h + 1) return 'corridor';
  return null;
}

export const SPAWN = { x: 18.5 * TILE, y: 15 * TILE };
