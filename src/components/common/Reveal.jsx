import { useEffect, useRef, useState } from "react";
import { cn } from "../../utils/cn";

/**
 * Reveal — subtle scroll-triggered entrance animation.
 * Wraps content, observes it once, and eases it into view.
 * Falls back to instantly-visible when IntersectionObserver is
 * unavailable, and respects `prefers-reduced-motion` via CSS.
 */
export default function Reveal({
  as: Tag = "div",
  delay = 0,
  className,
  children,
  ...rest
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -48px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn("reveal", visible && "reveal-visible", className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}
