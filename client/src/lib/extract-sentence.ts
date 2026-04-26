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

const LEADING_QUOTES = /^["""''‚‛„‟‹›「」\u0022\u0027]+/;
const TRAILING_QUOTES = /["""''‚‛„‟‹›「」\u0022\u0027]+$/;

const cleanSentence = (sentence: string): string => {
  return sentence
    .replace(LEADING_QUOTES, "")
    .replace(TRAILING_QUOTES, "")
    .trim()
    .replace(/^[a-z]/, (c) => c.toUpperCase());
};

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

  if (matchedIndex === -1)
    return cleanSentence(sentences[0]?.trim() ?? paragraphText);

  if (!includeContext) {
    const result = cleanSentence(sentences[matchedIndex].trim());
    if (result.length <= 500) return result;
    return result.slice(0, 497).replace(/\s+\S*$/, "") + "...";
  }

  const start = Math.max(0, matchedIndex - 1);
  const end = Math.min(sentences.length, matchedIndex + 2);
  const result = cleanSentence(sentences.slice(start, end).join(" ").trim());

  if (result.length <= 500) return result;
  return result.slice(0, 497).replace(/\s+\S*$/, "") + "...";
}
