import { ACHIEVEMENTS, LEVELS, MISSIONS, getLevelForXp } from '../data/missions';
import { INFO_POINTS } from '../game/mapData';
import { EventBus } from '../game/EventBus';
import { resetProgress, setState, updateSettings, useGame } from '../state/store';
import { audio } from '../audio/audio';
import { Icon } from './Icon';

export function InfoDialog({ infoId }: { infoId: string }) {
  const pt = INFO_POINTS.find((p) => p.id === infoId);
  if (!pt) return null;
  const close = () => {
    audio.play('close');
    setState({ activeInfo: null });
  };
  return (
    <div className="modal-backdrop" onClick={close}>
      <div className="dialog-card" onClick={(e) => e.stopPropagation()}>
        <div className="row between center-v">
          <div className="row gap center-v">
            <span className="dlg-icon">
              <Icon name={pt.icon} size={28} color="#22d3ee" />
            </span>
            <div>
              <small className="dlg-eyebrow">INFORMASI PERANGKAT / NPC</small>
              <h3>{pt.title}</h3>
            </div>
          </div>
          <button className="btn btn-close" onClick={close}>
            <Icon name="close" size={16} />
          </button>
        </div>
        <p className="dlg-text">{pt.text}</p>
        <ul className="dlg-bullets">
          {pt.bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
        <div className="row end mt-sm">
          <button className="btn btn-primary" onClick={close}>
            <Icon name="check" size={15} /> Mengerti
          </button>
        </div>
      </div>
    </div>
  );
}

export function OverlayModal() {
  const modal = useGame((s) => s.modal);
  const settings = useGame((s) => s.settings);
  const progress = useGame((s) => s.progress);
  const screen = useGame((s) => s.screen);

  if (!modal) return null;

  const close = () => {
    audio.play('close');
    if (modal === 'tutorial') {
      setState((s) => ({ modal: null, progress: { ...s.progress, tutorialSeen: true } }));
    } else {
      setState({ modal: null });
    }
  };

  if (modal === 'tutorial') {
    return (
      <div className="modal-backdrop" onClick={close}>
        <div className="dialog-card" onClick={(e) => e.stopPropagation()}>
          <div className="row between center-v">
            <h3 className="row center-v gap">
              <Icon name="gamepad" size={22} color="#22d3ee" /> Tutorial Singkat Kontrol & Misi
            </h3>
            <button className="btn btn-close" onClick={close}>
              <Icon name="close" size={16} />
            </button>
          </div>
          <p className="dlg-text">
            Selamat bertugas di Gedung <b>IT SUPPORT – TECH MISSION</b>! Kamu berada di koridor utama gedung. Jelajahi 6 ruangan untuk menyelesaikan seluruh misi teknis.
          </p>
          <div className="tut-grid">
            <div className="tut-item">
              <div className="key-group">
                <span>W</span>
                <span>A</span>
                <span>S</span>
                <span>D</span>
              </div>
              <div>
                <b>Bergerak Bebas (2D Top-Down)</b>
                <small>Gunakan tombol W/A/S/D, Arrow Keys, atau Joystick Virtual di layar sentuh.</small>
              </div>
            </div>
            <div className="tut-item">
              <div className="key-group">
                <span>E</span>
              </div>
              <div>
                <b>Interaksi & Mulai Misi</b>
                <small>Dekati meja misi yang bersinar lalu tekan E (atau tombol Interaksi di bawah layar).</small>
              </div>
            </div>
            <div className="tut-item">
              <div className="key-group">
                <span>
                  <Icon name="map" size={16} />
                </span>
              </div>
              <div>
                <b>Mini Map & Penanda Misi</b>
                <small>Pantau posisi kamu dan lokasi misi yang belum selesai lewat Mini Map di kanan atas.</small>
              </div>
            </div>
          </div>
          <div className="row end mt-md">
            <button className="btn btn-primary btn-lg" onClick={close}>
              <Icon name="play" size={16} /> Mulai Jelajahi Gedung!
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (modal === 'howto') {
    return (
      <div className="modal-backdrop" onClick={close}>
        <div className="dialog-card wide" onClick={(e) => e.stopPropagation()}>
          <div className="row between center-v">
            <h3 className="row center-v gap">
              <Icon name="book" size={22} color="#22d3ee" /> Cara Bermain (How to Play)
            </h3>
            <button className="btn btn-close" onClick={close}>
              <Icon name="close" size={16} />
            </button>
          </div>

          <div className="howto-cols">
            <div className="srv-card">
              <b>
                <Icon name="gamepad" size={16} color="#22d3ee" /> Kontrol Karakter
              </b>
              <ul className="dlg-bullets">
                <li><b>W / Arrow Up</b>: Bergerak ke atas</li>
                <li><b>A / Arrow Left</b>: Bergerak ke kiri</li>
                <li><b>S / Arrow Down</b>: Bergerak ke bawah</li>
                <li><b>D / Arrow Right</b>: Bergerak ke kanan</li>
                <li><b>E / Enter</b>: Berinteraksi dengan meja misi, perangkat, atau NPC</li>
                <li><b>Mobile / Tablet</b>: Gunakan Virtual Joystick di kiri bawah & tombol Interaksi di kanan bawah</li>
              </ul>
            </div>

            <div className="srv-card">
              <b>
                <Icon name="server" size={16} color="#22d3ee" /> 6 Ruangan & Misi Praktik
              </b>
              <ul className="dlg-bullets">
                <li><b>1. IT Laboratory</b>: Rakit kabel LAN Straight standar T568B & crimping RJ45</li>
                <li><b>2. Hardware Workshop</b>: Pasang CPU, Heatsink, RAM, SSD, GPU, dan PSU ke motherboard</li>
                <li><b>3. Network Control Room</b>: Hubungkan kabel LAN, atur IP Address, Subnet Mask, Gateway & uji Ping</li>
                <li><b>4. Server Room</b>: Konfigurasi Hostname, IP Statis, Daemon Service & Firewall Server</li>
                <li><b>5. Software Support Room</b>: Perbaiki masalah Driver GPU, Storage penuh, dan File Sistem OS</li>
                <li><b>6. Helpdesk Office</b>: Tangani 5 tiket laporan pengguna hingga berstatus RESOLVED</li>
              </ul>
            </div>
          </div>

          <div className="row end mt-md">
            <button className="btn btn-primary" onClick={close}>
              Tutup Panduan
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (modal === 'settings') {
    return (
      <div className="modal-backdrop" onClick={close}>
        <div className="dialog-card" onClick={(e) => e.stopPropagation()}>
          <div className="row between center-v">
            <h3 className="row center-v gap">
              <Icon name="settings" size={22} color="#22d3ee" /> Pengaturan (Settings)
            </h3>
            <button className="btn btn-close" onClick={close}>
              <Icon name="close" size={16} />
            </button>
          </div>

          <div className="settings-list">
            <div className="setting-row">
              <div>
                <b>
                  <Icon name="music" size={15} color="#22d3ee" /> Background Music
                </b>
                <small>Musik latar bertema teknologi (Web Audio Synth)</small>
              </div>
              <button
                className={`btn btn-sm ${settings.music ? 'btn-success' : 'btn-ghost'}`}
                onClick={() => {
                  audio.unlock();
                  updateSettings({ music: !settings.music });
                }}
              >
                {settings.music ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="setting-row">
              <div>
                <b>
                  <Icon name="volume" size={15} color="#22d3ee" /> Sound Effects (SFX)
                </b>
                <small>Suara interaksi, crimping, klik, berhasil & salah</small>
              </div>
              <button
                className={`btn btn-sm ${settings.sfx ? 'btn-success' : 'btn-ghost'}`}
                onClick={() => {
                  audio.unlock();
                  updateSettings({ sfx: !settings.sfx });
                }}
              >
                {settings.sfx ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="setting-row">
              <div>
                <b>
                  <Icon name="volume" size={15} color="#22d3ee" /> Suara Langkah Kaki
                </b>
                <small>Efek suara ketika karakter berjalan di lantai gedung</small>
              </div>
              <button
                className={`btn btn-sm ${settings.footsteps ? 'btn-success' : 'btn-ghost'}`}
                onClick={() => updateSettings({ footsteps: !settings.footsteps })}
              >
                {settings.footsteps ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="setting-row">
              <div>
                <b>
                  <Icon name="settings" size={15} color="#22d3ee" /> Volume Utama ({Math.round(settings.volume * 100)}%)
                </b>
                <small>Atur keras/lembutnya suara keseluruhan</small>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={settings.volume}
                onChange={(e) => {
                  audio.unlock();
                  updateSettings({ volume: Number(e.target.value) });
                }}
              />
            </div>

            <div className="setting-row">
              <div>
                <b>
                  <Icon name="gamepad" size={15} color="#22d3ee" /> Kontrol Virtual Mobile
                </b>
                <small>Tampilkan joystick & tombol sentuh di layar</small>
              </div>
              <div className="row gap">
                {(['auto', 'on', 'off'] as const).map((m) => (
                  <button
                    key={m}
                    className={`btn btn-sm ${settings.showJoystick === m ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => updateSettings({ showJoystick: m })}
                  >
                    {m.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="row between center-v mt-md">
            <div className="row gap">
              {screen === 'game' && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    EventBus.emit('reset-player');
                    close();
                  }}
                >
                  <Icon name="pin" size={14} /> Reset Posisi ke Koridor
                </button>
              )}
              <button
                className="btn btn-danger btn-sm"
                onClick={() => {
                  if (window.confirm('Reset seluruh progress misi, XP, dan achievement dari awal?')) {
                    resetProgress();
                  }
                }}
              >
                <Icon name="trash" size={14} /> Reset Progress Game
              </button>
            </div>
            <button className="btn btn-primary" onClick={close}>
              Simpan & Tutup
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (modal === 'achievements') {
    const lvlInfo = getLevelForXp(progress.xp);
    return (
      <div className="modal-backdrop" onClick={close}>
        <div className="dialog-card wide" onClick={(e) => e.stopPropagation()}>
          <div className="row between center-v">
            <h3 className="row center-v gap">
              <Icon name="trophy" size={22} color="#facc15" /> Perkembangan Level & Achievement
            </h3>
            <button className="btn btn-close" onClick={close}>
              <Icon name="close" size={16} />
            </button>
          </div>

          <div className="levels-strip">
            {LEVELS.map((l) => {
              const reached = progress.xp >= l.minXp;
              const isCurrent = lvlInfo.current.level === l.level;
              return (
                <div key={l.level} className={`lvl-step ${reached ? 'reached' : ''} ${isCurrent ? 'current' : ''}`}>
                  <span>
                    <Icon name={l.badge} size={24} color={reached ? '#22d3ee' : '#64748b'} />
                  </span>
                  <b>Level {l.level}</b>
                  <small>{l.title}</small>
                  <code>{l.minXp} XP</code>
                </div>
              );
            })}
          </div>

          <div className="ach-grid mt-sm">
            {ACHIEVEMENTS.map((a) => {
              const unlocked = progress.achievements.includes(a.id);
              return (
                <div key={a.id} className={`ach-card ${unlocked ? 'unlocked' : ''}`}>
                  <div className="ach-ico" style={{ borderColor: unlocked ? a.color : undefined }}>
                    <Icon name={unlocked ? a.icon : 'lock'} size={20} color={unlocked ? a.color : '#64748b'} />
                  </div>
                  <div>
                    <b>{a.title}</b>
                    <small>{a.description}</small>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="row end mt-md">
            <button className="btn btn-primary" onClick={close}>
              Tutup
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (modal === 'map') {
    return (
      <div className="modal-backdrop" onClick={close}>
        <div className="dialog-card wide" onClick={(e) => e.stopPropagation()}>
          <div className="row between center-v">
            <h3 className="row center-v gap">
              <Icon name="map" size={22} color="#22d3ee" /> Direktori Ruangan & Status Misi Gedung IT
            </h3>
            <button className="btn btn-close" onClick={close}>
              <Icon name="close" size={16} />
            </button>
          </div>
          <p className="sim-sub">
            Berjalanlah menuju ruangan di bawah ini melalui koridor utama, dekati meja misi yang bersinar, lalu tekan <b>E</b> untuk memulai praktik.
          </p>

          <div className="map-mission-grid">
            {MISSIONS.map((m) => {
              const res = progress.completed[m.id];
              return (
                <div key={m.id} className={`map-mission-card ${res ? 'done' : ''}`} style={{ borderColor: res ? '#22c55e' : m.color }}>
                  <div className="row between center-v">
                    <span className="mm-room-badge" style={{ background: `${m.color}22`, color: m.color }}>
                      <Icon name={m.icon} size={13} color={m.color} /> {m.roomName}
                    </span>
                    <span className={`tck-status ${res ? 'ok' : 'high'}`}>
                      {res ? `SELESAI (${res.score}/100)` : `${m.difficulty} • +${m.xpReward} XP`}
                    </span>
                  </div>
                  <b>
                    Misi {m.number}: {m.title}
                  </b>
                  <small>{m.subtitle}</small>
                  <div className="row between center-v mt-sm">
                    <small>
                      <Icon name="pin" size={12} color="#94a3b8" /> Objek: {m.stationLabel}
                    </small>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => {
                        audio.play('open');
                        setState({ modal: null, activeMission: m.id });
                      }}
                    >
                      {res ? 'Ulangi Praktik' : 'Buka Misi'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="row end mt-md">
            <button className="btn btn-primary" onClick={close}>
              Kembali ke Map
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (modal === 'final') {
    const lvlInfo = getLevelForXp(progress.xp);
    const results = Object.values(progress.completed).filter(Boolean);
    const avgScore = results.length
      ? Math.round(results.reduce((acc, r) => acc + (r?.score ?? 0), 0) / results.length)
      : 100;

    return (
      <div className="modal-backdrop" onClick={close}>
        <div className="dialog-card wide final-card" onClick={(e) => e.stopPropagation()}>
          <div className="final-banner">
            <div className="final-crown">
              <Icon name="crown" size={44} color="#facc15" />
            </div>
            <div>
              <span className="mmc-tag">ALL 6 TECH MISSIONS COMPLETED!</span>
              <h2>SELAMAT! KAMU ADALAH IT SUPPORT EXPERT!</h2>
              <p>
                Seluruh insiden komputer, pengkabelan RJ45, perakitan hardware, konfigurasi jaringan LAN, administrasi server, troubleshooting OS, dan tiket Helpdesk telah tuntas!
              </p>
            </div>
          </div>

          <div className="final-stats-row">
            <div className="final-stat">
              <small>PANGKAT AKHIR</small>
              <b>
                <Icon name={lvlInfo.current.badge} size={15} color="#22d3ee" /> {lvlInfo.current.title} (LVL {lvlInfo.current.level})
              </b>
            </div>
            <div className="final-stat">
              <small>TOTAL XP</small>
              <b>
                <Icon name="bolt" size={15} color="#facc15" /> {progress.xp} XP
              </b>
            </div>
            <div className="final-stat">
              <small>RATA-RATA SKOR PRAKTIK</small>
              <b>
                <Icon name="award" size={15} color="#4ade80" /> {avgScore} / 100
              </b>
            </div>
            <div className="final-stat">
              <small>ACHIEVEMENTS</small>
              <b>
                <Icon name="trophy" size={15} color="#f472b6" /> {progress.achievements.length} / {ACHIEVEMENTS.length}
              </b>
            </div>
          </div>

          <div className="final-missions-summary">
            {MISSIONS.map((m) => {
              const r = progress.completed[m.id];
              return (
                <div key={m.id} className="fms-row">
                  <span>
                    <Icon name={m.icon} size={15} color={m.color} /> <b>Misi {m.number}: {m.title}</b> ({m.roomName})
                  </span>
                  <span className="row center-v gap">
                    {r ? (
                      <>
                        {Array.from({ length: r.stars }).map((_, i) => (
                          <Icon key={i} name="star" size={14} color="#facc15" />
                        ))}
                        <span>• Skor {r.score}/100</span>
                      </>
                    ) : (
                      'Belum selesai'
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="row between center-v mt-md">
            <button
              className="btn btn-ghost"
              onClick={() => {
                audio.play('click');
                setState({ modal: null, screen: 'start' });
              }}
            >
              <Icon name="home" size={15} /> Kembali ke Layar Utama
            </button>
            <button className="btn btn-primary btn-lg" onClick={close}>
              <Icon name="map" size={16} /> Lanjut Eksplorasi Gedung IT
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
