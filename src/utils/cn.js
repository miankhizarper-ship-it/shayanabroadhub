/**
 * Join conditional class names — tiny dependency-free alternative to clsx.
 *
 * @param {...(string | false | null | undefined)} classes
 * @returns {string}
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
