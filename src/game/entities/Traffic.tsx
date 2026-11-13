import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { GAME } from '../core/config'
import { applyCollectible, applyCollision, applyNearMiss, SeededRandom } from '../core/logic'
import type { SimState, TrafficEntity } from '../core/types'
import { synthAudio } from '../audio/audio'
import { useGameStore } from '../../state/gameStore'

const COLORS = ['#ff3b9d', '#00d9ff', '#8b5cff', '#ff9d24', '#46ffc8']

export function TrafficSystem({ sim }: { sim: React.RefObject<SimState> }) {
  const entities = useMemo(() => {
    const rng = new SeededRandom(2051)
    return Array.from({ length: 15 }, (_, i): TrafficEntity => {
      const type = i % 7 === 5 ? 'energy' : i % 9 === 7 ? 'barrier' : i % 5 === 3 ? 'truck' : 'car'
      const lane = Math.floor(rng.next() * 3) - 1
      return { id: i, lane, x: lane * GAME.laneWidth, z: -45 - i * 18 - rng.next() * 18, speed: type === 'barrier' || type === 'energy' ? 0 : 18 + rng.next() * 32, type, color: COLORS[i % COLORS.length], hit: false, scored: false }
    })
  }, [])
  const rng = useRef(new SeededRandom(8891))
  const settings = useGameStore((s) => s.settings)
  const setNotification = useGameStore((s) => s.setNotification)

  useFrame((_, dt) => {
    if (useGameStore.getState().phase !== 'playing') return
    const s = sim.current
    for (const entity of entities) {
      entity.z += Math.max(8, s.speed - entity.speed) * dt / 3.6
      const dx = Math.abs(s.x - entity.x)
      const hitWidth = entity.type === 'truck' ? 1.75 : entity.type === 'energy' ? 0.85 : 1.35
      if (!entity.hit && Math.abs(entity.z - 2.6) < 1.6 && dx < hitWidth) {
        entity.hit = true
        if (entity.type === 'energy') {
          sim.current = applyCollectible(s)
          setNotification('+ ENERGY CELL')
          if (!settings.muted) synthAudio.blip('collect', settings.masterVolume * settings.sfxVolume)
        } else {
          sim.current = applyCollision(s, entity.type === 'truck' || entity.type === 'barrier' ? 1.15 : 0.75)
          setNotification('IMPACT!')
          if (!settings.muted) synthAudio.blip('hit', settings.masterVolume * settings.sfxVolume)
        }
      }
      if (!entity.scored && entity.type !== 'energy' && !entity.hit && entity.z > 4.4 && entity.z < 7 && dx < 2.45 && dx > hitWidth) {
        entity.scored = true
        sim.current = applyNearMiss(sim.current)
        setNotification('NEAR MISS  +400')
      }
      if (entity.z > 19) {
        const lane = Math.floor(rng.current.next() * 3) - 1
        entity.lane = lane
        entity.x = lane * GAME.laneWidth
        entity.z = -185 - rng.current.next() * 140
        entity.speed = entity.type === 'barrier' || entity.type === 'energy' ? 0 : 18 + rng.current.next() * 34
        entity.hit = false
        entity.scored = false
      }
    }
  })

  return <>{entities.map((entity) => <TrafficModel key={entity.id} entity={entity} />)}</>
}

function TrafficModel({ entity }: { entity: TrafficEntity }) {
  const group = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (!group.current) return
    group.current.position.set(entity.x, entity.type === 'energy' ? 0.72 + Math.sin(state.clock.elapsedTime * 4 + entity.id) * 0.16 : 0, entity.z)
    group.current.visible = !entity.hit || entity.type !== 'energy'
    if (entity.type === 'energy') group.current.rotation.y += 0.04
  })
  if (entity.type === 'energy') return (
    <group ref={group}>
      <pointLight color="#35f7ff" distance={5} intensity={3} />
      <mesh rotation={[Math.PI / 4, 0, Math.PI / 4]}><octahedronGeometry args={[0.48]} /><meshStandardMaterial color="#bffcff" emissive="#06dff7" emissiveIntensity={7} toneMapped={false} /></mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.72, 0.045, 6, 24]} /><meshBasicMaterial color="#ff3dad" toneMapped={false} /></mesh>
    </group>
  )
  if (entity.type === 'barrier') return (
    <group ref={group}>
      <mesh position={[0, 0.58, 0]} castShadow><boxGeometry args={[2.25, 1.15, 0.6]} /><meshStandardMaterial color="#21152d" metalness={0.8} /></mesh>
      {[-0.72, 0, 0.72].map((x) => <mesh key={x} position={[x, 0.62, 0.32]}><boxGeometry args={[0.34, 0.12, 0.04]} /><meshBasicMaterial color="#ff9c22" toneMapped={false} /></mesh>)}
    </group>
  )
  const truck = entity.type === 'truck'
  return (
    <group ref={group}>
      <mesh position={[0, truck ? 0.75 : 0.45, 0]} scale={[truck ? 1.65 : 1.35, truck ? 0.95 : 0.5, truck ? 2.7 : 1.9]} castShadow>
        <boxGeometry /><meshStandardMaterial color={entity.color} metalness={0.82} roughness={0.25} />
      </mesh>
      <mesh position={[0, truck ? 0.88 : 0.65, truck ? 1.25 : 0.68]} scale={[truck ? 1.35 : 0.92, 0.26, 0.58]}>
        <boxGeometry /><meshStandardMaterial color="#07101b" metalness={0.4} roughness={0.15} />
      </mesh>
      <mesh position={[0, 0.42, truck ? -2.73 : -1.93]} scale={[truck ? 1.2 : 0.9, 0.08, 0.06]}>
        <boxGeometry /><meshBasicMaterial color="#ff176f" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.08, 0]} scale={[truck ? 1.5 : 1.2, 0.025, truck ? 2.4 : 1.75]}>
        <boxGeometry /><meshBasicMaterial color={entity.color} transparent opacity={0.45} toneMapped={false} />
      </mesh>
    </group>
  )
}
