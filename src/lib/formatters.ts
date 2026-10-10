/**
 * Syllabi formatting utilities.
 * Enforces strict honesty: no fabricated social proof, no "0+ students",
 * and clean academic typography.
 */

export function formatSavesCount(savesCount: number): string {
  if (!savesCount || savesCount <= 0) {
    return 'No saves yet';
  }
  if (savesCount === 1) {
    return '1 save';
  }
  if (savesCount < 1000) {
    return `${savesCount} saves`;
  }
  return `${(savesCount / 1000).toFixed(1)}k saves`;
}

export function formatViewsCount(viewsCount: number): string {
  if (!viewsCount || viewsCount <= 0) {
    return '0 views';
  }
  if (viewsCount === 1) {
    return '1 view';
  }
  if (viewsCount < 1000) {
    return `${viewsCount} views`;
  }
  return `${(viewsCount / 1000).toFixed(1)}k views`;
}

export function formatDownloadsCount(downloadsCount: number): string {
  if (!downloadsCount || downloadsCount <= 0) {
    return '0 downloads';
  }
  if (downloadsCount === 1) {
    return '1 download';
  }
  if (downloadsCount < 1000) {
    return `${downloadsCount} downloads`;
  }
  return `${(downloadsCount / 1000).toFixed(1)}k downloads`;
}

export function formatRating(ratingAvg: number, ratingCount: number): string {
  if (!ratingCount || ratingCount <= 0) {
    return 'Unrated';
  }
  return `${ratingAvg.toFixed(1)} (${ratingCount})`;
}

export function formatPageCount(pages: number): string {
  if (!pages || pages <= 1) {
    return '1 page';
  }
  return `${pages} pages`;
}
