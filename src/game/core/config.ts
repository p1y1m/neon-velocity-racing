export const GAME = {
  laneWidth: 3.15,
  roadHalfWidth: 5.1,
  baseSpeed: 48,
  maxSpeed: 88,
  nitroMaxSpeed: 122,
  acceleration: 22,
  coastDrag: 8,
  brakeForce: 43,
  lateralAcceleration: 31,
  lateralDrag: 7.5,
  collisionDamage: 28,
  invulnerability: 1.25,
  comboDuration: 4.2,
  fixedStep: 1 / 60,
} as const

export const CAR_COLORS = {
  cyan: { label: 'Ion Cyan', body: '#08c7d9', glow: '#58f7ff' },
  magenta: { label: 'Nova Rose', body: '#c41568', glow: '#ff47ac' },
  gold: { label: 'Solar Flare', body: '#d98616', glow: '#ffd166' },
} as const

export const INITIAL_RUN = {
  score: 0,
  distance: 0,
  speed: 48,
  maxSpeed: 48,
  integrity: 100,
  nitro: 72,
  combo: 1,
  comboTimer: 0,
  nearMisses: 0,
  collectibles: 0,
  elapsed: 0,
} as const
