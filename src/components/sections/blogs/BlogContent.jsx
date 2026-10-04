import ImageWithFallback from "../../common/ImageWithFallback";
import { optimizedImageSrc } from "../../../utils/images";
import { Fragment } from "react";

/**
 * BlogContent — renders the structured content blocks of an essay.
 *
 * Block schema: { type: "p" | "h2" | "h3" | "quote" | "list" |
 * "image" | "code", … } — produced two ways:
 *   1. the API: markdown content parsed by utils/markdown.js
 *   2. the Phase 2 fixtures (already structured)
 * Inline text supports **bold**, *italic*, `code` and [links](url).
 */
export default function BlogContent({ blocks }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "h2":
            return (
              <h2
                key={index}
                className="pt-4 font-display text-2xl leading-snug font-medium text-ink sm:text-3xl"
              >
                <InlineText text={block.text} />
              </h2>
            );

          case "h3":
            return (
              <h3
                key={index}
                className="pt-3 font-display text-xl leading-snug font-medium text-ink sm:text-2xl"
              >
                <InlineText text={block.text} />
              </h3>
            );

          case "p":
            return (
              <p
                key={index}
                className="text-base leading-[1.85] text-ink-soft sm:text-[1.075rem]"
              >
                <InlineText text={block.text} />
              </p>
            );

          case "quote":
            return (
              <blockquote
                key={index}
                className="border-l-2 border-bronze-500 py-1 pl-6"
              >
                <p className="font-display text-xl leading-snug italic text-ink sm:text-2xl">
                  <InlineText text={block.text} />
                </p>
                {block.cite ? (
                  <cite className="mt-2 block text-sm not-italic text-ink-muted">
                    — {block.cite}
                  </cite>
                ) : null}
              </blockquote>
            );

          case "list": {
            const items = block.items ?? [];
            if (block.ordered) {
              return (
                <ol key={index} className="list-decimal space-y-3 pl-6 marker:font-display marker:text-bronze-600">
                  {items.map((item) => (
                    <li
                      key={item}
                      className="pl-1.5 text-base leading-relaxed text-ink-soft"
                    >
                      <InlineText text={item} />
                    </li>
                  ))}
                </ol>
              );
            }
            return (
              <ul key={index} className="space-y-3 pl-1">
                {items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-base leading-relaxed text-ink-soft"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-[0.65rem] size-1.5 shrink-0 rounded-full bg-bronze-500"
                    />
                    <span>
                      <InlineText text={item} />
                    </span>
                  </li>
                ))}
              </ul>
            );
          }

          case "image":
            return (
              <figure key={index} className="py-2">
                <div className="overflow-hidden rounded-xl shadow-rest">
                  <ImageWithFallback
                    src={optimizedImageSrc(block.src, { width: 1600 })}
                    alt={block.alt}
                    className="aspect-[16/9] w-full"
                  />
                </div>
                {block.caption ? (
                  <figcaption className="mt-3 text-center text-sm italic text-ink-muted">
                    {block.caption}
                  </figcaption>
                ) : null}
              </figure>
            );

          case "code":
            return (
              <pre
                key={index}
                className="overflow-x-auto rounded-xl bg-ink-deep p-5 text-[13px] leading-relaxed text-cream/90"
              >
                {block.code ? (
                  <code className="font-mono">{block.code}</code>
                ) : null}
              </pre>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}

/**
 * InlineText — renders **bold**, *italic*, `code` and
 * [text](https://url) inside prose blocks. Plain text (no markers)
 * passes through untouched, so fixture content is unaffected.
 */
export function InlineText({ text }) {
  const source = String(text ?? "");
  if (!source) return null;

  /* Single pass tokenizer over the four inline constructs. */
  const pattern =
    /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(`([^`]+)`)|(\[([^\]]+)\]\(([^)\s]+)\))/g;
  const nodes = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = pattern.exec(source)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(<Fragment key={key++}>{source.slice(lastIndex, match.index)}</Fragment>);
    }
    if (match[1]) {
      nodes.push(<strong key={key++} className="font-semibold text-ink">{match[2]}</strong>);
    } else if (match[3]) {
      nodes.push(<em key={key++}>{match[4]}</em>);
    } else if (match[5]) {
      nodes.push(
        <code
          key={key++}
          className="rounded-md bg-cream-deep px-1.5 py-0.5 font-mono text-[0.85em] text-ink"
        >
          {match[6]}
        </code>,
      );
    } else if (match[7]) {
      nodes.push(
        <a
          key={key++}
          href={safeHref(match[9])}
          className="font-medium text-bronze-700 underline decoration-bronze-300 underline-offset-2 transition-colors hover:text-bronze-800"
          {...external(match[9])}
        >
          {match[8]}
        </a>,
      );
    }
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < source.length) {
    nodes.push(<Fragment key={key++}>{source.slice(lastIndex)}</Fragment>);
  }

  return nodes;
}

function safeHref(url) {
  const value = String(url ?? "").trim();
  if (/^https?:\/\//i.test(value) || value.startsWith("/") || value.startsWith("mailto:")) {
    return value;
  }
  return "#";
}

function external(url) {
  return String(url ?? "").startsWith("http")
    ? { target: "_blank", rel: "noreferrer noopener" }
    : {};
}
