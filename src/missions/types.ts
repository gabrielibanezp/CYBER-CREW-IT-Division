export interface MissionApi {
  /** Register a mistake (wrong answer/config). Plays error sfx and shows feedback. */
  mistake: (msg: string) => void;
  /** Positive feedback message. */
  good: (msg: string) => void;
  /** Report stage progress for the mission progress bar. */
  progress: (done: number, total: number, label: string) => void;
  /** Mission fully solved. */
  complete: () => void;
}

export interface MissionProps {
  api: MissionApi;
}

