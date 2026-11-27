// Gobble Dash — all sound is synthesised with WebAudio, no audio files.
// A tiny gobble, a jump whoosh, coin plinks, an alarm when spotted and a
// cheerful escape jingle. Nothing loads over the network.

export class SoundBank {
  constructor() {
    this.context = null;
    this.muted = false;
    this.musicTimer = null;
    this.musicStep = 0;
  }

  ensure() {
    if (!this.context) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return false;
      this.context = new AudioContext();
    }
    if (this.context.state === 'suspended') void this.context.resume();
    return true;
  }

  tone(freq, duration, type, volume, slideTo) {
    if (this.muted || !this.ensure()) return;
    const ctx = this.context;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), now + duration);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  gobble() {
    // Three quick descending clucks, the turkey's signature sound.
    [520, 430, 350].forEach((f, i) => {
      setTimeout(() => this.tone(f, 0.09, 'square', 0.12, f * 0.7), i * 90);
    });
  }

  click() {
    this.tone(600, 0.05, 'triangle', 0.1);
  }

  jump() {
    this.tone(280, 0.18, 'sine', 0.14, 620);
  }

  dash() {
    this.tone(180, 0.22, 'sawtooth', 0.08, 720);
  }

  corn() {
    this.tone(880, 0.08, 'triangle', 0.16);
    setTimeout(() => this.tone(1320, 0.12, 'triangle', 0.16), 70);
  }

  feather() {
    [660, 880, 1100, 1320].forEach((f, i) => {
      setTimeout(() => this.tone(f, 0.14, 'triangle', 0.14), i * 60);
    });
  }

  thud() {
    this.tone(140, 0.25, 'sawtooth', 0.2, 55);
  }

  alarm() {
    this.tone(740, 0.16, 'square', 0.1, 740);
    setTimeout(() => this.tone(740, 0.16, 'square', 0.1, 740), 190);
  }

  caught() {
    [392, 330, 262, 196].forEach((f, i) => {
      setTimeout(() => this.tone(f, 0.3, 'sawtooth', 0.14), i * 170);
    });
  }

  escaped() {
    [523, 659, 784, 1047, 1319].forEach((f, i) => {
      setTimeout(() => this.tone(f, 0.28, 'triangle', 0.16), i * 130);
    });
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }
}
