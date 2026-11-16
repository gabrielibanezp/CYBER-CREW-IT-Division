import { useEffect, useState } from 'react';
import { MissionProps } from './types';
import { audio } from '../audio/audio';
import { Icon } from '../ui/Icon';

export default function SoftwareMission({ api }: MissionProps) {
  const [activeCase, setActiveCase] = useState<1 | 2 | 3>(1);

  // Case 1: Aplikasi tidak dapat dibuka + Driver GPU belum terinstal
  const [c1Inspected, setC1Inspected] = useState(false);
  const [c1CauseOk, setC1CauseOk] = useState(false);
  const [c1DriverPct, setC1DriverPct] = useState(0);
  const [c1Installing, setC1Installing] = useState(false);
  const [c1Solved, setC1Solved] = useState(false);

  // Case 2: Penyimpanan hampir penuh (99%) + proses runaway membuat komputer hang/error
  const [c2Inspected, setC2Inspected] = useState(false);
  const [c2KilledRunaway, setC2KilledRunaway] = useState(false);
  const [c2CleanedTemp, setC2CleanedTemp] = useState(false);
  const [c2CleanedDumps, setC2CleanedDumps] = useState(false);
  const c2Solved = c2KilledRunaway && c2CleanedTemp && c2CleanedDumps;

  // Case 3: Sistem operasi mengalami masalah (file sistem korup & layanan update mati)
  const [c3Scanned, setC3Scanned] = useState(false);
  const [c3SfcPct, setC3SfcPct] = useState(0);
  const [c3RunningSfc, setC3RunningSfc] = useState(false);
  const [c3SfcDone, setC3SfcDone] = useState(false);
  const [c3ServiceRestarted, setC3ServiceRestarted] = useState(false);
  const c3Solved = c3SfcDone && c3ServiceRestarted;

  const solvedCount = Number(c1Solved) + Number(c2Solved) + Number(c3Solved);

  useEffect(() => {
    const label =
      solvedCount === 3
        ? 'Seluruh 3 kasus Software Troubleshooting berhasil diperbaiki!'
        : `Selesaikan 3 kasus perbaikan software (${solvedCount}/3 tuntas)`;
    api.progress(solvedCount, 3, label);
  }, [solvedCount]);

  // Handlers Case 1
  const installDriver = () => {
    if (c1Installing || c1Solved) return;
    setC1Installing(true);
    audio.play('power');
    let p = 0;
    const iv = setInterval(() => {
      p += 25;
      setC1DriverPct(p);
      audio.play('beep');
      if (p >= 100) {
        clearInterval(iv);
        setC1Installing(false);
        setC1Solved(true);
        audio.play('success');
        api.good('Driver GPU & Runtime OpenGL berhasil diinstal! Aplikasi Desain 3D kini terbuka normal pada 1920×1080 60Hz.');
      }
    }, 280);
  };

  // Handlers Case 3
  const runSfc = () => {
    if (c3RunningSfc || c3SfcDone) return;
    setC3RunningSfc(true);
    audio.play('type');
    let p = 0;
    const iv = setInterval(() => {
      p += 25;
      setC3SfcPct(p);
      audio.play('beep');
      if (p >= 100) {
        clearInterval(iv);
        setC3RunningSfc(false);
        setC3SfcDone(true);
        audio.play('success');
        api.good('Windows Resource Protection menemukan file korup dan berhasil memperbaikinya (sfc /scannow).');
      }
    }, 300);
  };

  const diskUsage = 99 - (c2CleanedTemp ? 24 : 0) - (c2CleanedDumps ? 18 : 0);
  const cpuUsage = c2KilledRunaway ? 12 : 98;

  return (
    <div className="sim sw">
      {/* Navigasi 3 Kasus */}
      <div className="case-tabs">
        <button
          className={`case-tab ${activeCase === 1 ? 'active' : ''} ${c1Solved ? 'done' : ''}`}
          onClick={() => {
            setActiveCase(1);
            audio.play('click');
          }}
        >
          <span>{c1Solved ? '✓' : '1'}</span>
          <div>
            <b>Kasus 1: Aplikasi & Driver</b>
            <small>Aplikasi force-close & tanda seru Device Manager</small>
          </div>
        </button>

        <button
          className={`case-tab ${activeCase === 2 ? 'active' : ''} ${c2Solved ? 'done' : ''}`}
          onClick={() => {
            setActiveCase(2);
            audio.play('click');
          }}
        >
          <span>{c2Solved ? '✓' : '2'}</span>
          <div>
            <b>Kasus 2: Storage Penuh & Hang</b>
            <small>Disk C: 99% penuh & CPU 98% runaway</small>
          </div>
        </button>

        <button
          className={`case-tab ${activeCase === 3 ? 'active' : ''} ${c3Solved ? 'done' : ''}`}
          onClick={() => {
            setActiveCase(3);
            audio.play('click');
          }}
        >
          <span>{c3Solved ? '✓' : '3'}</span>
          <div>
            <b>Kasus 3: Sistem Operasi Error</b>
            <small>File sistem OS korup & layanan sistem berhenti</small>
          </div>
        </button>
      </div>

      {/* KASUS 1 */}
      {activeCase === 1 && (
        <div className="sw-case-panel">
          <div className="sw-symptom">
            <b>
              <Icon name="alert" size={14} color="#fde047" /> Keluhan Workstation #01:
            </b>{' '}
            Aplikasi <i>SIJA Studio CAD</i> tidak dapat dibuka dan muncul error{' '}
            <code>OpenGL Hardware Acceleration Failed (Error 0x887A0004)</code>. Tampilan layar juga tampak buram pada resolusi 800×600.
          </div>

          <div className="sw-steps-grid">
            {/* Step 1: Pemeriksaan Device Manager */}
            <div className="srv-card">
              <div className="cab-panel-title">
                Tahap 1 — Pemeriksaan Device Manager {c1Inspected && <span className="tag-ok">✓ Diperiksa</span>}
              </div>
              {!c1Inspected ? (
                <div>
                  <p className="sim-sub">Pilih alat pemeriksaan yang tepat untuk memeriksa status driver perangkat keras:</p>
                  <div className="role-btns">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        setC1Inspected(true);
                        audio.play('open');
                        api.good('Device Manager dibuka: terlihat tanda seru kuning (!) pada Display Adapters.');
                      }}
                    >
                      <Icon name="search" size={14} /> Buka Device Manager & Log Aplikasi
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => api.mistake('Format ulang harddisk tidak diperlukan dan akan menghapus data pengguna! Periksa Device Manager dulu.')}
                    >
                      <Icon name="alert" size={14} /> Langsung Format Harddisk C:
                    </button>
                  </div>
                </div>
              ) : (
                <div className="devmgr-box">
                  <div className="devmgr-item ok">
                    <Icon name="check" size={14} color="#4ade80" /> Processors — Intel Core i7 (8 threads)
                  </div>
                  <div className={`devmgr-item ${c1Solved ? 'ok' : 'warn'}`}>
                    <Icon name={c1Solved ? 'check' : 'alert'} size={14} color={c1Solved ? '#4ade80' : '#facc15'} />{' '}
                    {c1Solved
                      ? 'Display Adapters — NVIDIA RTX Graphics (WHQL Driver v552.12 Active)'
                      : 'Display Adapters — Microsoft Basic Display Adapter (Code 28: Driver belum terinstal!)'}
                  </div>
                  <div className="devmgr-item ok">
                    <Icon name="check" size={14} color="#4ade80" /> Network Adapters — Intel Gigabit Ethernet
                  </div>
                </div>
              )}
            </div>

            {/* Step 2 & 3: Diagnosis & Solusi */}
            <div className="srv-card">
              <div className="cab-panel-title">
                Tahap 2 & 3 — Diagnosis & Instalasi Driver {c1Solved && <span className="tag-ok">✓ Selesai</span>}
              </div>
              {!c1Inspected && <p className="sim-sub">Jalankan pemeriksaan Device Manager di sebelah kiri terlebih dahulu.</p>}

              {c1Inspected && !c1CauseOk && (
                <div>
                  <p className="sim-sub">Apa penyebab utama aplikasi gagal membuka akselerasi grafis?</p>
                  <div className="role-btns">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        setC1CauseOk(true);
                        audio.play('success');
                        api.good('Diagnosis tepat! Driver GPU belum terinstal sehingga sistem hanya memakai Basic Display Adapter.');
                      }}
                    >
                      <Icon name="cpu" size={14} /> Driver Kartu Grafis (GPU) belum terinstal
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => api.mistake('Kabel LAN tidak memengaruhi akselerasi OpenGL/GPU maupun resolusi monitor.')}
                    >
                      <Icon name="cable" size={14} /> Kabel LAN RJ45 kendor
                    </button>
                  </div>
                </div>
              )}

              {c1CauseOk && (
                <div className="mt-sm">
                  <p className="sim-sub">Terapkan solusi perbaikan pada Workstation #01:</p>
                  <button className="btn btn-primary" onClick={installDriver} disabled={c1Installing || c1Solved}>
                    <Icon name={c1Solved ? 'check' : 'disc'} size={15} />{' '}
                    {c1Solved
                      ? 'Driver GPU WHQL & Runtime Terinstal'
                      : c1Installing
                        ? `Menginstal Driver GPU… (${c1DriverPct}%)`
                        : 'Instal Driver Resmi GPU WHQL + OpenGL Runtime'}
                  </button>
                  {(c1Installing || c1Solved) && (
                    <div className="prog-bar mt-sm">
                      <div className="prog-fill" style={{ width: `${c1DriverPct}%` }} />
                    </div>
                  )}
                  {c1Solved && (
                    <div className="row between center-v mt-sm">
                      <span className="bios-pass">
                        <Icon name="check" size={14} color="#4ade80" /> Aplikasi CAD berjalan lancar (1080p 60Hz)
                      </span>
                      <button className="btn btn-primary btn-sm" onClick={() => setActiveCase(2)}>
                        Lanjut Kasus 2 <Icon name="arrow-right" size={14} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* KASUS 2 */}
      {activeCase === 2 && (
        <div className="sw-case-panel">
          <div className="sw-symptom">
            <b>
              <Icon name="alert" size={14} color="#fde047" /> Keluhan Workstation #02:
            </b>{' '}
            Komputer sangat lambat/hang, muncul peringatan{' '}
            <code>Low Disk Space on Local Disk (C:) — 99% Full</code>, dan kipas berputar kencang terus-menerus.
          </div>

          <div className="sw-steps-grid">
            <div className="srv-card">
              <div className="cab-panel-title">
                Tahap 1 — Task Manager & Storage Analyzer {c2Inspected && <span className="tag-ok">✓ Aktif</span>}
              </div>

              <div className="meters-row">
                <div className="meter-box">
                  <span>CPU Load: <b>{cpuUsage}%</b></span>
                  <div className="prog-bar">
                    <div className={`prog-fill ${cpuUsage > 80 ? 'danger' : ''}`} style={{ width: `${cpuUsage}%` }} />
                  </div>
                </div>
                <div className="meter-box">
                  <span>Disk C: Usage: <b>{diskUsage}%</b></span>
                  <div className="prog-bar">
                    <div className={`prog-fill ${diskUsage > 85 ? 'danger' : ''}`} style={{ width: `${diskUsage}%` }} />
                  </div>
                </div>
              </div>

              {!c2Inspected ? (
                <button
                  className="btn btn-primary mt-sm"
                  onClick={() => {
                    setC2Inspected(true);
                    audio.play('open');
                    api.good('Task Manager & Storage Analyzer menampilkan proses yang macet dan rincian pemakaian ruang penyimpanan.');
                  }}
                >
                  <Icon name="search" size={14} /> Pindai Proses & Ruang Disk C:
                </button>
              ) : (
                <div className="proc-list mt-sm">
                  <div className="proc-row">
                    <span>
                      <Icon name="settings" size={14} color="#38bdf8" /> System Idle / Explorer.exe <small>(Proses Penting OS)</small>
                    </span>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => api.mistake('Jangan matikan proses inti sistem operasi (Explorer/System)!')}
                    >
                      Jangan Hentikan
                    </button>
                  </div>
                  <div className={`proc-row ${c2KilledRunaway ? 'solved' : 'bad'}`}>
                    <span>
                      <Icon name="alert" size={14} color={c2KilledRunaway ? '#4ade80' : '#f87171'} /> CrashIndexerLoop.exe{' '}
                      <small>({c2KilledRunaway ? 'Terminated' : '86% CPU • Not Responding'})</small>
                    </span>
                    <button
                      className={`btn btn-sm ${c2KilledRunaway ? 'btn-success' : 'btn-primary'}`}
                      disabled={c2KilledRunaway}
                      onClick={() => {
                        setC2KilledRunaway(true);
                        audio.play('snap');
                        api.good('Proses runaway CrashIndexerLoop.exe dihentikan! Beban CPU turun ke 12%.');
                      }}
                    >
                      {c2KilledRunaway ? '✓ Dihentikan' : 'End Task'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="srv-card">
              <div className="cab-panel-title">
                Tahap 2 — Pembersihan Partisi Sistem (Disk Cleanup) {c2Solved && <span className="tag-ok">✓ Selesai</span>}
              </div>
              {!c2Inspected ? (
                <p className="sim-sub">Pindai proses dan ruang disk di panel kiri terlebih dahulu.</p>
              ) : (
                <div className="proc-list">
                  <div className={`proc-row ${c2CleanedTemp ? 'solved' : 'bad'}`}>
                    <span>
                      <Icon name="trash" size={14} color="#38bdf8" /> Windows Temp & App Cache <small>(24.5 GB sampah sementara)</small>
                    </span>
                    <button
                      className={`btn btn-sm ${c2CleanedTemp ? 'btn-success' : 'btn-primary'}`}
                      disabled={c2CleanedTemp}
                      onClick={() => {
                        setC2CleanedTemp(true);
                        audio.play('snap');
                        api.good('24.5 GB file Temp & Cache berhasil dibersihkan.');
                      }}
                    >
                      {c2CleanedTemp ? '✓ Dibersihkan' : 'Bersihkan Temp'}
                    </button>
                  </div>

                  <div className={`proc-row ${c2CleanedDumps ? 'solved' : 'bad'}`}>
                    <span>
                      <Icon name="trash" size={14} color="#38bdf8" /> Old Crash Memory Dumps & Recycle Bin <small>(18.2 GB)</small>
                    </span>
                    <button
                      className={`btn btn-sm ${c2CleanedDumps ? 'btn-success' : 'btn-primary'}`}
                      disabled={c2CleanedDumps}
                      onClick={() => {
                        setC2CleanedDumps(true);
                        audio.play('snap');
                        api.good('18.2 GB Crash Dump lama berhasil dihapus.');
                      }}
                    >
                      {c2CleanedDumps ? '✓ Dihapus' : 'Hapus Dump'}
                    </button>
                  </div>

                  <div className="proc-row">
                    <span>
                      <Icon name="folder" size={14} color="#facc15" /> C:\Windows\System32 <small>(File Inti OS — Jangan Dihapus)</small>
                    </span>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => api.mistake('DILARANG menghapus folder System32! Itu akan merusak sistem operasi secara permanen.')}
                    >
                      Hapus System32
                    </button>
                  </div>

                  {c2Solved && (
                    <div className="row between center-v mt-sm">
                      <span className="bios-pass">
                        <Icon name="check" size={14} color="#4ade80" /> Disk C: lega ({diskUsage}%) & CPU normal ({cpuUsage}%)
                      </span>
                      <button className="btn btn-primary btn-sm" onClick={() => setActiveCase(3)}>
                        Lanjut Kasus 3 <Icon name="arrow-right" size={14} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* KASUS 3 */}
      {activeCase === 3 && (
        <div className="sw-case-panel">
          <div className="sw-symptom">
            <b>
              <Icon name="alert" size={14} color="#fde047" /> Keluhan Workstation #03:
            </b>{' '}
            Sistem operasi mengalami error sistem (<code>System DLL Corrupted: 0x80070570</code>) setelah mati listrik mendadak, dan layanan pembaruan/komponen sistem berhenti bekerja.
          </div>

          <div className="sw-steps-grid">
            <div className="srv-card">
              <div className="cab-panel-title">
                Tahap 1 — Pemeriksaan Integritas File Sistem OS {c3Scanned && <span className="tag-ok">✓ Diperiksa</span>}
              </div>
              {!c3Scanned ? (
                <div>
                  <p className="sim-sub">Jalankan Event Viewer & System Health Scanner untuk mendeteksi kerusakan OS:</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setC3Scanned(true);
                      audio.play('open');
                      api.good('Hasil scan: ditemukan integritas file sistem DLL yang korup dan layanan Windows Update/Installer berhenti.');
                    }}
                  >
                    <Icon name="search" size={14} /> Jalankan Diagnostik Sistem Operasi
                  </button>
                </div>
              ) : (
                <div className="terminal-box">
                  <div className="term-err">[EVENT 7031] Corruption detected in C:\Windows\System32\rpcss.dll</div>
                  <div className="term-err">[SERVICE] Windows Module Installer & Update Service: STOPPED</div>
                  {c3SfcDone && <div className="term-ok">[SFC] Windows Resource Protection found corrupt files and successfully repaired them.</div>}
                  {c3ServiceRestarted && <div className="term-ok">[SERVICE] wuauserv & trustedinstaller restarted → RUNNING.</div>}
                </div>
              )}
            </div>

            <div className="srv-card">
              <div className="cab-panel-title">
                Tahap 2 — Perbaikan Sistem Operasi Interaktif {c3Solved && <span className="tag-ok">✓ Selesai</span>}
              </div>
              {!c3Scanned ? (
                <p className="sim-sub">Jalankan diagnostik di panel kiri terlebih dahulu.</p>
              ) : (
                <div className="proc-list">
                  <div className={`proc-row ${c3SfcDone ? 'solved' : 'bad'}`}>
                    <div>
                      <b>1. System File Checker (<code>sfc /scannow</code>)</b>
                      <small style={{ display: 'block' }}>Memindai dan memulihkan file sistem OS yang rusak dari cache komponen</small>
                    </div>
                    <button
                      className={`btn btn-sm ${c3SfcDone ? 'btn-success' : 'btn-primary'}`}
                      disabled={c3RunningSfc || c3SfcDone}
                      onClick={runSfc}
                    >
                      <Icon name={c3SfcDone ? 'check' : 'wrench'} size={14} />{' '}
                      {c3SfcDone ? 'File OS Pulih' : c3RunningSfc ? `Memperbaiki ${c3SfcPct}%…` : 'Jalankan sfc /scannow'}
                    </button>
                  </div>

                  <div className={`proc-row ${c3ServiceRestarted ? 'solved' : 'bad'}`}>
                    <div>
                      <b>2. Restart Layanan Sistem & Windows Module Installer</b>
                      <small style={{ display: 'block' }}>Mengaktifkan kembali layanan sistem yang mati akibat crash</small>
                    </div>
                    <button
                      className={`btn btn-sm ${c3ServiceRestarted ? 'btn-success' : 'btn-primary'}`}
                      disabled={!c3SfcDone || c3ServiceRestarted}
                      onClick={() => {
                        setC3ServiceRestarted(true);
                        audio.play('success');
                        api.good('Layanan sistem berhasil di-restart dan sistem operasi kembali stabil!');
                      }}
                    >
                      <Icon name={c3ServiceRestarted ? 'check' : 'refresh'} size={14} />{' '}
                      {c3ServiceRestarted ? 'Layanan Aktif' : 'Restart System Services'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {solvedCount === 3 && (
        <div className="success-card mt-sm">
          <div className="sc-icon">
            <Icon name="wrench" size={32} color="#4ade80" />
          </div>
          <div>
            <b>Ketiga Kasus Software Troubleshooting Berhasil Diselesaikan!</b>
            <p>
              Workstation #01 (Driver GPU), Workstation #02 (Storage & Proses Runaway), dan Workstation #03 (Perbaikan File Sistem OS) telah kembali beroperasi normal.
            </p>
            <button className="btn btn-success" onClick={() => api.complete()}>
              Selesaikan Misi <Icon name="arrow-right" size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

