import * as THREE from "three";
import type { Settings, Vec3 } from "../shared/types";
import { meshChunk } from "../world/mesher";
import type { World } from "../world/World";

export class Renderer {
  readonly renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(74, 1, .05, 180);
  readonly selection = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(1.01, 1.01, 1.01)),
    new THREE.LineBasicMaterial({ color: 0xd8ddd1 }),
  );
  private chunks = new Map<string, { opaque: THREE.Mesh; transparent: THREE.Mesh }>();
  private signal = new THREE.Group();
  private atlas!: THREE.Texture;
  private opaqueMat?: THREE.MeshLambertMaterial;
  private transparentMat?: THREE.MeshLambertMaterial;

  constructor(private world: World, private settings: Settings) {
    this.renderer.setPixelRatio(Math.min(2, devicePixelRatio));
    this.renderer.domElement.id = 'game-canvas';
    document.querySelector('#viewport')!.append(this.renderer.domElement);
    this.scene.background = new THREE.Color(0x7f9290);
    this.scene.fog = new THREE.Fog(0x7f9290, 50, settings.renderDistance * 22);
    this.camera.rotation.order = 'YXZ';
    this.scene.add(new THREE.HemisphereLight(0xb8c8c1, 0x51473a, 1.05));
    const sun = new THREE.DirectionalLight(0xffdfac, 1.15);
    sun.position.set(35, 60, 20);
    this.scene.add(sun, this.selection, this.signal);
    this.selection.visible = false;
    this.resize();
    addEventListener('resize', () => this.resize());
  }

  async init() {
    this.atlas = await new THREE.TextureLoader().loadAsync('/blockworks/assets/atlas.png');
    this.atlas.magFilter = THREE.NearestFilter;
    this.atlas.minFilter = THREE.NearestFilter;
    this.atlas.generateMipmaps = false;
    this.atlas.colorSpace = THREE.SRGBColorSpace;
    this.opaqueMat = new THREE.MeshLambertMaterial({ map: this.atlas, vertexColors: true });
    this.transparentMat = new THREE.MeshLambertMaterial({ map: this.atlas, vertexColors: true, transparent: true, opacity: .78, alphaTest: .12, side: THREE.DoubleSide, depthWrite: false });
    this.rebuildDirty();
  }

  resize() { const width = innerWidth, height = innerHeight; this.renderer.setSize(width, height); this.camera.aspect = width / height; this.camera.updateProjectionMatrix(); }
  rebuildDirty() {
    if (!this.opaqueMat || !this.transparentMat) return;
    for (const [key, chunk] of this.world.chunks) {
      if (!chunk.dirty) continue;
      const old = this.chunks.get(key);
      if (old) { old.opaque.geometry.dispose(); old.transparent.geometry.dispose(); this.scene.remove(old.opaque, old.transparent); }
      const next = meshChunk(this.world, chunk, this.opaqueMat, this.transparentMat);
      next.opaque.position.set(chunk.cx * 16, 0, chunk.cz * 16);
      next.transparent.position.copy(next.opaque.position);
      this.scene.add(next.opaque, next.transparent);
      this.chunks.set(key, next);
      chunk.dirty = false;
    }
  }
  setCamera(position: Vec3, yaw: number, pitch: number, bob = 0, landing = 0) {
    this.camera.position.set(position.x, position.y + 1.62 + bob - landing, position.z);
    this.camera.rotation.set(pitch, yaw, 0);
    const cx = Math.floor(position.x / 16), cz = Math.floor(position.z / 16);
    for (const [key, pair] of this.chunks) {
      const [x, z] = key.split(',').map(Number);
      const visible = Math.max(Math.abs((x ?? 0) - cx), Math.abs((z ?? 0) - cz)) <= this.settings.renderDistance;
      pair.opaque.visible = visible;
      pair.transparent.visible = visible;
    }
  }
  setFov(value: number) { if (Math.abs(this.camera.fov - value) < .01) return; this.camera.fov = value; this.camera.updateProjectionMatrix(); }
  target(block?: Vec3) { this.selection.visible = !!block; if (block) this.selection.position.set(block.x + .5, block.y + .5, block.z + .5); }

  setTowerState(completed: boolean) {
    this.signal.clear();
    if (!completed) return;
    const { x, z, ground } = this.world.tower;
    const core = new THREE.Mesh(new THREE.BoxGeometry(.58, .58, .58), new THREE.MeshBasicMaterial({ color: 0x58b9b4 }));
    core.position.set(x + .5, ground + 6.5, z + .5);
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(.08, .22, 75, 8, 1, true),
      new THREE.MeshBasicMaterial({ color: 0x75cac4, transparent: true, opacity: .32, depthWrite: false }),
    );
    beam.position.set(x + .5, ground + 44, z + .5);
    const coreLight = new THREE.PointLight(0x65bdb8, 1.35, 11, 2);
    coreLight.position.copy(core.position);
    this.signal.add(core, beam, coreLight);
    for (const side of [-2, 2]) {
      const lamp = new THREE.Mesh(new THREE.BoxGeometry(.22, .3, .22), new THREE.MeshBasicMaterial({ color: 0xd6a15f }));
      lamp.position.set(x + side + .5, ground + 5.3, z - 1.5);
      const light = new THREE.PointLight(0xd6a15f, .7, 8, 2);
      light.position.copy(lamp.position);
      this.signal.add(lamp, light);
    }
  }
  render() { this.renderer.render(this.scene, this.camera); }
  triangles() { return this.renderer.info.render.triangles; }
}
