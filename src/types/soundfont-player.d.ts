declare module 'soundfont-player' {
  export interface PlayerOptions {
    soundfont?: 'FluidR3_GM' | 'MusyngKite';
    format?: 'mp3' | 'ogg';
    nameToUrl?: (name: string, soundfont: string, format: string) => string;
    gain?: number;
    attack?: number;
    decay?: number;
    sustain?: number;
    release?: number;
  }

  export interface InstrumentPlayer {
    play: (
      note: string | number,
      when?: number,
      options?: { gain?: number; duration?: number; attack?: number; release?: number }
    ) => { stop: (when?: number) => void } | void;
    stop: (when?: number) => void;
  }

  const Soundfont: {
    instrument: (
      ctx: AudioContext,
      name: string,
      options?: PlayerOptions
    ) => Promise<InstrumentPlayer>;
  };

  export default Soundfont;
}
