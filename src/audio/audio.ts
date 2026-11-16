/**
 * Procedural audio engine (Web Audio API) – no external audio files needed.
 * Provides SFX and a looping tech-themed background music track.
 */
export type SfxName =
  | 'click'
  | 'pick'
  | 'drop'
  | 'snap'
  | 'success'
  | 'error'
  | 'start'
  | 'complete'
  | 'step'
  | 'crimp'
  | 'type'
  | 'power'
  | 'levelup'
  | 'beep'
  | 'open'
  | 'close'
  | 'achievement';

interface AudioSettings {
  music: boolean;
  sfx: boolean;
  volume: number; // 0..1
}

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private settings: AudioSettings = { music: true, sfx: true, volume: 0.7 };
  private musicTimer: number | null = null;
  private musicStep = 0;
  private nextNoteTime = 0;
  private musicWanted = false;
  private noiseBuffer: AudioBuffer | null = null;

  /** Must be called from a user gesture at least once. */
  unlock() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.connect(this.ctx.destination);
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.connect(this.master);
      this.musicGain = this.ctx.createGain();
      this.musicGain.connect(this.master);
      const len = this.ctx.sampleRate * 0.5;
      this.noiseBuffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      this.applySettings();
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    if (this.musicWanted) this.startMusic();
  }

  setSettings(s: AudioSettings) {
    this.settings = { ...s };
    this.applySettings();
    if (this.settings.music && this.musicWanted) this.startMusic();
    if (!this.settings.music) this.haltMusicLoop();
  }

  private applySettings() {
    if (!this.master || !this.sfxGain || !this.musicGain || !this.ctx) return;
    const t = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(this.settings.volume, t, 0.05);
    this.sfxGain.gain.setTargetAtTime(this.settings.sfx ? 0.9 : 0, t, 0.02);
    this.musicGain.gain.setTargetAtTime(this.settings.music ? 0.22 : 0, t, 0.2);
  }

  private tone(
    freq: number,
    start: number,
    dur: number,
    opts: { type?: OscillatorType; vol?: number; slideTo?: number; attack?: number; dest?: AudioNode } = {},
  ) {
    if (!this.ctx) return;
    const { type = 'sine', vol = 0.3, slideTo, attack = 0.005, dest = this.sfxGain! } = opts;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + dur);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(vol, start + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(g);
    g.connect(dest);
    osc.start(start);
    osc.stop(start + dur + 0.05);
  }

  private noise(start: number, dur: number, vol = 0.2, filterFreq = 2000, dest?: AudioNode) {
    if (!this.ctx || !this.noiseBuffer) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, start);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    src.connect(filter);
    filter.connect(g);
    g.connect(dest ?? this.sfxGain!);
    src.start(start);
    src.stop(start + dur + 0.05);
  }

  play(name: SfxName) {
    if (!this.ctx || !this.settings.sfx) return;
    const t = this.ctx.currentTime + 0.01;
    switch (name) {
      case 'click':
        this.tone(880, t, 0.06, { type: 'triangle', vol: 0.15 });
        break;
      case 'open':
        this.tone(440, t, 0.12, { type: 'sine', vol: 0.18, slideTo: 880 });
        break;
      case 'close':
        this.tone(880, t, 0.12, { type: 'sine', vol: 0.15, slideTo: 440 });
        break;
      case 'pick':
        this.tone(520, t, 0.08, { type: 'triangle', vol: 0.18, slideTo: 760 });
        break;
      case 'drop':
        this.tone(600, t, 0.08, { type: 'triangle', vol: 0.15, slideTo: 380 });
        break;
      case 'snap':
        this.noise(t, 0.05, 0.25, 3000);
        this.tone(1200, t, 0.08, { type: 'square', vol: 0.08 });
        break;
      case 'step':
        this.noise(t, 0.04, 0.05, 900);
        break;
      case 'type':
        this.noise(t, 0.025, 0.08, 4000);
        break;
      case 'beep':
        this.tone(1000, t, 0.12, { type: 'square', vol: 0.08 });
        break;
      case 'success':
        this.tone(660, t, 0.12, { type: 'triangle', vol: 0.2 });
        this.tone(990, t + 0.09, 0.18, { type: 'triangle', vol: 0.2 });
        break;
      case 'error':
        this.tone(220, t, 0.18, { type: 'sawtooth', vol: 0.12, slideTo: 140 });
        this.tone(180, t + 0.12, 0.2, { type: 'square', vol: 0.08, slideTo: 110 });
        break;
      case 'start':
        [523, 659, 784, 1046].forEach((f, i) => this.tone(f, t + i * 0.07, 0.16, { type: 'triangle', vol: 0.17 }));
        break;
      case 'complete':
        [523, 659, 784, 1046, 1318].forEach((f, i) => this.tone(f, t + i * 0.09, 0.3, { type: 'triangle', vol: 0.2 }));
        this.tone(1568, t + 0.5, 0.6, { type: 'sine', vol: 0.15 });
        break;
      case 'levelup':
        [392, 523, 659, 784, 1046, 1318, 1568].forEach((f, i) =>
          this.tone(f, t + i * 0.06, 0.25, { type: 'square', vol: 0.07 }),
        );
        break;
      case 'achievement':
        [784, 988, 1175, 1568].forEach((f, i) => this.tone(f, t + i * 0.1, 0.35, { type: 'sine', vol: 0.18 }));
        break;
      case 'crimp':
        this.noise(t, 0.12, 0.4, 1500);
        this.tone(140, t, 0.15, { type: 'square', vol: 0.12, slideTo: 80 });
        break;
      case 'power':
        this.tone(80, t, 0.6, { type: 'sawtooth', vol: 0.08, slideTo: 300, attack: 0.1 });
        this.tone(1200, t + 0.5, 0.15, { type: 'square', vol: 0.08 });
        break;
    }
  }

  // ---------------- Music ----------------
  startMusic() {
    this.musicWanted = true;
    if (!this.ctx || !this.settings.music || this.musicTimer !== null) return;
    this.nextNoteTime = this.ctx.currentTime + 0.1;
    this.musicTimer = window.setInterval(() => this.scheduleMusic(), 60);
  }

  stopMusic() {
    this.musicWanted = false;
    this.haltMusicLoop();
  }

  private haltMusicLoop() {
    if (this.musicTimer !== null) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private scheduleMusic() {
    if (!this.ctx || !this.musicGain) return;
    const bpm = 108;
    const sixteenth = 60 / bpm / 4;
    // Am - F - C - G progression, techy arpeggio
    const chords = [
      [220, 261.6, 329.6, 440],
      [174.6, 220, 261.6, 349.2],
      [261.6, 329.6, 392, 523.3],
      [196, 246.9, 293.7, 392],
    ];
    const pattern = [0, 2, 1, 3, 2, 1, 3, 2, 0, 3, 1, 2, 3, 1, 2, 3];
    while (this.nextNoteTime < this.ctx.currentTime + 0.25) {
      const step = this.musicStep % 16;
      const bar = Math.floor(this.musicStep / 16) % 4;
      const chord = chords[bar];
      const t = this.nextNoteTime;
      const dest = this.musicGain;
      // arp
      this.tone(chord[pattern[step]] * 2, t, sixteenth * 0.9, { type: 'triangle', vol: 0.09, dest });
      // bass
      if (step % 4 === 0) this.tone(chord[0] / 2, t, sixteenth * 3.5, { type: 'sawtooth', vol: 0.07, dest, attack: 0.01 });
      // pad on bar start
      if (step === 0) chord.forEach((f) => this.tone(f, t, sixteenth * 15, { type: 'sine', vol: 0.03, dest, attack: 0.3 }));
      // hats
      if (step % 2 === 1) this.noise(t, 0.03, 0.03, 8000, dest);
      // kick
      if (step % 8 === 0) this.tone(120, t, 0.18, { type: 'sine', vol: 0.18, slideTo: 40, dest });
      this.nextNoteTime += sixteenth;
      this.musicStep++;
    }
  }
}

export const audio = new AudioEngine();

