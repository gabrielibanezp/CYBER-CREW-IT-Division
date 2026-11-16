import { MISSIONS, getLevelForXp } from '../data/missions';
import { setState, useGame } from '../state/store';
import { audio } from '../audio/audio';
import { Icon } from './Icon';

export default function StartScreen() {
  const progress = useGame((s) => s.progress);
  const doneCount = MISSIONS.filter((m) => progress.completed[m.id]).length;
  const lvl = getLevelForXp(progress.xp);

  const handlePlay = () => {
    audio.unlock();
    audio.startMusic();
    audio.play('start');
    setState((s) => ({
      screen: 'game',
      modal: s.progress.tutorialSeen ? null : 'tutorial',
      progress: {
        ...s.progress,
        startedAt: s.progress.startedAt ?? Date.now(),
      },
    }));
  };

  return (
    <div className="start-screen">
      {/* Background bertema laboratorium komputer & jaringan */}
      <div className="start-bg-grid" />
      <div className="start-bg-decor">
        <div className="bg-rack rack-l">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-rack-u">
              <i className="led-g" />
              <i className="led-c" />
              <span />
            </div>
          ))}
        </div>
        <div className="bg-rack rack-r">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-rack-u">
              <i className="led-c" />
              <i className="led-g" />
              <span />
            </div>
          ))}
        </div>
      </div>

      <div className="start-container">
        <div className="start-hero-card">
          {/* Kiri: Logo, Identitas Game & Tombol Utama */}
          <div className="start-left">
            <div className="start-pill">
              <Icon name="bolt" size={13} color="#22d3ee" /> INTERACTIVE 2D TOP-DOWN IT SIMULATION GAME
            </div>
            <h1 className="start-logo">
              IT SUPPORT
              <span>TECH MISSION</span>
            </h1>
            <p className="start-desc">
              Jelajahi gedung teknologi sebagai teknisi IT Support profesional! Masuk ke 6 ruangan spesialis, rakit kabel LAN RJ45, pasang komponen motherboard, konfigurasi jaringan & server, hingga selesaikan tiket troubleshooting secara langsung.
            </p>

            {doneCount > 0 && (
              <div className="start-save-banner">
                <span>
                  <Icon name={lvl.current.badge} size={15} color="#4ade80" /> Progress Tersimpan: <b>Level {lvl.current.level} ({lvl.current.title})</b> •{' '}
                  <b>{doneCount}/6 Misi</b> • <b>{progress.xp} XP</b>
                </span>
              </div>
            )}

            <div className="start-buttons">
              <button className="btn btn-primary btn-xl pulse" onClick={handlePlay}>
                <Icon name="play" size={18} color="#ffffff" /> {doneCount > 0 ? 'PLAY GAME (LANJUTKAN)' : 'PLAY GAME'}
              </button>
              <div className="row gap">
                <button
                  className="btn btn-secondary btn-lg"
                  onClick={() => {
                    audio.unlock();
                    audio.play('open');
                    setState({ modal: 'howto' });
                  }}
                >
                  <Icon name="book" size={16} color="#38bdf8" /> HOW TO PLAY
                </button>
                <button
                  className="btn btn-secondary btn-lg"
                  onClick={() => {
                    audio.unlock();
                    audio.play('open');
                    setState({ modal: 'settings' });
                  }}
                >
                  <Icon name="settings" size={16} color="#38bdf8" /> SETTINGS
                </button>
              </div>
            </div>

            <div className="start-room-badges">
              <span><Icon name="cable" size={13} color="#22d3ee" /> IT Lab</span>
              <span><Icon name="cpu" size={13} color="#fb923c" /> Hardware Workshop</span>
              <span><Icon name="network" size={13} color="#38bdf8" /> Network Room</span>
              <span><Icon name="server" size={13} color="#a78bfa" /> Server Room</span>
              <span><Icon name="wrench" size={13} color="#34d399" /> Software Room</span>
              <span><Icon name="headset" size={13} color="#f472b6" /> Helpdesk Office</span>
            </div>
          </div>

          {/* Kanan: Ilustrasi Karakter Teknisi IT & Lab */}
          <div className="start-right">
            <div className="tech-char-showcase">
              <svg viewBox="0 0 280 300" className="tech-hero-svg">
                <defs>
                  <radialGradient id="heroGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#0a1630" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <circle cx="140" cy="155" r="125" fill="url(#heroGlow)" />
                {/* Lab Monitors Behind */}
                <rect x="24" y="62" width="76" height="52" rx="6" fill="#0f172a" stroke="#22d3ee" strokeWidth="2.5" />
                <line x1="34" y1="78" x2="84" y2="78" stroke="#22d3ee" strokeWidth="3" />
                <line x1="34" y1="88" x2="72" y2="88" stroke="#38bdf8" strokeWidth="3" />
                <line x1="34" y1="98" x2="88" y2="98" stroke="#34d399" strokeWidth="3" />

                <rect x="180" y="62" width="76" height="52" rx="6" fill="#0f172a" stroke="#a78bfa" strokeWidth="2.5" />
                <circle cx="204" cy="88" r="11" fill="none" stroke="#a78bfa" strokeWidth="3" />
                <line x1="222" y1="80" x2="246" y2="80" stroke="#a78bfa" strokeWidth="3" />
                <line x1="222" y1="92" x2="240" y2="92" stroke="#f472b6" strokeWidth="3" />

                {/* Shadow */}
                <ellipse cx="140" cy="268" rx="62" ry="14" fill="#020617" opacity="0.65" />

                {/* Legs & Shoes */}
                <rect x="112" y="206" width="22" height="48" rx="8" fill="#1e3a8a" />
                <rect x="146" y="206" width="22" height="48" rx="8" fill="#1e3a8a" />
                <rect x="106" y="246" width="30" height="14" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
                <rect x="144" y="246" width="30" height="14" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />

                {/* Torso Jacket */}
                <rect x="96" y="132" width="88" height="82" rx="22" fill="#0891b2" stroke="#22d3ee" strokeWidth="2.5" />
                <polygon points="124,132 140,154 156,132" fill="#e0f2fe" />
                {/* ID Badge */}
                <rect x="150" y="156" width="20" height="26" rx="3" fill="#ffffff" />
                <rect x="153" y="160" width="14" height="6" fill="#0284c7" />
                <line x1="153" y1="171" x2="167" y2="171" stroke="#64748b" strokeWidth="2" />
                <line x1="153" y1="176" x2="164" y2="176" stroke="#64748b" strokeWidth="2" />

                {/* Belt */}
                <rect x="98" y="198" width="84" height="11" rx="4" fill="#0f172a" />
                <rect x="132" y="197" width="16" height="13" rx="2" fill="#facc15" />

                {/* Arms holding Laptop & Crimping Tool */}
                <rect x="70" y="140" width="26" height="54" rx="12" fill="#06b6d4" />
                <rect x="184" y="140" width="26" height="54" rx="12" fill="#06b6d4" />
                <circle cx="83" cy="196" r="10" fill="#f2c6a0" />
                <circle cx="197" cy="196" r="10" fill="#f2c6a0" />

                {/* Diagnostic Tablet in Left Hand */}
                <rect x="54" y="176" width="42" height="30" rx="5" fill="#1e293b" stroke="#22d3ee" strokeWidth="2" />
                <text x="75" y="195" textAnchor="middle" fontSize="9" fontWeight="800" fill="#22d3ee">PING OK</text>

                {/* Head */}
                <circle cx="140" cy="92" r="36" fill="#f2c6a0" />
                {/* Hair */}
                <path d="M104 88 C104 54, 176 54, 176 88 C166 74, 114 74, 104 88 Z" fill="#1e1b18" />
                {/* Eyes & Smile */}
                <circle cx="126" cy="94" r="5" fill="#0f172a" />
                <circle cx="154" cy="94" r="5" fill="#0f172a" />
                <circle cx="128" cy="92" r="1.8" fill="#ffffff" />
                <circle cx="156" cy="92" r="1.8" fill="#ffffff" />
                <path d="M130 108 Q140 117 150 108" stroke="#7c2d12" strokeWidth="3" fill="none" strokeLinecap="round" />

                {/* Tech Headset */}
                <path d="M100 92 A42 42 0 0 1 180 92" stroke="#1e293b" strokeWidth="7" fill="none" />
                <rect x="94" y="80" width="12" height="26" rx="5" fill="#22d3ee" stroke="#0f172a" strokeWidth="2" />
                <rect x="174" y="80" width="12" height="26" rx="5" fill="#22d3ee" stroke="#0f172a" strokeWidth="2" />
                <path d="M102 104 Q114 118 128 114" stroke="#1e293b" strokeWidth="3.5" fill="none" />
                <circle cx="128" cy="114" r="4" fill="#22d3ee" />
              </svg>
              <div className="showcase-caption">
                <b>Teknisi IT Support Siap Bertugas!</b>
                <small>Gunakan W/A/S/D atau Arrow Keys untuk menjelajahi map & tekan E untuk berinteraksi</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

