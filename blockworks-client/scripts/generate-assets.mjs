import { PNG } from 'pngjs';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, 'public/assets');
mkdirSync(out, { recursive: true });

const TILE = 16, COLS = 4;
const png = new PNG({ width: TILE * COLS, height: TILE * COLS });
const rgba = (hex, alpha = 255) => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
  alpha,
];
const pixel = (tile, x, y, color, alpha = 255) => {
  if (x < 0 || y < 0 || x >= TILE || y >= TILE) return;
  const ox = (tile % COLS) * TILE, oy = Math.floor(tile / COLS) * TILE;
  const index = ((ox + x) + (oy + y) * png.width) * 4;
  const value = rgba(color, alpha);
  for (let i = 0; i < 4; i++) png.data[index + i] = value[i];
};
const fill = (tile, color, alpha = 255) => {
  for (let y = 0; y < TILE; y++) for (let x = 0; x < TILE; x++) pixel(tile, x, y, color, alpha);
};
const rect = (tile, x, y, width, height, color, alpha = 255) => {
  for (let py = y; py < y + height; py++) for (let px = x; px < x + width; px++) pixel(tile, px, py, color, alpha);
};
const hline = (tile, y, x1, x2, color) => rect(tile, x1, y, x2 - x1 + 1, 1, color);
const vline = (tile, x, y1, y2, color) => rect(tile, x, y1, 1, y2 - y1 + 1, color);

// Grass top: broad leaf clusters, not pixel-static noise.
fill(0, '#6f8554');
for (const [x, y, c] of [[1, 2, '#849760'], [6, 1, '#596d46'], [11, 3, '#7d925d'], [3, 8, '#586b45'], [8, 7, '#82955f'], [12, 11, '#5b6f47'], [5, 13, '#83955e']]) rect(0, x, y, 3, 2, c);
hline(0, 5, 1, 4, '#8a9b66'); hline(0, 10, 7, 11, '#526541');

// Grass side: a clear sod cap over compact earth and a few roots.
fill(1, '#6d503c'); rect(1, 0, 0, 16, 4, '#708654');
for (const [x, depth] of [[1, 2], [4, 4], [8, 2], [11, 5], [14, 3]]) rect(1, x, 4, 2, depth, '#607446');
rect(1, 2, 10, 5, 3, '#795944'); rect(1, 10, 7, 4, 3, '#5e4637');
vline(1, 5, 5, 10, '#927057'); vline(1, 12, 6, 11, '#8a674f');

// Dirt: soft, connected patches.
fill(2, '#715441'); rect(2, 1, 2, 6, 4, '#806049'); rect(2, 9, 1, 5, 5, '#5f4739');
rect(2, 4, 9, 7, 5, '#7b5a45'); rect(2, 12, 10, 3, 4, '#5c4538'); hline(2, 7, 1, 5, '#8a684f');

// Stone: large fractured planes with consistent value.
fill(3, '#707675'); rect(3, 1, 1, 6, 5, '#7f8582'); rect(3, 9, 2, 5, 6, '#5f6665');
rect(3, 3, 9, 7, 5, '#666d6c'); rect(3, 11, 10, 4, 4, '#858a86');
hline(3, 7, 0, 8, '#555d5c'); vline(3, 8, 4, 11, '#555d5c'); hline(3, 14, 4, 13, '#565e5d');

// Sand and water use horizontal sediment/wave structure.
fill(4, '#b9a374'); hline(4, 3, 1, 10, '#c8b382'); hline(4, 7, 5, 15, '#a99064'); hline(4, 12, 0, 8, '#c5af7d'); rect(4, 12, 1, 3, 2, '#aa9166');
fill(5, '#4e7477'); hline(5, 2, 1, 11, '#668b8a'); hline(5, 6, 6, 15, '#365e63'); hline(5, 10, 0, 8, '#6c8e8b'); hline(5, 14, 4, 13, '#3e676b');

// Log end and side: rings and directional bark.
fill(6, '#725038');
for (let y = 1; y < 15; y++) for (let x = 1; x < 15; x++) {
  const radius = Math.max(Math.abs(x - 7.5), Math.abs(y - 7.5));
  if (radius < 6) pixel(6, x, y, radius < 2 ? '#5f422f' : radius < 4 ? '#a07248' : '#86603f');
}
rect(6, 7, 4, 2, 8, '#765033'); hline(6, 8, 4, 11, '#68452f');
fill(7, '#795238');
for (const [x, w, c] of [[1, 2, '#593d2e'], [4, 3, '#936642'], [8, 2, '#64432f'], [11, 3, '#986b46'], [15, 1, '#55392b']]) rect(7, x, 0, w, 16, c);
hline(7, 5, 3, 8, '#a4744b'); hline(7, 12, 9, 14, '#56392b');

// Leaves: overlapping, blocky leaf masses.
fill(8, '#435f43'); rect(8, 1, 1, 6, 5, '#526f4c'); rect(8, 8, 2, 6, 6, '#38523b');
rect(8, 3, 8, 7, 6, '#5b764f'); rect(8, 11, 10, 4, 5, '#314b37'); rect(8, 6, 5, 4, 3, '#687f56');

// Coal and crystal are embedded seams, not colored speckles.
fill(9, '#686f6e'); rect(9, 1, 1, 6, 5, '#757c79'); rect(9, 9, 9, 6, 5, '#59605f');
rect(9, 3, 5, 4, 6, '#292d2d'); rect(9, 7, 8, 5, 4, '#333838'); hline(9, 12, 5, 10, '#232727');
fill(10, '#606b6b'); rect(10, 1, 1, 6, 6, '#707a78'); rect(10, 10, 9, 5, 5, '#505a5b');
for (const [x, y, h, c] of [[4, 4, 9, '#3d9fa5'], [7, 1, 12, '#78d5d1'], [10, 5, 8, '#2e7e85']]) {
  vline(10, x, y, y + h - 1, c); vline(10, x + 1, y + 2, y + h - 2, c);
}
pixel(10, 8, 3, '#b8eee8'); pixel(10, 5, 5, '#a3e8e2');

// Planks and bench: readable boards and joinery.
fill(11, '#8b6543'); hline(11, 7, 0, 15, '#503b2e'); hline(11, 15, 0, 15, '#4e392d');
vline(11, 5, 0, 6, '#62452f'); vline(11, 11, 8, 14, '#62452f');
hline(11, 3, 1, 4, '#a67a4e'); hline(11, 11, 7, 10, '#a0754d');
fill(12, '#4c5554');
for (const [x, y, w, h, c] of [[1, 1, 6, 4, '#747d79'], [8, 1, 7, 5, '#626b69'], [0, 6, 5, 5, '#66706d'], [6, 7, 7, 4, '#808783'], [13, 7, 3, 5, '#5d6665'], [1, 12, 7, 3, '#7a817d'], [9, 12, 6, 3, '#68706e']]) rect(12, x, y, w, h, c);
fill(13, '#7c5638'); rect(13, 0, 0, 16, 2, '#4d372b'); rect(13, 0, 7, 16, 2, '#4d372b'); rect(13, 0, 14, 16, 2, '#4d372b');
vline(13, 7, 0, 15, '#a2754a'); for (let i = 2; i < 14; i++) { pixel(13, i, i, '#4d372b'); pixel(13, 15 - i, i, '#4d372b'); }

// Torch tile uses transparent negative space; the core is constructed metal with
// the only saturated blue-green accent in the atlas.
fill(14, '#000000', 0); rect(14, 7, 5, 2, 10, '#6b432a'); rect(14, 6, 2, 4, 4, '#c37c37'); rect(14, 7, 1, 2, 4, '#e7b75a');
fill(15, '#394544'); rect(15, 1, 1, 14, 14, '#566260'); rect(15, 3, 3, 10, 10, '#263232');
for (let y = 4; y <= 11; y++) {
  const half = y < 8 ? y - 4 : 11 - y;
  hline(15, y, 7 - half, 8 + half, y === 7 || y === 8 ? '#9de7df' : '#45aaa9');
}
pixel(15, 1, 1, '#9b6a3c'); pixel(15, 14, 1, '#9b6a3c'); pixel(15, 1, 14, '#9b6a3c'); pixel(15, 14, 14, '#9b6a3c');

writeFileSync(resolve(out, 'atlas.png'), PNG.sync.write(png));
