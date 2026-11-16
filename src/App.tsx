import { useEffect } from 'react';
import { MissionId } from './data/missions';
import { EventBus, worldLock } from './game/EventBus';
import PhaserGame from './game/PhaserGame';
import MissionModal from './missions/MissionModal';
import { setState, useGame } from './state/store';
import Hud from './ui/Hud';
import MobileControls from './ui/MobileControls';
import { InfoDialog, OverlayModal } from './ui/Modals';
import StartScreen from './ui/StartScreen';
import { audio } from './audio/audio';

export default function App() {
  const screen = useGame((s) => s.screen);
  const activeMission = useGame((s) => s.activeMission);
  const activeInfo = useGame((s) => s.activeInfo);
  const modal = useGame((s) => s.modal);

  // Lock player movement whenever a modal/mission/dialog is open
  useEffect(() => {
    worldLock.locked = Boolean(activeMission || activeInfo || modal || screen !== 'game');
  }, [activeMission, activeInfo, modal, screen]);

  // Listen to Phaser scene events
  useEffect(() => {
    const off1 = EventBus.on('nearby', (nearby) => {
      setState({ nearby });
    });
    const off2 = EventBus.on('room', (roomId: string) => {
      setState({ currentRoom: roomId });
    });
    const off3 = EventBus.on('interact', (payload: { kind: 'mission' | 'info'; id: string }) => {
      audio.unlock();
      if (payload.kind === 'mission') {
        audio.play('start');
        setState({ activeMission: payload.id as MissionId });
      } else {
        setState({ activeInfo: payload.id });
      }
    });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setState((s) => {
          if (s.modal) return { modal: null };
          if (s.activeInfo) return { activeInfo: null };
          if (s.activeMission) return { activeMission: null };
          return {};
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      off1();
      off2();
      off3();
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div className="app-root" onPointerDown={() => audio.unlock()}>
      {screen === 'start' && <StartScreen />}

      {screen === 'game' && (
        <div className="game-viewport">
          <PhaserGame />
          <Hud />
          <MobileControls />
        </div>
      )}

      {activeMission && <MissionModal missionId={activeMission} />}
      {activeInfo && <InfoDialog infoId={activeInfo} />}
      <OverlayModal />
    </div>
  );
}

