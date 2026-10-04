import { ArrowUpRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDate } from "../../../utils/format";
import { cn } from "../../../utils/cn";
import ImageWithFallback from "../../common/ImageWithFallback";

/**
 * BlogCard — journal article card used on the Home page and the
 * Blog listing grid. Renders as a link to /blogs/:slug.
 */
export default function BlogCard({ post, className }) {
  return (
    <article className={cn("h-full", className)}>
      <Link
        to={`/blogs/${post.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-card shadow-rest transition-all duration-300 hover:-translate-y-1 hover:border-bronze-300 hover:shadow-lift focus-visible:-translate-y-1"
      >
        <div className="relative aspect-[16/10] overflow-hidden">
          <ImageWithFallback
            src={post.cover}
            alt={post.alt}
            className="size-full transition-transform duration-500 group-hover:scale-[1.04]"
          />
          <span className="absolute left-4 top-4 rounded-full bg-cream/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-bronze-700">
            {post.category}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-6">
          <div className="flex items-center gap-3 text-xs text-ink-muted">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span aria-hidden="true" className="size-1 rounded-full bg-bronze-300" />
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden="true" />
              {post.readingTime} min read
            </span>
          </div>

          <h3 className="mt-3 font-display text-xl leading-snug font-medium text-ink transition-colors group-hover:text-bronze-700">
            {post.title}
          </h3>

          <p className="mt-2.5 line-clamp-3 flex-1 text-sm leading-relaxed text-ink-soft">
            {post.excerpt}
          </p>

          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-bronze-700">
            Read essay
            <ArrowUpRight
              className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </span>
        </div>
      </Link>
    </article>
  );
}
