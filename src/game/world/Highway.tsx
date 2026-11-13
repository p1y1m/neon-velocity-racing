import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { SimState } from '../core/types'

const SEGMENT_LENGTH = 24
const SEGMENTS = 16

export function Highway({ sim }: { sim: React.RefObject<SimState> }) {
  const group = useRef<THREE.Group>(null)
  useFrame(() => {
    if (group.current) group.current.position.z = (sim.current.distance % SEGMENT_LENGTH)
  })
  return (
    <group ref={group}>
      {Array.from({ length: SEGMENTS }, (_, i) => (
        <group key={i} position={[0, -0.08, -i * SEGMENT_LENGTH]}>
          <mesh receiveShadow position={[0, -0.05, -SEGMENT_LENGTH / 2]}>
            <boxGeometry args={[11.2, 0.22, SEGMENT_LENGTH - 0.05]} />
            <meshStandardMaterial color="#090a14" roughness={0.62} metalness={0.55} />
          </mesh>
          {[-1.57, 1.57].map((x) => (
            <group key={x}>
              {Array.from({ length: 6 }, (_, j) => (
                <mesh key={j} position={[x, 0.09, -j * 4 - 1.2]}>
                  <boxGeometry args={[0.055, 0.015, 2.1]} />
                  <meshBasicMaterial color="#dffcff" transparent opacity={0.8} />
                </mesh>
              ))}
            </group>
          ))}
          {[-5.62, 5.62].map((x) => (
            <group key={x} position={[x, 0.25, -SEGMENT_LENGTH / 2]}>
              <mesh>
                <boxGeometry args={[0.12, 0.12, SEGMENT_LENGTH]} />
                <meshBasicMaterial color={x < 0 ? '#00eaff' : '#ff2ca9'} toneMapped={false} />
              </mesh>
              <mesh position={[x < 0 ? -0.2 : 0.2, 0.28, 0]}>
                <boxGeometry args={[0.07, 0.62, SEGMENT_LENGTH]} />
                <meshStandardMaterial color="#181a2b" metalness={0.9} />
              </mesh>
            </group>
          ))}
          {i % 3 === 1 && <LightArch z={-12} />}
        </group>
      ))}
    </group>
  )
}

function LightArch({ z }: { z: number }) {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#824cff', toneMapped: false }), [])
  return (
    <group position={[0, 0, z]}>
      <mesh position={[-5.5, 2.25, 0]} material={mat}><boxGeometry args={[0.11, 4.5, 0.12]} /></mesh>
      <mesh position={[5.5, 2.25, 0]} material={mat}><boxGeometry args={[0.11, 4.5, 0.12]} /></mesh>
      <mesh position={[0, 4.5, 0]} material={mat}><boxGeometry args={[11.1, 0.11, 0.12]} /></mesh>
    </group>
  )
}
