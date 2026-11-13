import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { CAR_COLORS } from '../core/config'
import type { CarColor, SimState } from '../core/types'

interface Props { sim: React.RefObject<SimState>; color: CarColor }

function Wheel({ x, z }: { x: number; z: number }) {
  const wheel = useRef<THREE.Mesh>(null)
  useFrame((_, dt) => { if (wheel.current) wheel.current.rotation.x -= dt * 13 })
  return (
    <group position={[x, 0.42, z]}>
      <mesh ref={wheel} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.43, 0.43, 0.34, 16]} />
        <meshStandardMaterial color="#05050a" roughness={0.75} metalness={0.3} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.21, 0.21, 0.36, 10]} />
        <meshStandardMaterial color="#45f3ff" emissive="#14b8c8" emissiveIntensity={3} />
      </mesh>
    </group>
  )
}

export function PlayerCar({ sim, color }: Props) {
  const group = useRef<THREE.Group>(null)
  const glow = CAR_COLORS[color].glow
  const body = CAR_COLORS[color].body
  const bodyMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: body, metalness: 0.88, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.14,
  }), [body])

  useFrame((state, dt) => {
    if (!group.current) return
    const s = sim.current
    group.current.position.x = THREE.MathUtils.damp(group.current.position.x, s.x, 10, dt)
    group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, -s.lateralVelocity * 0.035, 7, dt)
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, -s.lateralVelocity * 0.022, 7, dt)
    group.current.position.y = 0.06 + Math.sin(state.clock.elapsedTime * 7) * 0.015
  })

  return (
    <group ref={group} position={[0, 0.06, 2.6]}>
      <pointLight color={glow} intensity={7} distance={8} position={[0, 0.2, 1.2]} />
      <mesh position={[0, 0.36, 0.1]} scale={[1.6, 0.34, 2.35]} castShadow material={bodyMaterial}>
        <boxGeometry args={[1, 1, 1]} />
      </mesh>
      <mesh position={[0, 0.7, 0.1]} scale={[1.08, 0.34, 1.12]} castShadow>
        <sphereGeometry args={[1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial color="#07101e" metalness={0.6} roughness={0.08} transmission={0.18} transparent opacity={0.86} />
      </mesh>
      <mesh position={[0, 0.33, -1.55]} rotation={[0.16, 0, 0]} scale={[1.42, 0.12, 0.82]} material={bodyMaterial}>
        <boxGeometry />
      </mesh>
      <mesh position={[0, 0.38, 1.65]} rotation={[-0.15, 0, 0]} scale={[1.38, 0.18, 0.7]} material={bodyMaterial}>
        <boxGeometry />
      </mesh>
      <mesh position={[0, 0.62, -1.82]} scale={[1.45, 0.07, 0.3]}>
        <boxGeometry />
        <meshStandardMaterial color="#11131a" metalness={0.9} roughness={0.22} />
      </mesh>
      <mesh position={[0, 0.42, 1.79]} scale={[1.03, 0.055, 0.08]}>
        <boxGeometry />
        <meshStandardMaterial color="#dfffff" emissive="#8effff" emissiveIntensity={8} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.47, -1.93]} scale={[1.15, 0.07, 0.08]}>
        <boxGeometry />
        <meshStandardMaterial color="#ff238f" emissive="#ff006f" emissiveIntensity={9} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.12, 0]} scale={[1.55, 0.035, 2.15]}>
        <boxGeometry />
        <meshBasicMaterial color={glow} transparent opacity={0.65} toneMapped={false} />
      </mesh>
      {[-0.7, 0.7].map((x) => (
        <group key={x}>
          <Wheel x={x} z={1.12} />
          <Wheel x={x} z={-1.12} />
          <mesh position={[x * 0.54, 0.37, -2.02]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.18, 1.35, 12, 1, true]} />
            <meshBasicMaterial color={glow} transparent opacity={0.52} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
