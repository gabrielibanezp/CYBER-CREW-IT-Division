import { useMemo, useState } from 'react';
import { MISSIONS, MissionId } from '../data/missions';
import { announceRewards, completeMission, setState } from '../state/store';
import { EventBus } from '../game/EventBus';
import { audio } from '../audio/audio';
import { MissionApi } from './types';
import { Icon } from '../ui/Icon';
import CableMission from './CableMission';
import HardwareMission from './HardwareMission';
import NetworkMission from './NetworkMission';
import ServerMission from './ServerMission';
import SoftwareMission from './SoftwareMission';
import HelpdeskMission from './HelpdeskMission';

export default function MissionModal({ missionId }: { missionId: MissionId }) {
  const mission = MISSIONS.find((m) => m.id === missionId)!;
  const [mistakes, setMistakes] = useState(0);
  const [feedback, setFeedback] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [prog, setProg] = useState<{ done: number; total: number; label: string }>({
    done: 0,
    total: 1,
    label: 'Mulai simulasi praktik',
  });
  const [completedInfo, setCompletedInfo] = useState<ReturnType<typeof completeMission> | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);

  const api: MissionApi = useMemo(
    () => ({
      mistake: (msg: string) => {
        audio.play('error');
        setMistakes((m) => m + 1);
        setFeedback({ kind: 'err', text: msg });
      },
      good: (msg: string) => {
        setFeedback({ kind: 'ok', text: msg });
      },
      progress: (done: number, total: number, label: string) => {
        setProg({ done, total, label });
      },
      complete: () => {
        const res = completeMission(missionId, mistakes);
        announceRewards(res, mission.title);
        EventBus.emit('missions-changed');
        setCompletedInfo(res);
      },
    }),
    [missionId, mistakes, mission.title],
  );

  const closeModal = () => {
    audio.play('close');
    const allDone = completedInfo?.allDone;
    setState((s) => ({
      activeMission: null,
      modal: allDone && !s.progress.finalSeen ? 'final' : s.modal,
      progress: allDone ? { ...s.progress, finalSeen: true } : s.progress,
    }));
  };

  const pct = Math.min(100, Math.round((prog.done / Math.max(1, prog.total)) * 100));

  return (
    <div className="modal-backdrop">
      <div className="mission-modal">
        {/* Header Misi */}
        <div className="mm-header" style={{ borderColor: mission.color }}>
          <div className="mm-title-group">
            <div className="mm-icon" style={{ background: `${mission.color}22`, borderColor: mission.color }}>
              <Icon name={mission.icon} size={26} color={mission.color} />
            </div>
            <div>
              <div className="mm-eyebrow">
                <span className="mm-room-badge" style={{ background: `${mission.color}26`, color: mission.color }}>
                  <Icon name="pin" size={12} color={mission.color} /> {mission.roomName}
                </span>
                <span className={`mm-diff diff-${mission.difficulty.toLowerCase()}`}>
                  <Icon name="bolt" size={12} color="#fde047" /> Kesulitan: {mission.difficulty}
                </span>
                <span className="mm-xp-badge">+{mission.xpReward} XP</span>
              </div>
              <h2>
                MISSION {mission.number}: {mission.title}
              </h2>
              <p className="mm-subtitle">{mission.subtitle}</p>
            </div>
          </div>

          <div className="mm-header-actions">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setShowInstructions((s) => !s);
                audio.play('click');
              }}
            >
              <Icon name="book" size={14} /> {showInstructions ? 'Sembunyikan Info' : 'Lihat Instruksi'}
            </button>
            <button className="btn btn-close" onClick={closeModal} title="Tutup Misi (ESC)">
              <Icon name="close" size={16} />
            </button>
          </div>
        </div>

        {/* Progress penyelesaian misi */}
        <div className="mm-progress-strip">
          <div className="row between center-v">
            <span>
              <b>Progress Penyelesaian:</b> {prog.label}
            </span>
            <span>
              <b>{pct}%</b> • Kesalahan: <b>{mistakes}</b>
            </span>
          </div>
          <div className="prog-bar">
            <div className="prog-fill" style={{ width: `${pct}%`, background: mission.color }} />
          </div>
        </div>

        {/* Body */}
        <div className="mm-body">
          {!completedInfo ? (
            <>
              {showInstructions && (
                <div className="mm-brief">
                  <div className="mm-brief-col">
                    <b>
                      <Icon name="alert" size={14} color="#facc15" /> Deskripsi Masalah:
                    </b>
                    <p>{mission.problemDescription}</p>
                  </div>
                  <div className="mm-brief-col">
                    <b>
                      <Icon name="wrench" size={14} color="#22d3ee" /> Instruksi Pengerjaan:
                    </b>
                    <ol>
                      {mission.instructions.map((ins, i) => (
                        <li key={i}>{ins}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}

              {feedback && (
                <div className={`mm-feedback ${feedback.kind}`}>
                  <Icon
                    name={feedback.kind === 'err' ? 'alert' : 'check'}
                    size={18}
                    color={feedback.kind === 'err' ? '#f87171' : '#4ade80'}
                  />
                  <div>{feedback.text}</div>
                </div>
              )}

              <div className="mm-sim-container">
                {missionId === 'cable_assembly' && <CableMission api={api} />}
                {missionId === 'hardware_assembly' && <HardwareMission api={api} />}
                {missionId === 'network_config' && <NetworkMission api={api} />}
                {missionId === 'server_config' && <ServerMission api={api} />}
                {missionId === 'software_troubleshoot' && <SoftwareMission api={api} />}
                {missionId === 'helpdesk_ticket' && <HelpdeskMission api={api} />}
              </div>
            </>
          ) : (
            /* Layar Hasil & Penjelasan Materi setelah Misi Selesai */
            <div className="mm-complete-view">
              <div className="mmc-banner">
                <div className="mmc-trophy">
                  <Icon name="trophy" size={44} color="#facc15" />
                </div>
                <div>
                  <span className="mmc-tag">MISSION COMPLETED</span>
                  <h3>{mission.title} Berhasil Diselesaikan!</h3>
                  <p>Lokasi Misi ({mission.roomName}) kini ditandai selesai pada peta gedung.</p>
                </div>
                <div className="mmc-stats">
                  <div className="mmc-stat">
                    <small>NILAI HASIL</small>
                    <b>{completedInfo.result.score}/100</b>
                  </div>
                  <div className="mmc-stat">
                    <small>RATING</small>
                    <b className="row center-v gap" style={{ justifyContent: 'center' }}>
                      {Array.from({ length: completedInfo.result.stars }).map((_, i) => (
                        <Icon key={i} name="star" size={15} color="#facc15" />
                      ))}
                    </b>
                  </div>
                  <div className="mmc-stat">
                    <small>REWARD XP</small>
                    <b>+{completedInfo.gainedXp} XP</b>
                  </div>
                </div>
              </div>

              <div className="mmc-learning-card">
                <h4>
                  <Icon name="book" size={17} color="#22d3ee" /> Rangkuman Materi: {mission.learningTitle}
                </h4>
                <p>{mission.learningSummary}</p>
                <ul>
                  {mission.learningBullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>

              <div className="row end gap mt-md">
                <button className="btn btn-primary btn-lg" onClick={closeModal}>
                  {completedInfo.allDone ? (
                    <>
                      <Icon name="trophy" size={16} /> Lihat Hasil Akhir Gedung IT <Icon name="arrow-right" size={16} />
                    </>
                  ) : (
                    <>
                      <Icon name="map" size={16} /> Kembali Jelajahi Map <Icon name="arrow-right" size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
