export interface AtomSiteLoop {
  columns: string[];
  rows: string[][];
}

function isLoopStart(line: string): boolean {
  return line.trim() === 'loop_';
}

/**
 * Finds the first mmCIF loop whose columns satisfy the predicate.
 */
export function findLoop(
  cifText: string,
  matchColumns: (columns: string[]) => boolean,
): AtomSiteLoop | null {
  const loops = findAllLoops(cifText, matchColumns);
  return loops[0] ?? null;
}

/** Finds all mmCIF loops whose columns satisfy the predicate. */
export function findAllLoops(
  cifText: string,
  matchColumns: (columns: string[]) => boolean,
): AtomSiteLoop[] {
  const lines = cifText.split('\n');
  const loops: AtomSiteLoop[] = [];

  for (let i = 0; i < lines.length; i++) {
    if (!isLoopStart(lines[i])) continue;

    const columns: string[] = [];
    let j = i + 1;

    while (j < lines.length && lines[j].trim().startsWith('_')) {
      columns.push(lines[j].trim());
      j++;
    }

    if (!matchColumns(columns)) {
      continue;
    }

    const rows: string[][] = [];
    while (j < lines.length) {
      const line = lines[j].trim();
      if (!line || line.startsWith('#')) break;
      if (isLoopStart(line) || line.startsWith('_')) break;
      rows.push(splitCifLine(line));
      j++;
    }

    loops.push({ columns, rows });
  }

  return loops;
}

export function findAtomSiteLoop(cifText: string): AtomSiteLoop | null {
  return findLoop(cifText, (columns) =>
    columns.some((column) => column.startsWith('_atom_site.')),
  );
}

export function getLoopColumnIndex(columns: string[], name: string): number {
  return columns.indexOf(name);
}

export function splitCifLine(line: string): string[] {
  const tokens: string[] = [];
  let index = 0;

  while (index < line.length) {
    while (index < line.length && line[index] === ' ') index++;
    if (index >= line.length) break;

    const quote = line[index];
    if (quote === "'" || quote === '"') {
      index++;
      const start = index;
      while (index < line.length && line[index] !== quote) index++;
      tokens.push(line.slice(start, index));
      index++;
      continue;
    }

    const start = index;
    while (index < line.length && line[index] !== ' ') index++;
    tokens.push(line.slice(start, index));
  }

  return tokens;
}
