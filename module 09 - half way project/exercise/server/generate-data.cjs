// Generates realistic fake data for the Solar Dashboard exercise.
// Run once (or whenever you want fresh data):  node generate-data.cjs
//
// The generated data is realistic in these ways:
// - Sunlight hours follow the seasons: long summer days, short winter days,
//   with more cloudy days in winter.
// - Each site has its own panel capacity (kWh produced per sunlight hour
//   when the panels are clean).
// - Panels get dirty over time. Efficiency stays stable for ~2 weeks after
//   a wash, then decays exponentially. After ~6 months without a wash the
//   panels produce close to nothing. A wash restores full efficiency.
// - Washes are sometimes ~4-8 weeks apart, and sometimes there is a gap of
//   4-6 months with no wash at all.

const { writeFileSync, mkdirSync } = require('node:fs');
const { join } = require('node:path');
const { randomUUID } = require('node:crypto');

// ---------------------------------------------------------------------------
// Seeded random generator, so the shape of the data is reproducible.
// ---------------------------------------------------------------------------
function mulberry32(seed) {
  let a = seed | 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20261112);

// ---------------------------------------------------------------------------
// Date helpers. All dates are UTC millisecond timestamps; days are 'YYYY-MM-DD'.
// ---------------------------------------------------------------------------
const DAY = 86_400_000;
const START = Date.UTC(2024, 0, 1); // 2024-01-01
const END = Date.UTC(2026, 11, 31); // 2026-12-31

function toIsoDay(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

function dayOfYear(ms) {
  const d = new Date(ms);
  return Math.floor((ms - Date.UTC(d.getUTCFullYear(), 0, 1)) / DAY) + 1;
}

function monthOf(ms) {
  return new Date(ms).getUTCMonth() + 1; // 1..12
}

function round1(n) {
  return Math.round(n * 10) / 10;
}

// ---------------------------------------------------------------------------
// Companies and sites: 4 companies, 30 sites (10 + 3 + 9 + 8).
// ---------------------------------------------------------------------------
const companyDefs = [
  {
    name: 'Helios Energy',
    sites: [
      ['Galil Heights', 'north'],
      ['Golan Ridge', 'north'],
      ['Carmel Slopes', 'north'],
      ['Sharon Park', 'center'],
      ['Ayalon Fields', 'center'],
      ['Negev One', 'south'],
      ['Arava Sun', 'south'],
      ['Eilat Shores', 'south'],
      ['Jordan Valley', 'east'],
      ['Coastal Dunes', 'west'],
    ],
  },
  {
    name: 'Desert Light',
    sites: [
      ['Mitzpe Ramon Field', 'south'],
      ['Beer Sheva Flats', 'south'],
      ['Dead Sea Terrace', 'east'],
    ],
  },
  {
    name: 'SunGrid Ltd',
    sites: [
      ['Hula Valley Array', 'north'],
      ['Tiberias Lakeview', 'north'],
      ['Afula Plains', 'north'],
      ['Netanya Coast', 'west'],
      ['Herzliya Rooftops', 'west'],
      ['Modiin Hills', 'center'],
      ['Rehovot Science Park', 'center'],
      ['Lachish Fields', 'south'],
      ['Yotvata Sands', 'south'],
    ],
  },
  {
    name: 'Blue Horizon Solar',
    sites: [
      ['Haifa Bay Panels', 'west'],
      ['Acre Old Port', 'west'],
      ['Jerusalem Heights', 'center'],
      ['Ella Valley Ridge', 'center'],
      ['Jericho Oasis', 'east'],
      ['Beit Shean Valley', 'east'],
      ['Dimona Solar One', 'south'],
      ['Paran Desert Farm', 'south'],
    ],
  },
];

const companies = [];
const sites = [];

for (const def of companyDefs) {
  const companyId = randomUUID();
  companies.push({ id: companyId, name: def.name });
  for (const [name, region] of def.sites) {
    sites.push({ id: randomUUID(), name, region, companyId });
  }
}

// ---------------------------------------------------------------------------
// Washes: per site, a schedule of wash days. Most gaps are 4-8 weeks, but
// roughly 1 in 6 gaps is a long neglect period of 4-6 months.
// ---------------------------------------------------------------------------
function generateWashSchedule() {
  // The panels were last washed a little before the recorded period starts.
  let washMs = START - Math.floor(rand() * 14) * DAY;
  const schedule = [washMs];
  for (;;) {
    const gapDays =
      rand() < 0.17
        ? 120 + Math.floor(rand() * 65) // 4-6 months of neglect
        : 28 + Math.floor(rand() * 29); // 4-8 weeks
    washMs += gapDays * DAY;
    if (washMs > END) break;
    schedule.push(washMs);
  }
  return schedule;
}

// ---------------------------------------------------------------------------
// Activities: one record per site per day.
// ---------------------------------------------------------------------------

// Seasonal daylight curve: peaks around June 21 (~12h), bottoms around
// December 21 (~5h).
function seasonalSunlight(ms) {
  return 8.5 + 3.5 * Math.cos((2 * Math.PI * (dayOfYear(ms) - 172)) / 365.25);
}

// Chance of a cloudy day, by month.
function cloudChance(ms) {
  const m = monthOf(ms);
  if (m === 12 || m <= 2) return 0.3; // winter
  if (m >= 5 && m <= 9) return 0.05; // summer
  return 0.15; // spring / autumn
}

// Dirt factor: 1.0 for the first two weeks after a wash, then exponential
// decay. After ~6 months it is close to 0.
function dirtFactor(daysSinceWash) {
  if (daysSinceWash <= 14) return 1;
  return Math.max(0.02, Math.exp(-(daysSinceWash - 14) / 45));
}

const activities = [];
const washes = [];

for (const site of sites) {
  // Clean-panel capacity of this site, in kWh per sunlight hour.
  const capacity = round1(4 + rand() * 8);

  const schedule = generateWashSchedule();
  for (const washMs of schedule) {
    if (washMs >= START) {
      washes.push({ id: randomUUID(), siteId: site.id, day: toIsoDay(washMs) });
    }
  }

  let washIndex = 0;
  for (let ms = START; ms <= END; ms += DAY) {
    // Advance to the latest wash that is not after this day.
    while (washIndex + 1 < schedule.length && schedule[washIndex + 1] <= ms) {
      washIndex++;
    }
    const daysSinceWash = Math.round((ms - schedule[washIndex]) / DAY);

    const weather = rand() < cloudChance(ms) ? 0.3 + rand() * 0.45 : 0.85 + rand() * 0.15;
    const sunlightHours = round1(Math.max(0.5, seasonalSunlight(ms) * weather));

    const performanceNoise = 0.92 + rand() * 0.16;
    const energyKwh = round1(capacity * sunlightHours * dirtFactor(daysSinceWash) * performanceNoise);

    activities.push({
      id: randomUUID(),
      siteId: site.id,
      day: toIsoDay(ms),
      energyKwh,
      sunlightHours,
    });
  }
}

// ---------------------------------------------------------------------------
// Write one JSON file per collection, one record per line.
// ---------------------------------------------------------------------------
const dataDir = join(__dirname, 'data');
mkdirSync(dataDir, { recursive: true });

function writeCollection(name, records) {
  const json = `[\n${records.map((r) => `  ${JSON.stringify(r)}`).join(',\n')}\n]\n`;
  writeFileSync(join(dataDir, `${name}.json`), json);
  console.log(`${name}.json: ${records.length} records`);
}

writeCollection('companies', companies);
writeCollection('sites', sites);
writeCollection('activities', activities);
writeCollection('washes', washes);
