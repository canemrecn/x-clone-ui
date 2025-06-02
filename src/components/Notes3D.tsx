"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
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
    <mesh ref={ref} position={[0, 0, 0]}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color={"#F9911C"} />
    </mesh>
  );
}

export default function Notes3D() {
  return (
    <div style={{ height: "100vh", width: "100%", background: "#000" }}>
      <Canvas camera={{ position: [3, 3, 5] }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <SpinningCube />
        <Text
          position={[0, -2.5, 0]}
          fontSize={0.5}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          UnderGo 3D
        </Text>
        <OrbitControls enableZoom={true} />
      </Canvas>
    </div>
  );
}
