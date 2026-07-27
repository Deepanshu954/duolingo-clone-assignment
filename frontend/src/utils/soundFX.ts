class SoundFX {
  private playSound(frequency: number, type: OscillatorType = 'sine', duration: number = 0.15) {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio Context disabled or unavailable
    }
  }

  playClick() {
    this.playSound(400, 'sine', 0.05);
  }

  playCorrect() {
    this.playSound(523.25, 'sine', 0.1);
    setTimeout(() => this.playSound(659.25, 'sine', 0.2), 100);
  }

  playWrong() {
    this.playSound(200, 'sawtooth', 0.2);
  }

  playFinish() {
    this.playSound(523.25, 'sine', 0.1);
    setTimeout(() => this.playSound(659.25, 'sine', 0.1), 100);
    setTimeout(() => this.playSound(783.99, 'sine', 0.3), 200);
  }
}

export const soundFX = new SoundFX();
