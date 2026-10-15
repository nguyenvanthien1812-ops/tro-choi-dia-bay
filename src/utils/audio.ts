class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private ufoHumOsc: OscillatorNode | null = null;
  private ufoHumGain: GainNode | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.ufoHumGain) {
      this.ufoHumGain.gain.setValueAtTime(0, this.ctx?.currentTime || 0);
    }
  }

  public getMuted() {
    return this.isMuted;
  }

  public playClick() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.05);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  public startUfoHum() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    if (this.ufoHumOsc) {
      return; // Already playing
    }

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, now);

    lfo.frequency.setValueAtTime(6, now); // LFO rate for vibrating UFO sound
    lfoGain.gain.setValueAtTime(15, now);
    lfo.connect(osc.frequency);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.3);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    lfo.start(now);

    this.ufoHumOsc = osc;
    this.ufoHumGain = gain;
  }

  public stopUfoHum() {
    if (this.ufoHumOsc && this.ufoHumGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.ufoHumGain.gain.linearRampToValueAtTime(0, now + 0.2);
      setTimeout(() => {
        try {
          this.ufoHumOsc?.stop();
          this.ufoHumOsc?.disconnect();
        } catch {
          // ignore
        }
        this.ufoHumOsc = null;
        this.ufoHumGain = null;
      }, 250);
    }
  }

  public playScanBeam() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.linearRampToValueAtTime(1200, now + 0.4);
    osc.frequency.linearRampToValueAtTime(400, now + 0.8);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.8);
  }

  public playTargetLock() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Two rapid high chime beeps
    [0, 0.08, 0.16].forEach((delay, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880 + idx * 220, now + delay);

      gain.gain.setValueAtTime(0.2, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.07);
    });
  }

  public playAbductZap() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Retro laser teleport slide sound
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(1800, now + 0.7);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.8);

    // Add sparkling arpeggio
    const arpeggioNotes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
    arpeggioNotes.forEach((freq, i) => {
      if (!this.ctx) return;
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      const startTime = now + 0.1 + i * 0.08;

      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(freq, startTime);

      subGain.gain.setValueAtTime(0.12, startTime);
      subGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);

      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);

      subOsc.start(startTime);
      subOsc.stop(startTime + 0.12);
    });
  }

  public playFanfare() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const chords = [
      { freq: 523.25, time: 0, dur: 0.15 }, // C5
      { freq: 659.25, time: 0.15, dur: 0.15 }, // E5
      { freq: 783.99, time: 0.30, dur: 0.15 }, // G5
      { freq: 1046.50, time: 0.45, dur: 0.6 } // C6
    ];

    chords.forEach(({ freq, time, dur }) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + time);

      gain.gain.setValueAtTime(0.2, now + time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + dur);
    });
  }

  public speakVietnamese(text: string) {
    if (this.isMuted) return;
    if (!('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel(); // Stop previous speaking
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      utterance.rate = 1.0;
      utterance.pitch = 1.1;

      // Try finding Vietnamese voice
      const voices = window.speechSynthesis.getVoices();
      const viVoice = voices.find(v => v.lang.includes('vi') || v.lang.includes('VI'));
      if (viVoice) {
        utterance.voice = viVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // SpeechSynthesis may fail on some restricted browsers
    }
  }
}

export const soundEngine = new SoundEngine();
