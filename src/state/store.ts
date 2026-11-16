import { useSyncExternalStore } from 'react';
import { ACHIEVEMENTS, MISSIONS, MissionId, getLevelForXp } from '../data/missions';
import { audio } from '../audio/audio';

/**
 * Global game state (progress, settings, UI flags) persisted to localStorage.
 * A tiny external store consumed by React via useSyncExternalStore.
 */

export interface MissionResult {
  score: number; // 0..100
  stars: number; // 1..3
  mistakes: number;
  xp: number;
  completedAt: number;
}

export interface Settings {
  music: boolean;
  sfx: boolean;
  volume: number;
  footsteps: boolean;
  showJoystick: 'auto' | 'on' | 'off';
}

export interface Progress {
  xp: number;
  completed: Partial<Record<MissionId, MissionResult>>;
  achievements: string[];
  tutorialSeen: boolean;
  playerPos: { x: number; y: number } | null;
  startedAt: number | null;
  finishedAt: number | null;
  finalSeen: boolean;
}

export type Screen = 'start' | 'game';

export interface Toast {
  id: number;
  kind: 'mission' | 'achievement' | 'level' | 'info' | 'error';
  title: string;
  text: string;
  icon: string;
  color?: string;
}

export interface GameState {
  screen: Screen;
  progress: Progress;
  settings: Settings;
  activeMission: MissionId | null;
  activeInfo: string | null;
  modal: null | 'settings' | 'howto' | 'tutorial' | 'final' | 'achievements' | 'map';
  toasts: Toast[];
  nearby: { kind: 'mission' | 'info'; id: string; label: string } | null;
  currentRoom: string;
}

const SAVE_KEY = 'itsupport-techmission-save-v1';
const SETTINGS_KEY = 'itsupport-techmission-settings-v1';

const defaultProgress = (): Progress => ({
  xp: 0,
  completed: {},
  achievements: [],
  tutorialSeen: false,
  playerPos: null,
  startedAt: null,
  finishedAt: null,
  finalSeen: false,
});

const defaultSettings = (): Settings => ({
  music: true,
  sfx: true,
  volume: 0.7,
  footsteps: true,
  showJoystick: 'auto',
});

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

let state: GameState = {
  screen: 'start',
  progress: load(SAVE_KEY, defaultProgress()),
  settings: load(SETTINGS_KEY, defaultSettings()),
  activeMission: null,
  activeInfo: null,
  modal: null,
  toasts: [],
  nearby: null,
  currentRoom: 'Main Tech Corridor',
};

audio.setSettings(state.settings);

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}

export function getState() {
  return state;
}

export function setState(patch: Partial<GameState> | ((s: GameState) => Partial<GameState>)) {
  const p = typeof patch === 'function' ? patch(state) : patch;
  state = { ...state, ...p };
  if ('progress' in p) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state.progress));
    } catch {
      /* storage might be unavailable */
    }
  }
  if ('settings' in p) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
    } catch {
      /* ignore */
    }
    audio.setSettings(state.settings);
  }
  emit();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useGame<T>(selector: (s: GameState) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state));
}

// ---------------- Actions ----------------
let toastId = 1;
export function pushToast(t: Omit<Toast, 'id'>, ms = 3800) {
  const id = toastId++;
  setState((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
  window.setTimeout(() => {
    setState((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) }));
  }, ms);
}

export function updateSettings(p: Partial<Settings>) {
  setState((s) => ({ settings: { ...s.settings, ...p } }));
}

export function savePlayerPos(x: number, y: number) {
  // Silent save (does not trigger re-render storms): write directly.
  state.progress = { ...state.progress, playerPos: { x: Math.round(x), y: Math.round(y) } };
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state.progress));
  } catch {
    /* ignore */
  }
}

export function resetProgress() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    /* ignore */
  }
  setState({ progress: defaultProgress(), activeMission: null, modal: null, screen: 'start' });
}

export function calcResult(mistakes: number, baseXp: number): MissionResult {
  const score = Math.max(50, 100 - mistakes * 8);
  const stars = score >= 90 ? 3 : score >= 70 ? 2 : 1;
  const bonus = stars === 3 ? 50 : stars === 2 ? 20 : 0;
  return { score, stars, mistakes, xp: baseXp + bonus, completedAt: Date.now() };
}

/** Completes a mission. Returns the result and newly unlocked info for the result screen. */
export function completeMission(id: MissionId, mistakes: number) {
  const mission = MISSIONS.find((m) => m.id === id)!;
  const prev = state.progress;
  const already = prev.completed[id];
  const result = calcResult(mistakes, mission.xpReward);
  // Replays only grant XP difference if score improved
  const gainedXp = already ? Math.max(0, result.xp - already.xp) : result.xp;
  const best = already && already.score >= result.score ? already : result;

  const completed = { ...prev.completed, [id]: best };
  const xp = prev.xp + gainedXp;

  const unlocked: string[] = [];
  const has = (a: string) => prev.achievements.includes(a) || unlocked.includes(a);
  const unlock = (a: string) => {
    if (!has(a)) unlocked.push(a);
  };
  unlock('first_mission');
  if (completed.cable_assembly) unlock('cable_master');
  if (completed.hardware_assembly) unlock('hardware_specialist');
  if (completed.network_config) unlock('network_expert');
  if (completed.server_config) unlock('server_admin');
  if (completed.helpdesk_ticket) unlock('helpdesk_hero');
  if (completed.server_config && completed.software_troubleshoot) unlock('troubleshooting_master');
  const allDone = MISSIONS.every((m) => completed[m.id]);
  if (allDone) unlock('it_support_champion');

  const levelBefore = getLevelForXp(prev.xp).current.level;
  const levelAfter = getLevelForXp(xp).current;

  setState({
    progress: {
      ...prev,
      xp,
      completed,
      achievements: [...prev.achievements, ...unlocked],
      finishedAt: allDone && !prev.finishedAt ? Date.now() : prev.finishedAt,
    },
  });

  return {
    result,
    gainedXp,
    unlocked: unlocked.map((u) => ACHIEVEMENTS.find((a) => a.id === u)).filter(Boolean),
    leveledUp: levelAfter.level > levelBefore ? levelAfter : null,
    allDone,
  };
}

export function announceRewards(r: ReturnType<typeof completeMission>, missionTitle: string) {
  audio.play('complete');
  pushToast({ kind: 'mission', title: 'MISSION COMPLETED', text: `${missionTitle} • +${r.gainedXp} XP`, icon: 'check', color: '#22d3ee' }, 4500);
  let delay = 900;
  if (r.leveledUp) {
    const lv = r.leveledUp;
    window.setTimeout(() => {
      audio.play('levelup');
      pushToast({ kind: 'level', title: `LEVEL UP! Level ${lv.level}`, text: lv.title, icon: lv.badge, color: '#facc15' }, 4500);
    }, delay);
    delay += 900;
  }
  r.unlocked.forEach((a) => {
    if (!a) return;
    window.setTimeout(() => {
      audio.play('achievement');
      pushToast({ kind: 'achievement', title: 'Achievement Unlocked', text: a.title, icon: a.icon, color: a.color }, 4500);
    }, delay);
    delay += 900;
  });
}

