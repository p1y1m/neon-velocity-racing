import { useEffect } from 'react'
import { useGameStore } from '../state/gameStore'

export function HUD() {
  const run = useGameStore((s) => s.run)
  const pause = useGameStore((s) => s.pause)
  const notification = useGameStore((s) => s.notification)
  const setNotification = useGameStore((s) => s.setNotification)
  useEffect(() => {
    if (!notification) return
    const timer = window.setTimeout(() => setNotification(''), 1100)
    return () => window.clearTimeout(timer)
  }, [notification, setNotification])
  return (
    <div className="hud" aria-label="Race HUD">
      <div className="hud-top">
        <div className="hud-score"><small>SCORE</small><strong>{Math.floor(run.score).toLocaleString().padStart(7, '0')}</strong></div>
        <div className="hud-distance"><small>DISTANCE</small><strong>{(run.distance / 1000).toFixed(2)}</strong><span>KM</span></div>
        <button className="pause-button" aria-label="Pause" onClick={pause}>Ⅱ</button>
      </div>
      <div className="speedometer"><span>KM/H</span><strong>{Math.round(run.speed)}</strong><div className="speed-bar"><i style={{ width: `${Math.min(100, run.speed / 1.22)}%` }} /></div></div>
      <div className="hud-bottom">
        <Meter label="INTEGRITY" value={run.integrity} color="#ff3a8d" />
        <div className="combo"><small>COMBO</small><strong>×{run.combo}</strong></div>
        <Meter label="NITRO" value={run.nitro} color="#18e8ff" />
      </div>
      {notification && <div className="notification" key={notification}>{notification}</div>}
    </div>
  )
}

function Meter({ label, value, color }: { label: string; value: number; color: string }) {
  return <div className="meter"><div><small>{label}</small><b>{Math.round(value)}%</b></div><span><i style={{ width: `${value}%`, backgroundColor: color, boxShadow: `0 0 12px ${color}` }} /></span></div>
}
