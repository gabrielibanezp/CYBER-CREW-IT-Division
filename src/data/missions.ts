export type MissionId =
  | 'cable_assembly'
  | 'hardware_assembly'
  | 'network_config'
  | 'server_config'
  | 'software_troubleshoot'
  | 'helpdesk_ticket';

export type RoomId =
  | 'it_lab'
  | 'hardware_workshop'
  | 'network_room'
  | 'server_room'
  | 'software_room'
  | 'helpdesk_office'
  | 'corridor';

export interface MissionDef {
  id: MissionId;
  number: number;
  title: string;
  subtitle: string;
  roomId: RoomId;
  roomName: string;
  difficulty: 'Mudah' | 'Menengah' | 'Lanjutan';
  xpReward: number;
  icon: string;
  color: string;
  problemDescription: string;
  instructions: string[];
  learningTitle: string;
  learningSummary: string;
  learningBullets: string[];
  badgeId: string;
  stationTile: { x: number; y: number };
  stationLabel: string;
}

export interface RoomDef {
  id: RoomId;
  name: string;
  subtitle: string;
  color: string;
  accent: string;
  floorTint: number;
  bounds: { x: number; y: number; w: number; h: number }; // in tiles
  missionId?: MissionId;
}

export const ROOMS: RoomDef[] = [
  {
    id: 'it_lab',
    name: 'IT Laboratory',
    subtitle: 'Praktik Pengkabelan & Perangkat Jaringan',
    color: '#22d3ee',
    accent: '#0891b2',
    floorTint: 0x16324f,
    bounds: { x: 2, y: 2, w: 12, h: 10 },
    missionId: 'cable_assembly',
  },
  {
    id: 'hardware_workshop',
    name: 'Hardware Workshop',
    subtitle: 'Perakitan & Perbaikan Komponen PC',
    color: '#fb923c',
    accent: '#ea580c',
    floorTint: 0x2c2438,
    bounds: { x: 16, y: 2, w: 12, h: 10 },
    missionId: 'hardware_assembly',
  },
  {
    id: 'network_room',
    name: 'Network Control Room',
    subtitle: 'Topologi, IP Address & Routing LAN',
    color: '#38bdf8',
    accent: '#0284c7',
    floorTint: 0x152b44,
    bounds: { x: 30, y: 2, w: 12, h: 10 },
    missionId: 'network_config',
  },
  {
    id: 'server_room',
    name: 'Server Room',
    subtitle: 'Data Center, Layanan & Firewall Server',
    color: '#a78bfa',
    accent: '#7c3aed',
    floorTint: 0x1d1f3a,
    bounds: { x: 2, y: 18, w: 12, h: 10 },
    missionId: 'server_config',
  },
  {
    id: 'software_room',
    name: 'Software Support Room',
    subtitle: 'Troubleshooting OS, Driver & Storage',
    color: '#34d399',
    accent: '#059669',
    floorTint: 0x153532,
    bounds: { x: 16, y: 18, w: 12, h: 10 },
    missionId: 'software_troubleshoot',
  },
  {
    id: 'helpdesk_office',
    name: 'Helpdesk Office',
    subtitle: 'Pusat Tiket Laporan & Penanganan User',
    color: '#f472b6',
    accent: '#db2777',
    floorTint: 0x2c1e38,
    bounds: { x: 30, y: 18, w: 12, h: 10 },
    missionId: 'helpdesk_ticket',
  },
  {
    id: 'corridor',
    name: 'Main Tech Corridor',
    subtitle: 'Koridor Utama Gedung IT Support',
    color: '#94a3b8',
    accent: '#475569',
    floorTint: 0x1b263b,
    bounds: { x: 2, y: 12, w: 40, h: 6 },
  },
];

export const MISSIONS: MissionDef[] = [
  {
    id: 'cable_assembly',
    number: 1,
    title: 'Network Cable Assembly',
    subtitle: 'Pembuatan Kabel LAN Straight (T568B)',
    roomId: 'it_lab',
    roomName: 'IT Laboratory',
    difficulty: 'Mudah',
    xpReward: 200,
    icon: 'cable',
    color: '#22d3ee',
    stationTile: { x: 8, y: 6 },
    stationLabel: 'Meja Crimping RJ45',
    badgeId: 'cable_master',
    problemDescription:
      'Laboratorium membutuhkan kabel patch UTP Cat6 Straight-Through baru untuk menghubungkan PC workstation ke Switch ruang lab. Susun 8 inti kabel sesuai standar T568B dan lakukan crimping pada konektor RJ45!',
    instructions: [
      'Pilih standar pengkabelan T568B untuk kabel Straight-Through.',
      'Kupas jaket kabel UTP terlebih dahulu agar 8 helai kabel terlihat.',
      'Seret (drag & drop) atau klik setiap warna kabel ke slot Pin 1 hingga Pin 8 pada konektor RJ45.',
      'Periksa urutan warna. Jika sudah tepat, tekan tombol CRIMP RJ45 & UJI LAN TESTER.',
    ],
    learningTitle: 'Kabel UTP Straight-Through & Standar TIA/EIA-568B',
    learningSummary:
      'Kabel Straight-Through memiliki urutan pin yang identik pada kedua ujung konektor RJ45 (umumnya menggunakan standar T568B di kedua sisi). Kabel ini digunakan untuk menghubungkan dua perangkat yang berbeda layer/fungsi pada jaringan.',
    learningBullets: [
      'Urutan T568B (Pin 1–8): Putih-Orange, Orange, Putih-Hijau, Biru, Putih-Biru, Hijau, Putih-Cokelat, Cokelat.',
      'Pasangan Pin 1–2 (Orange) dan Pin 3 & 6 (Hijau) membawa sinyal Transmit (TX) dan Receive (RX) pada Fast Ethernet 100BASE-TX; Gigabit Ethernet 1000BASE-T memanfaatkan keempat pasang.',
      'Digunakan untuk: PC ↔ Switch, Switch ↔ Router, Router ↔ Modem, atau Server ↔ Switch.',
      'Kabel Crossover (T568A ke T568B) digunakan untuk perangkat sejenis (mis. PC ↔ PC lama tanpa Auto-MDI/MDIX).',
    ],
  },
  {
    id: 'hardware_assembly',
    number: 2,
    title: 'Computer Hardware Assembly',
    subtitle: 'Perakitan & Pemeriksaan Komponen Motherboard',
    roomId: 'hardware_workshop',
    roomName: 'Hardware Workshop',
    difficulty: 'Mudah',
    xpReward: 220,
    icon: 'cpu',
    color: '#fb923c',
    stationTile: { x: 22, y: 6 },
    stationLabel: 'Meja Rakit PC',
    badgeId: 'hardware_specialist',
    problemDescription:
      'Satu unit PC teknisi baru belum dirakit. Pasang seluruh komponen perangkat keras (CPU, Heatsink Fan, RAM DDR4, SSD NVMe M.2, GPU PCIe, dan konektor Power Supply ATX) ke slot yang tepat pada motherboard, lalu jalankan POST check!',
    instructions: [
      'Seret (drag & drop) setiap komponen dari baki komponen ke slot yang sesuai pada motherboard.',
      'Perhatikan petunjuk teknis: Heatsink dipasang setelah CPU terpasang di socket LGA.',
      'Jika salah slot, komponen akan kembali ke baki secara otomatis disertai petunjuk.',
      'Setelah ke-6 komponen terpasang, klik tombol JALANKAN PEMERIKSAAN AKHIR (POST BIOS).',
    ],
    learningTitle: 'Arsitektur Motherboard & Fungsi Komponen Inti PC',
    learningSummary:
      'Motherboard adalah papan sirkuit utama (PCB) yang mengintegrasikan jalur data, daya, dan komunikasi antar komponen komputer melalui chipset dan jalur bus (PCIe, SATA/NVMe, Memory Channel).',
    learningBullets: [
      'CPU (Central Processing Unit) dipasang pada socket LGA/AM dengan memperhatikan tanda segitiga emas (Golden Triangle) disusul Thermal Paste & Heatsink Fan untuk melepas panas.',
      'RAM DDR4/DDR5 dipasang pada slot DIMM (prioritaskan konfigurasi Dual-Channel A2 & B2).',
      'SSD M.2 NVMe menggunakan jalur PCIe berkecepatan tinggi langsung ke CPU/Chipset.',
      'GPU (Graphics Card) dipasang pada slot PCIe x16 paling atas agar mendapat bandwidth penuh.',
      'PSU (Power Supply Unit) menyuplai daya 24-pin ATX untuk motherboard dan 8-pin EPS untuk CPU.',
    ],
  },
  {
    id: 'network_config',
    number: 3,
    title: 'Network Configuration',
    subtitle: 'Topologi LAN, IP Addressing & Uji Ping',
    roomId: 'network_room',
    roomName: 'Network Control Room',
    difficulty: 'Menengah',
    xpReward: 250,
    icon: 'network',
    color: '#38bdf8',
    stationTile: { x: 36, y: 6 },
    stationLabel: 'Konsol Jaringan LAN',
    badgeId: 'network_expert',
    problemDescription:
      'Jaringan ruang kontrol belum terhubung. Pasang kabel UTP antara Router, Switch, PC 1, dan PC 2, kemudian atur alamat IPv4, Subnet Mask, Default Gateway, serta DNS setiap PC sesuai dokumen topologi, lalu verifikasi koneksi dengan perintah PING!',
    instructions: [
      'Tahap 1 – Pengkabelan: Hubungkan Router (192.168.1.1) ke Switch, lalu hubungkan PC 1 dan PC 2 ke Switch.',
      'Tahap 2 – Konfigurasi IP: Pilih PC 1 dan PC 2, lalu masukkan IP Address, Subnet Mask (255.255.255.0), Default Gateway (192.168.1.1), dan DNS.',
      'PC 1 wajib memakai IP 192.168.1.2 dan PC 2 wajib memakai IP 192.168.1.3.',
      'Tahap 3 – Simulasi Ping: Jalankan uji Ping dari terminal untuk memastikan seluruh node saling terhubung tanpa packet loss.',
    ],
    learningTitle: 'Pengalamatan IPv4, Subnet Mask /24 & Default Gateway',
    learningSummary:
      'Agar komputer dalam satu Local Area Network (LAN) dapat saling berkomunikasi dan mengakses jaringan luar, setiap host memerlukan IP Address unik dalam satu subnet yang sama serta alamat Default Gateway yang mengarah ke Router.',
    learningBullets: [
      'Subnet Mask 255.255.255.0 (/24) berarti 3 oktet pertama (192.168.1) adalah Network ID dan oktet terakhir (.1 s/d .254) adalah Host ID.',
      'IP Conflict terjadi apabila dua perangkat menggunakan alamat IP yang sama di jaringan yang sama.',
      'Default Gateway (192.168.1.1) adalah alamat IP antarmuka Router tempat paket dikirim ketika tujuan berada di luar jaringan lokal.',
      'Utilitas PING menggunakan protokol ICMP Echo Request & Echo Reply untuk menguji konektivitas layer 3.',
    ],
  },
  {
    id: 'server_config',
    number: 4,
    title: 'Server Configuration',
    subtitle: 'Setup Server Produksi, Layanan & Firewall',
    roomId: 'server_room',
    roomName: 'Server Room',
    difficulty: 'Menengah',
    xpReward: 260,
    icon: 'server',
    color: '#a78bfa',
    stationTile: { x: 8, y: 23 },
    stationLabel: 'Rak Server Utama',
    badgeId: 'server_admin',
    problemDescription:
      'Server utama perusahaan tidak dapat diakses oleh klien! Identifikasi peran server, atur Hostname dan IP statis server, aktifkan daemon layanan jaringan (HTTP, DNS, SSH), buka port Firewall yang terblokir, dan uji konektivitas dari komputer klien.',
    instructions: [
      'Identifikasi peran utama server internal perusahaan (Web & Internal DNS Server).',
      'Atur Hostname menjadi "srv-core-01", IP Static "192.168.1.10", Subnet "255.255.255.0", dan Gateway "192.168.1.1".',
      'Aktifkan layanan jaringan utama: Nginx HTTP (Port 80/443), CoreDNS (Port 53), dan OpenSSH (Port 22).',
      'Perbaiki masalah "Server Unreachable": buka blokir Port 80/443 pada Firewall Rule dan jalankan Health & Connectivity Check.',
    ],
    learningTitle: 'Administrasi Server, Daemon Service & Firewall Port',
    learningSummary:
      'Server produksi harus menggunakan IP Address statis agar selalu dapat ditemukan oleh klien dan DNS. Selain layanan (daemon) harus berstatus active/running, port TCP/UDP terkait juga harus diizinkan pada firewall.',
    learningBullets: [
      'Hostname standar memudahkan identifikasi server pada log dan DNS (mis. srv-core-01).',
      'Port penting: HTTP (TCP 80), HTTPS (TCP 443), DNS (UDP/TCP 53), SSH (TCP 22).',
      'Jika service sudah berjalan tetapi klien tetap "Connection Timed Out", penyebab paling umum adalah aturan Firewall (UFW/iptables) yang memblokir port inbound.',
    ],
  },
  {
    id: 'software_troubleshoot',
    number: 5,
    title: 'Software Troubleshooting',
    subtitle: 'Diagnostik & Perbaikan Masalah OS, Driver & Storage',
    roomId: 'software_room',
    roomName: 'Software Support Room',
    difficulty: 'Lanjutan',
    xpReward: 280,
    icon: 'wrench',
    color: '#34d399',
    stationTile: { x: 22, y: 23 },
    stationLabel: 'Workstation Diagnostik OS',
    badgeId: 'troubleshooting_master',
    problemDescription:
      'Tiga workstation mengalami insiden software serius: (1) Aplikasi Desain force-close & layar beresolusi rendah, (2) Partisi sistem C: penuh 99% dan PC hang karena proses runaway, serta (3) Sistem operasi gagal membuka aplikasi karena file sistem korup. Lakukan tahapan inspeksi, diagnosis, dan tindakan perbaikan langsung!',
    instructions: [
      'Selesaikan 3 kasus berurutan menggunakan peralatan diagnostik interaktif (Device Manager, Task Manager, Storage Analyzer, dan System Repair Terminal).',
      'Tahap tiap kasus: (1) Jalankan alat pemeriksaan untuk menemukan akar masalah → (2) Lakukan tindakan teknis interaktif → (3) Verifikasi sistem kembali normal.',
    ],
    learningTitle: 'Metodologi Troubleshooting Sistem Operasi & Aplikasi',
    learningSummary:
      'Troubleshooting software yang efektif mengikuti tahapan sistematis: Identifikasi gejala → Periksa log/status sistem (Device Manager, Task Manager, Disk Usage) → Isolasi penyebab → Terapkan perbaikan → Verifikasi.',
    learningBullets: [
      'Tanda seru kuning (!) pada Device Manager menandakan driver belum terinstal atau korup, membuat akselerasi hardware gagal.',
      'Partisi OS yang penuh (>95%) menghambat pembuatan Virtual Memory (Pagefile) dan cache sementara sehingga sistem melambat drastis.',
      'Perintah "sfc /scannow" (System File Checker) memindai dan memulihkan file sistem Windows yang rusak secara otomatis.',
    ],
  },
  {
    id: 'helpdesk_ticket',
    number: 6,
    title: 'Help Desk Ticket System',
    subtitle: 'Penanganan Tiket Insiden Pengguna Secara Langsung',
    roomId: 'helpdesk_office',
    roomName: 'Helpdesk Office',
    difficulty: 'Lanjutan',
    xpReward: 300,
    icon: 'headset',
    color: '#f472b6',
    stationTile: { x: 36, y: 23 },
    stationLabel: 'Meja Tiket Helpdesk',
    badgeId: 'helpdesk_hero',
    problemDescription:
      'Antrean Helpdesk menerima 5 tiket prioritas tinggi dari staf gedung: PC tidak mau menyala, internet tidak terhubung, printer tidak terdeteksi, Blue Screen of Death (BSOD), dan keyboard tidak berfungsi. Baca laporan, identifikasi penyebab, dan selesaikan melalui workbench simulasi!',
    instructions: [
      'Pilih setiap tiket yang berstatus OPEN pada antrean Helpdesk.',
      'Baca keluhan pengguna, periksa indikator perangkat pada panel simulasi, dan tentukan akar masalahnya.',
      'Lakukan tindakan perbaikan interaktif pada simulasi perangkat hingga status berubah menjadi RESOLVED.',
      'Selesaikan kelima tiket untuk menuntaskan misi Helpdesk Office!',
    ],
    learningTitle: 'Manajemen Tiket IT Helpdesk & SLA Troubleshooting',
    learningSummary:
      'IT Helpdesk merupakan garda terdepan (Tier 1/Tier 2) dalam menangani insiden pengguna. Teknisi harus memeriksa layer paling mendasar terlebih dahulu (fisik/daya/kabel) sebelum melangkah ke konfigurasi sistem.',
    learningBullets: [
      'Kasus PC Mati Total: Selalu periksa sumber listrik, kabel power AC, dan sakelar I/O pada PSU sebelum membongkar komponen dalam.',
      'Kasus Internet Terputus / DNS Error: Periksa status adaptor jaringan, pembaruan DHCP lease (ipconfig /renew), dan konfigurasi DNS.',
      'Kasus Printer Offline/Stuck: Pastikan kabel/koneksi aktif, nyalakan daya printer, dan bersihkan antrean cetak (Print Spooler) yang macet.',
      'Kasus BSOD (MEMORY_MANAGEMENT): Periksa modul RAM yang longgar/bermasalah serta kompatibilitas driver yang baru diinstal.',
      'Kasus Keyboard Mati: Periksa koneksi kabel/receiver USB, coba port USB lain, lalu uji input langsung.',
    ],
  },
];

export interface LevelDef {
  level: number;
  title: string;
  minXp: number;
  badge: string;
}

export const LEVELS: LevelDef[] = [
  { level: 1, title: 'IT Beginner', minXp: 0, badge: 'award' },
  { level: 2, title: 'Junior Technician', minXp: 200, badge: 'wrench' },
  { level: 3, title: 'Network Technician', minXp: 500, badge: 'network' },
  { level: 4, title: 'System Administrator', minXp: 900, badge: 'shield' },
  { level: 5, title: 'IT Support Expert', minXp: 1300, badge: 'crown' },
];

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_mission',
    title: 'First Mission',
    description: 'Menyelesaikan misi IT Support pertama.',
    icon: 'star',
    color: '#facc15',
  },
  {
    id: 'cable_master',
    title: 'Cable Master',
    description: 'Merakit kabel LAN RJ45 standar T568B dengan sempurna.',
    icon: 'cable',
    color: '#22d3ee',
  },
  {
    id: 'hardware_specialist',
    title: 'Hardware Specialist',
    description: 'Merakit seluruh komponen motherboard PC hingga lulus POST BIOS.',
    icon: 'cpu',
    color: '#fb923c',
  },
  {
    id: 'network_expert',
    title: 'Network Expert',
    description: 'Mengonfigurasi topologi LAN, IP Address, Gateway, dan uji Ping sukses.',
    icon: 'network',
    color: '#38bdf8',
  },
  {
    id: 'server_admin',
    title: 'Server Admin',
    description: 'Mengonfigurasi server, layanan, dan firewall hingga dapat diakses klien.',
    icon: 'server',
    color: '#a78bfa',
  },
  {
    id: 'helpdesk_hero',
    title: 'Helpdesk Hero',
    description: 'Menyelesaikan seluruh tiket laporan pengguna di Helpdesk Office.',
    icon: 'headset',
    color: '#f472b6',
  },
  {
    id: 'troubleshooting_master',
    title: 'Troubleshooting Master',
    description: 'Menyelesaikan kasus Server & Software Troubleshooting.',
    icon: 'wrench',
    color: '#34d399',
  },
  {
    id: 'it_support_champion',
    title: 'IT Support Champion',
    description: 'Menamatkan seluruh 6 misi IT Support di gedung teknologi!',
    icon: 'trophy',
    color: '#f472b6',
  },
];

export function getLevelForXp(xp: number): { current: LevelDef; next: LevelDef | null; progressPct: number } {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (xp >= lvl.minXp) current = lvl;
  }
  const idx = LEVELS.findIndex((l) => l.level === current.level);
  const next = idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
  if (!next) return { current, next: null, progressPct: 100 };
  const span = next.minXp - current.minXp;
  const into = xp - current.minXp;
  return { current, next, progressPct: Math.min(100, Math.max(0, Math.round((into / span) * 100))) };
}

