import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { CAR_COLORS, INITIAL_RUN } from '../game/core/config'
import { updateRecords } from '../game/core/logic'
import type { CarColor, GamePhase, Records, RunStats, Settings, SimState } from '../game/core/types'

const DEFAULT_SETTINGS: Settings = {
  quality: 'high', masterVolume: 0.75, sfxVolume: 0.2, musicVolume: 0.45, muted: false, cameraShake: true,
}
const DEFAULT_RECORDS: Records = {
  bestScore: 0, longestDistance: 0, highestSpeed: 0, bestCombo: 1, totalRuns: 0, achievements: [],
}

interface GameStore {
  phase: GamePhase
  returnPhase: GamePhase
  countdown: number
  carColor: CarColor
  settings: Settings
  records: Records
  run: RunStats
  notification: string
  setPhase: (phase: GamePhase) => void
  start: () => void
  finishCountdown: () => void
  pause: () => void
  resume: () => void
  openSettings: () => void
  closeSettings: () => void
  updateSettings: (settings: Partial<Settings>) => void
  selectColor: (color: CarColor) => void
  syncRun: (run: SimState) => void
  endRun: (run: SimState) => void
  setNotification: (value: string) => void
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      phase: 'boot', returnPhase: 'menu', countdown: 3, carColor: 'cyan', settings: DEFAULT_SETTINGS,
      records: DEFAULT_RECORDS, run: INITIAL_RUN, notification: '',
      setPhase: (phase) => set({ phase }),
      start: () => set({ phase: 'countdown', countdown: 3, run: INITIAL_RUN, notification: '' }),
      finishCountdown: () => set({ phase: 'playing', countdown: 0 }),
      pause: () => { if (get().phase === 'playing') set({ phase: 'paused' }) },
      resume: () => { if (get().phase === 'paused') set({ phase: 'playing' }) },
      openSettings: () => set((state) => ({ returnPhase: state.phase, phase: 'settings' })),
      closeSettings: () => set((state) => ({ phase: state.returnPhase === 'settings' ? 'menu' : state.returnPhase })),
      updateSettings: (settings) => set((state) => ({ settings: { ...state.settings, ...settings } })),
      selectColor: (carColor) => { if (CAR_COLORS[carColor]) set({ carColor }) },
      syncRun: (run) => set({ run }),
      endRun: (run) => set((state) => ({ phase: 'gameover', run, records: updateRecords(state.records, run) })),
      setNotification: (notification) => set({ notification }),
    }),
    {
      name: 'neon-velocity-v1',
      version: 2,
      migrate: (persisted, version) => {
        const saved = (persisted ?? {}) as Partial<GameStore>
        if (version < 2 && saved.settings?.sfxVolume === 0.8) {
          saved.settings = { ...saved.settings, sfxVolume: 0.2 }
        }
        return saved
      },
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ settings: state.settings, records: state.records, carColor: state.carColor }),
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<GameStore>
        return {
          ...current,
          ...saved,
          settings: { ...DEFAULT_SETTINGS, ...(saved.settings ?? {}) },
          records: { ...DEFAULT_RECORDS, ...(saved.records ?? {}) },
          phase: 'boot' as GamePhase,
        }
      },
    },
  ),
)
