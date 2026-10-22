/*
 * Generated docs for prototype stories.
 *
 * A prototype is a composition, so the question a reviewer asks is "which
 * components is this built from?" The rendered page cannot answer that: a real
 * `Card` and a hand-rolled `<div>` look identical in the browser. The source
 * can. So each prototype passes its own source (Vite's `?raw`) through here,
 * and "Show code" and "Components used" are derived from it — never written by
 * hand, so they cannot disagree with what the page is actually made of.
 *
 * Every other component the page renders — one that does not come from
 * `src/components/`, wherever it is written — is listed on its own, as made in
 * this prototype: it is the piece a designer cannot find in Figma, and the
 * first candidate to become a real component. A function that is a whole
 * screen or a step of one (`TourPage`) is marked `section: true` and named on
 * one line instead. The mark only quiets a name; forgetting it lists a section
 * as invented, never hides an invented component.
 *
 * A file with several stories: put `source` on the meta's `parameters.docs` so
 * every story's "Show code" gets it (a story without it falls back to the
 * one-line `<Component prop=… />`), and `description` on the first story only.
 */

type Entry = {
  /** The file's full source, imported with `?raw`. */
  source: string;
  /** The function in that file that renders the screen (or a shared piece of it). */
  fn: string;
  /** A screen or a step of one, not a reusable piece: named, not flagged. */
  section?: boolean;
};

/** Named imports from the design system's own components folder. */
const DS_IMPORT = /import\s*\{([^}]+)\}\s*from\s*'(?:\.\.\/)+components\/[A-Za-z]+'/g;

/** Named imports from the prototype's own folder (`./booking/BookingTopBar`), for "Defined in". */
const LOCAL_IMPORT = /import\s*\{([^}]+)\}\s*from\s*'\.\/([\w-]+\/[\w./-]+)'/g;

/**
 * A JSX element with a capitalised name: `<Card.Root>`, `<BookingTopBar />`.
 * The `<` must not follow a name, so `useState<Step>` and other generics are
 * types, not elements.
 */
const JSX_ELEMENT = /(?<![\w.])<([A-Z]\w*)(?:\.(\w+))?[\s/>]/g;

/** Elements a page renders itself rather than through a component. */
const HTML_TAG = /<(h[1-6]|p|span|div|section|article|header|main|nav|ol|ul|li|a|strong|em|code)\b/g;

/** The `function fn(...) { ... }` block, up to the first closing brace at column 0. */
function functionSource(source: string, fn: string) {
  const start = source.indexOf(`function ${fn}(`);
  if (start === -1) throw new Error(`prototypeDocs: no function ${fn}() in the source passed in`);
  const end = source.indexOf('\n}\n', start);
  return source.slice(start, end === -1 ? undefined : end + 2);
}

export function prototypeDocs(entries: Entry[]) {
  const used = new Map<string, { places: number; parts: Set<string> }>();
  const html = new Map<string, number>();
  /** Components the page renders that are not from the library, with where they are defined. */
  const local = new Map<string, string>();
  const sections = new Set(entries.filter((e) => e.section).map((e) => e.fn));
  /** For each function passed in, the library components it renders. */
  const builtFrom = new Map<string, Set<string>>();

  for (const { source, fn } of entries) {
    const ds = new Set<string>();
    for (const m of source.matchAll(DS_IMPORT)) {
      for (const name of m[1].split(',')) if (name.trim()) ds.add(name.trim());
    }
    const imported = new Map<string, string>();
    for (const m of source.matchAll(LOCAL_IMPORT)) {
      for (const name of m[1].split(',')) if (/^[A-Z]/.test(name.trim())) imported.set(name.trim(), m[2]);
    }

    const body = functionSource(source, fn);
    const own = new Set<string>();
    builtFrom.set(fn, own);
    for (const m of body.matchAll(JSX_ELEMENT)) {
      const [, name, part] = m;
      if (!ds.has(name)) {
        if (!sections.has(name) && !local.has(name)) {
          local.set(
            name,
            imported.has(name)
              ? `\`src/patterns/${imported.get(name)}\``
              : source.includes(`function ${name}(`)
                ? 'this story file'
                : 'not checked — imported from elsewhere',
          );
        }
        continue;
      }
      own.add(name);
      const entry = used.get(name) ?? { places: 0, parts: new Set<string>() };
      // One place per root: `<Card.Root>` or a bare `<Button>`; parts are listed, not counted.
      if (!part || part === 'Root') entry.places += 1;
      if (part && part !== 'Root') entry.parts.add(part);
      used.set(name, entry);
    }
    for (const m of body.matchAll(HTML_TAG)) html.set(m[1], (html.get(m[1]) ?? 0) + 1);
  }

  const rows = [...used.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, { places, parts }]) => {
      const partList = parts.size ? [...parts].map((p) => `\`${p}\``).join(', ') : '—';
      return `| \`${name}\` | ${places} | ${partList} |`;
    });

  const htmlList = [...html.entries()]
    .sort(([, a], [, b]) => b - a)
    .map(([tag, n]) => `\`<${tag}>\` ×${n}`)
    .join(', ');

  const localRows = [...local.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, where]) => {
      const parts = builtFrom.get(name);
      const from = parts
        ? [...parts].sort().map((p) => `\`${p}\``).join(', ') || 'plain HTML only'
        : 'not known — pass its function to `prototypeDocs`';
      return `| \`${name}\` | ${where} | ${from} |`;
    });

  const summary = [
    '**Components used** — generated from the code under “Show code”, so it cannot drift from it. A repeated item (a card in a list) counts once.',
    '',
    '| Component | Places in the code | Parts used |',
    '| --- | --- | --- |',
    ...rows,
    '',
    htmlList
      ? `**Plain HTML, not a component:** ${htmlList}. Each should be page layout or a gap listed in the table above.`
      : '**Plain HTML, not a component:** none.',
    '',
    ...(localRows.length
      ? [
          '**⚠️ Made in this prototype, not in the library:** a component invented for this page. It is not in `src/components/` and has no Figma component; the library parts inside it are counted in the table above.',
          '',
          '| Component | Defined in | Built from |',
          '| --- | --- | --- |',
          ...localRows,
        ]
      : ['**Made in this prototype, not in the library:** none.']),
    ...(sections.size
      ? ['', `**Screen sections, not components:** ${[...sections].map((s) => `\`${s}\``).join(', ')}.`]
      : []),
  ].join('\n');

  return {
    source: {
      code: entries.map(({ source, fn }) => functionSource(source, fn)).join('\n\n'),
      language: 'tsx',
    },
    description: { story: summary },
  };
}
