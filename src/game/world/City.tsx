import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { SeededRandom } from '../core/logic'
import type { Quality, SimState } from '../core/types'

interface Building { x: number; y: number; z: number; sx: number; sy: number; sz: number; color: THREE.Color }

export function City({ sim, quality }: { sim: React.RefObject<SimState>; quality: Quality }) {
  const count = quality === 'low' ? 50 : quality === 'medium' ? 84 : 124
  const buildings = useMemo(() => {
    const rng = new SeededRandom(7447)
    return Array.from({ length: count }, (_, i): Building => {
      const side = i % 2 ? 1 : -1
      const sx = 2.6 + rng.next() * 5.5
      const sy = 5 + rng.next() * 24
      return {
        x: side * (9 + rng.next() * 24), y: sy / 2 - 0.2, z: -rng.next() * 320,
        sx, sy, sz: 2.8 + rng.next() * 7,
        color: new THREE.Color(rng.next() > 0.52 ? '#061526' : '#160721').multiplyScalar(0.7 + rng.next() * 0.4),
      }
    })
  }, [count])
  const shells = useRef<THREE.InstancedMesh>(null)
  const windows = useRef<THREE.InstancedMesh>(null)
  const root = useRef<THREE.Group>(null)

  useLayoutEffect(() => {
    const matrix = new THREE.Matrix4()
    const winColor = new THREE.Color()
    buildings.forEach((b, i) => {
      matrix.compose(new THREE.Vector3(b.x, b.y, b.z), new THREE.Quaternion(), new THREE.Vector3(b.sx, b.sy, b.sz))
      shells.current?.setMatrixAt(i, matrix)
      shells.current?.setColorAt(i, b.color)
      matrix.compose(new THREE.Vector3(b.x + (b.x > 0 ? -b.sx / 2 - 0.025 : b.sx / 2 + 0.025), b.y, b.z), new THREE.Quaternion(), new THREE.Vector3(0.045, b.sy * 0.72, b.sz * 0.72))
      windows.current?.setMatrixAt(i, matrix)
      windows.current?.setColorAt(i, winColor.set(i % 3 === 0 ? '#ff2aa2' : i % 3 === 1 ? '#20e9ff' : '#8765ff'))
    })
    if (shells.current) shells.current.instanceMatrix.needsUpdate = true
    if (windows.current) windows.current.instanceMatrix.needsUpdate = true
  }, [buildings])

  useFrame(() => { if (root.current) root.current.position.z = sim.current.distance % 320 })
  return (
    <group ref={root}>
      <instancedMesh ref={shells} args={[undefined, undefined, count]} castShadow receiveShadow>
        <boxGeometry />
        <meshStandardMaterial vertexColors roughness={0.78} metalness={0.5} />
      </instancedMesh>
      <instancedMesh ref={windows} args={[undefined, undefined, count]}>
        <boxGeometry />
        <meshBasicMaterial vertexColors transparent opacity={0.5} toneMapped={false} />
      </instancedMesh>
      {[-70, -145, -240].map((z, i) => <HoloSign key={z} z={z} side={i % 2 ? 1 : -1} index={i} />)}
      <DistantTower />
    </group>
  )
}

function HoloSign({ z, side, index }: { z: number; side: number; index: number }) {
  return (
    <group position={[side * 8.5, 5.2 + index, z]} rotation={[0, side > 0 ? -0.32 : 0.32, 0]}>
      <mesh><boxGeometry args={[5, 2.2, 0.08]} /><meshBasicMaterial color={index % 2 ? '#ff258e' : '#04d9ff'} transparent opacity={0.18} /></mesh>
      <mesh position={[0, 0, 0.06]}><planeGeometry args={[4.45, 1.65]} /><meshBasicMaterial color="#bffcff" transparent opacity={0.45} wireframe /></mesh>
    </group>
  )
}

function DistantTower() {
  return (
    <group position={[22, 18, -270]}>
      <mesh><cylinderGeometry args={[4, 7, 38, 8]} /><meshStandardMaterial color="#080d20" metalness={0.85} roughness={0.32} /></mesh>
      <mesh position={[0, 12, 0]}><torusGeometry args={[4.3, 0.12, 6, 32]} /><meshBasicMaterial color="#ff2aa2" toneMapped={false} /></mesh>
      <mesh position={[0, 20.5, 0]}><coneGeometry args={[1, 8, 8]} /><meshBasicMaterial color="#37f2ff" toneMapped={false} /></mesh>
    </group>
  )
}
