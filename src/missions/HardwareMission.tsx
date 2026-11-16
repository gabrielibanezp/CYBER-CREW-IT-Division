import { useEffect, useState } from 'react';
import { MissionProps } from './types';
import { startDrag } from './dnd';
import { audio } from '../audio/audio';
import { Icon } from '../ui/Icon';

interface PartDef {
  id: string;
  name: string;
  slotLabel: string;
  desc: string;
  requires?: string;
}

const PARTS: PartDef[] = [
  {
    id: 'cpu',
    name: 'Processor (CPU)',
    slotLabel: 'Socket LGA 1700',
    desc: 'Otak komputer yang mengeksekusi instruksi program. Dipasang pada socket LGA.',
  },
  {
    id: 'heatsink',
    name: 'Heatsink & Cooling Fan',
    slotLabel: 'CPU Cooler Mount (di atas CPU)',
    desc: 'Menyerap dan membuang panas dari CPU. Wajib dipasang setelah CPU terpasang.',
    requires: 'cpu',
  },
  {
    id: 'ram',
    name: 'RAM DDR4 (2×8 GB)',
    slotLabel: 'Slot DIMM DDR4',
    desc: 'Memori kerja berkecepatan tinggi untuk menyimpan data sementara saat sistem aktif.',
  },
  {
    id: 'ssd',
    name: 'SSD M.2 NVMe 1TB',
    slotLabel: 'Slot M.2 NVMe',
    desc: 'Penyimpanan utama berkecepatan tinggi untuk sistem operasi dan aplikasi.',
  },
  {
    id: 'gpu',
    name: 'Graphics Card (GPU)',
    slotLabel: 'Slot PCIe x16',
    desc: 'Kartu pengolah grafis yang dipasang pada jalur ekspansi PCI Express x16.',
  },
  {
    id: 'psu',
    name: 'Power Supply (24-Pin ATX)',
    slotLabel: 'Konektor 24-Pin ATX & PSU Bay',
    desc: 'Menyuplai daya DC stabil ke motherboard dan seluruh komponen komputer.',
  },
];

function PartIllustration({ id, small }: { id: string; small?: boolean }) {
  const s = small ? 0.78 : 1;
  switch (id) {
    case 'cpu':
      return (
        <svg viewBox="0 0 80 80" width={64 * s} height={64 * s}>
          <rect x="8" y="8" width="64" height="64" rx="6" fill="#15803d" stroke="#22c55e" strokeWidth="2.5" />
          <polygon points="10,66 10,70 14,70" fill="#facc15" />
          <rect x="18" y="18" width="44" height="44" rx="4" fill="#cbd5e1" stroke="#64748b" strokeWidth="2" />
          <text x="40" y="38" textAnchor="middle" fontSize="9" fontWeight="800" fill="#1e293b">CORE i7</text>
          <text x="40" y="50" textAnchor="middle" fontSize="7" fontWeight="600" fill="#475569">LGA1700</text>
        </svg>
      );
    case 'heatsink':
      return (
        <svg viewBox="0 0 80 80" width={64 * s} height={64 * s}>
          <rect x="8" y="8" width="64" height="64" rx="10" fill="#334155" stroke="#94a3b8" strokeWidth="2.5" />
          {[14, 20, 26, 54, 60, 66].map((x) => (
            <line key={x} x1={x} y1="10" x2={x} y2="70" stroke="#64748b" strokeWidth="1.5" />
          ))}
          <circle cx="40" cy="40" r="24" fill="#0f172a" stroke="#22d3ee" strokeWidth="2" />
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <ellipse
              key={a}
              cx="40"
              cy="26"
              rx="5"
              ry="12"
              fill="#38bdf8"
              opacity="0.85"
              transform={`rotate(${a} 40 40)`}
            />
          ))}
          <circle cx="40" cy="40" r="6" fill="#e2e8f0" />
        </svg>
      );
    case 'ram':
      return (
        <svg viewBox="0 0 96 64" width={76 * s} height={54 * s}>
          {[10, 36].map((y, idx) => (
            <g key={idx}>
              <rect x="6" y={y} width="84" height="20" rx="3" fill="#065f46" stroke="#10b981" strokeWidth="2" />
              {[14, 26, 38, 50, 62, 74].map((x) => (
                <rect key={x} x={x} y={y + 3} width="8" height="10" rx="1" fill="#111827" />
              ))}
              <rect x="10" y={y + 15} width="76" height="4" fill="#facc15" />
              <rect x="44" y={y + 15} width="4" height="5" fill="#0b1530" />
            </g>
          ))}
        </svg>
      );
    case 'ssd':
      return (
        <svg viewBox="0 0 96 54" width={76 * s} height={46 * s}>
          <rect x="8" y="12" width="80" height="30" rx="4" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
          <rect x="8" y="18" width="6" height="18" fill="#facc15" />
          <rect x="20" y="16" width="22" height="22" rx="2" fill="#0f172a" stroke="#475569" />
          <rect x="46" y="16" width="32" height="22" rx="2" fill="#0284c7" />
          <text x="62" y="29" textAnchor="middle" fontSize="8" fontWeight="800" fill="#fff">NVMe</text>
          <circle cx="84" cy="27" r="3" fill="#0b1530" stroke="#facc15" strokeWidth="1.5" />
        </svg>
      );
    case 'gpu':
      return (
        <svg viewBox="0 0 110 64" width={86 * s} height={52 * s}>
          <rect x="8" y="8" width="96" height="44" rx="6" fill="#1e1b4b" stroke="#fb923c" strokeWidth="2.5" />
          <rect x="4" y="6" width="6" height="48" rx="2" fill="#94a3b8" />
          <circle cx="38" cy="30" r="15" fill="#0f172a" stroke="#fb923c" strokeWidth="1.8" />
          <circle cx="76" cy="30" r="15" fill="#0f172a" stroke="#fb923c" strokeWidth="1.8" />
          <circle cx="38" cy="30" r="5" fill="#fb923c" />
          <circle cx="76" cy="30" r="5" fill="#fb923c" />
          <rect x="22" y="52" width="54" height="5" fill="#facc15" />
        </svg>
      );
    case 'psu':
    default:
      return (
        <svg viewBox="0 0 96 64" width={76 * s} height={54 * s}>
          <rect x="6" y="8" width="64" height="48" rx="5" fill="#1f2937" stroke="#94a3b8" strokeWidth="2" />
          <circle cx="30" cy="32" r="16" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
          <circle cx="30" cy="32" r="9" fill="none" stroke="#475569" strokeWidth="1.2" />
          <rect x="52" y="16" width="12" height="14" rx="2" fill="#ef4444" />
          <text x="58" y="44" textAnchor="middle" fontSize="8" fontWeight="800" fill="#facc15">650W</text>
          <path d="M70 28 C82 28, 80 42, 88 42" stroke="#facc15" strokeWidth="4" fill="none" />
          <path d="M70 34 C82 34, 80 46, 88 46" stroke="#ef4444" strokeWidth="3" fill="none" />
          <rect x="84" y="34" width="8" height="18" rx="1" fill="#e2e8f0" />
        </svg>
      );
  }
}

export default function HardwareMission({ api }: MissionProps) {
  const [installed, setInstalled] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [shakeId, setShakeId] = useState<string | null>(null);
  const [wrongSlot, setWrongSlot] = useState<string | null>(null);
  const [postState, setPostState] = useState<'idle' | 'running' | 'passed'>('idle');
  const [postStep, setPostStep] = useState(0);

  useEffect(() => {
    const done = postState === 'passed' ? 7 : installed.length;
    const label =
      postState === 'passed'
        ? 'POST BIOS berhasil — semua komponen terdeteksi!'
        : installed.length < 6
          ? `Pasang komponen ke motherboard (${installed.length}/6)`
          : 'Semua komponen terpasang! Jalankan Pemeriksaan Akhir (POST BIOS).';
    api.progress(done, 7, label);
  }, [installed.length, postState]);

  const tryPlace = (partId: string, slotId: string | null) => {
    const part = PARTS.find((p) => p.id === partId);
    if (!part) return;
    if (!slotId || !slotId.startsWith('slot-')) return;
    const targetId = slotId.replace('slot-', '');

    if (targetId !== partId) {
      const targetPart = PARTS.find((p) => p.id === targetId);
      setShakeId(partId);
      setWrongSlot(targetId);
      setTimeout(() => {
        setShakeId(null);
        setWrongSlot(null);
      }, 650);
      api.mistake(
        `Slot tidak tepat! ${part.name} tidak dipasang di ${targetPart?.slotLabel ?? 'slot tersebut'}. Pasang pada ${part.slotLabel}.`,
      );
      return;
    }

    if (part.requires && !installed.includes(part.requires)) {
      setShakeId(partId);
      setTimeout(() => setShakeId(null), 650);
      api.mistake('Pasang Processor (CPU) terlebih dahulu ke Socket LGA sebelum memasang Heatsink & Fan di atasnya!');
      return;
    }

    if (!installed.includes(partId)) {
      setInstalled((prev) => [...prev, partId]);
      audio.play('snap');
      api.good(`${part.name} berhasil terpasang pada ${part.slotLabel}!`);
      setSelected(null);
    }
  };

  const handleSlotClick = (slotTargetId: string) => {
    if (selected) {
      tryPlace(selected, `slot-${slotTargetId}`);
    }
  };

  const runPost = () => {
    if (installed.length < PARTS.length || postState !== 'idle') return;
    setPostState('running');
    setPostStep(0);
    audio.play('power');
    let s = 0;
    const iv = setInterval(() => {
      s++;
      setPostStep(s);
      audio.play('beep');
      if (s >= 6) {
        clearInterval(iv);
        setTimeout(() => {
          setPostState('passed');
          audio.play('success');
          api.good('POST BIOS LULUS! Seluruh komponen terdeteksi normal dan suhu CPU stabil.');
        }, 400);
      }
    }, 360);
  };

  const cpuDone = installed.includes('cpu');
  const heatsinkDone = installed.includes('heatsink');
  const ramDone = installed.includes('ram');
  const ssdDone = installed.includes('ssd');
  const gpuDone = installed.includes('gpu');
  const psuDone = installed.includes('psu');

  return (
    <div className="sim hw">
      <div className="hw-layout">
        {/* Baki Komponen */}
        <div className="hw-tray">
          <div className="cab-panel-title">
            Baki Komponen PC <small>(seret ke slot motherboard — atau klik komponen lalu klik slot)</small>
          </div>
          <div className="hw-parts-grid">
            {PARTS.map((p) => {
              const isInstalled = installed.includes(p.id);
              const locked = p.requires && !installed.includes(p.requires);
              return (
                <div
                  key={p.id}
                  className={`hw-part-card ${isInstalled ? 'installed' : ''} ${selected === p.id ? 'selected' : ''} ${shakeId === p.id ? 'shake' : ''}`}
                  onPointerDown={(e) => {
                    if (isInstalled) return;
                    startDrag(e, {
                      payload: p.id,
                      onStart: () => audio.play('pick'),
                      onDrop: (dropId, payload) => tryPlace(payload, dropId),
                      onClick: () => {
                        setSelected(selected === p.id ? null : p.id);
                        audio.play('pick');
                      },
                    });
                  }}
                >
                  <div className="hw-part-img">
                    <PartIllustration id={p.id} small />
                    {isInstalled && <span className="hw-badge-ok">✓ Terpasang</span>}
                    {!isInstalled && locked && <span className="hw-badge-wait">Pasang CPU dulu</span>}
                  </div>
                  <div className="hw-part-info">
                    <b>{p.name}</b>
                    <span>Target: {p.slotLabel}</span>
                    <small>{p.desc}</small>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Papan Motherboard Interaktif */}
        <div className="hw-board-wrap">
          <div className="cab-panel-title">
            Motherboard ATX Workbench <small>({installed.length}/6 komponen terpasang)</small>
          </div>

          <div className={`mobo ${psuDone ? 'powered' : ''} ${postState === 'running' || postState === 'passed' ? 'running' : ''}`}>
            <div className="mobo-silk">SIJA-Z790 PRO ATX • REV 2.0</div>

            {/* I/O Shield */}
            <div className="mobo-io">
              <span>REAR I/O</span>
              <i />
              <i />
              <i />
            </div>

            {/* VRM Heatsink */}
            <div className="mobo-vrm">VRM HEATSINK</div>

            {/* SLOT 1 & 2: CPU + HEATSINK */}
            <div
              data-drop={cpuDone ? 'slot-heatsink' : 'slot-cpu'}
              onClick={() => handleSlotClick(cpuDone ? 'heatsink' : 'cpu')}
              className={`mobo-slot slot-cpu ${cpuDone ? 'filled' : ''} ${heatsinkDone ? 'cooled' : ''} ${wrongSlot === 'cpu' || wrongSlot === 'heatsink' ? 'wrong' : ''
                } ${selected === 'cpu' && !cpuDone ? 'awaiting' : ''} ${selected === 'heatsink' && cpuDone && !heatsinkDone ? 'awaiting' : ''}`}
            >
              <div className="slot-header">
                {!cpuDone ? '1. SOCKET LGA 1700 (CPU)' : !heatsinkDone ? '2. PASANG HEATSINK DI ATAS CPU' : 'CPU + COOLER READY'}
              </div>
              <div className="slot-visual">
                {!cpuDone && <div className="socket-pins" />}
                {cpuDone && !heatsinkDone && (
                  <div className="installed-cpu">
                    <PartIllustration id="cpu" small />
                    <small className="pulse-hint">+ Pasang Heatsink Fan di sini</small>
                  </div>
                )}
                {heatsinkDone && (
                  <div className={`installed-cooler ${postState !== 'idle' ? 'spin' : ''}`}>
                    <PartIllustration id="heatsink" small />
                  </div>
                )}
              </div>
            </div>

            {/* SLOT 3: RAM DIMM */}
            <div
              data-drop="slot-ram"
              onClick={() => handleSlotClick('ram')}
              className={`mobo-slot slot-ram ${ramDone ? 'filled' : ''} ${wrongSlot === 'ram' ? 'wrong' : ''} ${selected === 'ram' && !ramDone ? 'awaiting' : ''
                }`}
            >
              <div className="slot-header">SLOT DIMM DDR4 (A2/B2)</div>
              <div className="dimm-lanes">
                <div className={`dimm-bar ${ramDone ? 'populated' : ''}`} />
                <div className="dimm-bar" />
                <div className={`dimm-bar ${ramDone ? 'populated' : ''}`} />
                <div className="dimm-bar" />
              </div>
              {ramDone && <span className="slot-ok-tag">✓ 16GB Dual-Channel</span>}
            </div>

            {/* SLOT 4: ATX 24-PIN & PSU */}
            <div
              data-drop="slot-psu"
              onClick={() => handleSlotClick('psu')}
              className={`mobo-slot slot-psu ${psuDone ? 'filled' : ''} ${wrongSlot === 'psu' ? 'wrong' : ''} ${selected === 'psu' && !psuDone ? 'awaiting' : ''
                }`}
            >
              <div className="slot-header">24-PIN ATX & PSU</div>
              <div className="atx-pins">
                {Array.from({ length: 12 }).map((_, i) => (
                  <i key={i} className={psuDone ? 'live' : ''} />
                ))}
              </div>
              {psuDone && <span className="slot-ok-tag">✓ 650W 80+ Connected</span>}
            </div>

            {/* SLOT 5: M.2 NVMe SSD */}
            <div
              data-drop="slot-ssd"
              onClick={() => handleSlotClick('ssd')}
              className={`mobo-slot slot-ssd ${ssdDone ? 'filled' : ''} ${wrongSlot === 'ssd' ? 'wrong' : ''} ${selected === 'ssd' && !ssdDone ? 'awaiting' : ''
                }`}
            >
              <div className="slot-header">M.2_1 PCIe 4.0 x4 (SSD NVMe)</div>
              {ssdDone ? (
                <div className="ssd-mounted">
                  <PartIllustration id="ssd" small />
                </div>
              ) : (
                <div className="m2-outline">M.2 2280 Key-M Slot</div>
              )}
            </div>

            {/* SLOT 6: PCIe x16 GPU */}
            <div
              data-drop="slot-gpu"
              onClick={() => handleSlotClick('gpu')}
              className={`mobo-slot slot-gpu ${gpuDone ? 'filled' : ''} ${wrongSlot === 'gpu' ? 'wrong' : ''} ${selected === 'gpu' && !gpuDone ? 'awaiting' : ''
                }`}
            >
              <div className="slot-header">PCIEX16_1 (Graphics Card Slot)</div>
              {gpuDone ? (
                <div className="gpu-mounted">
                  <PartIllustration id="gpu" small />
                  <span className="slot-ok-tag">✓ RTX GPU Terkunci</span>
                </div>
              ) : (
                <div className="pcie-lane">
                  <div className="pcie-clip" />
                </div>
              )}
            </div>

            {/* Chipset */}
            <div className="mobo-chipset">
              <span>INTEL Z790</span>
              <small>CHIPSET</small>
            </div>
          </div>

          {/* Pemeriksaan Akhir / POST BIOS */}
          <div className="hw-footer">
            {installed.length < 6 && (
              <div className="sim-hint">
                <Icon name="info" size={14} color="#22d3ee" /> Petunjuk: Seret keenam komponen ke slot yang sesuai. Pastikan <b>CPU</b> dipasang sebelum <b>Heatsink Fan</b>.
              </div>
            )}

            {installed.length === 6 && postState === 'idle' && (
              <button className="btn btn-primary btn-lg pulse" onClick={runPost}>
                <Icon name="bolt" size={16} /> JALANKAN PEMERIKSAAN AKHIR (POST BIOS)
              </button>
            )}

            {(postState === 'running' || postState === 'passed') && (
              <div className="bios-screen">
                <div className="bios-header">SIJA UEFI BIOS UTILITY — POWER-ON SELF TEST (POST)</div>
                <ul className="bios-checks">
                  <li className={postStep >= 1 ? 'ok' : ''}>[OK] ATX 24-Pin & 8-Pin EPS Power Rail: 12.04V / 5.01V / 3.32V</li>
                  <li className={postStep >= 2 ? 'ok' : ''}>[OK] CPU Detected: Intel Core i7 (LGA1700) @ 4.90 GHz</li>
                  <li className={postStep >= 3 ? 'ok' : ''}>[OK] CPU Cooler RPM: 1480 RPM • CPU Temp: 36°C (Normal)</li>
                  <li className={postStep >= 4 ? 'ok' : ''}>[OK] Memory: 16384 MB DDR4-3200 Dual-Channel Active</li>
                  <li className={postStep >= 5 ? 'ok' : ''}>[OK] NVMe M.2_1: 1000 GB PCIe Gen4 SSD Ready</li>
                  <li className={postStep >= 6 ? 'ok' : ''}>[OK] VGA PCIe x16: Dedicated Graphics Adapter Initialized (1 Beep)</li>
                </ul>
                {postState === 'passed' && (
                  <div className="row between center-v mt-sm">
                    <span className="bios-pass">
                      <Icon name="check" size={15} color="#4ade80" /> SYSTEM POST PASSED — SIAP DIGUNAKAN
                    </span>
                    <button className="btn btn-success" onClick={() => api.complete()}>
                      Selesaikan Misi <Icon name="arrow-right" size={15} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

