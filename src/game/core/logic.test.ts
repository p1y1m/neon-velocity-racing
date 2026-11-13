import { describe, expect, it } from 'vitest'
import { applyCollectible, applyCollision, applyNearMiss, createSimulation, difficultyAt, SeededRandom, stepSimulation, updateRecords } from './logic'

const idle = { left: false, right: false, accelerate: false, brake: false, nitro: false }

describe('game simulation', () => {
  it('advances distance and score with frame-rate independent steps', () => {
    let a = createSimulation(), b = createSimulation()
    for (let i = 0; i < 60; i++) a = stepSimulation(a, idle, 1 / 60)
    for (let i = 0; i < 30; i++) b = stepSimulation(b, idle, 1 / 30)
    expect(a.distance).toBeCloseTo(b.distance, 1)
    expect(a.score).toBeCloseTo(b.score, 0)
  })
  it('consumes nitro and raises the speed cap', () => {
    let state = createSimulation()
    for (let i = 0; i < 180; i++) state = stepSimulation(state, { ...idle, nitro: true }, 1 / 60)
    expect(state.speed).toBeGreaterThan(88)
    expect(state.nitro).toBeLessThan(10)
  })
  it('applies collision invulnerability once', () => {
    const hit = applyCollision(createSimulation())
    expect(hit.integrity).toBe(72)
    expect(applyCollision(hit).integrity).toBe(72)
  })
  it('builds combo and collectible rewards', () => {
    const near = applyNearMiss(createSimulation())
    expect(near.combo).toBe(2)
    expect(near.score).toBe(800)
    const collected = applyCollectible(near)
    expect(collected.collectibles).toBe(1)
    expect(collected.nitro).toBe(100)
  })
  it('progresses difficulty within safe limits', () => {
    expect(difficultyAt(0).level).toBe(1)
    expect(difficultyAt(10_000).level).toBe(10)
    expect(difficultyAt(10_000).spawnInterval).toBeGreaterThanOrEqual(0.58)
  })
  it('is deterministic for equal random seeds', () => {
    const a = new SeededRandom(42), b = new SeededRandom(42)
    expect(Array.from({ length: 8 }, () => a.next())).toEqual(Array.from({ length: 8 }, () => b.next()))
  })
  it('updates records and achievements', () => {
    const state = { ...createSimulation(), score: 9000, distance: 1200, maxSpeed: 112, nearMisses: 9 }
    const records = updateRecords({ bestScore: 10, longestDistance: 0, highestSpeed: 0, bestCombo: 1, totalRuns: 0, achievements: [] }, state)
    expect(records.bestScore).toBe(9000)
    expect(records.achievements).toContain('First Kilometer')
    expect(records.achievements).toContain('Speed Demon')
  })
})
