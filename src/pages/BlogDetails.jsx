import { useEffect } from "react";
import { ArrowLeft, CalendarDays, Clock, UserRound } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Container from "../components/common/Container";
import Reveal from "../components/common/Reveal";
import Button from "../components/common/Button";
import LoadingState from "../components/common/LoadingState";
import ImageWithFallback from "../components/common/ImageWithFallback";
import BlogContent from "../components/sections/blogs/BlogContent";
import BlogCard from "../components/sections/blogs/BlogCard";
import { publicApi } from "../lib/api";
import { useResource } from "../hooks/useResource";
import { adaptBlogDetail, adaptBlogPost } from "../data/adapters";
import { formatDate } from "../utils/format";
import { useSeo, blogPostingSchema } from "../utils/seo";

/**
 * BlogDetails — full article view at /blogs/:slug, served by the
 * public API (markdown content parsed into blocks client-side).
 * Unknown slugs get the same graceful holding state as before.
 */
export default function BlogDetails() {
  const { slug } = useParams();
  const { data, loading, error, retry } = useResource(
    (signal) => publicApi.blog(slug, signal),
    [slug],
  );

  /* SEO reacts as the article data resolves (loading → loaded), so
     crawlers and previews get the article's real metadata. */
  const seoPost = data?.post ? adaptBlogDetail(data.post) : null;
  useSeo({
    title: seoPost?.title ?? "The Journal",
    description: seoPost?.excerpt ?? "Essays from the Shayan Abroad Hub journal.",
    path: `/blogs/${slug ?? ""}`,
    image: seoPost?.cover ?? undefined,
    type: seoPost ? "article" : "website",
    publishedTime: seoPost?.date ? new Date(seoPost.date).toISOString() : undefined,
    author: seoPost?.author?.name,
    jsonLd: seoPost ? blogPostingSchema({ post: seoPost, path: `/blogs/${slug}` }) : null,
  });

  /* Keep the masthead in view on essay changes. */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [slug]);

  if (loading) {
    return (
      <section className="pt-36 pb-24 sm:pt-44">
        <Container className="max-w-3xl">
          <LoadingState label="Loading essay" />
        </Container>
      </section>
    );
  }

  if (error && error.status === 404) {
    return <NotReady slug={slug} />;
  }

  if (error) {
    return (
      <section className="pt-36 pb-24 sm:pt-44">
        <Container className="max-w-xl">
          <div className="rounded-xl border border-line bg-card p-8 text-center shadow-rest sm:p-12">
            <h1 className="font-display text-2xl font-medium text-ink sm:text-3xl">
              The essay could not load.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft sm:text-base">
              {error.message ?? "Something went wrong reaching the server."}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button onClick={retry} variant="secondary">
                Try again
              </Button>
              <Button to="/blogs">
                <ArrowLeft className="size-4" aria-hidden="true" />
                Back to the Journal
              </Button>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  const post = adaptBlogDetail(data?.post);
  const related = (data?.related ?? []).map(adaptBlogPost).slice(0, 3);

  if (!post) {
    return <NotReady slug={slug} />;
  }

  return (
    <>
      {/* Article masthead */}
      <header className="border-b border-line bg-cream-deep/60 pt-32 pb-12 sm:pt-40 sm:pb-16">
        <Container className="max-w-4xl">
          <Reveal>
            <Link
              to="/blogs"
              className="inline-flex items-center gap-2 text-sm font-medium text-ink-soft transition-colors hover:text-bronze-700"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              All essays
            </Link>

            <div className="mt-7 flex flex-wrap items-center gap-3 text-xs">
              <span className="rounded-full bg-bronze-600 px-3.5 py-1.5 font-semibold uppercase tracking-[0.14em] text-cream">
                {post.category}
              </span>
              <span className="inline-flex items-center gap-1.5 text-ink-muted">
                <CalendarDays className="size-3.5" aria-hidden="true" />
                <time dateTime={post.date}>{formatDate(post.date)}</time>
              </span>
              <span className="inline-flex items-center gap-1.5 text-ink-muted">
                <Clock className="size-3.5" aria-hidden="true" />
                {post.readingTime} min read
              </span>
              <span className="inline-flex items-center gap-1.5 text-ink-muted">
                <UserRound className="size-3.5" aria-hidden="true" />
                {post.author.name}
              </span>
            </div>

            <h1 className="mt-6 font-display text-3xl leading-[1.15] font-medium text-ink animate-fade-up sm:text-4xl lg:text-[2.9rem]">
              {post.title}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">
              {post.excerpt}
            </p>
          </Reveal>
        </Container>
      </header>

      {/* Cover image */}
      <Container className="mt-10 max-w-4xl sm:mt-14">
        <Reveal>
          <figure className="overflow-hidden rounded-2xl shadow-lift">
            <ImageWithFallback
              src={post.cover}
              alt={post.alt}
              loading="eager"
              className="aspect-[2/1] w-full"
            />
          </figure>
        </Reveal>
      </Container>

      {/* Article body */}
      <Container className="mt-12 max-w-3xl pb-16 sm:mt-16">
        <Reveal>
          <BlogContent blocks={post.content} />
        </Reveal>

        {/* Author card */}
        <Reveal className="mt-14">
          <div className="flex items-start gap-4 rounded-xl border border-line bg-card p-6 shadow-rest sm:items-center sm:p-7">
            <span
              aria-hidden="true"
              className="flex size-14 shrink-0 items-center justify-center rounded-full bg-ink font-display text-xl italic text-cream"
            >
              {post.author.initials}
            </span>
            <div>
              <p className="font-display text-lg font-medium text-ink">
                {post.author.name}
              </p>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bronze-700">
                {post.author.role}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Writing here fortnightly about strategy, editorial craft and
                the quieter sides of building things well.
              </p>
            </div>
          </div>
        </Reveal>
      </Container>

      {/* Related essays */}
      {related.length > 0 ? (
        <section
          aria-label="Related essays"
          className="border-t border-line bg-cream-deep/60 py-16 sm:py-20"
        >
          <Container>
            <Reveal>
              <div className="flex items-end justify-between gap-6">
                <h2 className="font-display text-2xl font-medium text-ink sm:text-3xl">
                  Keep reading
                </h2>
                <Button to="/blogs" variant="secondary" size="sm" className="shrink-0">
                  <ArrowLeft className="size-4" aria-hidden="true" />
                  All essays
                </Button>
              </div>
            </Reveal>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {related.map((relatedPost, index) => (
                <Reveal key={relatedPost.slug} delay={index * 80}>
                  <BlogCard post={relatedPost} />
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      ) : null}
    </>
  );
}

/** Holding state for unknown/unpublished slugs — no hard 404. */
function NotReady({ slug }) {
  return (
    <section className="pt-36 pb-24 sm:pt-44">
      <Container>
        <div className="mx-auto max-w-xl rounded-xl border border-line bg-card p-8 text-center shadow-rest sm:p-12">
          <p
            aria-hidden="true"
            className="font-display text-5xl italic text-bronze-300"
          >
            ?
          </p>
          <h1 className="mt-4 font-display text-2xl font-medium text-ink sm:text-3xl">
            This essay hasn&rsquo;t been published yet.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft sm:text-base">
            The slug “{slug}” doesn&rsquo;t match an article in the journal —
            it may have been renamed, or it is still being written.
          </p>
          <Button to="/blogs" className="mt-8">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to the Journal
          </Button>
        </div>
      </Container>
    </section>
  );
}
