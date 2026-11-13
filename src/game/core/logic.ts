import { GAME, INITIAL_RUN } from './config'
import type { InputState, Records, SimState } from './types'

export const createSimulation = (): SimState => ({
  ...INITIAL_RUN,
  x: 0,
  lateralVelocity: 0,
  invulnerable: 0,
  shake: 0,
  flash: 0,
})

export function stepSimulation(state: SimState, input: InputState, dt: number): SimState {
  const boost = input.nitro && state.nitro > 0
  const speedLimit = boost ? GAME.nitroMaxSpeed : GAME.maxSpeed
  let speed = state.speed
  if (input.accelerate || boost) speed += GAME.acceleration * (boost ? 1.8 : 1) * dt
  else speed -= GAME.coastDrag * dt
  if (input.brake) speed -= GAME.brakeForce * dt
  speed = Math.max(25, Math.min(speedLimit, speed))

  const steer = Number(input.right) - Number(input.left)
  const sensitivity = Math.max(0.56, 1 - speed / 230)
  let lateralVelocity = state.lateralVelocity + steer * GAME.lateralAcceleration * sensitivity * dt
  lateralVelocity *= Math.exp(-GAME.lateralDrag * (steer === 0 ? 1 : 0.16) * dt)
  let x = state.x + lateralVelocity * dt
  if (Math.abs(x) > GAME.roadHalfWidth) {
    x = Math.sign(x) * GAME.roadHalfWidth
    lateralVelocity *= -0.25
    speed = Math.max(35, speed - 26 * dt)
  }

  const distance = state.distance + speed * dt / 3.6
  const comboTimer = Math.max(0, state.comboTimer - dt)
  const combo = comboTimer === 0 ? 1 : state.combo
  const nitro = Math.max(0, Math.min(100, state.nitro + (boost ? -24 : 2.2) * dt))
  const passiveScore = speed * dt * 0.42 * combo
  return {
    ...state,
    x,
    speed,
    maxSpeed: Math.max(state.maxSpeed, speed),
    lateralVelocity,
    distance,
    elapsed: state.elapsed + dt,
    score: state.score + passiveScore,
    nitro,
    combo,
    comboTimer,
    invulnerable: Math.max(0, state.invulnerable - dt),
    shake: Math.max(0, state.shake - dt * 2.5),
    flash: Math.max(0, state.flash - dt * 3),
  }
}

export function applyCollision(state: SimState, severity = 1): SimState {
  if (state.invulnerable > 0) return state
  const integrity = Math.max(0, state.integrity - GAME.collisionDamage * severity)
  return {
    ...state,
    integrity,
    speed: Math.max(28, state.speed * 0.58),
    combo: 1,
    comboTimer: 0,
    invulnerable: GAME.invulnerability,
    shake: 1,
    flash: 1,
  }
}

export function applyNearMiss(state: SimState): SimState {
  const combo = Math.min(8, state.combo + 1)
  return {
    ...state,
    nearMisses: state.nearMisses + 1,
    combo,
    comboTimer: GAME.comboDuration,
    score: state.score + 400 * combo,
    nitro: Math.min(100, state.nitro + 8),
  }
}

export function applyCollectible(state: SimState): SimState {
  return {
    ...state,
    collectibles: state.collectibles + 1,
    nitro: Math.min(100, state.nitro + 28),
    score: state.score + 750 * state.combo,
    comboTimer: Math.max(state.comboTimer, GAME.comboDuration),
  }
}

export function difficultyAt(distance: number) {
  const level = Math.min(10, 1 + Math.floor(distance / 550))
  return {
    level,
    spawnInterval: Math.max(0.58, 1.5 - level * 0.08),
    trafficSpeedMin: 16 + level * 1.2,
    trafficSpeedMax: 38 + level * 1.8,
  }
}

export function updateRecords(records: Records, state: SimState): Records {
  const achievements = new Set(records.achievements)
  if (state.distance >= 1000) achievements.add('First Kilometer')
  if (state.maxSpeed >= 110) achievements.add('Speed Demon')
  if (state.nearMisses >= 8) achievements.add('Near-Miss Specialist')
  if (state.collectibles >= 10) achievements.add('Nitro Master')
  if (state.elapsed >= 180) achievements.add('Survivor')
  return {
    bestScore: Math.max(records.bestScore, Math.floor(state.score)),
    longestDistance: Math.max(records.longestDistance, Math.floor(state.distance)),
    highestSpeed: Math.max(records.highestSpeed, Math.floor(state.maxSpeed)),
    bestCombo: Math.max(records.bestCombo, state.combo),
    totalRuns: records.totalRuns + 1,
    achievements: [...achievements],
  }
}

export class SeededRandom {
  constructor(private seed: number) {}
  next() {
    this.seed |= 0
    this.seed = (this.seed + 0x6d2b79f5) | 0
    let t = this.seed
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
