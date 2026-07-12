export type Vec3 = { x: number; y: number; z: number };

export type Settings = {
  renderDistance: number;
  fov: number;
  sensitivity: number;
  headBob: boolean;
  shadows: boolean;
  volume: number;
  objectives: boolean;
};

export type ItemStack = { id: number; count: number; durability?: number } | null;

export type SaveData = {
  version: 1;
  name: string;
  seed: number;
  edits: Array<[string, number]>;
  player: Vec3;
  spawn: Vec3;
  health: number;
  inventory: ItemStack[];
  objective: number;
  completed: boolean;
  savedAt: number;
};

export type GameEvent =
  | { type: "block-broken"; block: number; position: Vec3 }
  | { type: "block-placed"; block: number; position: Vec3 }
  | { type: "crafted"; item: number }
  | { type: "damage"; amount: number }
  | { type: "objective"; index: number };
