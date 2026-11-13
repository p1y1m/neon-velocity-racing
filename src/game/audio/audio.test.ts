import { afterEach, describe, expect, it, vi } from 'vitest'
import { SynthAudio } from './audio'

class MockParam {
  setValueAtTime = vi.fn()
  exponentialRampToValueAtTime = vi.fn()
}

class MockOscillator {
  type: OscillatorType = 'sine'
  frequency = new MockParam()
  onended: (() => void) | null = null
  connect = vi.fn(() => this)
  disconnect = vi.fn()
  start = vi.fn()
  stop = vi.fn()
}

class MockGain {
  gain = new MockParam()
  connect = vi.fn(() => this)
  disconnect = vi.fn()
}

class MockFilter {
  type: BiquadFilterType = 'lowpass'
  frequency = new MockParam()
  Q = new MockParam()
  connect = vi.fn(() => this)
  disconnect = vi.fn()
}

class MockContext {
  currentTime = 10
  state: AudioContextState = 'running'
  destination = {}
  oscillators: MockOscillator[] = []
  gains: MockGain[] = []
  filters: MockFilter[] = []
  createOscillator = vi.fn(() => {
    const node = new MockOscillator()
    this.oscillators.push(node)
    return node
  })
  createGain = vi.fn(() => {
    const node = new MockGain()
    this.gains.push(node)
    return node
  })
  createBiquadFilter = vi.fn(() => {
    const node = new MockFilter()
    this.filters.push(node)
    return node
  })
  resume = vi.fn(async () => undefined)
  suspend = vi.fn(async () => { this.state = 'suspended' })
  close = vi.fn(async () => { this.state = 'closed' })
}

let context: MockContext

afterEach(() => vi.unstubAllGlobals())

function installAudioContextMock() {
  const Constructor = vi.fn(function AudioContextMock() {
    return context
  })
  vi.stubGlobal('AudioContext', Constructor)
}

describe('quiet synthesized audio', () => {
  it('uses a short, filtered one-shot without harsh oscillator shapes', () => {
    context = new MockContext()
    installAudioContextMock()
    const audio = new SynthAudio()

    audio.blip('hit', 0.2)

    expect(context.oscillators).toHaveLength(1)
    expect(context.oscillators[0].type).toBe('sine')
    expect(context.oscillators[0].start).toHaveBeenCalledOnce()
    expect(context.oscillators[0].stop).toHaveBeenCalledWith(10.15)
    expect(context.filters[0].type).toBe('lowpass')
  })

  it('stops and disconnects every active voice during cleanup', () => {
    context = new MockContext()
    installAudioContextMock()
    const audio = new SynthAudio()
    audio.blip('ui', 0.2)
    audio.blip('collect', 0.2)

    audio.stopAll()

    expect(context.oscillators.every((node) => node.stop.mock.calls.length >= 2)).toBe(true)
    expect(context.oscillators.every((node) => node.disconnect.mock.calls.length === 1)).toBe(true)
    expect(context.gains.every((node) => node.disconnect.mock.calls.length === 1)).toBe(true)
    expect(context.suspend).not.toHaveBeenCalled()
  })
})
