// src/components/ThreeScene3D.tsx
"use client";

import { useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { AnaglyphEffect } from "@/lib/AnaglyphEffect"; // yeni yol

function SceneContent() {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    ref.current.rotation.y += 0.01;
    ref.current.rotation.x += 0.005;
  });

  return (
    <mesh ref={ref} position={[0, 0, 0]}>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial color="#F9911C" />
    </mesh>
  );
}

function AnaglyphRenderer() {
  const { gl, size, scene, camera } = useThree();
  const perspectiveCamera = camera as THREE.PerspectiveCamera;
  const effectRef = useRef<AnaglyphEffect | null>(null);

  useEffect(() => {
    const effect = new AnaglyphEffect(gl);
    effect.setSize(size.width, size.height);
    const originalRender = gl.render;

    gl.render = () => effect.render(scene, perspectiveCamera);
    effectRef.current = effect;

    return () => {
      gl.render = originalRender;
    };
  }, [gl, size, scene, perspectiveCamera]);

  return null;
}


export default function ThreeScene3D() {
  return (
    <div style={{ height: "100vh", width: "100%", background: "black" }}>
      <Canvas camera={{ position: [2, 2, 4] }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} />
        <SceneContent />
        <OrbitControls />
        <AnaglyphRenderer />
      </Canvas>
    </div>
  );
}
