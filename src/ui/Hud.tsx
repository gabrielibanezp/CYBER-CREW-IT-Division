import { MISSIONS, ROOMS, getLevelForXp } from '../data/missions';
import { EventBus } from '../game/EventBus';
import { setState, useGame } from '../state/store';
import { audio } from '../audio/audio';
import MiniMap from './MiniMap';
import { Icon } from './Icon';

export default function Hud() {
  const xp = useGame((s) => s.progress.xp);
  const completed = useGame((s) => s.progress.completed);
  const achievements = useGame((s) => s.progress.achievements);
  const nearby = useGame((s) => s.nearby);
  const currentRoom = useGame((s) => s.currentRoom);
  const toasts = useGame((s) => s.toasts);

  const lvlInfo = getLevelForXp(xp);
  const doneCount = MISSIONS.filter((m) => completed[m.id]).length;
  const totalMissions = MISSIONS.length;
  const overallPct = Math.round((doneCount / totalMissions) * 100);

  const roomObj = ROOMS.find((r) => r.id === currentRoom) ?? ROOMS.find((r) => r.id === 'corridor')!;
  const nextMission = MISSIONS.find((m) => !completed[m.id]);

  return (
    <div className="hud-layer">
      {/* Kiri Atas: Nama Game, Level Pemain, XP */}
      <div className="hud-top-left">
        <div className="hud-brand-card">
          <div className="hud-logo-badge">
            <Icon name="wrench" size={20} color="#ffffff" />
          </div>
          <div className="hud-brand-text">
            <div className="hud-game-title">IT SUPPORT – TECH MISSION</div>
            <div className="hud-level-row">
              <span className="hud-lvl-pill">
                <Icon name={lvlInfo.current.badge} size={14} color="#22d3ee" /> LVL {lvlInfo.current.level}: {lvlInfo.current.title}
              </span>
              <span className="hud-xp-text">
                <Icon name="bolt" size={13} color="#facc15" /> <b>{xp}</b> XP {lvlInfo.next ? `/ ${lvlInfo.next.minXp} XP` : '(MAX)'}
              </span>
            </div>
            <div className="hud-xp-bar">
              <div className="hud-xp-fill" style={{ width: `${lvlInfo.progressPct}%` }} />
            </div>
          </div>
        </div>

        {/* Indikator Ruangan Saat Ini */}
        <div className="hud-room-pill" style={{ borderColor: roomObj.color }}>
          <span className="room-dot" style={{ background: roomObj.color }} />
          <div>
            <b>{roomObj.name}</b>
            <small>{roomObj.subtitle}</small>
          </div>
        </div>
      </div>

      {/* Kanan Atas: Jumlah Misi Selesai, Tombol Settings, Mini Map */}
      <div className="hud-top-right">
        <div className="hud-actions-row">
          <button
            className="hud-stat-chip"
            onClick={() => {
              audio.play('open');
              setState({ modal: 'map' });
            }}
            title="Lihat Daftar Misi & Peta"
          >
            <Icon name="check" size={15} color="#22d3ee" />
            <span>Misi Selesai:</span>
            <b>
              {doneCount}/{totalMissions}
            </b>
          </button>

          <button
            className="hud-stat-chip"
            onClick={() => {
              audio.play('open');
              setState({ modal: 'achievements' });
            }}
            title="Achievement & Badge"
          >
            <Icon name="trophy" size={15} color="#facc15" />
            <b>{achievements.length}</b>
          </button>

          {doneCount === totalMissions && (
            <button
              className="hud-stat-chip champ"
              onClick={() => {
                audio.play('open');
                setState({ modal: 'final' });
              }}
            >
              <Icon name="crown" size={15} color="#ffffff" /> Sertifikat Hasil
            </button>
          )}

          <button
            className="hud-icon-btn"
            onClick={() => {
              audio.play('open');
              setState({ modal: 'howto' });
            }}
            title="Cara Bermain"
          >
            <Icon name="help" size={18} color="#38bdf8" />
          </button>

          <button
            className="hud-icon-btn"
            onClick={() => {
              audio.play('open');
              setState({ modal: 'settings' });
            }}
            title="Pengaturan (Settings)"
          >
            <Icon name="settings" size={18} color="#22d3ee" />
          </button>
        </div>

        <MiniMap
          onClick={() => {
            audio.play('open');
            setState({ modal: 'map' });
          }}
        />
      </div>

      {/* Toast Notifications */}
      <div className="hud-toasts">
        {toasts.map((t) => (
          <div key={t.id} className={`hud-toast kind-${t.kind}`} style={{ borderColor: t.color }}>
            <span className="ht-icon">
              <Icon name={t.icon} size={22} color={t.color ?? '#22d3ee'} />
            </span>
            <div>
              <b>{t.title}</b>
              <small>{t.text}</small>
            </div>
          </div>
        ))}
      </div>

      {/* Bagian Bawah: Mission Progress Bar, Instruksi Singkat, Tombol Interaksi */}
      <div className="hud-bottom">
        <div className="hud-bottom-card">
          <div className="hb-top-row">
            <div className="hb-mission-info">
              <span className="hb-label">
                <Icon name="terminal" size={13} color="#22d3ee" /> MISSION PROGRESS ({overallPct}%)
              </span>
              <span className="hb-hint">
                {nearby ? (
                  <b className="hb-nearby-text">
                    <Icon name="spark" size={14} color="#fde047" /> Dekat Objek: {nearby.label} — Tekan [E] atau tombol Interaksi!
                  </b>
                ) : nextMission ? (
                  <>
                    <Icon name="pin" size={14} color="#38bdf8" /> Misi Berikutnya: <b>{nextMission.title}</b> di <b>{nextMission.roomName}</b> (Gunakan W/A/S/D atau Arrow Keys)
                  </>
                ) : (
                  <b>
                    <Icon name="trophy" size={14} color="#facc15" /> Seluruh 6 Misi Selesai! Kamu adalah IT Support Expert!
                  </b>
                )}
              </span>
            </div>

            <button
              className={`hb-interact-btn ${nearby ? 'active' : ''}`}
              disabled={!nearby}
              onClick={() => EventBus.emit('interact-request')}
            >
              <span className="key-cap">E</span>
              <span>{nearby ? nearby.label : 'Dekati Objek Misi'}</span>
            </button>
          </div>

          <div className="hb-progress-track">
            <div className="hb-progress-fill" style={{ width: `${overallPct}%` }} />
            <div className="hb-mission-pips">
              {MISSIONS.map((m) => {
                const isDone = !!completed[m.id];
                return (
                  <button
                    key={m.id}
                    className={`hb-pip ${isDone ? 'done' : ''}`}
                    onClick={() => {
                      audio.play('open');
                      setState({ modal: 'map' });
                    }}
                    title={`Misi ${m.number}: ${m.title} (${m.roomName})`}
                  >
                    <Icon name={isDone ? 'check' : m.icon} size={14} color={isDone ? '#4ade80' : m.color} />
                    <small>{m.roomName.split(' ')[0]}</small>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
