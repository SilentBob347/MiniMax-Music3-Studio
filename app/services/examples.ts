/**
 * The official MiniMax Music 3 demo prompts that ship with the engine's
 * reference client, plus the split between the three caption sections.
 *
 * They are the clearest statement of what this model expects: a caption written
 * as a labelled document — Global Metadata, Vocal Details, Arrangement — and
 * lyrics carrying bracketed section tags. Loading one shows that shape straight
 * away instead of leaving a one-line prompt to guess from.
 */

const modules = import.meta.glob('../examples/*.json', { eager: true }) as Record<string, { default?: unknown }>;

export interface Music3Example {
  name: string;
  caption: string;
  globalMetadata: string;
  vocalDetails: string;
  arrangement: string;
  lyrics: string;
  duration: number;
}

const SECTIONS = ['Global Metadata', 'Vocal Details', 'Arrangement'] as const;

/**
 * Splits a caption on its section headings. A caption that does not carry them
 * — a hand-written one, for instance — stays whole in the first field so
 * nothing is silently dropped.
 */
export function splitCaption(caption: string): { globalMetadata: string; vocalDetails: string; arrangement: string } {
  // a heading counts only at the start of a line, so the word inside a sentence stays text
  const found = SECTIONS.map((section, field) => {
    const match = new RegExp(`(^|\\n)${section}`).exec(caption);
    return { field, index: match ? match.index + match[1].length : -1 };
  })
    .filter(entry => entry.index >= 0)
    .sort((a, b) => a.index - b.index);
  if (found.length === 0) {
    return { globalMetadata: caption.trim(), vocalDetails: '', arrangement: '' };
  }
  const fields = ['', '', ''];
  found.forEach((entry, order) => {
    const end = order + 1 < found.length ? found[order + 1].index : caption.length;
    fields[entry.field] = caption.slice(entry.index + SECTIONS[entry.field].length, end).trim();
  });
  const lead = caption.slice(0, found[0].index).trim();
  if (lead) fields[0] = fields[0] ? `${lead}\n${fields[0]}` : lead;
  return { globalMetadata: fields[0], vocalDetails: fields[1], arrangement: fields[2] };
}

/** Rebuilds the single caption string the engine takes from the three panes. */
export function joinCaption(globalMetadata: string, vocalDetails: string, arrangement: string): string {
  return SECTIONS.map((heading, index) => {
    // a trigger's comma with nothing after it is not part of the caption
    const body = [globalMetadata, vocalDetails, arrangement][index].trim().replace(/,$/, '').trimEnd();
    return body ? `${heading}\n${body}` : '';
  })
    .filter(Boolean)
    .join('\n');
}

const examples: Music3Example[] = Object.entries(modules).map(([path, module]) => {
  const data = (module.default ?? module) as { caption?: string; lyrics?: string; duration?: number };
  const caption = String(data.caption ?? '');
  return {
    name: path.split('/').pop()?.replace('.json', '') ?? 'example',
    caption,
    ...splitCaption(caption),
    lyrics: String(data.lyrics ?? ''),
    duration: Number(data.duration ?? 60),
  };
});

export function randomExample(): Music3Example {
  return examples[Math.floor(Math.random() * examples.length)];
}

export const exampleCount = examples.length;

/**
 * A caption for this model is a labelled document, so showing it raw in a list
 * subtitle reads as "Global Metadata Basic Attributes: bpm is 118. key is ...".
 * This keeps the description and drops the scaffolding.
 */
export function captionSummary(caption: string): string {
  const skip = /^(global metadata|vocal details|arrangement)/i;
  const technical = /(bpm|key|scale|tempo|time signature) is/i;
  return caption
    .split(/[\n.]/)
    .map(part => part.trim())
    .filter(part => part.length > 0 && !skip.test(part) && !technical.test(part))
    .join('. ')
    .trim();
}
