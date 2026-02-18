import type { HighlightColor } from "@/types/vocabulary";

export interface HighlightWord {
  word: string;
  highlightColor: HighlightColor;
}

/**
 * Walks all text nodes inside `root` and wraps whole-word matches of any
 * vocabulary word in a `<mark>` element with a data-attribute for the color.
 *
 * Works on the live DOM — call this **after** setting innerHTML.
 */
export function highlightVocabularyWords(
  root: HTMLElement,
  words: HighlightWord[],
) {
  if (!words.length) return;

  // Build a map: lowercased word → color (last-write wins if duplicates)
  const colorMap = new Map<string, HighlightColor>();
  for (const { word, highlightColor } of words) {
    colorMap.set(word.toLowerCase(), highlightColor);
  }

  // Build a single regex that matches any word (case-insensitive).
  // We use a Unicode-aware approach: for each word, we assert that the
  // character before/after the match is not a letter or digit (\p{L}|\p{N}).
  // This works for non-Latin scripts (Greek, Japanese, Cyrillic, etc.)
  // where \b only handles ASCII boundaries.
  const escaped = words.map((w) =>
    w.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  const inner = escaped.join("|");
  const pattern = new RegExp(
    `(?<![\\p{L}\\p{N}])(${inner})(?![\\p{L}\\p{N}])`,
    "giu",
  );

  // Collect text nodes first to avoid mutating the tree while iterating
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode as Text);
  }

  for (const node of textNodes) {
    const text = node.textContent ?? "";
    if (!pattern.test(text)) continue;
    pattern.lastIndex = 0;

    const frag = document.createDocumentFragment();
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      // Append any text before the match
      if (match.index > lastIndex) {
        frag.appendChild(
          document.createTextNode(text.slice(lastIndex, match.index)),
        );
      }

      const matchedWord = match[0];
      const color = colorMap.get(matchedWord.toLowerCase()) ?? "yellow";

      const mark = document.createElement("mark");
      mark.setAttribute("data-highlight", color);
      mark.className = `vocab-highlight vocab-highlight-${color}`;
      mark.textContent = matchedWord;
      frag.appendChild(mark);

      lastIndex = pattern.lastIndex;
    }

    // Append remaining text
    if (lastIndex < text.length) {
      frag.appendChild(document.createTextNode(text.slice(lastIndex)));
    }

    node.parentNode?.replaceChild(frag, node);
  }
}
