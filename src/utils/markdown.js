/**
 * Markdown ⇄ content-blocks bridge.
 *
 * The backend Blog model stores `content` as markdown (kept for
 * compatibility and portability). The public renderer
 * (<BlogContent />) consumes structured blocks. This module is the
 * single conversion point shared by the public blog detail page and
 * the admin editor's preview.
 *
 * Supported markdown (superset of what the admin toolbar emits):
 *   ## / ###        headings (h2/h3)
 *   paragraphs      with **bold**, *italic*, `code`, [link](url)
 *   > quote
 *   - item / 1. item  unordered & ordered lists
 *   ![alt](src)     image (title attribute → caption)
 *   ``` fenced code blocks
 */

/** Convert a markdown string into the structured block array. */
export function markdownToBlocks(markdown) {
  const lines = String(markdown ?? "").replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let paragraph = [];
  let index = 0;

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      blocks.push({ type: "p", text: paragraph.join(" ") });
      paragraph = [];
    }
  };

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    /* Fenced code block */
    if (trimmed.startsWith("```")) {
      flushParagraph();
      const lang = trimmed.slice(3).trim();
      const code = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        code.push(lines[index]);
        index += 1;
      }
      index += 1; // closing fence
      blocks.push({ type: "code", lang, code: code.join("\n") });
      continue;
    }

    /* Blank line → paragraph boundary */
    if (trimmed === "") {
      flushParagraph();
      index += 1;
      continue;
    }

    /* Headings */
    const heading = trimmed.match(/^(#{2,3})\s+(.*)$/);
    if (heading) {
      flushParagraph();
      blocks.push({
        type: heading[1].length === 2 ? "h2" : "h3",
        text: heading[2].trim(),
      });
      index += 1;
      continue;
    }

    /* Blockquote (merge consecutive > lines) */
    if (trimmed.startsWith(">")) {
      flushParagraph();
      const quote = [trimmed.replace(/^>\s?/, "")];
      index += 1;
      while (index < lines.length && lines[index].trim().startsWith(">")) {
        quote.push(lines[index].trim().replace(/^>\s?/, ""));
        index += 1;
      }
      blocks.push({ type: "quote", text: quote.join(" ") });
      continue;
    }

    /* Image */
    const image = trimmed.match(/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/);
    if (image) {
      flushParagraph();
      blocks.push({
        type: "image",
        alt: image[1],
        src: safeUrl(image[2]),
        caption: image[3] ?? "",
      });
      index += 1;
      continue;
    }

    /* Unordered list */
    if (/^[-*]\s+/.test(trimmed)) {
      flushParagraph();
      const items = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-*]\s+/, ""));
        index += 1;
      }
      blocks.push({ type: "list", items });
      continue;
    }

    /* Ordered list */
    if (/^\d+[.)]\s+/.test(trimmed)) {
      flushParagraph();
      const items = [];
      while (index < lines.length && /^\d+[.)]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+[.)]\s+/, ""));
        index += 1;
      }
      blocks.push({ type: "list", ordered: true, items });
      continue;
    }

    /* Paragraph text (merge soft-wrapped lines) */
    paragraph.push(trimmed);
    index += 1;
  }

  flushParagraph();
  return blocks;
}

/** Only allow http(s), mailto and site-relative URLs. */
function safeUrl(url) {
  const value = String(url ?? "").trim();
  if (/^https?:\/\//i.test(value) || /^\/[^/]/.test(value) || value.startsWith("mailto:")) {
    return value;
  }
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  return "#";
}

/** Rough reading-time estimate for editor previews (200 wpm). */
export function estimateReadingTime(text) {
  const words = String(text ?? "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200) || 1);
}
