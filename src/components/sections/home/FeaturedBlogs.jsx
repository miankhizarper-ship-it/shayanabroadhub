import { useMemo } from "react";
import { ArrowRight } from "lucide-react";
import Container from "../../common/Container";
import Reveal from "../../common/Reveal";
import SectionHeading from "../../common/SectionHeading";
import Button from "../../common/Button";
import BlogCard from "../blogs/BlogCard";
import SectionSkeleton from "./SectionSkeleton";
import { publicApi } from "../../../lib/api";
import { useResource } from "../../../hooks/useResource";
import { adaptBlogPost } from "../../../data/adapters";

/**
 * FeaturedBlogs — the latest three essays from the API, linking to
 * the Journal. Renders the full section chrome with skeletons while
 * loading and hides itself when the collection is empty or the API
 * is unreachable — the rest of the homepage is never blocked.
 */
export default function FeaturedBlogs() {
  const { data, loading, error } = useResource(
    (signal) => publicApi.blogs({ limit: 3 }, signal),
    [],
  );

  const posts = useMemo(
    () => (data?.items ?? []).map(adaptBlogPost),
    [data],
  );

  if (!loading && (error || posts.length === 0)) return null;

  return (
    <section className="py-20 sm:py-28">
      <Container>
        <Reveal>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="From the journal"
              title="Recent thinking, written down"
              className="max-w-xl"
            />
            <Button to="/blogs" variant="secondary" size="sm" className="shrink-0">
              View all essays
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </Reveal>

        {loading ? (
          <SectionSkeleton cards={3} />
        ) : (
          <div className="mt-12 grid gap-5 sm:mt-14 md:grid-cols-3 sm:gap-6">
            {posts.map((post, index) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
