import type { HighlightColor } from "@/types/vocabulary";

export interface HighlightWord {
  word: string;
  highlightColor: HighlightColor;
}

const LETTER_OR_DIGIT = /[\p{L}\p{N}]/u;
const WHITESPACE_RUN = /\s+/g;

/**
 * Returns `true` when `char` is a Unicode letter or digit.
 */
function isWordChar(char: string | undefined): boolean {
  return char !== undefined && LETTER_OR_DIGIT.test(char);
}

/**
 * Collapse every run of whitespace in `s` into a single space and lowercase it.
 */
function normalizeForSearch(s: string): string {
  return s.replace(WHITESPACE_RUN, " ").toLowerCase();
}

/**
 * Build a mapping from every index in the normalized string back to the
 * corresponding index in the original string.
 *
 * Runs of whitespace in `original` are collapsed to one space in the
 * normalized version.  For each position in the normalized string we store the
 * index in the original that produced it.
 *
 * Returns { normalized, toOriginal } where `toOriginal[i]` is the index in
 * `original` that corresponds to normalized character `i`.  An extra entry at
 * `toOriginal[normalized.length]` points to the position just past the last
 * consumed original character (useful for computing the original-text length of
 * a match).
 */
function buildNormalizedMap(original: string) {
  const toOriginal: number[] = [];
  let normalized = "";
  let i = 0;
  while (i < original.length) {
    const ch = original[i];
    if (/\s/.test(ch)) {
      // Consume the entire whitespace run, emit a single space
      normalized += " ";
      toOriginal.push(i); // map the emitted space to the first ws char
      while (i < original.length && /\s/.test(original[i])) i++;
    } else {
      normalized += ch.toLowerCase();
      toOriginal.push(i);
      i++;
    }
  }
  // Sentinel so that toOriginal[matchEnd] gives the original-end position
  toOriginal.push(i);
  return { normalized, toOriginal };
}

/**
 * Walks all text nodes inside `root` and wraps matches of any vocabulary word
 * in a `<mark>` element with a data-attribute for the color.
 *
 * Matching is whitespace-normalized and case-insensitive so that `"the Country
 * Mouse"` still matches even when the HTML source contains `"the Country\nMouse"`.
 *
 * Uses a plain indexOf search instead of regex so that words containing special
 * characters (dots, commas, etc.) are matched reliably.
 *
 * Words are sorted longest-first so "e.g." is matched before "e" or "g".
 *
 * Works on the live DOM — call this **after** setting innerHTML.
 */
export function highlightVocabularyWords(
  root: HTMLElement,
  words: HighlightWord[],
) {
  if (!words.length) return;

  // Build a map: normalized word → color (last-write wins if duplicates)
  const colorMap = new Map<string, HighlightColor>();
  for (const { word, highlightColor } of words) {
    colorMap.set(normalizeForSearch(word), highlightColor);
  }

  // Sort longest first so longer phrases are matched before their substrings
  const sorted = [...words]
    .map((w) => normalizeForSearch(w.word))
    .sort((a, b) => b.length - a.length);

  // Deduplicate
  const uniqueWords = [...new Set(sorted)];

  // Collect text nodes first to avoid mutating the tree while iterating
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode as Text);
  }

  for (const node of textNodes) {
    const text = node.textContent ?? "";
    if (!text.trim()) continue;

    // Build a whitespace-normalized version + position map
    const { normalized, toOriginal } = buildNormalizedMap(text);

    // Find all non-overlapping matches across all vocab words
    // Matches store positions in the *normalized* string
    const matches: { nStart: number; nEnd: number; word: string }[] = [];

    for (const word of uniqueWords) {
      let startPos = 0;
      while (startPos <= normalized.length - word.length) {
        const idx = normalized.indexOf(word, startPos);
        if (idx === -1) break;

        const nEnd = idx + word.length;

        // Apply word boundaries on the *normalized* string
        const charBefore = normalized[idx - 1];
        const charAfter = normalized[nEnd];
        const firstIsWordChar = isWordChar(word[0]);
        const lastIsWordChar = isWordChar(word[word.length - 1]);

        const leftOk = !firstIsWordChar || !isWordChar(charBefore);
        const rightOk = !lastIsWordChar || !isWordChar(charAfter);

        if (leftOk && rightOk) {
          const overlaps = matches.some((m) => idx < m.nEnd && nEnd > m.nStart);
          if (!overlaps) {
            matches.push({ nStart: idx, nEnd, word });
          }
        }

        startPos = idx + 1;
      }
    }

    if (!matches.length) continue;

    // Sort matches by position
    matches.sort((a, b) => a.nStart - b.nStart);

    const frag = document.createDocumentFragment();
    let lastOrigIdx = 0;

    for (const m of matches) {
      // Map normalized positions back to original text positions
      const origStart = toOriginal[m.nStart];
      const origEnd = toOriginal[m.nEnd];

      // Text before the match (in original)
      if (origStart > lastOrigIdx) {
        frag.appendChild(
          document.createTextNode(text.slice(lastOrigIdx, origStart)),
        );
      }

      const matchedText = text.slice(origStart, origEnd);
      const color = colorMap.get(m.word) ?? "yellow";

      const mark = document.createElement("mark");
      mark.setAttribute("data-highlight", color);
      mark.className = `vocab-highlight vocab-highlight-${color}`;
      mark.textContent = matchedText;
      frag.appendChild(mark);

      lastOrigIdx = origEnd;
    }

    // Remaining text
    if (lastOrigIdx < text.length) {
      frag.appendChild(document.createTextNode(text.slice(lastOrigIdx)));
    }

    node.parentNode?.replaceChild(frag, node);
  }
}
