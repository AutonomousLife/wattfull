import * as THREE from "three";
import type { SaveData, Settings, Vec3 } from "../shared/types";
import { World } from "../world/World";
import { findSpawn } from "../world/generator";
import { Renderer } from "../rendering/Renderer";
import { Input } from "../input/Input";
import { Inventory } from "../inventory/Inventory";
import { AudioSystem } from "../audio/AudioSystem";
import { BlockId, BLOCKS, ItemId, toolTier } from "../world/blocks";
import { collides, moveAxis, overlapsBlock, playerAABB } from "../player/collision";
import { raycastVoxel, type VoxelHit } from "../world/raycast";
import { craft, RECIPES } from "../crafting/recipes";
import { objectiveSatisfied } from "./objectives";
import { completeTowerRepair, TOWER_REPAIR } from "./repair";
import { saveWorld } from "../persistence/db";
import type { UI } from "../ui/UI";

type Drop = { id: number; count: number; position: THREE.Vector3; velocity: number; mesh: THREE.Mesh; age: number };
type Particle = { mesh: THREE.Mesh; velocity: THREE.Vector3; age: number };

export class Game {
  readonly world: World;
  readonly inventory: Inventory;
  readonly spawn: Vec3;
  readonly player: Vec3;
  readonly velocity: Vec3 = { x: 0, y: 0, z: 0 };
  health = 20;
  objective = 0;
  completed = false;
  private renderer: Renderer;
  private input: Input;
  private audio: AudioSystem;
  private running = false;
  private stopped = false;
  private last = 0;
  private accumulator = 0;
  private grounded = false;
  private coyote = 0;
  private jumpBuffer = 0;
  private mining = 0;
  private miningKey = '';
  private target: VoxelHit | null = null;
  private placeCooldown = 0;
  private bob = 0;
  private bobPhase = 0;
  private landing = 0;
  private stepDistance = 0;
  private autosave = 0;
  private debug = false;
  private fps = 0;
  private frames = 0;
  private fpsTime = 0;
  private worldTime = .32;
  private streamCleanup = 0;
  private streamRequest = '';
  private drops: Drop[] = [];
  private particles: Particle[] = [];

  constructor(readonly name: string, readonly seed: number, private settings: Settings, private ui: UI, save?: SaveData) {
    this.world = new World(seed);
    if (save) this.world.applyEdits(save.edits);
    const generatedSpawn = findSpawn(seed);
    const savedSpawn = save ? { ...save.spawn } : generatedSpawn;
    this.spawn = collides(playerAABB(savedSpawn), (x, y, z) => this.world.isSolid(x, y, z)) ? generatedSpawn : savedSpawn;
    this.player = save ? { ...save.player } : { ...this.spawn };
    if (collides(playerAABB(this.player), (x, y, z) => this.world.isSolid(x, y, z))) Object.assign(this.player, this.spawn);
    this.health = save?.health ?? 20;
    this.inventory = new Inventory(27, save?.inventory);
    this.objective = save?.objective ?? 0;
    this.completed = save?.completed ?? false;
    this.worldTime = save?.worldTime ?? .32;
    if (this.completed) this.world.repairTower();
    this.renderer = new Renderer(this.world, settings);
    this.input = new Input(this.renderer.renderer.domElement, () => settings.sensitivity);
    this.audio = new AudioSystem(() => settings.volume);
    this.bind();
  }

  async start() {
    await this.renderer.init();
    this.renderer.setTowerState(this.completed);
    this.running = true;
    this.ui.showGame();
    this.ui.renderHUD(this.inventory, this.health, this.objective, this.completed);
    this.lockPointer();
    requestAnimationFrame(time => this.loop(time));
  }

  refreshSettings() { this.audio.updateVolume(); }

  private bind() {
    const canvas = this.renderer.renderer.domElement;
    canvas.addEventListener('click', () => { this.audio.start(); if (!this.ui.isMenu() && document.pointerLockElement !== canvas) this.lockPointer(); });
    document.addEventListener('pointerlockchange', () => {
      if (this.stopped) return;
      if (document.pointerLockElement === canvas) { this.running = true; this.input.setEnabled(true); this.ui.showGame(); }
      else if (this.running) { this.running = false; this.input.setEnabled(false); this.ui.pause(); void this.save(); }
    });
    addEventListener('keydown', event => {
      if (this.stopped) return;
      if (event.code === 'F3') { event.preventDefault(); this.debug = !this.debug; }
      if (event.code === 'F5') { event.preventDefault(); void this.save(true); }
      if (!this.running) return;
      if (/^Digit[1-9]$/.test(event.code)) {
        this.inventory.selected = Number(event.code.slice(5)) - 1;
        this.ui.renderHUD(this.inventory, this.health, this.objective, this.completed);
      }
      if (event.code === 'KeyE' || event.code === 'KeyC') { event.preventDefault(); this.openInventory(); }
    });
    this.ui.onResume = () => { this.ui.showGame(); this.lockPointer(); };
    this.ui.onSave = () => void this.save(true);
    this.ui.onQuit = () => { void this.save().then(() => { this.stop(); this.ui.showTitle(); }); };
    this.ui.onCompleteExplore = () => { this.ui.showGame(); this.lockPointer(); };
    this.ui.onCompleteQuit = () => { void this.save().then(() => { this.stop(); this.ui.showTitle(); }); };
    this.ui.onCraft = id => this.doCraft(id);
    this.ui.onMoveSlot = (from, to) => { this.inventory.move(from, to); this.ui.renderHUD(this.inventory, this.health, this.objective, this.completed); };
  }

  private loop(time: number) {
    if (this.stopped) return;
    const dt = Math.min(.1, (time - this.last) / 1000 || 0);
    this.last = time;
    this.accumulator = Math.min(.15, this.accumulator + dt);
    let steps = 0;
    while (this.accumulator >= 1 / 60 && steps++ < 5) { if (this.running) this.fixed(1 / 60); this.accumulator -= 1 / 60; }
    if (steps === 5) this.accumulator = 0;
    this.updateView(dt);
    this.renderer.render();
    this.frames++;
    this.fpsTime += dt;
    if (this.fpsTime >= .5) { this.fps = Math.round(this.frames / this.fpsTime); this.frames = 0; this.fpsTime = 0; }
    this.ui.debug(`FPS ${this.fps}\nXYZ ${this.player.x.toFixed(2)} ${this.player.y.toFixed(2)} ${this.player.z.toFixed(2)}\nCHUNK ${Math.floor(this.player.x / 16)}, ${Math.floor(this.player.z / 16)}\nLOADED ${this.world.chunks.size}\nQUEUED ${this.world.pendingGeneration()}\nTIME ${Math.floor(this.worldTime * 24)}:00\nTRIANGLES ${this.renderer.triangles()}\nSEED ${this.seed}\nGROUNDED ${this.grounded}`, this.debug);
    requestAnimationFrame(next => this.loop(next));
  }

  private fixed(dt: number) {
    const streamRequest = `${Math.floor(this.player.x / 16)},${Math.floor(this.player.z / 16)}:${this.settings.renderDistance}`;
    if (streamRequest !== this.streamRequest) {
      this.streamRequest = streamRequest;
      this.world.queueAround(this.player.x, this.player.z, this.settings.renderDistance + 1);
    }
    this.world.processGeneration(1);
    this.streamCleanup += dt;
    if (this.streamCleanup > 2) { this.streamCleanup = 0; this.world.unloadFar(this.player.x, this.player.z, this.settings.renderDistance + 2); }
    this.worldTime = (this.worldTime + dt / 720) % 1;
    const axis = this.input.axis();
    const length = Math.hypot(axis.x, axis.z) || 1;
    const sprint = this.input.sprinting() && axis.z > 0;
    const speed = sprint ? 5.55 : 4.15;
    const forwardX = -Math.sin(this.input.yaw), forwardZ = -Math.cos(this.input.yaw);
    const rightX = Math.cos(this.input.yaw), rightZ = -Math.sin(this.input.yaw);
    const wishX = (rightX * axis.x + forwardX * axis.z) / length;
    const wishZ = (rightZ * axis.x + forwardZ * axis.z) / length;
    // Strong ground traction and intentionally limited air control stop the
    // player from skating across terrain while preserving a responsive jump.
    const acceleration = this.grounded ? 54 : 12;
    const deceleration = this.grounded ? 66 : 11;
    this.velocity.x = this.approach(this.velocity.x, wishX * speed, (axis.x || axis.z ? acceleration : deceleration) * dt);
    this.velocity.z = this.approach(this.velocity.z, wishZ * speed, (axis.x || axis.z ? acceleration : deceleration) * dt);

    if (this.input.consumeJump()) this.jumpBuffer = .1;
    else this.jumpBuffer = Math.max(0, this.jumpBuffer - dt);
    this.coyote = this.grounded ? .1 : Math.max(0, this.coyote - dt);
    if (this.jumpBuffer > 0 && this.coyote > 0) {
      this.velocity.y = 8.15;
      this.grounded = false;
      this.coyote = 0;
      this.jumpBuffer = 0;
      this.audio.jump();
    }

    const oldX = this.player.x, oldZ = this.player.z;
    const gravity = this.velocity.y > 0 && !this.input.jumpHeld() ? 52 : 32;
    this.velocity.y = Math.max(-38, this.velocity.y - gravity * dt);
    if (this.moveHorizontal('x', this.velocity.x * dt)) this.velocity.x = 0;
    if (this.moveHorizontal('z', this.velocity.z * dt)) this.velocity.z = 0;
    const fallSpeed = -this.velocity.y;
    const hitY = moveAxis(this.player, 'y', this.velocity.y * dt, (x, y, z) => this.world.isSolid(x, y, z));
    this.grounded = hitY && this.velocity.y <= 0;
    if (hitY) { if (fallSpeed > 9) this.land(fallSpeed); this.velocity.y = 0; }

    const travelled = Math.hypot(this.player.x - oldX, this.player.z - oldZ);
    if (this.grounded && travelled > .001) {
      this.stepDistance += travelled;
      if (this.stepDistance > 1.8) {
        this.stepDistance = 0;
        const under = BLOCKS[this.world.get(Math.floor(this.player.x), Math.floor(this.player.y - .1), Math.floor(this.player.z))]!;
        this.audio.footstep(under.footstep);
      }
    } else if (!this.grounded) this.stepDistance = 0;

    const wheel = this.input.consumeWheel();
    if (wheel) { this.inventory.selected = (this.inventory.selected + Math.sign(wheel) + 9) % 9; this.ui.renderHUD(this.inventory, this.health, this.objective, this.completed); }
    this.updateTarget();
    this.mine(dt);
    if (this.input.consumePlace() && this.placeCooldown <= 0) this.place();
    this.placeCooldown = Math.max(0, this.placeCooldown - dt);
    this.updateDrops(dt);
    this.updateParticles(dt);
    this.autosave += dt;
    if (this.autosave > 25) { this.autosave = 0; void this.save(); }
  }

  private updateView(dt: number) {
    const moving = Math.hypot(this.velocity.x, this.velocity.z);
    if (this.grounded && moving > .2) this.bobPhase += moving * dt * 1.9;
    const targetBob = this.settings.headBob && this.grounded && moving > .2 ? Math.sin(this.bobPhase) * .012 : 0;
    this.bob += (targetBob - this.bob) * Math.min(1, dt * 14);
    this.landing = Math.max(0, this.landing - dt * .65);
    const sprinting = this.grounded && moving > 5.1 && this.input.sprinting();
    this.renderer.setFov(this.settings.fov + (sprinting ? 3.5 : 0), dt);
    this.renderer.setCamera(this.player, this.input.yaw, this.input.pitch, this.bob, this.landing);
    this.renderer.updateSky(this.worldTime);
    this.renderer.rebuildDirty(1);
  }

  private moveHorizontal(axis: 'x' | 'z', amount: number) {
    const solid = (x: number, y: number, z: number) => this.world.isSolid(x, y, z);
    if (!moveAxis(this.player, axis, amount, solid)) return false;
    // Small steps keep the worksite traversable without allowing block climbs.
    if (!this.grounded || moveAxis(this.player, 'y', .52, solid)) return true;
    if (!moveAxis(this.player, axis, amount, solid)) {
      moveAxis(this.player, 'y', -.54, solid);
      return false;
    }
    moveAxis(this.player, 'y', -.54, solid);
    return true;
  }

  private updateTarget() {
    const cameraPosition = { x: this.player.x, y: this.player.y + 1.62, z: this.player.z };
    const cos = Math.cos(this.input.pitch);
    const direction = { x: -Math.sin(this.input.yaw) * cos, y: Math.sin(this.input.pitch), z: -Math.cos(this.input.yaw) * cos };
    this.target = raycastVoxel(cameraPosition, direction, 5, (x, y, z) => this.world.isSolid(x, y, z));
    this.renderer.target(this.target?.block);
  }

  private mine(dt: number) {
    if (!this.input.mine || !this.target) { this.cancelMine(); return; }
    const { block } = this.target;
    if (this.world.isTowerBlock(block.x, block.y, block.z)) { this.cancelMine(); this.ui.reject(); return; }
    const key = `${block.x},${block.y},${block.z}`;
    if (key !== this.miningKey) { this.miningKey = key; this.mining = 0; }
    const id = this.world.get(block.x, block.y, block.z), definition = BLOCKS[id]!;
    const selected = this.inventory.slots[this.inventory.selected], tier = toolTier(selected?.id ?? 0);
    this.ui.viewmodel(selected?.id ?? 0, true);
    let multiplier = 1;
    if (definition.tool === 'pickaxe') multiplier = tier < definition.tier ? .14 : tier >= 2 ? 5.4 : 3.6;
    const previous = this.mining;
    this.mining += dt * multiplier / Math.max(.1, definition.hardness);
    this.ui.mining(this.mining);
    if (Math.floor(this.mining * 4) !== Math.floor(previous * 4)) this.audio.mine(definition.footstep);
    if (this.mining < 1) return;
    this.world.edit(block.x, block.y, block.z, BlockId.Air);
    this.audio.break(definition.footstep);
    this.spawnParticles(id, block);
    if (definition.drop && !(definition.tool === 'pickaxe' && tier < definition.tier)) this.spawnDrop(definition.drop, block);
    if (selected && definition.tool === 'pickaxe' && tier > 0) this.inventory.damageSelected();
    this.cancelMine();
  }

  private cancelMine() { this.mining = 0; this.miningKey = ''; this.ui.mining(0); this.ui.viewmodel(this.inventory.slots[this.inventory.selected]?.id ?? 0, false); }

  private place() {
    if (!this.target) { this.rejectPlacement(); return; }
    const stack = this.inventory.slots[this.inventory.selected];
    if (stack?.id === BlockId.Beacon) { this.tryRepair(); return; }
    const position = this.target.adjacent;
    if (!stack || !BLOCKS[stack.id]?.placeable || this.world.isTowerBlock(this.target.block.x, this.target.block.y, this.target.block.z) || this.world.isTowerBlock(position.x, position.y, position.z)) { this.rejectPlacement(); return; }
    const existing = this.world.get(position.x, position.y, position.z);
    if (existing !== BlockId.Air && existing !== BlockId.Water) { this.rejectPlacement(); return; }
    if (overlapsBlock(playerAABB(this.player), position.x, position.y, position.z)) { this.rejectPlacement(); return; }
    this.world.edit(position.x, position.y, position.z, stack.id);
    this.inventory.consumeSelected();
    this.audio.place();
    this.placeCooldown = .14;
    this.ui.renderHUD(this.inventory, this.health, this.objective, this.completed);
  }

  private rejectPlacement() { this.audio.reject(); this.ui.reject(); }

  private tryRepair() {
    if (!this.target || !this.world.isTowerTarget(this.target.block.x, this.target.block.y, this.target.block.z) || this.objective < 7) { this.rejectPlacement(); return; }
    const planks = this.inventory.count(BlockId.Planks), stone = this.inventory.count(BlockId.Cobblestone), cores = this.inventory.count(BlockId.Beacon);
    if (!completeTowerRepair(this.inventory, this.world)) {
      this.ui.message(`Need ${Math.max(0, TOWER_REPAIR.planks - planks)} planks · ${Math.max(0, TOWER_REPAIR.cobblestone - stone)} stone · ${Math.max(0, TOWER_REPAIR.cores - cores)} core`);
      this.audio.reject();
      return;
    }
    this.renderer.rebuildDirty();
    this.renderer.setTowerState(true);
    this.audio.towerStart();
    this.objective = 8;
    this.completed = true;
    this.ui.message('Tower repaired');
    this.ui.renderHUD(this.inventory, this.health, this.objective, true);
    this.running = false;
    this.input.setEnabled(false);
    document.exitPointerLock();
    this.ui.complete();
    void this.save();
  }

  private spawnDrop(id: number, position: Vec3) {
    const colors: Record<number, number> = { [BlockId.Log]: 0x795238, [BlockId.Cobblestone]: 0x68706e, [ItemId.Coal]: 0x292d2d, [ItemId.Crystal]: 0x53b8b4 };
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(.22, .22, .22), new THREE.MeshLambertMaterial({ color: colors[id] ?? 0x8d8f7f }));
    mesh.position.set(position.x + .5, position.y + .62, position.z + .5);
    this.renderer.scene.add(mesh);
    this.drops.push({ id, count: 1, position: mesh.position, velocity: 1.25, mesh, age: 0 });
  }

  private spawnParticles(id: number, position: Vec3) {
    const colors: Record<number, number> = { [BlockId.Grass]: 0x6f8554, [BlockId.Dirt]: 0x715441, [BlockId.Stone]: 0x707675, [BlockId.Log]: 0x795238, [BlockId.Cobblestone]: 0x68706e, [BlockId.CrystalOre]: 0x53b8b4 };
    const material = new THREE.MeshLambertMaterial({ color: colors[id] ?? 0x73766e });
    for (let index = 0; index < 4; index++) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(.07, .07, .07), material.clone());
      mesh.position.set(position.x + .35 + Math.random() * .3, position.y + .4 + Math.random() * .3, position.z + .35 + Math.random() * .3);
      this.renderer.scene.add(mesh);
      this.particles.push({ mesh, velocity: new THREE.Vector3((Math.random() - .5) * 1.6, .8 + Math.random() * .8, (Math.random() - .5) * 1.6), age: 0 });
    }
    material.dispose();
  }

  private updateDrops(dt: number) {
    for (let index = this.drops.length - 1; index >= 0; index--) {
      const drop = this.drops[index]!;
      drop.age += dt;
      drop.velocity -= 16 * dt;
      const nextY = drop.position.y + drop.velocity * dt;
      if (this.world.isSolid(Math.floor(drop.position.x), Math.floor(nextY - .14), Math.floor(drop.position.z))) { drop.velocity = 0; drop.position.y = Math.floor(nextY - .14) + 1.14; }
      else drop.position.y = nextY;
      drop.mesh.rotation.y += dt * 1.2;
      const dx = drop.position.x - this.player.x, dy = drop.position.y - (this.player.y + 1), dz = drop.position.z - this.player.z;
      if (dx * dx + dy * dy + dz * dz < 2.56 && this.inventory.add(drop.id, drop.count) === 0) {
        this.removeDrop(index);
        this.audio.pickup();
        this.advance({ kind: 'pickup', id: drop.id });
        this.ui.renderHUD(this.inventory, this.health, this.objective, this.completed);
      } else if (drop.age > 600) this.removeDrop(index);
    }
  }

  private removeDrop(index: number) {
    const drop = this.drops[index]!;
    this.renderer.scene.remove(drop.mesh);
    drop.mesh.geometry.dispose();
    (drop.mesh.material as THREE.Material).dispose();
    this.drops.splice(index, 1);
  }

  private updateParticles(dt: number) {
    for (let index = this.particles.length - 1; index >= 0; index--) {
      const particle = this.particles[index]!;
      particle.age += dt;
      particle.velocity.y -= 8 * dt;
      particle.mesh.position.addScaledVector(particle.velocity, dt);
      if (particle.age > .32) {
        this.renderer.scene.remove(particle.mesh);
        particle.mesh.geometry.dispose();
        (particle.mesh.material as THREE.Material).dispose();
        this.particles.splice(index, 1);
      }
    }
  }

  private nearBench() {
    for (let y = -2; y <= 2; y++) for (let z = -4; z <= 4; z++) for (let x = -4; x <= 4; x++) {
      if (this.world.get(Math.floor(this.player.x) + x, Math.floor(this.player.y) + y, Math.floor(this.player.z) + z) === BlockId.CraftingBench) return true;
    }
    return false;
  }
  private openInventory() { this.running = false; this.input.setEnabled(false); document.exitPointerLock(); this.ui.inventory(this.inventory, this.nearBench()); }
  private doCraft(id: string) {
    const recipe = RECIPES.find(value => value.id === id);
    if (!recipe || !craft(this.inventory, recipe, this.nearBench())) { this.ui.message('Need materials or a bench'); this.audio.reject(); return; }
    this.audio.craft();
    this.advance({ kind: 'craft', id: recipe.output.id });
    this.ui.inventory(this.inventory, this.nearBench());
    this.ui.renderHUD(this.inventory, this.health, this.objective, this.completed);
    void this.save();
  }
  private advance(event: { kind: string; id: number }) {
    if (this.completed) return;
    if (objectiveSatisfied(this.objective, event, id => this.inventory.count(id))) {
      this.objective++;
      this.audio.objective();
      this.ui.message(this.objective < 8 ? `Objective ${this.objective}/8` : 'Return to the signal tower');
      this.ui.renderHUD(this.inventory, this.health, this.objective, this.completed);
    }
  }
  private land(speed: number) {
    this.audio.land();
    this.landing = Math.min(.045, (speed - 8) * .006);
    if (speed > 12) {
      const damage = Math.floor((speed - 10) * 1.6);
      this.health = Math.max(0, this.health - damage);
      this.audio.damage();
      this.ui.damage();
      this.ui.renderHUD(this.inventory, this.health, this.objective, this.completed);
      if (this.health <= 0) this.respawn();
    }
  }
  private respawn() {
    this.player.x = this.spawn.x; this.player.y = this.spawn.y; this.player.z = this.spawn.z;
    this.velocity.x = this.velocity.y = this.velocity.z = 0;
    this.health = 20;
    this.ui.message('Returned to worksite');
    this.ui.renderHUD(this.inventory, this.health, this.objective, this.completed);
  }
  async save(announce = false) {
    await saveWorld({ version: 1, name: this.name, seed: this.seed, edits: [...this.world.edits], player: { ...this.player }, spawn: { ...this.spawn }, health: this.health, inventory: this.inventory.serialize(), objective: this.objective, completed: this.completed, worldTime: this.worldTime, savedAt: Date.now() });
    if (announce) this.ui.message('Saved');
  }
  stop() { this.stopped = true; this.running = false; this.input.setEnabled(false); document.exitPointerLock(); }
  private lockPointer() {
    try { const result = this.renderer.renderer.domElement.requestPointerLock(); void result?.catch(() => this.ui.message('Click to resume')); }
    catch { this.ui.message('Click to resume'); }
  }
  private approach(value: number, target: number, delta: number) { return value < target ? Math.min(value + delta, target) : Math.max(value - delta, target); }
}
