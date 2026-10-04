import {
  Compass,
  Feather,
  Landmark,
  Mic,
  Presentation,
} from "lucide-react";

/**
 * Map of icon names stored in data files to lucide-react components.
 * Data stays serializable (future API-friendly); components stay
 * tree-shakeable because only the used icons are imported here.
 */
export const iconMap = {
  Compass,
  Feather,
  Landmark,
  Mic,
  Presentation,
};

/** Resolve an icon name to a component, with a safe fallback. */
export function getIcon(name) {
  return iconMap[name] ?? Compass;
}
