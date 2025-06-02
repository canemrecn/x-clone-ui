// src/app/notes3d/page.tsx
"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function SpinningCube() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.x += 0.01;
      ref.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={ref}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  );
}

export default function Notes3DPage() {
  return (
    <div style={{ height: "100vh", width: "100%", background: "#000" }}>
      <Canvas camera={{ position: [4, 4, 6] }}>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <SpinningCube />
        <OrbitControls />
      </Canvas>
    </div>
  );
}
