// src/components/ThreeScene3D.tsx
"use client";

import { useRef, useEffect } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { AnaglyphEffect } from "three/examples/jsm/effects/AnaglyphEffect";

function SceneBox() {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.x += 0.005;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}

function AnaglyphRenderer() {
  const { gl, scene, size, camera } = useThree();
  const camera3D = camera as THREE.PerspectiveCamera;

  useEffect(() => {
    const effect = new AnaglyphEffect(gl);
    effect.setSize(size.width, size.height);

    const originalRender = gl.render;
    gl.render = () => effect.render(scene, camera3D);

    return () => {
      gl.render = originalRender;
    };
  }, [gl, scene, size, camera3D]);

  return null;
}

export default function ThreeScene3D() {
  return (
    <div style={{ height: "100vh", width: "100vw", backgroundColor: "black" }}>
      <Canvas camera={{ position: [2, 2, 5], fov: 75 }}>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <OrbitControls />
        <SceneBox />
        <AnaglyphRenderer />
      </Canvas>
    </div>
  );
}
