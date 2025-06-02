// src/types/three-stdlib.d.ts
declare module 'three-stdlib/effects/AnaglyphEffect.js' {
  import { WebGLRenderer, Camera, Scene } from 'three';
  export class AnaglyphEffect {
    constructor(renderer: WebGLRenderer);
    setSize(width: number, height: number): void;
    render(scene: Scene, camera: Camera): void;
  }
}
