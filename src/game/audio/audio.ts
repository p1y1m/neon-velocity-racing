export type SoundName = 'ui' | 'nitro' | 'hit' | 'collect'

interface ActiveVoice {
  oscillator: OscillatorNode
  gain: GainNode
  filter: BiquadFilterNode
}

interface ToneShape {
  start: number
  end: number
  duration: number
  level: number
  type: OscillatorType
  cutoff: number
}

const TONES: Record<SoundName, ToneShape> = {
  ui: { start: 330, end: 440, duration: 0.075, level: 0.05, type: 'sine', cutoff: 1400 },
  nitro: { start: 145, end: 290, duration: 0.22, level: 0.065, type: 'triangle', cutoff: 900 },
  hit: { start: 105, end: 62, duration: 0.13, level: 0.075, type: 'sine', cutoff: 420 },
  collect: { start: 510, end: 760, duration: 0.14, level: 0.055, type: 'sine', cutoff: 1600 },
}

export class SynthAudio {
  private context: AudioContext | null = null
  private activeVoices = new Set<ActiveVoice>()

  private getContext() {
    if (typeof AudioContext === 'undefined') return null
    if (!this.context) this.context = new AudioContext()
    if (this.context.state === 'suspended') void this.context.resume()
    return this.context
  }

  blip(name: SoundName, volume = 0.2) {
    const ctx = this.getContext()
    if (!ctx) return
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()
    const now = ctx.currentTime
    const tone = TONES[name]
    const voice: ActiveVoice = { oscillator, gain, filter }

    oscillator.type = tone.type
    oscillator.frequency.setValueAtTime(tone.start, now)
    oscillator.frequency.exponentialRampToValueAtTime(tone.end, now + tone.duration)
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(tone.cutoff, now)
    filter.Q.setValueAtTime(0.6, now)

    // A short fade-in prevents clicks; the gentle tail keeps every cue unobtrusive.
    const peak = Math.max(0.0001, Math.min(1, volume) * tone.level)
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(peak, now + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + tone.duration)

    oscillator.connect(filter).connect(gain).connect(ctx.destination)
    this.activeVoices.add(voice)
    oscillator.onended = () => this.releaseVoice(voice)
    oscillator.start(now)
    oscillator.stop(now + tone.duration + 0.02)
  }

  stopAll() {
    for (const voice of [...this.activeVoices]) {
      voice.oscillator.onended = null
      try {
        voice.oscillator.stop()
      } catch {
        // A voice that has already ended is still safe to disconnect.
      }
      this.releaseVoice(voice)
    }
  }

  dispose() {
    this.stopAll()
    const context = this.context
    this.context = null
    if (context && context.state !== 'closed') void context.close()
  }

  private releaseVoice(voice: ActiveVoice) {
    voice.oscillator.disconnect()
    voice.filter.disconnect()
    voice.gain.disconnect()
    this.activeVoices.delete(voice)
  }
}

export const synthAudio = new SynthAudio()
