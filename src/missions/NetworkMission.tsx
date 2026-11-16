import { useEffect, useState } from 'react';
import { MissionProps } from './types';
import { audio } from '../audio/audio';
import { Icon } from '../ui/Icon';

interface PcConfig {
  ip: string;
  mask: string;
  gateway: string;
  dns: string;
  saved: boolean;
}

type NodeId = 'router' | 'switch' | 'pc1' | 'pc2';

export default function NetworkMission({ api }: MissionProps) {
  const [links, setLinks] = useState<{ router_switch: boolean; switch_pc1: boolean; switch_pc2: boolean }>({
    router_switch: false,
    switch_pc1: false,
    switch_pc2: false,
  });
  const [cableTool, setCableTool] = useState<'straight' | 'cross'>('straight');
  const [fromNode, setFromNode] = useState<NodeId | null>(null);
  const [activePc, setActivePc] = useState<'pc1' | 'pc2'>('pc1');

  const [pc1, setPc1] = useState<PcConfig>({
    ip: '',
    mask: '255.255.255.0',
    gateway: '',
    dns: '8.8.8.8',
    saved: false,
  });
  const [pc2, setPc2] = useState<PcConfig>({
    ip: '',
    mask: '255.255.255.0',
    gateway: '',
    dns: '8.8.8.8',
    saved: false,
  });

  const [pingLogs, setPingLogs] = useState<string[]>([
    'SIJA Network Console v2.4 — Siap menjalankan diagnostik jaringan.',
  ]);
  const [pingPassed, setPingPassed] = useState(false);
  const [pinging, setPinging] = useState(false);

  const cableCount = Number(links.router_switch) + Number(links.switch_pc1) + Number(links.switch_pc2);
  const allCables = cableCount === 3;

  useEffect(() => {
    const done =
      (allCables ? 1 : 0) +
      (pc1.saved ? 1 : 0) +
      (pc2.saved ? 1 : 0) +
      (pingPassed ? 1 : 0);
    const label = !allCables
      ? `Hubungkan kabel jaringan (${cableCount}/3 link)`
      : !pc1.saved || !pc2.saved
        ? 'Atur IP Address, Subnet Mask, Gateway & DNS pada PC 1 dan PC 2'
        : !pingPassed
          ? 'Jalankan Simulasi Ping untuk memverifikasi koneksi'
          : 'Seluruh komputer terhubung ke jaringan!';
    api.progress(done, 4, label);
  }, [allCables, cableCount, pc1.saved, pc2.saved, pingPassed]);

  const handleNodeClick = (n: NodeId) => {
    audio.play('click');
    if (n === 'pc1' || n === 'pc2') setActivePc(n);

    if (!fromNode) {
      setFromNode(n);
      return;
    }
    if (fromNode === n) {
      setFromNode(null);
      return;
    }

    if (cableTool === 'cross') {
      setFromNode(null);
      api.mistake('Kabel Crossover digunakan untuk perangkat sejenis. Untuk menghubungkan Router ↔ Switch dan Switch ↔ PC, gunakan kabel Straight-Through!');
      return;
    }

    const pair = [fromNode, n].sort().join('_');
    setFromNode(null);

    if (pair === 'router_switch') {
      setLinks((l) => ({ ...l, router_switch: true }));
      audio.play('snap');
      api.good('Kabel UTP Straight terhubung: Router (192.168.1.1) ↔ Switch.');
    } else if (pair === 'pc1_switch') {
      setLinks((l) => ({ ...l, switch_pc1: true }));
      audio.play('snap');
      api.good('Kabel UTP Straight terhubung: Switch ↔ PC 1.');
    } else if (pair === 'pc2_switch') {
      setLinks((l) => ({ ...l, switch_pc2: true }));
      audio.play('snap');
      api.good('Kabel UTP Straight terhubung: Switch ↔ PC 2.');
    } else {
      api.mistake('Topologi Star LAN: Hubungkan Router ke Switch, serta masing-masing PC ke Switch (bukan langsung PC ke Router atau PC ke PC).');
    }
  };

  const validatePc = (which: 'pc1' | 'pc2', cfg: PcConfig, other: PcConfig): string | null => {
    const expectedIp = which === 'pc1' ? '192.168.1.2' : '192.168.1.3';
    const ip = cfg.ip.trim();
    const mask = cfg.mask.trim();
    const gw = cfg.gateway.trim();
    const dns = cfg.dns.trim();

    if (!ip || !mask || !gw || !dns) {
      return `Form konfigurasi ${which.toUpperCase()} belum lengkap. Isi IP Address, Subnet Mask, Default Gateway, dan DNS!`;
    }
    if (ip === '192.168.1.1') {
      return `IP Conflict! 192.168.1.1 sudah digunakan oleh Router (Default Gateway).`;
    }
    if (other.ip.trim() && ip === other.ip.trim()) {
      return `IP Address Conflict! ${ip} sudah dipakai oleh komputer lain di jaringan yang sama.`;
    }
    if (!ip.startsWith('192.168.1.')) {
      return `Network ID tidak sesuai! IP ${ip} berada di luar jaringan 192.168.1.0/24.`;
    }
    if (ip !== expectedIp) {
      return `Sesuai dokumen topologi ruang kontrol, ${which === 'pc1' ? 'PC 1 wajib memakai IP 192.168.1.2' : 'PC 2 wajib memakai IP 192.168.1.3'}.`;
    }
    if (mask !== '255.255.255.0') {
      return `Subnet Mask salah (${mask}). Untuk jaringan /24 gunakan 255.255.255.0.`;
    }
    if (gw !== '192.168.1.1') {
      return `Default Gateway salah (${gw}). Arahkan ke IP Router: 192.168.1.1.`;
    }
    return null;
  };

  const savePcConfig = (which: 'pc1' | 'pc2') => {
    const cfg = which === 'pc1' ? pc1 : pc2;
    const other = which === 'pc1' ? pc2 : pc1;
    const err = validatePc(which, cfg, other);
    if (err) {
      api.mistake(err);
      setPingLogs((l) => [...l, `[ERROR ${which.toUpperCase()}] ${err}`]);
      return;
    }
    if (which === 'pc1') setPc1({ ...pc1, saved: true });
    else setPc2({ ...pc2, saved: true });
    audio.play('success');
    api.good(`Konfigurasi IPv4 ${which.toUpperCase()} (${cfg.ip.trim()}) tersimpan dan aktif!`);
    setPingLogs((l) => [...l, `[OK] ${which.toUpperCase()} interface eth0 configured: ${cfg.ip.trim()}/24 gw ${cfg.gateway.trim()}`]);
  };

  const runPing = () => {
    if (pinging) return;
    audio.play('click');

    if (!allCables) {
      const missing: string[] = [];
      if (!links.router_switch) missing.push('Router ↔ Switch');
      if (!links.switch_pc1) missing.push('Switch ↔ PC 1');
      if (!links.switch_pc2) missing.push('Switch ↔ PC 2');
      const msg = `PING GAGAL (Media Disconnected): Kabel belum terpasang pada ${missing.join(', ')}.`;
      setPingLogs((l) => [...l, `> ping 192.168.1.1`, msg]);
      api.mistake(msg);
      return;
    }

    const err1 = validatePc('pc1', pc1, pc2);
    if (err1) {
      setPingLogs((l) => [...l, `> [PC 1] ping 192.168.1.1`, `Request timed out. Penyebab: ${err1}`]);
      api.mistake(err1);
      return;
    }
    const err2 = validatePc('pc2', pc2, pc1);
    if (err2) {
      setPingLogs((l) => [...l, `> [PC 2] ping 192.168.1.1`, `Request timed out. Penyebab: ${err2}`]);
      api.mistake(err2);
      return;
    }

    setPc1((p) => ({ ...p, saved: true }));
    setPc2((p) => ({ ...p, saved: true }));
    setPinging(true);
    const lines = [
      `> [PC 1: 192.168.1.2] ping 192.168.1.1 (Gateway Router)`,
      `Reply from 192.168.1.1: bytes=32 time=1ms TTL=64`,
      `> [PC 1: 192.168.1.2] ping 192.168.1.3 (PC 2)`,
      `Reply from 192.168.1.3: bytes=32 time<1ms TTL=128`,
      `> [PC 2: 192.168.1.3] ping 8.8.8.8 (DNS Reachability via Gateway)`,
      `Reply from 8.8.8.8: bytes=32 time=14ms TTL=57 — 0% packet loss!`,
    ];
    let idx = 0;
    const iv = setInterval(() => {
      setPingLogs((l) => [...l, lines[idx]]);
      audio.play('beep');
      idx++;
      if (idx >= lines.length) {
        clearInterval(iv);
        setPinging(false);
        setPingPassed(true);
        audio.play('success');
        api.good('Uji PING berhasil! Seluruh perangkat terhubung tanpa packet loss.');
      }
    }, 340);
  };

  const cur = activePc === 'pc1' ? pc1 : pc2;
  const setCur = (patch: Partial<PcConfig>) => {
    if (activePc === 'pc1') setPc1({ ...pc1, ...patch, saved: false });
    else setPc2({ ...pc2, ...patch, saved: false });
  };

  return (
    <div className="sim net">
      <div className="net-grid">
        {/* Kiri: Topologi & Pengkabelan */}
        <div className="net-topo-card">
          <div className="row between center-v">
            <div className="cab-panel-title">
              1. Topologi & Pengkabelan Jaringan <small>({cableCount}/3 kabel terhubung)</small>
            </div>
            <div className="cable-selector">
              <button
                className={`btn btn-sm ${cableTool === 'straight' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setCableTool('straight')}
              >
                <Icon name="cable" size={14} /> Kabel Straight
              </button>
              <button
                className={`btn btn-sm ${cableTool === 'cross' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setCableTool('cross')}
              >
                <Icon name="switch" size={14} /> Kabel Crossover
              </button>
            </div>
          </div>

          <p className="sim-sub">
            Klik 2 perangkat secara berurutan untuk memasang kabel, atau gunakan tombol pasang cepat di bawah peta topologi.
          </p>

          <div className="topo-canvas">
            <svg className="topo-lines" viewBox="0 0 500 250" preserveAspectRatio="none">
              {/* Router -> Switch */}
              <line
                x1="250"
                y1="48"
                x2="250"
                y2="125"
                stroke={links.router_switch ? '#22c55e' : '#334155'}
                strokeWidth={links.router_switch ? 5 : 3}
                strokeDasharray={links.router_switch ? undefined : '6 6'}
              />
              {/* Switch -> PC1 */}
              <line
                x1="250"
                y1="130"
                x2="115"
                y2="205"
                stroke={links.switch_pc1 ? '#22c55e' : '#334155'}
                strokeWidth={links.switch_pc1 ? 5 : 3}
                strokeDasharray={links.switch_pc1 ? undefined : '6 6'}
              />
              {/* Switch -> PC2 */}
              <line
                x1="250"
                y1="130"
                x2="385"
                y2="205"
                stroke={links.switch_pc2 ? '#22c55e' : '#334155'}
                strokeWidth={links.switch_pc2 ? 5 : 3}
                strokeDasharray={links.switch_pc2 ? undefined : '6 6'}
              />
            </svg>

            <button
              className={`topo-node node-router ${fromNode === 'router' ? 'selected' : ''} ${links.router_switch ? 'linked' : ''}`}
              onClick={() => handleNodeClick('router')}
            >
              <span className="node-ico">
                <Icon name="router" size={20} color="#22d3ee" />
              </span>
              <b>Router Gateway</b>
              <small>192.168.1.1 /24</small>
            </button>

            <button
              className={`topo-node node-switch ${fromNode === 'switch' ? 'selected' : ''} ${allCables ? 'linked' : ''}`}
              onClick={() => handleNodeClick('switch')}
            >
              <span className="node-ico">
                <Icon name="switch" size={20} color="#38bdf8" />
              </span>
              <b>Switch 8-Port</b>
              <small>Layer 2 LAN Switch</small>
            </button>

            <button
              className={`topo-node node-pc1 ${fromNode === 'pc1' ? 'selected' : ''} ${activePc === 'pc1' ? 'editing' : ''} ${pc1.saved && links.switch_pc1 ? 'linked' : ''
                }`}
              onClick={() => handleNodeClick('pc1')}
            >
              <span className="node-ico">
                <Icon name="pc" size={20} color="#34d399" />
              </span>
              <b>PC 1 {pc1.saved ? '✓' : ''}</b>
              <small>{pc1.ip || 'Target: 192.168.1.2'}</small>
            </button>

            <button
              className={`topo-node node-pc2 ${fromNode === 'pc2' ? 'selected' : ''} ${activePc === 'pc2' ? 'editing' : ''} ${pc2.saved && links.switch_pc2 ? 'linked' : ''
                }`}
              onClick={() => handleNodeClick('pc2')}
            >
              <span className="node-ico">
                <Icon name="pc" size={20} color="#34d399" />
              </span>
              <b>PC 2 {pc2.saved ? '✓' : ''}</b>
              <small>{pc2.ip || 'Target: 192.168.1.3'}</small>
            </button>
          </div>

          <div className="quick-links">
            <button
              className={`btn btn-sm ${links.router_switch ? 'btn-success' : 'btn-ghost'}`}
              onClick={() => {
                if (cableTool === 'cross') {
                  api.mistake('Router ke Switch menggunakan kabel Straight-Through!');
                  return;
                }
                setLinks((l) => ({ ...l, router_switch: true }));
                audio.play('snap');
              }}
            >
              <Icon name={links.router_switch ? 'check' : 'cable'} size={14} /> Router ↔ Switch
            </button>
            <button
              className={`btn btn-sm ${links.switch_pc1 ? 'btn-success' : 'btn-ghost'}`}
              onClick={() => {
                if (cableTool === 'cross') {
                  api.mistake('Switch ke PC 1 menggunakan kabel Straight-Through!');
                  return;
                }
                setLinks((l) => ({ ...l, switch_pc1: true }));
                audio.play('snap');
              }}
            >
              <Icon name={links.switch_pc1 ? 'check' : 'cable'} size={14} /> Switch ↔ PC 1
            </button>
            <button
              className={`btn btn-sm ${links.switch_pc2 ? 'btn-success' : 'btn-ghost'}`}
              onClick={() => {
                if (cableTool === 'cross') {
                  api.mistake('Switch ke PC 2 menggunakan kabel Straight-Through!');
                  return;
                }
                setLinks((l) => ({ ...l, switch_pc2: true }));
                audio.play('snap');
              }}
            >
              <Icon name={links.switch_pc2 ? 'check' : 'cable'} size={14} /> Switch ↔ PC 2
            </button>
          </div>
        </div>

        {/* Kanan: Konfigurasi IP + Terminal Ping */}
        <div className="net-config-col">
          <div className="net-form-card">
            <div className="row between center-v">
              <div className="cab-panel-title">2. Konfigurasi IPv4 Workstation</div>
              <div className="pc-tabs">
                <button
                  className={`pc-tab ${activePc === 'pc1' ? 'active' : ''} ${pc1.saved ? 'done' : ''}`}
                  onClick={() => {
                    setActivePc('pc1');
                    audio.play('click');
                  }}
                >
                  <Icon name="pc" size={13} /> PC 1 {pc1.saved ? '✓' : ''}
                </button>
                <button
                  className={`pc-tab ${activePc === 'pc2' ? 'active' : ''} ${pc2.saved ? 'done' : ''}`}
                  onClick={() => {
                    setActivePc('pc2');
                    audio.play('click');
                  }}
                >
                  <Icon name="pc" size={13} /> PC 2 {pc2.saved ? '✓' : ''}
                </button>
              </div>
            </div>

            <div className="net-ref-bar">
              <span>
                <Icon name="info" size={13} color="#22d3ee" /> Dokumen Jaringan:
              </span>
              <code>Router: 192.168.1.1</code>
              <code>PC 1: 192.168.1.2</code>
              <code>PC 2: 192.168.1.3</code>
              <code>Mask: 255.255.255.0</code>
            </div>

            <div className="ip-form">
              <label>
                <span>IP Address ({activePc === 'pc1' ? 'PC 1' : 'PC 2'})</span>
                <input
                  type="text"
                  placeholder={activePc === 'pc1' ? 'Contoh: 192.168.1.2' : 'Contoh: 192.168.1.3'}
                  value={cur.ip}
                  onChange={(e) => setCur({ ip: e.target.value })}
                />
              </label>
              <label>
                <span>Subnet Mask</span>
                <input
                  type="text"
                  placeholder="255.255.255.0"
                  value={cur.mask}
                  onChange={(e) => setCur({ mask: e.target.value })}
                />
              </label>
              <label>
                <span>Default Gateway</span>
                <input
                  type="text"
                  placeholder="192.168.1.1"
                  value={cur.gateway}
                  onChange={(e) => setCur({ gateway: e.target.value })}
                />
              </label>
              <label>
                <span>Preferred DNS Server</span>
                <input
                  type="text"
                  placeholder="8.8.8.8 atau 192.168.1.1"
                  value={cur.dns}
                  onChange={(e) => setCur({ dns: e.target.value })}
                />
              </label>
            </div>

            <div className="row between center-v mt-sm">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  const targetIp = activePc === 'pc1' ? '192.168.1.2' : '192.168.1.3';
                  setCur({ ip: targetIp, mask: '255.255.255.0', gateway: '192.168.1.1', dns: '8.8.8.8' });
                  audio.play('type');
                }}
              >
                <Icon name="bolt" size={13} /> Isi Sesuai Topologi
              </button>
              <button className="btn btn-primary" onClick={() => savePcConfig(activePc)}>
                <Icon name="save" size={14} /> Terapkan Konfigurasi {activePc.toUpperCase()}
              </button>
            </div>
          </div>

          {/* Terminal Ping */}
          <div className="net-ping-card">
            <div className="row between center-v">
              <div className="cab-panel-title">3. Simulasi Uji Konektivitas (PING)</div>
              <button className="btn btn-primary btn-sm" onClick={runPing} disabled={pinging}>
                <Icon name="terminal" size={14} /> {pinging ? 'Menguji Ping…' : 'Jalankan Uji PING'}
              </button>
            </div>
            <div className="terminal-box">
              {pingLogs.map((line, i) => (
                <div
                  key={i}
                  className={
                    line.includes('ERROR') || line.includes('GAGAL') || line.includes('timed out')
                      ? 'term-err'
                      : line.includes('Reply from') || line.includes('[OK]')
                        ? 'term-ok'
                        : 'term-cmd'
                  }
                >
                  {line}
                </div>
              ))}
            </div>

            {pingPassed && (
              <div className="row between center-v mt-sm">
                <span className="bios-pass">
                  <Icon name="check" size={15} color="#4ade80" /> JARINGAN TERHUBUNG (0% PACKET LOSS)
                </span>
                <button className="btn btn-success" onClick={() => api.complete()}>
                  Selesaikan Misi <Icon name="arrow-right" size={15} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

