export type GamePhase = 'boot' | 'menu' | 'countdown' | 'playing' | 'paused' | 'gameover' | 'results' | 'settings'
export type Quality = 'low' | 'medium' | 'high'
export type CarColor = 'cyan' | 'magenta' | 'gold'

export interface Settings {
  quality: Quality
  masterVolume: number
  sfxVolume: number
  musicVolume: number
  muted: boolean
  cameraShake: boolean
}

export interface Records {
  bestScore: number
  longestDistance: number
  highestSpeed: number
  bestCombo: number
  totalRuns: number
  achievements: string[]
}

export interface RunStats {
  score: number
  distance: number
  speed: number
  maxSpeed: number
  integrity: number
  nitro: number
  combo: number
  comboTimer: number
  nearMisses: number
  collectibles: number
  elapsed: number
}

export interface InputState {
  left: boolean
  right: boolean
  accelerate: boolean
  brake: boolean
  nitro: boolean
}

export interface SimState extends RunStats {
  x: number
  lateralVelocity: number
  invulnerable: number
  shake: number
  flash: number
}

export interface TrafficEntity {
  id: number
  lane: number
  x: number
  z: number
  speed: number
  type: 'car' | 'truck' | 'barrier' | 'energy'
  color: string
  hit: boolean
  scored: boolean
}
