import type { Footstep } from "../world/blocks";

export class AudioSystem {
  private ctx?: AudioContext;
  private gain?: GainNode;
  constructor(private volume: () => number) {}

  start() {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.gain = this.ctx.createGain();
      this.gain.gain.value = this.volume();
      this.gain.connect(this.ctx.destination);
    } else if (this.ctx.state === 'suspended') void this.ctx.resume();
  }
  updateVolume() { if (this.gain) this.gain.gain.value = this.volume(); }

  private tone(freq: number, duration = .08, type: OscillatorType = 'triangle', gain = .03, slide = 0) {
    this.start();
    const context = this.ctx!, oscillator = context.createOscillator(), envelope = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, context.currentTime);
    if (slide) oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), context.currentTime + duration);
    envelope.gain.setValueAtTime(gain, context.currentTime);
    envelope.gain.exponentialRampToValueAtTime(.0001, context.currentTime + duration);
    oscillator.connect(envelope); envelope.connect(this.gain!); oscillator.start(); oscillator.stop(context.currentTime + duration);
  }
  private noise(duration: number, gain: number, frequency: number) {
    this.start();
    const context = this.ctx!, length = Math.ceil(context.sampleRate * duration), buffer = context.createBuffer(1, length, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < length; index++) data[index] = (Math.random() * 2 - 1) * (1 - index / length);
    const source = context.createBufferSource(), filter = context.createBiquadFilter(), envelope = context.createGain();
    source.buffer = buffer; filter.type = 'bandpass'; filter.frequency.value = frequency; filter.Q.value = .7;
    envelope.gain.setValueAtTime(gain, context.currentTime); envelope.gain.exponentialRampToValueAtTime(.0001, context.currentTime + duration);
    source.connect(filter); filter.connect(envelope); envelope.connect(this.gain!); source.start(); source.stop(context.currentTime + duration);
  }
  private materialFrequency(type: Footstep) { return { grass: 180, stone: 560, wood: 330, sand: 130, water: 100 }[type]; }
  footstep(type: Footstep) { this.noise(.045, .016, this.materialFrequency(type)); }
  jump() { this.noise(.05, .014, 170); }
  land() { this.noise(.09, .032, 120); }
  mine(type: Footstep) { this.noise(.045, .025, this.materialFrequency(type) * 1.3); }
  break(type: Footstep) { this.noise(.11, .038, this.materialFrequency(type)); }
  place() { this.noise(.06, .024, 260); }
  reject() { this.tone(95, .045, 'triangle', .012, -20); }
  pickup() { this.tone(390, .065, 'sine', .022, 90); }
  craft() { this.noise(.08, .022, 420); this.tone(240, .08, 'triangle', .018, 70); }
  damage() { this.noise(.11, .045, 95); }
  towerStart() {
    this.noise(.32, .04, 160);
    this.tone(110, .75, 'sine', .045, 110);
    setTimeout(() => this.tone(330, .55, 'sine', .028, 220), 220);
  }
}
