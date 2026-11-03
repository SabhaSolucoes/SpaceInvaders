/** All sounds are synthesized with Web Audio; no asset files. */
export class SoundFx {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noiseBuf: AudioBuffer | null = null;
  private ufoOsc: OscillatorNode | null = null;
  private ufoLfo: OscillatorNode | null = null;
  private ufoGain: GainNode | null = null;
  private _muted = false;
  private marchIdx = 0;

  get muted(): boolean {
    return this._muted;
  }

  unlock(): void {
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = this._muted ? 0 : 0.6;
      this.master.connect(this.ctx.destination);
      const len = this.ctx.sampleRate;
      this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  setMuted(m: boolean): void {
    this._muted = m;
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(m ? 0 : 0.6, this.ctx.currentTime, 0.02);
  }

  private tone(freq: number, dur: number, type: OscillatorType, vol: number, slideTo?: number, delay = 0): void {
    if (!this.ctx || !this.master) return;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo !== undefined) osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t0 + dur);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(g).connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  private noise(dur: number, vol: number, filterFreq: number): void {
    if (!this.ctx || !this.master || !this.noiseBuf) return;
    const t0 = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const f = this.ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(filterFreq, t0);
    f.frequency.exponentialRampToValueAtTime(80, t0 + dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    src.connect(f).connect(g).connect(this.master);
    src.start(t0);
    src.stop(t0 + dur + 0.02);
  }

  /** The four-note invader march; called once per formation tick. */
  march(): void {
    const notes = [98, 87, 78, 73];
    this.tone(notes[this.marchIdx], 0.1, 'square', 0.12, notes[this.marchIdx] * 0.9);
    this.marchIdx = (this.marchIdx + 1) % notes.length;
  }

  shoot(): void {
    this.tone(1200, 0.12, 'square', 0.08, 300);
  }

  invaderHit(): void {
    this.noise(0.18, 0.25, 2500);
    this.tone(220, 0.12, 'square', 0.08, 60);
  }

  playerHit(): void {
    this.noise(0.8, 0.5, 1500);
    this.tone(120, 0.6, 'sawtooth', 0.2, 30);
  }

  shieldHit(): void {
    this.noise(0.06, 0.12, 900);
  }

  ufoHit(): void {
    this.tone(900, 0.4, 'square', 0.15, 100);
    this.noise(0.4, 0.3, 3000);
  }

  extraLife(): void {
    [523, 659, 784, 1047].forEach((n, i) => this.tone(n, 0.12, 'square', 0.12, undefined, i * 0.1));
  }

  waveClear(): void {
    [392, 523, 659, 784].forEach((n, i) => this.tone(n, 0.15, 'triangle', 0.15, undefined, i * 0.12));
  }

  blip(): void {
    this.tone(700, 0.05, 'square', 0.08);
  }

  ufoStart(): void {
    if (!this.ctx || !this.master || this.ufoOsc) return;
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = 500;
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 6;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 120;
    lfo.connect(lfoGain).connect(osc.frequency);
    const g = this.ctx.createGain();
    g.gain.value = 0.05;
    osc.connect(g).connect(this.master);
    osc.start();
    lfo.start();
    this.ufoOsc = osc;
    this.ufoLfo = lfo;
    this.ufoGain = g;
  }

  ufoStop(): void {
    if (!this.ctx || !this.ufoOsc || !this.ufoLfo || !this.ufoGain) return;
    this.ufoGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.03);
    this.ufoOsc.stop(this.ctx.currentTime + 0.2);
    this.ufoLfo.stop(this.ctx.currentTime + 0.2);
    this.ufoOsc = null;
    this.ufoLfo = null;
    this.ufoGain = null;
  }
}
