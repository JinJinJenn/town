// Pure data generation. No DOM, renderer, or Blender dependency.
export const CELL = 24;
export const LOT = 20;
export const CENTERS = [-36, -12, 12, 36];
export const PALETTES = [
  { wall: '#e4d4b5', roof: '#8da89b', trim: '#f4edda', shutter: '#92aa99' },
  { wall: '#dfc2b8', roof: '#a494aa', trim: '#f5eadb', shutter: '#a9b79e' },
  { wall: '#d6debe', roof: '#8e9eac', trim: '#f6eddb', shutter: '#c8b195' },
  { wall: '#e9d9b7', roof: '#ad91a4', trim: '#fbf0d9', shutter: '#a9baa6' },
  { wall: '#d7c9b9', roof: '#9891b0', trim: '#f4eddd', shutter: '#9eb4a3' },
];
export function rng(seed) {
  let h = 2166136261;
  for (const c of String(seed)) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h |= 0; h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function cleanSeed(value) {
  return String(value ?? '').trim().slice(0, 48) || 'petalwood';
}
export function createPlan(value = 'petalwood') {
  const seed = cleanSeed(value);
  const names = ['Willow', 'Rose', 'Clover', 'Maple', 'Wisteria', 'Hazel', 'Juniper', 'Primrose'];
  const lots = [];
  for (let iz = 0; iz < CENTERS.length; iz++) {
    for (let ix = 0; ix < CENTERS.length; ix++) {
      const id = iz * CENTERS.length + ix;
      const r = rng(`${seed}:house:${id}`);
      const cafe = ix === 1 && iz === 1;
      const park = (ix === 1 && iz === 2) || (ix === 3 && iz === 0);
      const floors = !cafe && !park && (id === 0 || id === 7 || r() > .83) ? 2 : 1;
      const paletteIndex = cafe ? 3 : (ix === 2 && iz === 1 ? 0 : Math.floor(r() * PALETTES.length));
      lots.push({ id, x: CENTERS[ix], z: CENTERS[iz],
        kind: park ? 'park' : cafe ? 'cafe' : floors === 2 ? 'townhouse' : 'cottage',
        name: park ? (id === 9 ? 'Petal Park' : 'Willow Gardens') : cafe ? "Jenn's Cafe" : `${names[id % names.length]} ${floors === 2 ? 'House' : 'Cottage'}`,
        width: cafe ? 10.6 : 8.1 + r() * 1.4,
        depth: cafe ? 8.5 : 7.5 + r() * 1.1,
        height: floors === 2 ? 6.7 : 3.8 + r() * .35,
        floors, palette: PALETTES[paletteIndex],
        rotation: (cafe || id === 6 || id === 10) ? 0 : [0, 0, 0, Math.PI / 2, -Math.PI / 2][Math.floor(r() * 5)],
        gardenSeed: `${seed}:garden:${id}`,
      });
    }
  }
  return { seed, lots, residents: lots.length * 2, extent: 54 };
}
export function sidewalkPosition(lot, distance) {
  const edge = 9.22, length = edge * 2;
  const d = ((distance % (length * 4)) + length * 4) % (length * 4);
  const side = Math.floor(d / length), t = d % length;
  const x = [-edge + t, edge, edge - t, -edge][side];
  const z = [-edge, -edge + t, edge, edge - t][side];
  return { x: lot.x + x, z: lot.z + z, angle: [Math.PI / 2, 0, -Math.PI / 2, Math.PI][side] };
}
