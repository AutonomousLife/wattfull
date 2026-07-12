import * as THREE from "three";
import type { Settings, Vec3 } from "../shared/types";
import { meshChunk } from "../world/mesher";
import type { World } from "../world/World";

export class Renderer {
  readonly renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(74, 1, .05, 220);
  readonly selection = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.01, 1.01, 1.01)), new THREE.LineBasicMaterial({ color: 0xd8ddd1 }));
  private chunks = new Map<string, { opaque: THREE.Mesh; transparent: THREE.Mesh }>();
  private signal = new THREE.Group();
  private skyObjects = new THREE.Group();
  private atlas!: THREE.Texture;
  private opaqueMat?: THREE.MeshLambertMaterial;
  private transparentMat?: THREE.MeshLambertMaterial;
  private sun = new THREE.DirectionalLight(0xffdfac, 1.15);
  private hemi = new THREE.HemisphereLight(0xb8c8c1, 0x51473a, 1.05);
  private sky = new THREE.Color();

  constructor(private world: World, private settings: Settings) {
    this.renderer.setPixelRatio(Math.min(2, devicePixelRatio));
    this.renderer.domElement.id = 'game-canvas';
    document.querySelector('#viewport')!.append(this.renderer.domElement);
    this.scene.background = new THREE.Color(0x7f9290);
    this.scene.fog = new THREE.Fog(0x7f9290, 42, settings.renderDistance * 22);
    this.camera.rotation.order = 'YXZ';
    this.sun.castShadow = false;
    this.scene.add(this.hemi, this.sun, this.selection, this.signal, this.skyObjects);
    this.selection.visible = false;
    this.createSkyObjects();
    this.resize();
    addEventListener('resize', () => this.resize());
  }

  private createSkyObjects() {
    const sunDisc = new THREE.Mesh(new THREE.SphereGeometry(2.2, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffe2a6, fog: false }));
    sunDisc.name = 'sun';
    const moon = new THREE.Mesh(new THREE.SphereGeometry(1.4, 12, 8), new THREE.MeshBasicMaterial({ color: 0xc8d4dc, fog: false }));
    moon.name = 'moon';
    const stars: number[] = [];
    for (let i = 0; i < 180; i++) {
      const a = i * 2.399, h = 20 + (i % 31) * 1.7, r = 120;
      stars.push(Math.cos(a) * r, h, Math.sin(a) * r);
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(stars, 3));
    const starField = new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0xe5eef0, size: .8, sizeAttenuation: false, transparent: true, opacity: 0, fog: false }));
    starField.name = 'stars';
    this.skyObjects.add(sunDisc, moon, starField);
  }

  async init() {
    this.atlas = await new THREE.TextureLoader().loadAsync('/blockworks/assets/atlas.png');
    this.atlas.magFilter = THREE.NearestFilter; this.atlas.minFilter = THREE.NearestFilter; this.atlas.generateMipmaps = false; this.atlas.colorSpace = THREE.SRGBColorSpace;
    this.opaqueMat = new THREE.MeshLambertMaterial({ map: this.atlas, vertexColors: true });
    this.transparentMat = new THREE.MeshLambertMaterial({ map: this.atlas, vertexColors: true, transparent: true, opacity: .78, alphaTest: .12, side: THREE.DoubleSide, depthWrite: false });
    this.rebuildDirty(2);
  }

  resize() { const width = innerWidth, height = innerHeight; this.renderer.setSize(width, height); this.camera.aspect = width / height; this.camera.updateProjectionMatrix(); }
  rebuildDirty(budget = 1) {
    if (!this.opaqueMat || !this.transparentMat) return;
    for (const [key, pair] of this.chunks) {
      if (this.world.chunks.has(key)) continue;
      pair.opaque.geometry.dispose(); pair.transparent.geometry.dispose(); this.scene.remove(pair.opaque, pair.transparent); this.chunks.delete(key);
    }
    for (const [key, chunk] of this.world.chunks) {
      if (!chunk.dirty || budget-- <= 0) continue;
      const old = this.chunks.get(key);
      if (old) { old.opaque.geometry.dispose(); old.transparent.geometry.dispose(); this.scene.remove(old.opaque, old.transparent); }
      const next = meshChunk(this.world, chunk, this.opaqueMat, this.transparentMat);
      next.opaque.position.set(chunk.cx * 16, 0, chunk.cz * 16); next.transparent.position.copy(next.opaque.position);
      this.scene.add(next.opaque, next.transparent); this.chunks.set(key, next); chunk.dirty = false;
    }
  }
  setCamera(position: Vec3, yaw: number, pitch: number, bob = 0, landing = 0) {
    this.camera.position.set(position.x, position.y + 1.62 + bob - landing, position.z); this.camera.rotation.set(pitch, yaw, 0);
    this.skyObjects.position.copy(this.camera.position);
    const cx = Math.floor(position.x / 16), cz = Math.floor(position.z / 16);
    for (const [key, pair] of this.chunks) {
      const [x, z] = key.split(',').map(Number); const visible = Math.max(Math.abs((x ?? 0) - cx), Math.abs((z ?? 0) - cz)) <= this.settings.renderDistance;
      pair.opaque.visible = visible; pair.transparent.visible = visible;
    }
  }
  setFov(target: number, dt: number) { const next = this.camera.fov + (target - this.camera.fov) * Math.min(1, dt * 9); if (Math.abs(next - this.camera.fov) < .01) return; this.camera.fov = next; this.camera.updateProjectionMatrix(); }
  updateSky(time: number) {
    const angle = time * Math.PI * 2 - Math.PI / 2, daylight = Math.max(0, Math.sin(angle));
    this.sun.position.set(Math.cos(angle) * 85, Math.sin(angle) * 95, 25);
    this.sun.intensity = .08 + daylight * 1.15; this.hemi.intensity = .18 + daylight * .9;
    this.sky.setRGB(.05 + daylight * .42, .08 + daylight * .49, .13 + daylight * .47);
    this.scene.background = this.sky; (this.scene.fog as THREE.Fog).color.copy(this.sky);
    const sunDisc = this.skyObjects.getObjectByName('sun')!; const moon = this.skyObjects.getObjectByName('moon')!; const stars = this.skyObjects.getObjectByName('stars') as THREE.Points;
    sunDisc.position.copy(this.sun.position).setLength(130); moon.position.copy(this.sun.position).multiplyScalar(-1).setLength(130);
    sunDisc.visible = daylight > .02; moon.visible = daylight < .25; (stars.material as THREE.PointsMaterial).opacity = Math.max(0, .8 - daylight * 3);
  }
  target(block?: Vec3) { this.selection.visible = !!block; if (block) this.selection.position.set(block.x + .5, block.y + .5, block.z + .5); }
  setTowerState(completed: boolean) {
    this.signal.clear(); if (!completed) return;
    const { x, z, ground } = this.world.tower;
    const core = new THREE.Mesh(new THREE.BoxGeometry(.58, .58, .58), new THREE.MeshBasicMaterial({ color: 0x58b9b4 })); core.position.set(x + .5, ground + 6.5, z + .5);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(.08, .22, 75, 8, 1, true), new THREE.MeshBasicMaterial({ color: 0x75cac4, transparent: true, opacity: .32, depthWrite: false })); beam.position.set(x + .5, ground + 44, z + .5);
    const coreLight = new THREE.PointLight(0x65bdb8, 1.35, 11, 2); coreLight.position.copy(core.position); this.signal.add(core, beam, coreLight);
  }
  render() { this.renderer.render(this.scene, this.camera); }
  triangles() { return this.renderer.info.render.triangles; }
}
