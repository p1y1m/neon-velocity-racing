import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing'
import { Suspense, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { createSimulation, stepSimulation } from '../core/logic'
import { inputState, isMobileDrivingDevice, resolveDrivingInput } from '../core/input'
import type { SimState } from '../core/types'
import { useGameStore } from '../../state/gameStore'
import { PlayerCar } from '../entities/PlayerCar'
import { TrafficSystem } from '../entities/Traffic'
import { Highway } from '../world/Highway'
import { City } from '../world/City'
import { synthAudio } from '../audio/audio'

export default function GameScene() {
  const selectedQuality = useGameStore((s) => s.settings.quality)
  const testVariant = new URLSearchParams(window.location.search).get('test')
  const quality = testVariant ? 'low' : selectedQuality
  return (
    <div className="scene" aria-label="3D racing scene">
      <Canvas
        frameloop={testVariant === '1' ? 'demand' : 'always'}
        shadows={quality === 'high'}
        dpr={quality === 'low' ? [0.65, 1] : quality === 'medium' ? [0.8, 1.35] : [1, 1.75]}
        camera={{ position: [0, 4.2, 11.5], fov: 62, near: 0.1, far: 460 }}
        gl={{ antialias: quality !== 'low', powerPreference: 'high-performance', alpha: false }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.18
        }}
      >
        <Suspense fallback={null}><World /></Suspense>
      </Canvas>
    </div>
  )
}

function World() {
  const sim = useRef<SimState>(createSimulation())
  const accumulator = useRef(0)
  const hudTimer = useRef(0)
  const nitroWasActive = useRef(false)
  const phase = useGameStore((s) => s.phase)
  const previousPhase = useRef(phase)
  const automaticAcceleration = useRef(isMobileDrivingDevice())
  const color = useGameStore((s) => s.carColor)
  const settings = useGameStore((s) => s.settings)
  const testVariant = new URLSearchParams(window.location.search).get('test')
  const quality = testVariant ? 'low' : settings.quality
  const syncRun = useGameStore((s) => s.syncRun)
  const endRun = useGameStore((s) => s.endRun)

  useEffect(() => {
    if (previousPhase.current === 'playing' || previousPhase.current === 'paused' || phase === 'paused') {
      synthAudio.stopAll()
    }
    nitroWasActive.current = false
    if (phase === 'countdown') sim.current = createSimulation()
    previousPhase.current = phase
  }, [phase])

  useEffect(() => () => synthAudio.dispose(), [])

  useFrame((_, frameDt) => {
    if (useGameStore.getState().phase !== 'playing') return
    const dt = Math.min(frameDt, 0.1)
    accumulator.current += dt
    const drivingInput = resolveDrivingInput(inputState, automaticAcceleration.current)
    while (accumulator.current >= 1 / 60) {
      sim.current = stepSimulation(sim.current, drivingInput, 1 / 60)
      accumulator.current -= 1 / 60
    }
    hudTimer.current += dt
    if (hudTimer.current >= 0.08) {
      syncRun(sim.current)
      hudTimer.current = 0
    }
    const nitroActive = inputState.nitro && sim.current.nitro > 0
    if (nitroActive && !nitroWasActive.current && !settings.muted) {
      synthAudio.blip('nitro', settings.masterVolume * settings.sfxVolume)
    }
    nitroWasActive.current = nitroActive
    if (sim.current.integrity <= 0) {
      endRun(sim.current)
    }
  })

  return (
    <>
      <color attach="background" args={['#03030b']} />
      <fogExp2 attach="fog" args={['#08051a', 0.012]} />
      <ambientLight intensity={0.48} color="#8b79d9" />
      <hemisphereLight intensity={1.1} color="#3de8ff" groundColor="#190018" />
      <directionalLight castShadow={quality === 'high'} position={[5, 12, 6]} intensity={1.7} color="#e6faff" shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-9, 3, -15]} color="#00e5ff" intensity={16} distance={35} />
      <pointLight position={[9, 5, -35]} color="#ff1d9e" intensity={18} distance={42} />
      <Highway sim={sim} />
      <City sim={sim} quality={quality} />
      {testVariant !== 'mobile' && <TrafficSystem sim={sim} />}
      <PlayerCar sim={sim} color={color} />
      <SpeedLines sim={sim} />
      <ChaseCamera sim={sim} shakeEnabled={settings.cameraShake} />
      {quality !== 'low' && (
        <EffectComposer multisampling={quality === 'high' ? 4 : 0}>
          <Bloom intensity={1.25} luminanceThreshold={0.55} luminanceSmoothing={0.38} mipmapBlur />
          {quality === 'high' && <Noise opacity={0.025} />}
          <Vignette eskil={false} offset={0.22} darkness={0.72} />
        </EffectComposer>
      )}
    </>
  )
}

function ChaseCamera({ sim, shakeEnabled }: { sim: React.RefObject<SimState>; shakeEnabled: boolean }) {
  const { camera } = useThree()
  const target = useRef(new THREE.Vector3())
  useFrame((state, dt) => {
    const s = sim.current
    const boost = inputState.nitro && s.nitro > 0
    const shake = shakeEnabled ? s.shake * 0.13 : 0
    const desiredX = s.x * 0.32 + (Math.random() - 0.5) * shake
    const desiredY = 4.15 + (boost ? 0.35 : 0) + (Math.random() - 0.5) * shake
    camera.position.x = THREE.MathUtils.damp(camera.position.x, desiredX, 5, dt)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, desiredY, 4, dt)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, boost ? 12.5 : 11.2, 4, dt)
    const perspective = camera as THREE.PerspectiveCamera
    perspective.fov = THREE.MathUtils.damp(perspective.fov, 60 + (s.speed - 45) * 0.16 + (boost ? 6 : 0), 4, dt)
    perspective.updateProjectionMatrix()
    target.current.set(s.x * 0.62, 0.72, -13 - s.speed * 0.045)
    camera.lookAt(target.current)
  })
  return null
}

function SpeedLines({ sim }: { sim: React.RefObject<SimState> }) {
  const lines = useRef<THREE.InstancedMesh>(null)
  useEffect(() => {
    if (!lines.current) return
    const matrix = new THREE.Matrix4()
    const rng = () => Math.random()
    for (let i = 0; i < 40; i++) {
      matrix.compose(new THREE.Vector3((rng() - 0.5) * 18, 1 + rng() * 7, -rng() * 70), new THREE.Quaternion(), new THREE.Vector3(0.012, 0.012, 1 + rng() * 4))
      lines.current.setMatrixAt(i, matrix)
    }
    lines.current.instanceMatrix.needsUpdate = true
  }, [])
  useFrame((_, dt) => {
    if (!lines.current) return
    lines.current.position.z += dt * sim.current.speed * 0.35
    if (lines.current.position.z > 14) lines.current.position.z = -18
    const material = lines.current.material
    if (!Array.isArray(material)) material.opacity = Math.max(0.04, (sim.current.speed - 48) / 150)
  })
  return (
    <instancedMesh ref={lines} args={[undefined, undefined, 40]} frustumCulled={false}>
      <boxGeometry />
      <meshBasicMaterial color="#bafcff" transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} />
    </instancedMesh>
  )
}
