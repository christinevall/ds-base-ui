/**
 * The contract overview: one row per component, code and Figma side by side.
 *
 *   npm run contract            writes docs/contract.md and prints a summary
 *   npm run contract -- --summary   prints the summary only (the session hook)
 *
 * Nothing is checked here that validate does not already check. This script
 * runs `validate --json` and lays its findings out per component, next to what
 * each side contains, so a designer can see the whole contract on one page.
 *
 * Code is the source. The Figma side is read from figma/manifest.json, the
 * last snapshot of the library, not from the live file: the overview says
 * when that snapshot was taken, so an old one is visible rather than trusted.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';

const SUMMARY_ONLY = process.argv.includes('--summary');
const FIGMA = 'figma/manifest.json';
const STORYBOOK = 'storybook-static/manifests/components.json';
// Not mirrored to Figma, by decision (see the figma-mirror skill's build order).
const NOT_MIRRORED = { Form: 'no visuals of its own', ScrollArea: 'behaviour, not something you draw', ContextMenu: 'the same popup as Menu' };

const findings = JSON.parse(execSync('node scripts/validate.mjs --json', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }));
const fm = existsSync(FIGMA) ? JSON.parse(readFileSync(FIGMA, 'utf8')) : null;
const sb = existsSync(STORYBOOK) ? Object.values(JSON.parse(readFileSync(STORYBOOK, 'utf8')).components) : [];
const git = (cmd) => { try { return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return ''; } };
const snapshotDate = git(`git log -1 --format=%cs -- ${FIGMA}`) || 'never committed';
const snapshotDirty = git(`git status --porcelain -- ${FIGMA}`) !== '';

// Which component a finding belongs to: Figma findings name the Figma item
// first ("Card.Header: …", "Meter has no key"); code findings sit in its folder.
const figmaItems = (fm?.components ?? []).filter((c) => c.source?.startsWith('src/components/'));
const folderOf = (source) => source.split('/')[2];
const itemsByLength = [...figmaItems].sort((a, b) => b.name.length - a.name.length);
const ownerOf = (f) => {
  if (f.file === FIGMA) {
    const item = itemsByLength.find((c) => f.message.startsWith(c.name + ':') || f.message.startsWith(c.name + ' '));
    return item ? folderOf(item.source) : null;
  }
  const m = f.file.match(/^src\/components\/([^/]+)\//);
  return m ? m[1] : null;
};
const byComponent = {};
const systemWide = [];
for (const f of findings) {
  const owner = ownerOf(f);
  if (owner) (byComponent[owner] ??= []).push(f);
  else systemWide.push(f);
}

const components = readdirSync('src/components').filter((d) => statSync(`src/components/${d}`).isDirectory()).sort();
const rows = components.map((name) => {
  const items = figmaItems.filter((c) => folderOf(c.source) === name);
  const figmaProps = [...new Set(items.flatMap((c) => c.props.filter((p) => p.type === 'VARIANT').map((p) => p.name)))];
  const doc = sb.find((d) => d.path?.startsWith(`./src/components/${name}/`))?.reactDocgen?.props ?? {};
  const codeProps = Object.keys(doc);
  const keyed = items.length > 0 && items.every((c) => fm.keys?.components?.[c.name]?.key);
  const issues = byComponent[name] ?? [];
  const status = NOT_MIRRORED[name] && !items.length ? 'not mirrored' : !items.length ? 'missing in Figma' : issues.length ? 'drift' : 'match';
  return { name, items, figmaProps, codeProps, keyed, issues, status };
});

const count = (s) => rows.filter((r) => r.status === s).length;
const drift = rows.filter((r) => r.status === 'drift' || r.status === 'missing in Figma');
const tokenCount = fm ? Object.values(fm.variables).reduce((n, c) => n + c.names.length, 0) : 0;
const summary = [
  `Contract: ${count('match')} of ${rows.length - count('not mirrored')} mirrored components match` +
    (drift.length ? `, ${drift.length} need attention: ${drift.map((r) => `${r.name} (${r.issues[0]?.message ?? r.status})`).join('; ')}` : '') +
    (systemWide.length ? `. ${systemWide.length} system-wide finding(s): ${[...new Set(systemWide.map((f) => f.rule))].join(', ')}` : '') + '.',
  `Figma side read from the snapshot of ${snapshotDate}${snapshotDirty ? ' (plus an uncommitted newer snapshot)' : ''}, not the live file.` +
    (fm?.keys ? ` Key map: ${Object.keys(fm.keys.components).length} components, ${Object.keys(fm.keys.textStyles).length} text styles, ${Object.keys(fm.keys.variables).length} variables.` : ' No key map yet.'),
  sb.length ? '' : 'Storybook manifest not built: code props are not listed (npm run build-storybook).',
].filter(Boolean);

if (!SUMMARY_ONLY) {
  const icon = { match: '✅', drift: '❌', 'missing in Figma': '❌', 'not mirrored': '➖' };
  const cell = (list) => (list.length ? list.map((p) => `\`${p}\``).join(' ') : '–');
  const md = [
    '# Contract overview',
    '',
    '<!-- Generated by `npm run contract`. Do not edit: change the code or the Figma library, then run it again. -->',
    '',
    'Every component, in code and in the Figma library, side by side. **Code is the source**: when the two disagree, Figma is updated (with the `figma-mirror` skill), never the other way round.',
    '',
    `- **Figma side:** read from \`figma/manifest.json\`, the snapshot of **${snapshotDate}**, not the live file. If the library changed since, run \`scripts/figma/snapshot.figma.js\` again.`,
    `- **Checks:** everything below comes from \`npm run validate\`. ${findings.length ? `${findings.length} finding(s) in total.` : 'No findings.'}`,
    `- **Tokens:** ${tokenCount} Figma variables, ${fm?.textStyles.length ?? 0} text styles, ${fm?.effectStyles.length ?? 0} effect styles.`,
    '',
    `**${count('match')} match · ${drift.length} need attention · ${count('not mirrored')} not mirrored by decision**`,
    '',
    '| | Component | In Figma (icons left out) | Variant options in Figma | Props in code (main part, from Storybook) | Keys |',
    '| --- | --- | --- | --- | --- | --- |',
    ...rows.map((r) => `| ${icon[r.status]} | **${r.name}** | ${r.items.length ? r.items.filter((c) => !c.name.startsWith('icon/')).map((c) => c.name).join(', ') : NOT_MIRRORED[r.name] ?? '–'} | ${cell(r.figmaProps)} | ${cell(r.codeProps)} | ${r.items.length ? (r.keyed ? '✅' : '❌') : '–'} |`),
    '',
    '## Needs attention',
    '',
    ...(drift.length ? drift.flatMap((r) => [`**${r.name}**`, ...(r.issues.length ? r.issues.map((f) => `- ${f.message} (\`${f.rule}\`)`) : ['- No Figma component yet.']), '']) : ['Nothing. Code and Figma agree.', '']),
    '## System-wide',
    '',
    ...(systemWide.length ? systemWide.map((f) => `- ${f.message} (\`${f.rule}\`, ${f.file})`) : ['No findings outside single components.']),
    '',
    '## What this page does not check',
    '',
    '- **Values.** Names, props, options, defaults and keys are compared; paddings, colours and sizes are not. A value that drifts (the Accordion panel padding, 2026-09-23) is found by the `figma-mirror` audit or by comparing screenshots.',
    '- **The live Figma file.** Only its last snapshot.',
    '- **Known differences.** Where Figma cannot match the code on purpose, `figma/GAPS.md` explains why.',
    '',
  ].join('\n');
  writeFileSync('docs/contract.md', md);
}
console.log(summary.join('\n'));
