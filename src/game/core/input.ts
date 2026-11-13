import type { InputState } from './types'

export const inputState: InputState = { left: false, right: false, accelerate: false, brake: false, nitro: false }

const KEY_MAP: Record<string, keyof InputState | undefined> = {
  ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
  ArrowUp: 'accelerate', KeyW: 'accelerate', ArrowDown: 'brake', KeyS: 'brake',
  ShiftLeft: 'nitro', ShiftRight: 'nitro', Space: 'nitro',
}

export function setInput(name: keyof InputState, active: boolean) {
  inputState[name] = active
}

export function resetInput() {
  for (const key of Object.keys(inputState) as (keyof InputState)[]) inputState[key] = false
}

export function isMobileDrivingDevice() {
  const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches ?? false
  const compactTouchDevice = navigator.maxTouchPoints > 0 && window.innerWidth <= 1024
  return coarsePointer || compactTouchDevice
}

export function resolveDrivingInput(input: InputState, automaticAcceleration: boolean): InputState {
  if (!automaticAcceleration) return input
  return { ...input, accelerate: !input.brake }
}

export function installInput(onPause: () => void, onRestart: () => void) {
  const keydown = (event: KeyboardEvent) => {
    const mapped = KEY_MAP[event.code]
    if (mapped) {
      event.preventDefault()
      inputState[mapped] = true
    }
    if (!event.repeat && (event.code === 'Escape' || event.code === 'KeyP')) onPause()
    if (!event.repeat && event.code === 'KeyR') onRestart()
  }
  const keyup = (event: KeyboardEvent) => {
    const mapped = KEY_MAP[event.code]
    if (mapped) {
      event.preventDefault()
      inputState[mapped] = false
    }
  }
  window.addEventListener('keydown', keydown, { passive: false })
  window.addEventListener('keyup', keyup, { passive: false })
  window.addEventListener('blur', resetInput)
  document.addEventListener('visibilitychange', resetInput)
  return () => {
    window.removeEventListener('keydown', keydown)
    window.removeEventListener('keyup', keyup)
    window.removeEventListener('blur', resetInput)
    document.removeEventListener('visibilitychange', resetInput)
  }
}
