import { cn } from "../../utils/cn";

/**
 * Container — the single horizontal rhythm of the site.
 * Every section content sits inside one of these so widths
 * and gutters stay perfectly consistent page-to-page.
 */
export default function Container({ as: Tag = "div", className, children }) {
  return (
    <Tag className={cn("mx-auto w-full max-w-site px-5 sm:px-8", className)}>
      {children}
    </Tag>
  );
}
