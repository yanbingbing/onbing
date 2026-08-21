import { writeFile } from 'node:fs/promises';

const username = 'yanbingbing';
const sourceUrl = `https://github.com/users/${username}/contributions`;
const outputUrl = new URL('../assets/github-contributions.svg', import.meta.url);

const response = await fetch(sourceUrl, {
  headers: {
    Accept: 'text/html',
    'User-Agent': 'onbing.com contribution snapshot',
  },
});

if (!response.ok) {
  throw new Error(`GitHub returned ${response.status} for ${sourceUrl}`);
}

const html = await response.text();
const totalMatch = html.match(/<h2[^>]*>[\s\S]*?([\d,]+)[\s\n]+contributions/);
const cellPattern = /<td[^>]*data-date="([^"]+)"[^>]*data-level="([0-4])"[^>]*>/g;
const cells = [...html.matchAll(cellPattern)].map((match) => ({
  date: match[1],
  level: Number(match[2]),
}));

if (!totalMatch || cells.length < 350) {
  throw new Error('GitHub contribution markup did not match the expected format');
}

const dayMs = 24 * 60 * 60 * 1000;
const dates = cells.map(({ date }) => new Date(`${date}T00:00:00Z`));
const firstDate = new Date(Math.min(...dates));
const lastDate = new Date(Math.max(...dates));
firstDate.setUTCDate(firstDate.getUTCDate() - firstDate.getUTCDay());

const cellSize = 10;
const cellStep = 12;
const graphLeft = 27;
const graphTop = 20;
const weekCount = Math.max(
  ...dates.map((date) => Math.floor((date - firstDate) / dayMs / 7)),
) + 1;
const width = graphLeft + weekCount * cellStep;
const height = graphTop + 7 * cellStep;
const colors = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];

const monthLabels = new Map();
for (const date of dates.sort((a, b) => a - b)) {
  const monthKey = `${date.getUTCFullYear()}-${date.getUTCMonth()}`;
  if (!monthLabels.has(monthKey)) {
    const week = Math.floor((date - firstDate) / dayMs / 7);
    monthLabels.set(monthKey, {
      label: date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }),
      x: graphLeft + week * cellStep,
    });
  }
}

const labels = [...monthLabels.values()]
  .map(({ label, x }) => `  <text x="${x}" y="10">${label}</text>`)
  .join('\n');
const squares = cells
  .map(({ date, level }) => {
    const currentDate = new Date(`${date}T00:00:00Z`);
    const week = Math.floor((currentDate - firstDate) / dayMs / 7);
    const x = graphLeft + week * cellStep;
    const y = graphTop + currentDate.getUTCDay() * cellStep;
    return `  <rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="2" fill="${colors[level]}" data-date="${date}" data-level="${level}"/>`;
  })
  .join('\n');

const total = totalMatch[1].replaceAll(',', '');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title description">
  <title id="title">${username} GitHub contributions</title>
  <desc id="description">${totalMatch[1]} contributions in the last year, captured from GitHub.</desc>
  <metadata>{"source":"${sourceUrl}","through":"${lastDate.toISOString().slice(0, 10)}","total":${total}}</metadata>
  <style>text{fill:#66707b;font:10px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}</style>
${labels}
${squares}
</svg>
`;

await writeFile(outputUrl, svg, 'utf8');
console.log(`Wrote ${cells.length} contribution cells (${totalMatch[1]} total)`);
