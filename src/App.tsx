import { useEffect, useState } from 'react'
import GameScene from './game/rendering/GameScene'
import { installInput, resetInput } from './game/core/input'
import { useGameStore } from './state/gameStore'
import { MainMenu } from './components/MainMenu'
import { HUD } from './components/HUD'
import { PauseMenu } from './components/PauseMenu'
import { Results } from './components/Results'
import { SettingsPanel } from './components/SettingsPanel'
import { MobileControls } from './components/MobileControls'

export default function App() {
  const phase = useGameStore((s) => s.phase)
  const setPhase = useGameStore((s) => s.setPhase)
  const start = useGameStore((s) => s.start)
  const pause = useGameStore((s) => s.pause)
  const resume = useGameStore((s) => s.resume)
  const finishCountdown = useGameStore((s) => s.finishCountdown)
  const [webgl] = useState(() => {
    try {
      const canvas = document.createElement('canvas')
      return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
    } catch { return false }
  })

  useEffect(() => {
    const timer = window.setTimeout(() => setPhase('menu'), 650)
    return () => window.clearTimeout(timer)
  }, [setPhase])

  useEffect(() => installInput(
    () => {
      const current = useGameStore.getState().phase
      if (current === 'playing') pause()
      else if (current === 'paused') resume()
    },
    () => { if (['gameover', 'results', 'paused'].includes(useGameStore.getState().phase)) start() },
  ), [pause, resume, start])

  useEffect(() => {
    if (phase !== 'countdown') return
    resetInput()
    const testMode = new URLSearchParams(window.location.search).has('test')
    const timer = window.setTimeout(finishCountdown, testMode ? 600 : 3000)
    return () => window.clearTimeout(timer)
  }, [phase, finishCountdown])

  if (!webgl) return (
    <main className="fallback">
      <p className="eyebrow">SYSTEM CHECK FAILED</p>
      <h1>WebGL unavailable</h1>
      <p>Neon Velocity needs hardware-accelerated WebGL. Enable graphics acceleration or try a current browser.</p>
    </main>
  )

  return (
    <main className={`app phase-${phase}`} data-game-state={phase}>
      <GameScene />
      <div className="scanlines" aria-hidden="true" />
      {phase === 'boot' && <Loading />}
      {phase === 'menu' && <MainMenu />}
      {phase === 'countdown' && <Countdown />}
      {phase === 'playing' && <><HUD /><MobileControls /></>}
      {phase === 'paused' && <><HUD /><PauseMenu /></>}
      {(phase === 'gameover' || phase === 'results') && <Results />}
      {phase === 'settings' && <SettingsPanel />}
      <div className="portrait-tip">ROTATE FOR THE FULL VELOCITY EXPERIENCE</div>
    </main>
  )
}

function Loading() {
  return <div className="loading-screen"><div className="brand-mark">NV</div><div className="loader" /><p>CALIBRATING HYPERDRIVE</p></div>
}

function Countdown() {
  return (
    <div className="countdown" role="status" aria-label="Race countdown">
      <span className="count c3">3</span><span className="count c2">2</span><span className="count c1">1</span><span className="count go">GO</span>
    </div>
  )
}
