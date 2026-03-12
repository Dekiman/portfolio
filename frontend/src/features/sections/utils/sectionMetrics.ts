import type { SectionMetrics } from "../types/section";

export function getSectionMetrics(nodes: Array<HTMLElement | null>): SectionMetrics[] {
  return nodes
    .filter((node): node is HTMLElement => node !== null)
    .map((node) => ({ top: node.offsetTop, height: node.offsetHeight }));
}

export function findSectionIndexForPosition(metrics: SectionMetrics[], positionY: number): number {
  for (let index = 0; index < metrics.length; index += 1) {
    const section = metrics[index];
    if (positionY >= section.top && positionY < section.top + section.height) {
      return index;
    }
  }

  if (metrics.length === 0) {
    return 0;
  }

  return metrics.length - 1;
}

export function getSectionVisibleViewportRatio(
  section: SectionMetrics,
  viewportTop: number,
  viewportHeight: number,
): number {
  const viewportBottom = viewportTop + viewportHeight;
  const sectionBottom = section.top + section.height;
  const visibleTop = Math.max(viewportTop, section.top);
  const visibleBottom = Math.min(viewportBottom, sectionBottom);
  const visiblePixels = Math.max(0, visibleBottom - visibleTop);
  return visiblePixels / Math.max(viewportHeight, 1);
}
