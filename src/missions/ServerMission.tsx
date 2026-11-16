import { useEffect, useState } from 'react';
import { MissionProps } from './types';
import { audio } from '../audio/audio';
import { Icon } from '../ui/Icon';

export default function ServerMission({ api }: MissionProps) {
  const [roleOk, setRoleOk] = useState(false);
  const [hostname, setHostname] = useState('');
  const [ip, setIp] = useState('');
  const [mask, setMask] = useState('255.255.255.0');
  const [gateway, setGateway] = useState('192.168.1.1');
  const [netSaved, setNetSaved] = useState(false);

  const [services, setServices] = useState({
    nginx: false,
    coredns: false,
    sshd: false,
  });

  const [firewallAllowHttp, setFirewallAllowHttp] = useState(false);
  const [diagLog, setDiagLog] = useState<string[]>([
    '[ALERT] Klien internal melaporkan: https://intranet.sija.local (192.168.1.10) tidak dapat diakses (Connection Refused / Timeout).',
  ]);
  const [verified, setVerified] = useState(false);

  const allServices = services.nginx && services.coredns && services.sshd;

  useEffect(() => {
    const done =
      (roleOk ? 1 : 0) +
      (netSaved ? 1 : 0) +
      (allServices ? 1 : 0) +
      (firewallAllowHttp ? 1 : 0) +
      (verified ? 1 : 0);
    const label = !roleOk
      ? 'Tahap 1: Identifikasi fungsi utama server produksi'
      : !netSaved
        ? 'Tahap 2: Atur Hostname (srv-core-01) & IP Statis (192.168.1.10)'
        : !allServices
          ? 'Tahap 3: Aktifkan daemon layanan jaringan (HTTP, DNS, SSH)'
          : !firewallAllowHttp
            ? 'Tahap 4: Buka blokir Port 80/443 pada Firewall Server'
            : !verified
              ? 'Tahap 5: Jalankan Pemeriksaan Konektivitas Server'
              : 'Server produksi online dan dapat diakses klien!';
    api.progress(done, 5, label);
  }, [roleOk, netSaved, allServices, firewallAllowHttp, verified]);

  const chooseRole = (choice: 'web_dns' | 'gaming' | 'print_only') => {
    if (choice === 'web_dns') {
      setRoleOk(true);
      audio.play('success');
      api.good('Tepat! Server ini bertugas sebagai Internal Web Portal & Core DNS Server gedung.');
    } else if (choice === 'gaming') {
      api.mistake('Bukan! Ini adalah rak server infrastruktur perusahaan, bukan mesin rendering game.');
    } else {
      api.mistake('Kurang tepat. Berdasarkan log insiden intranet.sija.local, server ini melayani HTTP/HTTPS dan resolusi nama DNS.');
    }
  };

  const saveServerNet = () => {
    const h = hostname.trim().toLowerCase();
    const ipClean = ip.trim();
    const maskClean = mask.trim();
    const gwClean = gateway.trim();

    if (h !== 'srv-core-01') {
      api.mistake('Hostname belum sesuai standar! Masukkan hostname: srv-core-01');
      return;
    }
    if (ipClean !== '192.168.1.10') {
      api.mistake('IP Server harus menggunakan IP statis 192.168.1.10 sesuai tabel inventaris server!');
      return;
    }
    if (maskClean !== '255.255.255.0' || gwClean !== '192.168.1.1') {
      api.mistake('Pastikan Subnet Mask 255.255.255.0 dan Default Gateway 192.168.1.1!');
      return;
    }
    setNetSaved(true);
    audio.play('success');
    api.good('Identitas srv-core-01 (192.168.1.10/24) berhasil diterapkan pada antarmuka eno1.');
    setDiagLog((l) => [...l, '[OK] hostnamectl set-hostname srv-core-01 • Static IP 192.168.1.10/24 active']);
  };

  const toggleService = (key: keyof typeof services, label: string) => {
    setServices((prev) => {
      const nextVal = !prev[key];
      const next = { ...prev, [key]: nextVal };
      audio.play(nextVal ? 'power' : 'click');
      setDiagLog((l) => [
        ...l,
        `[SYSTEMD] systemctl ${nextVal ? 'start' : 'stop'} ${key}.service → ${nextVal ? 'ACTIVE (running)' : 'INACTIVE'}`,
      ]);
      if (nextVal) api.good(`Layanan ${label} berhasil diaktifkan.`);
      return next;
    });
  };

  const runHealthCheck = () => {
    audio.play('click');
    if (!roleOk) {
      api.mistake('Identifikasi fungsi server terlebih dahulu pada panel Tahap 1.');
      return;
    }
    if (!netSaved) {
      api.mistake('Konfigurasi Hostname & IP Statis server belum disimpan!');
      setDiagLog((l) => [...l, '[FAIL] curl http://192.168.1.10 → Network Unreachable (IP belum dikonfigurasi)']);
      return;
    }
    if (!allServices) {
      api.mistake('Masih ada daemon layanan penting (Nginx HTTP / CoreDNS / OpenSSH) yang berstatus STOPPED.');
      setDiagLog((l) => [...l, '[FAIL] Connection Refused: Pastikan ketiga daemon service berstatus RUNNING.']);
      return;
    }
    if (!firewallAllowHttp) {
      api.mistake('Layanan sudah berjalan, tetapi koneksi masih TIMEOUT karena Firewall UFW memblokir Port 80/443 (DENY)!');
      setDiagLog((l) => [
        ...l,
        '[TIMEOUT] curl -I http://srv-core-01 (192.168.1.10:80) → Paket di-DROP oleh aturan Firewall Inbound!',
      ]);
      return;
    }

    setVerified(true);
    audio.play('success');
    api.good('Health Check 200 OK! Server srv-core-01 berhasil diakses oleh seluruh klien.');
    setDiagLog((l) => [
      ...l,
      '[PASS] nslookup srv-core-01.sija.local → 192.168.1.10 (CoreDNS Port 53 OK)',
      '[PASS] curl -I http://192.168.1.10 → HTTP/1.1 200 OK (Nginx Active, Firewall Allowed)',
      '[PASS] ssh admin@192.168.1.10 -p 22 → OpenSSH Banner Ready',
    ]);
  };

  return (
    <div className="sim srv">
      <div className="srv-grid">
        {/* Kiri: Rack Visual + Role + Hostname/IP */}
        <div className="srv-col">
          {/* Tahap 1: Identifikasi Fungsi Server */}
          <div className="srv-card">
            <div className="cab-panel-title">
              1. Identifikasi Fungsi Server {roleOk && <span className="tag-ok">✓ Selesai</span>}
            </div>
            <p className="sim-sub">
              Klien tidak bisa membuka portal internal <code>intranet.sija.local</code>. Apa fungsi utama rak server utama ini?
            </p>
            <div className="role-btns">
              <button
                className={`btn btn-sm ${roleOk ? 'btn-success' : 'btn-ghost'}`}
                onClick={() => chooseRole('web_dns')}
              >
                <Icon name="server" size={14} /> Web & Internal DNS Server
              </button>
              <button className="btn btn-sm btn-ghost" onClick={() => chooseRole('gaming')}>
                <Icon name="gamepad" size={14} /> Dedicated Game Rendering PC
              </button>
              <button className="btn btn-sm btn-ghost" onClick={() => chooseRole('print_only')}>
                <Icon name="printer" size={14} /> Local USB Printer Adapter
              </button>
            </div>
          </div>

          {/* Tahap 2: Hostname & IP Server */}
          <div className="srv-card">
            <div className="row between center-v">
              <div className="cab-panel-title">
                2. Konfigurasi Hostname & IP Statis {netSaved && <span className="tag-ok">✓ Aktif</span>}
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setHostname('srv-core-01');
                  setIp('192.168.1.10');
                  setMask('255.255.255.0');
                  setGateway('192.168.1.1');
                  setNetSaved(false);
                  audio.play('type');
                }}
              >
                <Icon name="bolt" size={13} /> Isi Sesuai Standar
              </button>
            </div>
            <div className="net-ref-bar">
              <code>Hostname: srv-core-01</code>
              <code>IP: 192.168.1.10</code>
              <code>Mask: 255.255.255.0</code>
              <code>GW: 192.168.1.1</code>
            </div>
            <div className="ip-form">
              <label>
                <span>Server Hostname</span>
                <input
                  type="text"
                  placeholder="srv-core-01"
                  value={hostname}
                  onChange={(e) => {
                    setHostname(e.target.value);
                    setNetSaved(false);
                  }}
                />
              </label>
              <label>
                <span>Static IPv4 Address</span>
                <input
                  type="text"
                  placeholder="192.168.1.10"
                  value={ip}
                  onChange={(e) => {
                    setIp(e.target.value);
                    setNetSaved(false);
                  }}
                />
              </label>
              <label>
                <span>Subnet Mask</span>
                <input
                  type="text"
                  value={mask}
                  onChange={(e) => {
                    setMask(e.target.value);
                    setNetSaved(false);
                  }}
                />
              </label>
              <label>
                <span>Default Gateway</span>
                <input
                  type="text"
                  value={gateway}
                  onChange={(e) => {
                    setGateway(e.target.value);
                    setNetSaved(false);
                  }}
                />
              </label>
            </div>
            <button className="btn btn-primary mt-sm" onClick={saveServerNet}>
              <Icon name="save" size={14} /> Simpan Identitas & IP Server
            </button>
          </div>
        </div>

        {/* Kanan: Services + Firewall + Connectivity Check */}
        <div className="srv-col">
          {/* Tahap 3: Daemon Services */}
          <div className="srv-card">
            <div className="cab-panel-title">
              3. Layanan Jaringan Server (Daemon Services) {allServices && <span className="tag-ok">✓ 3/3 Running</span>}
            </div>
            <div className="service-list">
              <div className={`service-row ${services.nginx ? 'on' : ''}`}>
                <div>
                  <b>
                    <Icon name="network" size={14} color="#22d3ee" /> Nginx HTTP/HTTPS Web Server
                  </b>
                  <small>Port TCP 80 / 443 • Melayani portal intranet</small>
                </div>
                <button
                  className={`btn btn-sm ${services.nginx ? 'btn-success' : 'btn-primary'}`}
                  onClick={() => toggleService('nginx', 'Nginx Web Server')}
                >
                  {services.nginx ? '● RUNNING' : 'Aktifkan'}
                </button>
              </div>

              <div className={`service-row ${services.coredns ? 'on' : ''}`}>
                <div>
                  <b>
                    <Icon name="server" size={14} color="#38bdf8" /> CoreDNS Internal Resolver
                  </b>
                  <small>Port UDP/TCP 53 • Menerjemahkan domain .sija.local</small>
                </div>
                <button
                  className={`btn btn-sm ${services.coredns ? 'btn-success' : 'btn-primary'}`}
                  onClick={() => toggleService('coredns', 'CoreDNS')}
                >
                  {services.coredns ? '● RUNNING' : 'Aktifkan'}
                </button>
              </div>

              <div className={`service-row ${services.sshd ? 'on' : ''}`}>
                <div>
                  <b>
                    <Icon name="lock" size={14} color="#a78bfa" /> OpenSSH Remote Administration
                  </b>
                  <small>Port TCP 22 • Akses konsol jarak jauh terenkripsi</small>
                </div>
                <button
                  className={`btn btn-sm ${services.sshd ? 'btn-success' : 'btn-primary'}`}
                  onClick={() => toggleService('sshd', 'OpenSSH Daemon')}
                >
                  {services.sshd ? '● RUNNING' : 'Aktifkan'}
                </button>
              </div>
            </div>
          </div>

          {/* Tahap 4: Troubleshooting Server Tidak Dapat Diakses (Firewall) */}
          <div className="srv-card">
            <div className="cab-panel-title">
              4. Pemecahan Masalah: Server Tidak Dapat Diakses {firewallAllowHttp && <span className="tag-ok">✓ Port Terbuka</span>}
            </div>
            <p className="sim-sub">
              Inspeksi Firewall UFW menunjukkan aturan Inbound Port 80/443 masih berstatus <b>DENY (Diblokir)</b> sehingga klien mengalami <i>Connection Timeout</i>.
            </p>
            <div className="fw-box">
              <div>
                <b>
                  <Icon name="shield" size={14} color="#22d3ee" /> Aturan Firewall Inbound: TCP Port 80 & 443 (HTTP/HTTPS)
                </b>
                <small>Status saat ini: {firewallAllowHttp ? 'ALLOW IN (Diizinkan)' : 'DENY IN (Diblokir — Klien gagal akses)'}</small>
              </div>
              <button
                className={`btn btn-sm ${firewallAllowHttp ? 'btn-success' : 'btn-primary'}`}
                onClick={() => {
                  const next = !firewallAllowHttp;
                  setFirewallAllowHttp(next);
                  audio.play('snap');
                  if (next) {
                    api.good('Aturan Firewall diperbarui: ufw allow 80,443/tcp (ALLOW IN).');
                    setDiagLog((l) => [...l, '[UFW] Rule updated: ALLOW IN 80,443/tcp from 192.168.1.0/24']);
                  }
                }}
              >
                <Icon name={firewallAllowHttp ? 'check' : 'unlock'} size={14} />{' '}
                {firewallAllowHttp ? 'ALLOW 80/443' : 'Buka Blokir Port 80/443'}
              </button>
            </div>

            <div className="row between center-v mt-sm">
              <b>5. Uji Konektivitas dari Klien</b>
              <button className="btn btn-primary" onClick={runHealthCheck}>
                <Icon name="search" size={14} /> Uji Konektivitas Server
              </button>
            </div>

            <div className="terminal-box mt-sm">
              {diagLog.map((line, i) => (
                <div
                  key={i}
                  className={
                    line.includes('FAIL') || line.includes('TIMEOUT') || line.includes('ALERT')
                      ? 'term-err'
                      : line.includes('PASS') || line.includes('[OK]') || line.includes('ALLOW')
                        ? 'term-ok'
                        : 'term-cmd'
                  }
                >
                  {line}
                </div>
              ))}
            </div>

            {verified && (
              <div className="row between center-v mt-sm">
                <span className="bios-pass">
                  <Icon name="check" size={15} color="#4ade80" /> SERVER PRODUCTION ONLINE (HTTP 200 OK)
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

