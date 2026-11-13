import { useGameStore } from '../state/gameStore'
export function PauseMenu() {
  const resume = useGameStore((s) => s.resume), start = useGameStore((s) => s.start), openSettings = useGameStore((s) => s.openSettings), setPhase = useGameStore((s) => s.setPhase)
  return <div className="modal-backdrop"><section className="pause-panel glass-panel"><p className="eyebrow">SYSTEM HOLD</p><h2>PAUSED</h2><button className="primary-button compact" onClick={resume}>RESUME</button><button onClick={start}>RESTART RUN</button><button onClick={openSettings}>SETTINGS</button><button onClick={() => setPhase('menu')}>RETURN TO MENU</button></section></div>
}
