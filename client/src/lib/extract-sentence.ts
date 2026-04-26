function getParagraphText(node: Node): string {
  const BLOCK_TAGS = new Set([
    "P",
    "DIV",
    "LI",
    "BLOCKQUOTE",
    "H1",
    "H2",
    "H3",
    "H4",
    "H5",
    "H6",
    "TD",
    "TH",
  ]);

  let current: Node | null = node;

  while (current) {
    if (
      current.nodeType === Node.ELEMENT_NODE &&
      BLOCK_TAGS.has((current as Element).tagName)
    ) {
      return (current as Element).textContent ?? "";
    }
    current = current.parentNode;
  }

  return node.textContent ?? "";
}

export function extractSentence(
  anchorNode: Node,
  selectedWord: string,
  includeContext = false,
): string {
  const paragraphText = getParagraphText(anchorNode)
    .replace(/\s+/g, " ")
    .trim();

  if (!paragraphText) return selectedWord;

  const sentences = paragraphText.match(/[^.!?]+[.!?]["']?/g) ?? [
    paragraphText,
  ];
  const lowerWord = selectedWord.toLowerCase();
  const matchedIndex = sentences.findIndex((s) =>
    s.toLowerCase().includes(lowerWord),
  );

  if (matchedIndex === -1) return sentences[0] ?? paragraphText;

  if (!includeContext) {
    return sentences[matchedIndex].trim();
  }

  // Uzmi rečenicu pre, ciljnu i rečenicu posle
  const start = Math.max(0, matchedIndex - 1);
  const end = Math.min(sentences.length, matchedIndex + 2);

  return sentences.slice(start, end).join(" ").trim();
}
