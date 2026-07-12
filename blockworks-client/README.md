# Blockworks

Blockworks is Wattfull's standalone first-person voxel survival vertical slice. It is a Vite/TypeScript/Three.js application and does not run inside React or the Next.js runtime. Production files are emitted to `../public/blockworks/` for static serving by Wattfull.

## Run it

From the repository root:

```bash
npm install
npm --prefix blockworks-client install
npm run game:dev
npm run game:test
npm run game:build
```

The Vite development URL is printed by `game:dev`. For full site integration, run `npm run game:build`, then `npm run dev`, unlock Experimental by typing `silver` on the homepage, and open Blockworks.

## Controls

- WASD: move
- Mouse: look
- Space: jump
- Shift: sprint
- Left mouse: mine
- Right mouse: place
- Mouse wheel or 1–9: select hotbar slot
- E or C: inventory and crafting
- Escape: release pointer lock and pause
- F3: debug overlay
- F5: save

## Architecture

- `src/game`: fixed-step simulation, progression, player health, item drops, and command coordination
- `src/world`: deterministic terrain, numeric chunk storage, block registry, exposed-face meshing, and DDA targeting
- `src/player`: voxel-aware AABB collision primitives
- `src/rendering`: Three.js scene, chunk mesh lifecycle, selection outline, and repaired-tower lighting
- `src/inventory` and `src/crafting`: pure inventory operations and recipe rules
- `src/input`: pointer-lock mouse and keyboard command collection
- `src/audio`: original procedural Web Audio cues
- `src/persistence`: IndexedDB adapter and versioned save validation
- `src/ui`: semantic menus, settings, inventory, crafting, and HUD

The simulation runs at a fixed 60 Hz with an accumulator; rendering runs independently with `requestAnimationFrame`. World edits go through `World.edit`, inventory changes through `Inventory`, and crafting through `craft`, keeping authoritative state separate from presentation.

## World and save format

The world is a 64×64 grid of 16×16 chunks with a height of 64 blocks. Chunks are generated deterministically from the seed as the player approaches them, with a protected worksite generated immediately for reliable spawning and collision. The terrain includes broad grassland, forest, scrubby shoreline, wetland, rocky highland, shallow water, crystal veins, and restrained cave tunnels. Base terrain is regenerated from the numeric seed; IndexedDB saves store sparse block edits plus player/spawn positions, health, inventory, objectives, completion state, world time, timestamp, and save version.

Generation and meshing are budgeted: one queued chunk is generated per fixed update and one dirty chunk is rebuilt per render update. This avoids the large synchronous world creation and remesh spikes that the early prototype incurred. The renderer also runs a persisted day-night cycle with a procedural sky color, sun, moon, stars, and time-aware fog.

## Assets

Run `npm run game:assets` to recreate `public/assets/atlas.png`. `scripts/generate-assets.mjs` builds intentional 16×16 material patterns—board joins, stone planes, bark, growth rings, leaf clusters, and embedded ore seams—from a controlled palette. Texture licensing is documented in `public/assets/ART_LICENSE.md`.

## Extending the game

To add a block, add its ID and complete definition in `src/world/blocks.ts`, add a material tile to the asset generator, assign its atlas index, and add drops or recipes. To add a recipe, add a `Recipe` entry in `src/crafting/recipes.ts`; the recipe UI reads that registry automatically. Advanced recipes use `bench: true`.

To replace textures, retain the 4×4 grid of 16×16 tiles and nearest-neighbor sampling, or update the atlas/UV contract together. Record third-party sources in `ART_LICENSE.md`.

## Future multiplayer plan

A later authoritative server can accept timestamped player commands (`move`, `look`, `jump`, `mine-start`, `mine-stop`, `place`, `craft`) and emit chunk snapshots, sparse edit batches, inventory acknowledgements, entity snapshots, damage, and objective events. The server should own collision, inventory, mining completion, and edits. Client prediction can reuse the current fixed-step simulation while reconciling snapshots. The existing LAN relay is intentionally not coupled to this client.

## Known limitations

- Single-player only; the old LAN relay is not used by this client.
- Terrain is finite but streamed on demand; it does not yet use a worker or vertical chunk sections.
- Water is static and lighting is artistic rather than voxel-propagated.
- Dropped items are session-local and are not yet persisted.
- Shadows are omitted to keep performance predictable.
- Touch controls and gamepads are not implemented.

The next sensible milestone is streamed outer chunks with worker-based meshing, followed by broader movement/mining playtesting before authoritative multiplayer.
