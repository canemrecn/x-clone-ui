// src/lib/AnaglyphEffect.ts
import {
  WebGLRenderer,
  WebGLRenderTarget,
  PerspectiveCamera,
  Scene,
  StereoCamera,
} from "three";

export class AnaglyphEffect {
  private renderer: WebGLRenderer;
  private stereoCamera: StereoCamera;
  private renderTargetL: WebGLRenderTarget;
  private renderTargetR: WebGLRenderTarget;
  private width: number = 512;
  private height: number = 512;

  constructor(renderer: WebGLRenderer) {
    this.renderer = renderer;
    this.stereoCamera = new StereoCamera();
    this.stereoCamera.eyeSep = 0.064;

    this.renderTargetL = new WebGLRenderTarget(this.width, this.height);
    this.renderTargetR = new WebGLRenderTarget(this.width, this.height);
  }

  setSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.renderTargetL.setSize(width, height);
    this.renderTargetR.setSize(width, height);
  }

  render(scene: Scene, camera: PerspectiveCamera): void {
    scene.updateMatrixWorld();

    if (camera.parent === null) camera.updateMatrixWorld();

    this.stereoCamera.update(camera);

    this.renderer.setRenderTarget(this.renderTargetL);
    this.renderer.render(scene, this.stereoCamera.cameraL);

    this.renderer.setRenderTarget(this.renderTargetR);
    this.renderer.render(scene, this.stereoCamera.cameraR);

    this.renderer.setRenderTarget(null);

    // Bu örnekte soldaki ve sağdaki görüntüleri birleştirmiyoruz.
    // Görsel efekt uygulanmak isteniyorsa burada canvas manipülasyonu gerekir.
    this.renderer.render(scene, camera);
  }
}
