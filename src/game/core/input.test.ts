import { describe, expect, it } from 'vitest'
import { resolveDrivingInput } from './input'
import type { InputState } from './types'

const idle: InputState = { left: false, right: false, accelerate: false, brake: false, nitro: false }

describe('driving input resolution', () => {
  it('leaves desktop input unchanged', () => {
    expect(resolveDrivingInput(idle, false)).toBe(idle)
    expect(resolveDrivingInput(idle, false).accelerate).toBe(false)
  })

  it('automatically accelerates on mobile', () => {
    const resolved = resolveDrivingInput(idle, true)
    expect(resolved.accelerate).toBe(true)
    expect(resolved.brake).toBe(false)
  })

  it('lets the mobile brake override automatic acceleration', () => {
    const resolved = resolveDrivingInput({ ...idle, brake: true, nitro: true }, true)
    expect(resolved.accelerate).toBe(false)
    expect(resolved.brake).toBe(true)
    expect(resolved.nitro).toBe(true)
  })
})
