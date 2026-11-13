import { useState } from 'react'
import { CAR_COLORS } from '../game/core/config'
import type { CarColor } from '../game/core/types'
import { synthAudio } from '../game/audio/audio'
import { useGameStore } from '../state/gameStore'

export function MainMenu() {
  const start = useGameStore((s) => s.start)
  const openSettings = useGameStore((s) => s.openSettings)
  const records = useGameStore((s) => s.records)
  const selected = useGameStore((s) => s.carColor)
  const selectColor = useGameStore((s) => s.selectColor)
  const settings = useGameStore((s) => s.settings)
  const [help, setHelp] = useState(false)
  const click = () => { if (!settings.muted) synthAudio.blip('ui', settings.masterVolume * settings.sfxVolume) }
  const play = () => { click(); start() }
  return (
    <div className="menu-layer">
      <div className="menu-topline"><span>SYNDICATE // NIGHT CIRCUIT</span><span>SECTOR 07 · 02:17</span></div>
      <section className="hero-panel">
        <p className="eyebrow">ILLEGAL CIRCUIT // SYNTH CITY</p>
        <h1><span>NEON</span> VELOCITY</h1>
        <p className="subtitle">CYBERPUNK RACING <b>3D</b></p>
        <p className="tagline">Cut through traffic. Break the skyline. Leave only light.</p>
        <div className="menu-actions">
          <button className="primary-button" onClick={play}><span>ENTER THE CIRCUIT</span><i>→</i></button>
          <div className="secondary-actions">
            <button onClick={() => { click(); setHelp(true) }}>HOW TO PLAY</button>
            <button onClick={() => { click(); openSettings() }}>SETTINGS</button>
          </div>
        </div>
        <div className="color-picker" aria-label="Vehicle color">
          <span>CHASSIS SIGNAL</span>
          {(Object.keys(CAR_COLORS) as CarColor[]).map((color) => (
            <button key={color} className={selected === color ? 'selected' : ''} aria-label={CAR_COLORS[color].label} title={CAR_COLORS[color].label} style={{ '--swatch': CAR_COLORS[color].glow } as React.CSSProperties} onClick={() => selectColor(color)} />
          ))}
        </div>
      </section>
      <aside className="record-card glass-panel">
        <p>PERSONAL RECORD</p><strong>{records.bestScore.toLocaleString().padStart(6, '0')}</strong><span>BEST SCORE</span>
        <div><b>{(records.longestDistance / 1000).toFixed(2)}</b><small>KM</small><em>LONGEST RUN</em></div>
        <div><b>{records.highestSpeed}</b><small>KM/H</small><em>TOP SPEED</em></div>
      </aside>
      <div className="controls-ribbon"><span><kbd>A</kbd><kbd>D</kbd> STEER</span><span><kbd>W</kbd><kbd>S</kbd> THROTTLE / BRAKE</span><span><kbd>SHIFT</kbd> NITRO</span><span><kbd>ESC</kbd> PAUSE</span></div>
      {help && <Help onClose={() => setHelp(false)} />}
    </div>
  )
}

function Help({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-backdrop"><section className="modal glass-panel"><p className="eyebrow">DRIVER BRIEFING</p><h2>OWN THE NIGHT</h2>
      <div className="help-grid">
        <div><b>01</b><h3>THREAD TRAFFIC</h3><p>Steer with A/D or arrows. Close passes build combo and recharge nitro.</p></div>
        <div><b>02</b><h3>HUNT ENERGY</h3><p>Collect cyan energy cores to refill boost. Hold Shift to ignite nitro.</p></div>
        <div><b>03</b><h3>STAY INTACT</h3><p>Impacts shred integrity. The circuit ends when your chassis reaches zero.</p></div>
      </div><button className="primary-button compact" onClick={onClose}>READY</button>
    </section></div>
  )
}
