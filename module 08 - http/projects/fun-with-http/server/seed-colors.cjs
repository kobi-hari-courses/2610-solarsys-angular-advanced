const { randomUUID } = require('node:crypto');
const { readFileSync, writeFileSync, renameSync } = require('node:fs');
const { join } = require('node:path');

const hues = [
  'Red',
  'Scarlet',
  'Orange',
  'Amber',
  'Gold',
  'Lime',
  'Green',
  'Emerald',
  'Mint',
  'Turquoise',
  'Cyan',
  'Azure',
  'Blue',
  'Indigo',
  'Violet',
  'Purple',
  'Magenta',
  'Fuchsia',
  'Pink',
  'Rose',
];
const saturations = ['Muted', 'Soft', 'Balanced', 'Rich', 'Vivid'];
const lightnesses = [
  'Deep',
  'Dark',
  'Shadow',
  'Dusk',
  'Midtone',
  'Clear',
  'Bright',
  'Light',
  'Pale',
  'Airy',
];

function rgb(hue, saturation, lightness) {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const secondary = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const offset = lightness - chroma / 2;
  const channels = [
    [chroma, secondary, 0],
    [secondary, chroma, 0],
    [0, chroma, secondary],
    [0, secondary, chroma],
    [secondary, 0, chroma],
    [chroma, 0, secondary],
  ][Math.floor(hue / 60)];
  return channels.map((channel) => Math.round((channel + offset) * 255));
}

const colors = hues.flatMap((hue, hueIndex) =>
  saturations.flatMap((saturation, saturationIndex) =>
    lightnesses.map((lightness, lightnessIndex) => {
      const [r, g, b] = rgb(
        hueIndex * 18,
        0.4 + saturationIndex * 0.15,
        0.1 + lightnessIndex * 0.08,
      );
      return {
        id: randomUUID(),
        name: `${lightness} ${saturation} ${hue}`,
        r,
        g,
        b,
        description: `A ${lightness.toLowerCase()} ${hue.toLowerCase()} shade with ${saturation.toLowerCase()} saturation.`,
      };
    }),
  ),
);

const path = join(__dirname, 'db.json');
const database = JSON.parse(readFileSync(path, 'utf8'));
database.colors = colors;
writeFileSync(`${path}.tmp`, `${JSON.stringify(database, null, 2)}\n`);
renameSync(`${path}.tmp`, path);
console.log(`Saved ${colors.length} colors; users and products were preserved.`);
