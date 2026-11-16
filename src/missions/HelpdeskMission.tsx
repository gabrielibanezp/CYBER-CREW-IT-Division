import { useEffect, useState } from 'react';
import { MissionProps } from './types';
import { audio } from '../audio/audio';
import { Icon } from '../ui/Icon';

interface TicketMeta {
  id: number;
  code: string;
  title: string;
  reporter: string;
  dept: string;
  priority: 'HIGH' | 'CRITICAL' | 'MEDIUM';
  report: string;
}

const TICKETS: TicketMeta[] = [
  {
    id: 1,
    code: 'TCK-101',
    title: 'Komputer Tidak Bisa Menyala',
    reporter: 'Budi (Divisi Akuntansi)',
    dept: 'Lantai 1 • Meja A4',
    priority: 'HIGH',
    report:
      '"Pagi ini komputer saya mati total ketika ditekan tombol power di casing depan. Lampu indikator dan kipas sama sekali tidak berputar."',
  },
  {
    id: 2,
    code: 'TCK-102',
    title: 'Internet Tidak Terhubung',
    reporter: 'Siti (Divisi HRD)',
    dept: 'Lantai 1 • Meja B2',
    priority: 'HIGH',
    report:
      '"Ikon jaringan di pojok kanan bawah ada tanda seru kuning (No Internet). Kemarin sempat diutak-atik pengaturan IP-nya."',
  },
  {
    id: 3,
    code: 'TCK-103',
    title: 'Printer Tidak Terdeteksi',
    reporter: 'Andi (Administrasi)',
    dept: 'Lantai 1 • Area Cetak',
    priority: 'MEDIUM',
    report:
      '"Printer LaserJet kantor tidak terdeteksi di komputer dan dokumen kontrak tidak mau keluar sama sekali."',
  },
  {
    id: 4,
    code: 'TCK-104',
    title: 'Komputer Mengalami Blue Screen',
    reporter: 'Riko (Desain Grafis)',
    dept: 'Lantai 1 • Studio D1',
    priority: 'CRITICAL',
    report:
      '"PC tiba-tiba layar biru (BSOD) dengan kode MEMORY_MANAGEMENT setelah meja tidak sengaja tersenggol dan setelah update driver beta."',
  },
  {
    id: 5,
    code: 'TCK-105',
    title: 'Keyboard Tidak Berfungsi',
    reporter: 'Maya (Customer Care)',
    dept: 'Lantai 1 • Helpdesk Front',
    priority: 'MEDIUM',
    report:
      '"Keyboard USB saya tidak merespons ketikan sama sekali, lampu NumLock juga mati. Padahal saya harus membalas pesan klien."',
  },
];

export default function HelpdeskMission({ api }: MissionProps) {
  const [activeId, setActiveId] = useState<number>(1);
  const [causeOk, setCauseOk] = useState<Record<number, boolean>>({});

  // Ticket 1 interactive states (PC won't turn on)
  const [t1Plugged, setT1Plugged] = useState(false);
  const [t1PsuSwitch, setT1PsuSwitch] = useState(false);
  const [t1PowerBtn, setT1PowerBtn] = useState(false);

  // Ticket 2 interactive states (Internet not connected)
  const [t2AdapterOn, setT2AdapterOn] = useState(false);
  const [t2DhcpRenewed, setT2DhcpRenewed] = useState(false);
  const [t2DnsFixed, setT2DnsFixed] = useState(false);

  // Ticket 3 interactive states (Printer not detected)
  const [t3UsbConnected, setT3UsbConnected] = useState(false);
  const [t3PrinterPower, setT3PrinterPower] = useState(false);
  const [t3SpoolerCleared, setT3SpoolerCleared] = useState(false);

  // Ticket 4 interactive states (BSOD)
  const [t4RamReseated, setT4RamReseated] = useState(false);
  const [t4DriverRolledBack, setT4DriverRolledBack] = useState(false);
  const [t4Rebooted, setT4Rebooted] = useState(false);

  // Ticket 5 interactive states (Keyboard not working)
  const [t5PortMoved, setT5PortMoved] = useState(false);
  const [t5HidReinstalled, setT5HidReinstalled] = useState(false);
  const [t5TestTyped, setT5TestTyped] = useState('');

  const resolved: Record<number, boolean> = {
    1: t1Plugged && t1PsuSwitch && t1PowerBtn,
    2: t2AdapterOn && t2DhcpRenewed && t2DnsFixed,
    3: t3UsbConnected && t3PrinterPower && t3SpoolerCleared,
    4: t4RamReseated && t4DriverRolledBack && t4Rebooted,
    5: t5PortMoved && t5HidReinstalled && t5TestTyped.trim().length >= 2,
  };

  const resolvedCount = Object.values(resolved).filter(Boolean).length;

  useEffect(() => {
    const label =
      resolvedCount === 5
        ? 'Seluruh 5 tiket laporan Helpdesk telah RESOLVED!'
        : `Selesaikan tiket laporan pengguna (${resolvedCount}/5 tiket RESOLVED)`;
    api.progress(resolvedCount, 5, label);
  }, [resolvedCount]);

  const curTicket = TICKETS.find((t) => t.id === activeId)!;

  const selectCause = (ticketId: number, correct: boolean, msg: string) => {
    if (correct) {
      setCauseOk((prev) => ({ ...prev, [ticketId]: true }));
      audio.play('success');
      api.good(msg);
    } else {
      api.mistake(msg);
    }
  };

  return (
    <div className="sim hd">
      <div className="hd-layout">
        {/* Daftar Antrean Tiket */}
        <div className="hd-queue">
          <div className="cab-panel-title">
            Antrean Tiket Helpdesk <small>({resolvedCount}/5 Resolved)</small>
          </div>
          <div className="hd-ticket-list">
            {TICKETS.map((t) => {
              const isDone = resolved[t.id];
              return (
                <button
                  key={t.id}
                  className={`hd-ticket-item ${activeId === t.id ? 'active' : ''} ${isDone ? 'resolved' : ''}`}
                  onClick={() => {
                    setActiveId(t.id);
                    audio.play('click');
                  }}
                >
                  <div className="row between center-v">
                    <span className="tck-code">{t.code}</span>
                    <span className={`tck-status ${isDone ? 'ok' : t.priority.toLowerCase()}`}>
                      {isDone ? '✓ RESOLVED' : t.priority}
                    </span>
                  </div>
                  <b>{t.title}</b>
                  <small>{t.reporter}</small>
                </button>
              );
            })}
          </div>
        </div>

        {/* Workbench Tiket Aktif */}
        <div className="hd-workbench">
          <div className="hd-header-card">
            <div className="row between center-v">
              <div>
                <span className="tck-code">{curTicket.code} • {curTicket.dept}</span>
                <h4>{curTicket.title}</h4>
                <small>Pelapor: {curTicket.reporter}</small>
              </div>
              <span className={`tck-badge ${resolved[curTicket.id] ? 'ok' : 'open'}`}>
                <Icon name={resolved[curTicket.id] ? 'check' : 'alert'} size={13} />{' '}
                {resolved[curTicket.id] ? 'STATUS: RESOLVED' : 'STATUS: OPEN'}
              </span>
            </div>
            <p className="hd-quote">{curTicket.report}</p>
          </div>

          {/* Tahap 1: Identifikasi Penyebab */}
          <div className="srv-card mt-sm">
            <div className="cab-panel-title">
              Tahap 1 — Identifikasi Kemungkinan Penyebab {causeOk[activeId] && <span className="tag-ok">✓ Teridentifikasi</span>}
            </div>

            {activeId === 1 && (
              <div className="role-btns">
                <button
                  className={`btn btn-sm ${causeOk[1] ? 'btn-success' : 'btn-ghost'}`}
                  onClick={() =>
                    selectCause(1, true, 'Tepat! Pemeriksaan PC mati total selalu dimulai dari kabel daya AC dan sakelar I/O Power Supply (PSU).')
                  }
                >
                  <Icon name="power" size={14} /> Kabel power AC terlepas & sakelar PSU masih OFF (0)
                </button>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => selectCause(1, false, 'Aplikasi browser tidak menyebabkan komputer mati total tanpa daya.')}
                >
                  <Icon name="network" size={14} /> Browser kekurangan ekstensi
                </button>
              </div>
            )}

            {activeId === 2 && (
              <div className="role-btns">
                <button
                  className={`btn btn-sm ${causeOk[2] ? 'btn-success' : 'btn-ghost'}`}
                  onClick={() =>
                    selectCause(2, true, 'Benar! Adaptor jaringan ke-disable atau konfigurasi DHCP/DNS salah menyebabkan tanda seru No Internet.')
                  }
                >
                  <Icon name="network" size={14} /> Adaptor Ethernet nonaktif / konfigurasi DHCP & DNS tidak valid
                </button>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => selectCause(2, false, 'Resolusi wallpaper tidak memengaruhi koneksi jaringan TCP/IP.')}
                >
                  <Icon name="pc" size={14} /> Wallpaper desktop terlalu besar
                </button>
              </div>
            )}

            {activeId === 3 && (
              <div className="role-btns">
                <button
                  className={`btn btn-sm ${causeOk[3] ? 'btn-success' : 'btn-ghost'}`}
                  onClick={() =>
                    selectCause(3, true, 'Tepat! Kabel data USB printer lepas, tombol daya printer mati, dan antrean Print Spooler macet.')
                  }
                >
                  <Icon name="printer" size={14} /> Kabel USB printer lepas, daya mati & layanan Print Spooler macet
                </button>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => selectCause(3, false, 'Soundcard audio tidak berkaitan dengan deteksi printer USB.')}
                >
                  <Icon name="volume" size={14} /> Volume speaker komputer di-mute
                </button>
              </div>
            )}

            {activeId === 4 && (
              <div className="role-btns">
                <button
                  className={`btn btn-sm ${causeOk[4] ? 'btn-success' : 'btn-ghost'}`}
                  onClick={() =>
                    selectCause(4, true, 'Tepat! Kode BSOD MEMORY_MANAGEMENT pasca benturan & update driver dipicu modul RAM kendor serta driver beta yang konflik.')
                  }
                >
                  <Icon name="cpu" size={14} /> Modul RAM longgar di slot DIMM & driver beta tidak kompatibel
                </button>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => selectCause(4, false, 'Mousepad kotor tidak menyebabkan kernel crash MEMORY_MANAGEMENT.')}
                >
                  <Icon name="info" size={14} /> Mousepad berdebu
                </button>
              </div>
            )}

            {activeId === 5 && (
              <div className="role-btns">
                <button
                  className={`btn btn-sm ${causeOk[5] ? 'btn-success' : 'btn-ghost'}`}
                  onClick={() =>
                    selectCause(5, true, 'Tepat! Konektor USB di port depan longgar/bermasalah dan driver HID Keyboard perlu di-refresh.')
                  }
                >
                  <Icon name="keyboard" size={14} /> Konektor USB longgar pada port depan & driver USB HID hang
                </button>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => selectCause(5, false, 'Kecerahan monitor tidak memengaruhi fungsi input keyboard USB.')}
                >
                  <Icon name="pc" size={14} /> Brightness monitor terlalu rendah
                </button>
              </div>
            )}
          </div>

          {/* Tahap 2: Simulasi Penyelesaian Masalah Interaktif */}
          <div className="srv-card mt-sm">
            <div className="cab-panel-title">
              Tahap 2 — Workbench Simulasi Perbaikan Langsung {resolved[activeId] && <span className="tag-ok">✓ RESOLVED</span>}
            </div>

            {!causeOk[activeId] ? (
              <p className="sim-sub">Identifikasi kemungkinan penyebab pada Tahap 1 terlebih dahulu untuk membuka workbench perbaikan.</p>
            ) : (
              <>
                {/* SIMULASI TIKET 1: PC TIDAK MENYALA */}
                {activeId === 1 && (
                  <div className="proc-list">
                    <div className={`proc-row ${t1Plugged ? 'solved' : 'bad'}`}>
                      <span>1. Colokkan Kabel Power AC ke Soket PSU & Stopkontak UPS</span>
                      <button
                        className={`btn btn-sm ${t1Plugged ? 'btn-success' : 'btn-primary'}`}
                        disabled={t1Plugged}
                        onClick={() => {
                          setT1Plugged(true);
                          audio.play('snap');
                          api.good('Kabel Power AC terpasang rapat ke PSU.');
                        }}
                      >
                        {t1Plugged ? '✓ Terpasang' : 'Colokkan Kabel AC'}
                      </button>
                    </div>
                    <div className={`proc-row ${t1PsuSwitch ? 'solved' : 'bad'}`}>
                      <span>2. Ubah Sakelar Belakang PSU dari posisi [O] ke posisi [I] (ON)</span>
                      <button
                        className={`btn btn-sm ${t1PsuSwitch ? 'btn-success' : 'btn-primary'}`}
                        disabled={!t1Plugged || t1PsuSwitch}
                        onClick={() => {
                          setT1PsuSwitch(true);
                          audio.play('snap');
                          api.good('Sakelar PSU aktif [I] — lampu standby motherboard menyala.');
                        }}
                      >
                        {t1PsuSwitch ? '✓ Posisi [I] ON' : 'Sakelar PSU → [I]'}
                      </button>
                    </div>
                    <div className={`proc-row ${t1PowerBtn ? 'solved' : 'bad'}`}>
                      <span>3. Tekan Tombol Power Casing Depan untuk Booting OS</span>
                      <button
                        className={`btn btn-sm ${t1PowerBtn ? 'btn-success' : 'btn-primary'}`}
                        disabled={!t1PsuSwitch || t1PowerBtn}
                        onClick={() => {
                          setT1PowerBtn(true);
                          audio.play('power');
                          api.good('PC Akuntansi menyala normal dan masuk ke desktop! Tiket TCK-101 RESOLVED.');
                        }}
                      >
                        <Icon name="power" size={14} /> {t1PowerBtn ? 'PC Menyala Normal' : 'Nyalakan PC'}
                      </button>
                    </div>
                  </div>
                )}

                {/* SIMULASI TIKET 2: INTERNET TIDAK TERHUBUNG */}
                {activeId === 2 && (
                  <div className="proc-list">
                    <div className={`proc-row ${t2AdapterOn ? 'solved' : 'bad'}`}>
                      <span>1. Aktifkan kembali Network Adapter (Ethernet0) yang berstatus Disabled</span>
                      <button
                        className={`btn btn-sm ${t2AdapterOn ? 'btn-success' : 'btn-primary'}`}
                        disabled={t2AdapterOn}
                        onClick={() => {
                          setT2AdapterOn(true);
                          audio.play('snap');
                          api.good('Adapter Ethernet0 berhasil di-Enable.');
                        }}
                      >
                        {t2AdapterOn ? '✓ Adapter Enabled' : 'Enable Ethernet0'}
                      </button>
                    </div>
                    <div className={`proc-row ${t2DhcpRenewed ? 'solved' : 'bad'}`}>
                      <span>2. Perbarui alamat IP otomatis via DHCP (<code>ipconfig /renew</code>)</span>
                      <button
                        className={`btn btn-sm ${t2DhcpRenewed ? 'btn-success' : 'btn-primary'}`}
                        disabled={!t2AdapterOn || t2DhcpRenewed}
                        onClick={() => {
                          setT2DhcpRenewed(true);
                          audio.play('beep');
                          api.good('DHCP Lease diperoleh: IP 192.168.1.45 /24, Gateway 192.168.1.1.');
                        }}
                      >
                        {t2DhcpRenewed ? '✓ IP 192.168.1.45' : 'Jalankan ipconfig /renew'}
                      </button>
                    </div>
                    <div className={`proc-row ${t2DnsFixed ? 'solved' : 'bad'}`}>
                      <span>3. Bersihkan cache DNS & atur DNS Resolver (<code>ipconfig /flushdns</code>)</span>
                      <button
                        className={`btn btn-sm ${t2DnsFixed ? 'btn-success' : 'btn-primary'}`}
                        disabled={!t2DhcpRenewed || t2DnsFixed}
                        onClick={() => {
                          setT2DnsFixed(true);
                          audio.play('success');
                          api.good('Koneksi Internet pulih! Status jaringan: Connected. Tiket TCK-102 RESOLVED.');
                        }}
                      >
                        {t2DnsFixed ? '✓ Internet Connected' : 'Flush DNS & Uji Koneksi'}
                      </button>
                    </div>
                  </div>
                )}

                {/* SIMULASI TIKET 3: PRINTER TIDAK TERDETEKSI */}
                {activeId === 3 && (
                  <div className="proc-list">
                    <div className={`proc-row ${t3UsbConnected ? 'solved' : 'bad'}`}>
                      <span>1. Pasang kembali kabel USB Type-B Printer ke port belakang PC</span>
                      <button
                        className={`btn btn-sm ${t3UsbConnected ? 'btn-success' : 'btn-primary'}`}
                        disabled={t3UsbConnected}
                        onClick={() => {
                          setT3UsbConnected(true);
                          audio.play('snap');
                          api.good('Kabel data USB Printer terhubung.');
                        }}
                      >
                        {t3UsbConnected ? '✓ USB Terhubung' : 'Pasang Kabel USB'}
                      </button>
                    </div>
                    <div className={`proc-row ${t3PrinterPower ? 'solved' : 'bad'}`}>
                      <span>2. Nyalakan Tombol Power Printer LaserJet (Status: Ready)</span>
                      <button
                        className={`btn btn-sm ${t3PrinterPower ? 'btn-success' : 'btn-primary'}`}
                        disabled={!t3UsbConnected || t3PrinterPower}
                        onClick={() => {
                          setT3PrinterPower(true);
                          audio.play('power');
                          api.good('Printer menyala dan terdeteksi oleh sistem operasi.');
                        }}
                      >
                        {t3PrinterPower ? '✓ Printer Ready' : 'Nyalakan Printer'}
                      </button>
                    </div>
                    <div className={`proc-row ${t3SpoolerCleared ? 'solved' : 'bad'}`}>
                      <span>3. Bersihkan antrean macet & Restart layanan <code>Print Spooler</code></span>
                      <button
                        className={`btn btn-sm ${t3SpoolerCleared ? 'btn-success' : 'btn-primary'}`}
                        disabled={!t3PrinterPower || t3SpoolerCleared}
                        onClick={() => {
                          setT3SpoolerCleared(true);
                          audio.play('success');
                          api.good('Print Spooler di-restart, halaman uji berhasil dicetak! Tiket TCK-103 RESOLVED.');
                        }}
                      >
                        {t3SpoolerCleared ? '✓ Test Page Tercetak' : 'Restart Print Spooler'}
                      </button>
                    </div>
                  </div>
                )}

                {/* SIMULASI TIKET 4: BLUE SCREEN (BSOD) */}
                {activeId === 4 && (
                  <div className="proc-list">
                    <div className={`proc-row ${t4RamReseated ? 'solved' : 'bad'}`}>
                      <span>1. Lepas, bersihkan pin emas, dan pasang ulang (Reseat) modul RAM hingga berbunyi klik</span>
                      <button
                        className={`btn btn-sm ${t4RamReseated ? 'btn-success' : 'btn-primary'}`}
                        disabled={t4RamReseated}
                        onClick={() => {
                          setT4RamReseated(true);
                          audio.play('snap');
                          api.good('Modul RAM DDR4 terpasang kencang di kedua pengait slot DIMM.');
                        }}
                      >
                        {t4RamReseated ? '✓ RAM Terkunci Rapat' : 'Reseat Modul RAM'}
                      </button>
                    </div>
                    <div className={`proc-row ${t4DriverRolledBack ? 'solved' : 'bad'}`}>
                      <span>2. Masuk Safe Mode & Rollback Driver Beta yang menyebabkan crash kernel</span>
                      <button
                        className={`btn btn-sm ${t4DriverRolledBack ? 'btn-success' : 'btn-primary'}`}
                        disabled={!t4RamReseated || t4DriverRolledBack}
                        onClick={() => {
                          setT4DriverRolledBack(true);
                          audio.play('beep');
                          api.good('Driver dikembalikan ke versi WHQL yang stabil.');
                        }}
                      >
                        {t4DriverRolledBack ? '✓ Driver WHQL Stabil' : 'Rollback Driver di Safe Mode'}
                      </button>
                    </div>
                    <div className={`proc-row ${t4Rebooted ? 'solved' : 'bad'}`}>
                      <span>3. Jalankan Windows Memory Diagnostic & Reboot Normal</span>
                      <button
                        className={`btn btn-sm ${t4Rebooted ? 'btn-success' : 'btn-primary'}`}
                        disabled={!t4DriverRolledBack || t4Rebooted}
                        onClick={() => {
                          setT4Rebooted(true);
                          audio.play('success');
                          api.good('0 Memory Errors ditemukan, sistem stabil tanpa BSOD! Tiket TCK-104 RESOLVED.');
                        }}
                      >
                        {t4Rebooted ? '✓ Sistem Stabil (No BSOD)' : 'Uji Memori & Reboot'}
                      </button>
                    </div>
                  </div>
                )}

                {/* SIMULASI TIKET 5: KEYBOARD TIDAK BERFUNGSI */}
                {activeId === 5 && (
                  <div className="proc-list">
                    <div className={`proc-row ${t5PortMoved ? 'solved' : 'bad'}`}>
                      <span>1. Pindahkan konektor USB Keyboard ke port USB belakang (langsung ke Motherboard)</span>
                      <button
                        className={`btn btn-sm ${t5PortMoved ? 'btn-success' : 'btn-primary'}`}
                        disabled={t5PortMoved}
                        onClick={() => {
                          setT5PortMoved(true);
                          audio.play('snap');
                          api.good('Keyboard terhubung ke port USB Rear I/O — lampu indikator NumLock menyala.');
                        }}
                      >
                        {t5PortMoved ? '✓ Terhubung ke Rear USB' : 'Pindah ke Port USB Belakang'}
                      </button>
                    </div>
                    <div className={`proc-row ${t5HidReinstalled ? 'solved' : 'bad'}`}>
                      <span>2. Scan Hardware Changes & Muat ulang driver <code>HID Keyboard Device</code></span>
                      <button
                        className={`btn btn-sm ${t5HidReinstalled ? 'btn-success' : 'btn-primary'}`}
                        disabled={!t5PortMoved || t5HidReinstalled}
                        onClick={() => {
                          setT5HidReinstalled(true);
                          audio.play('beep');
                          api.good('Driver HID Keyboard aktif! Silakan uji ketik pada kolom di bawah.');
                        }}
                      >
                        {t5HidReinstalled ? '✓ Driver HID Aktif' : 'Refresh Driver HID'}
                      </button>
                    </div>
                    <div className={`proc-row ${resolved[5] ? 'solved' : 'bad'}`}>
                      <span>3. Uji input keyboard (ketik minimal 2 huruf atau klik tombol Uji Ketik)</span>
                      <div className="row gap center-v">
                        <input
                          type="text"
                          className="kb-test-input"
                          placeholder="Ketik 'OK' di sini..."
                          disabled={!t5HidReinstalled}
                          value={t5TestTyped}
                          onChange={(e) => {
                            const val = e.target.value;
                            setT5TestTyped(val);
                            audio.play('type');
                            if (val.trim().length === 2) {
                              audio.play('success');
                              api.good('Input keyboard berfungsi sempurna! Tiket TCK-105 RESOLVED.');
                            }
                          }}
                        />
                        <button
                          className="btn btn-sm btn-primary"
                          disabled={!t5HidReinstalled || resolved[5]}
                          onClick={() => {
                            setT5TestTyped('TEST OK');
                            audio.play('success');
                            api.good('Input keyboard berfungsi sempurna! Tiket TCK-105 RESOLVED.');
                          }}
                        >
                          <Icon name="keyboard" size={14} /> Uji Ketik "TEST OK"
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {resolvedCount === 5 && (
            <div className="success-card mt-sm">
              <div className="sc-icon">
                <Icon name="headset" size={32} color="#4ade80" />
              </div>
              <div>
                <b>Seluruh 5 Tiket Helpdesk Berhasil Diselesaikan!</b>
                <p>
                  Tingkat kepuasan pengguna 100% (SLA Terpenuhi). Semua perangkat staf kini kembali beroperasi normal.
                </p>
                <button className="btn btn-success" onClick={() => api.complete()}>
                  Selesaikan Misi <Icon name="arrow-right" size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

