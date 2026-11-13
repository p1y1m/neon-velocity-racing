import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { MainMenu } from './MainMenu'
import { HUD } from './HUD'
import { SettingsPanel } from './SettingsPanel'
import { useGameStore } from '../state/gameStore'

beforeEach(() => useGameStore.setState({ phase: 'menu', notification: '', run: { score: 12345, distance: 987, speed: 74, maxSpeed: 91, integrity: 83, nitro: 62, combo: 3, comboTimer: 2, nearMisses: 4, collectibles: 2, elapsed: 20 } }))

describe('game UI', () => {
  it('starts the game from the main menu', () => {
    render(<MainMenu />)
    fireEvent.click(screen.getByRole('button', { name: /enter the circuit/i }))
    expect(useGameStore.getState().phase).toBe('countdown')
  })
  it('formats live HUD values', () => {
    render(<HUD />)
    expect(screen.getByText('012,345')).toBeInTheDocument()
    expect(screen.getByText('0.99')).toBeInTheDocument()
    expect(screen.getByText('×3')).toBeInTheDocument()
  })
  it('updates graphics settings', () => {
    render(<SettingsPanel />)
    fireEvent.click(screen.getByRole('button', { name: 'low' }))
    expect(useGameStore.getState().settings.quality).toBe('low')
  })
})
