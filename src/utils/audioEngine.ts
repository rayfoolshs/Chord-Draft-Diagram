import Soundfont, { InstrumentPlayer } from 'soundfont-player';
import { GuitarTone, StringState } from '../types/chord';

export interface GmGuitarPreset {
  id: GuitarTone;
  program: number; // General MIDI 1-indexed program (25-32)
  label: string;
  shortLabel: string;
}

export const GM_GUITAR_PRESETS: GmGuitarPreset[] = [
  {
    id: 'acoustic_guitar_steel',
    program: 26,
    label: 'GM 26 · Acoustic Guitar (Steel)',
    shortLabel: 'Acoustic Steel',
  },
  {
    id: 'acoustic_guitar_nylon',
    program: 25,
    label: 'GM 25 · Acoustic Guitar (Nylon)',
    shortLabel: 'Acoustic Nylon',
  },
  {
    id: 'electric_guitar_jazz',
    program: 27,
    label: 'GM 27 · Electric Guitar (Jazz)',
    shortLabel: 'Electric Jazz',
  },
  {
    id: 'electric_guitar_clean',
    program: 28,
    label: 'GM 28 · Electric Guitar (Clean)',
    shortLabel: 'Electric Clean',
  },
  {
    id: 'electric_guitar_muted',
    program: 29,
    label: 'GM 29 · Electric Guitar (Muted)',
    shortLabel: 'Electric Muted',
  },
  {
    id: 'overdriven_guitar',
    program: 30,
    label: 'GM 30 · Overdriven Guitar',
    shortLabel: 'Overdriven',
  },
  {
    id: 'distortion_guitar',
    program: 31,
    label: 'GM 31 · Distortion Guitar',
    shortLabel: 'Distortion',
  },
  {
    id: 'guitar_harmonics',
    program: 32,
    label: 'GM 32 · Guitar Harmonics',
    shortLabel: 'Harmonics',
  },
];

export type SoundfontStatus = 'idle' | 'loading' | 'ready' | 'fallback';

class GuitarAudioEngine {
  private ctx: AudioContext | null = null;
  private activeTimeouts: number[] = [];
  private sfCache = new Map<GuitarTone, InstrumentPlayer>();
  private sfLoading = new Map<GuitarTone, Promise<InstrumentPlayer | null>>();
  private statusListeners = new Set<(tone: GuitarTone, status: SoundfontStatus) => void>();
  private toneStatuses = new Map<GuitarTone, SoundfontStatus>();

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public onStatusChange(
    cb: (tone: GuitarTone, status: SoundfontStatus) => void
  ): () => void {
    this.statusListeners.add(cb);
    return () => {
      this.statusListeners.delete(cb);
    };
  }

  public getStatus(tone: GuitarTone): SoundfontStatus {
    return this.toneStatuses.get(tone) || 'idle';
  }

  private setStatus(tone: GuitarTone, status: SoundfontStatus): void {
    this.toneStatuses.set(tone, status);
    this.statusListeners.forEach((cb) => cb(tone, status));
  }

  public async preloadSoundfont(
    tone: GuitarTone
  ): Promise<InstrumentPlayer | null> {
    if (this.sfCache.has(tone)) {
      return this.sfCache.get(tone)!;
    }
    if (this.sfLoading.has(tone)) {
      return this.sfLoading.get(tone)!;
    }

    const ctx = this.ensureContext();
    this.setStatus(tone, 'loading');

    const loadPromise = Soundfont.instrument(ctx, tone, {
      soundfont: 'FluidR3_GM',
      format: 'mp3',
      gain: 1.35,
    })
      .then((player) => {
        this.sfCache.set(tone, player);
        this.sfLoading.delete(tone);
        this.setStatus(tone, 'ready');
        return player;
      })
      .catch(() => {
        this.sfLoading.delete(tone);
        this.setStatus(tone, 'fallback');
        return null;
      });

    this.sfLoading.set(tone, loadPromise);
    return loadPromise;
  }

  public stopAll(): void {
    this.activeTimeouts.forEach((id) => window.clearTimeout(id));
    this.activeTimeouts = [];
    this.sfCache.forEach((player) => {
      try {
        player.stop();
      } catch {
        // Ignore stop error if not playing
      }
    });
  }

  public midiToFreq(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  /**
   * Plays a MIDI note using cached General MIDI FluidR3_GM SoundFont samples when loaded,
   * or falls back seamlessly to a GM-voiced Karplus-Strong physical modeling synth.
   */
  public pluckMidi(
    midi: number,
    tone: GuitarTone = 'acoustic_guitar_steel',
    delaySeconds = 0,
    durationSeconds = 2.4
  ): void {
    const ctx = this.ensureContext();
    const cached = this.sfCache.get(tone);

    if (cached) {
      const startTime = ctx.currentTime + delaySeconds;
      const dur = tone === 'electric_guitar_muted' ? 0.35 : durationSeconds;
      cached.play(midi, startTime, {
        gain: 1.4,
        duration: dur,
      });
      return;
    }

    // Trigger SoundFont download in background for subsequent notes
    void this.preloadSoundfont(tone);

    // Immediate offline Karplus-Strong fallback shaped per GM Guitar program
    this.pluckKarplusFallback(ctx, midi, tone, delaySeconds, durationSeconds);
  }

  private pluckKarplusFallback(
    ctx: AudioContext,
    midi: number,
    tone: GuitarTone,
    delaySeconds: number,
    durationSeconds: number
  ): void {
    const startTime = ctx.currentTime + delaySeconds;
    const effectiveMidi = tone === 'guitar_harmonics' ? midi + 12 : midi;
    const freq = this.midiToFreq(effectiveMidi);
    const sampleRate = ctx.sampleRate;

    const effectiveDuration =
      tone === 'electric_guitar_muted' ? 0.38 : durationSeconds;
    const totalSamples = Math.floor(sampleRate * effectiveDuration);
    const buffer = ctx.createBuffer(1, totalSamples, sampleRate);
    const data = buffer.getChannelData(0);

    const period = Math.max(2, Math.round(sampleRate / freq));
    const ring = new Float32Array(period);

    for (let i = 0; i < period; i++) {
      const noise = Math.random() * 2 - 1;
      if (tone === 'acoustic_guitar_nylon' || tone === 'electric_guitar_jazz') {
        const prev = i > 0 ? ring[i - 1] : 0;
        ring[i] = 0.58 * prev + 0.42 * noise;
      } else if (tone === 'guitar_harmonics') {
        ring[i] = Math.sin((2 * Math.PI * i) / period) * 0.7 + noise * 0.15;
      } else {
        ring[i] = noise;
      }
    }

    const damping =
      tone === 'electric_guitar_muted'
        ? 0.945
        : tone === 'acoustic_guitar_nylon'
          ? 0.991
          : tone === 'overdriven_guitar' || tone === 'distortion_guitar'
            ? 0.9975
            : 0.9945;
    const blend =
      tone === 'acoustic_guitar_nylon' || tone === 'electric_guitar_jazz'
        ? 0.36
        : 0.46;

    let ptr = 0;
    for (let i = 0; i < totalSamples; i++) {
      const curr = ring[ptr];
      const next = ring[(ptr + 1) % period];
      data[i] = curr;
      ring[ptr] = damping * (blend * curr + (1 - blend) * next);
      ptr = (ptr + 1) % period;
    }

    const src = ctx.createBufferSource();
    src.buffer = buffer;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(
      tone === 'acoustic_guitar_nylon'
        ? 2200
        : tone === 'electric_guitar_jazz'
          ? 1800
          : tone === 'electric_guitar_muted'
            ? 1400
            : 3800,
      startTime
    );
    lowpass.frequency.exponentialRampToValueAtTime(
      tone === 'electric_guitar_jazz' ? 520 : 950,
      startTime + effectiveDuration * 0.85
    );

    const bodyResonance = ctx.createBiquadFilter();
    bodyResonance.type = 'peaking';
    bodyResonance.frequency.value =
      tone.startsWith('acoustic') ? 195 : 310;
    bodyResonance.Q.value = 1.4;
    bodyResonance.gain.value = tone.startsWith('acoustic') ? 5 : 2.5;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.32, startTime + 0.006);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      startTime + effectiveDuration
    );

    src.connect(bodyResonance);

    if (tone === 'overdriven_guitar' || tone === 'distortion_guitar') {
      const shaper = ctx.createWaveShaper();
      const amount = tone === 'distortion_guitar' ? 45 : 14;
      const curve = new Float32Array(256);
      for (let i = 0; i < 256; i++) {
        const x = (i * 2) / 256 - 1;
        curve[i] = ((3 + amount) * x * 20 * (Math.PI / 180)) / (Math.PI + amount * Math.abs(x));
      }
      shaper.curve = curve;
      bodyResonance.connect(shaper);
      shaper.connect(lowpass);
    } else {
      bodyResonance.connect(lowpass);
    }

    lowpass.connect(gain);
    gain.connect(ctx.destination);

    src.start(startTime);
    src.stop(startTime + effectiveDuration + 0.05);
  }

  public playChord(
    strings: StringState[],
    tuningMidi: number[],
    mode: 'down' | 'up' | 'arp',
    tone: GuitarTone,
    onStringActive?: (stringIndex: number | null) => void
  ): void {
    this.stopAll();
    const indices =
      mode === 'up' ? [5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5];
    const stepMs = mode === 'arp' ? 230 : 42;
    const duration = mode === 'arp' ? 1.8 : 2.5;

    let step = 0;
    indices.forEach((strIdx) => {
      const st = strings[strIdx];
      if (!st.muted && st.fret !== null) {
        const midi = tuningMidi[strIdx] + st.fret;
        const delayMs = step * stepMs;
        this.pluckMidi(midi, tone, delayMs / 1000, duration);

        if (onStringActive) {
          const tId = window.setTimeout(() => {
            onStringActive(strIdx);
          }, delayMs);
          this.activeTimeouts.push(tId);
        }
        step++;
      }
    });

    if (onStringActive) {
      const clearId = window.setTimeout(() => {
        onStringActive(null);
      }, step * stepMs + 420);
      this.activeTimeouts.push(clearId);
    }
  }
}

export const guitarAudio = new GuitarAudioEngine();
