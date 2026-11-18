export const PAGE_SIZE = 10;

// Reads a 1-based page number from a URL parameter, falling back to the first page.
export function parsePage(value: string | null): number {
  const page = Number.parseInt(value ?? "", 10);
  return Number.isNaN(page) || page < 1 ? 1 : page;
}
