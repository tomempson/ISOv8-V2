import { sanityClient } from "sanity:client";
import { createImageUrlBuilder } from "@sanity/image-url";

const builder = createImageUrlBuilder(sanityClient);

export function urlFor(source: any) {
  return builder.image(source);
}

const PAGES_QUERY = `*[_type == "page" && defined(slug.current)]{
  _id,
  _updatedAt,
  phase,
  section,
  metaTitle,
  metaDescription,
  metaKeywords,
  h1Title,
  h2Title,
  h3Title,
  body,
  "slug": slug.current
}`;

export async function getAllPages() {
  return await sanityClient.fetch(PAGES_QUERY);
}

const PAGE_BY_SLUG_QUERY = `*[_type == "page" && slug.current == $slug][0]{
  _id,
  phase,
  section,
  metaTitle,
  metaDescription,
  metaKeywords,
  h1Title,
  h2Title,
  h3Title,
  body,
  "slug": slug.current
}`;

export async function getPageBySlug(slug: string) {
  return await sanityClient.fetch(PAGE_BY_SLUG_QUERY, { slug });
}

export interface SidebarLink {
  href: string;
  label: string;
}

function sidebarSortKey(h3Title: string | undefined | null): number {
  if (!h3Title) return Number.MAX_SAFE_INTEGER;
  const trimmed = h3Title.trimEnd();
  const len = trimmed.length;
  if (len === 0) return Number.MAX_SAFE_INTEGER;

  const lastChar = trimmed[len - 1];
  const secondLast = len >= 2 ? trimmed[len - 2] : "";

  let candidate: string;
  if (secondLast === "." || secondLast === "") {
    candidate = lastChar;
  } else {
    candidate = secondLast + lastChar;
  }

  const parsed = parseInt(candidate, 10);
  return Number.isNaN(parsed) ? Number.MAX_SAFE_INTEGER : parsed;
}

export async function getSidebarLinksGroupedByPhaseSection(): Promise<Record<string, Record<string, SidebarLink[]>>> {
  const pages = await sanityClient.fetch(`*[_type == "page" && defined(slug.current) && defined(phase) && defined(section)]{
    phase,
    section,
    metaTitle,
    h1Title,
    h3Title,
    _createdAt,
    "slug": slug.current
  }`);

  const grouped: Record<string, Record<string, (SidebarLink & { _sortKey: number; _createdAt: string })[]>> = {};

  for (const page of pages) {
    if (!page.phase || !page.section) continue;
    if (!grouped[page.phase]) grouped[page.phase] = {};
    if (!grouped[page.phase][page.section]) grouped[page.phase][page.section] = [];
    grouped[page.phase][page.section].push({
      href: `/${page.phase}/${page.section}/${page.slug}`,
      label: page.metaTitle || page.h1Title || page.slug,
      _sortKey: sidebarSortKey(page.h3Title),
      _createdAt: page._createdAt,
    });
  }

  const result: Record<string, Record<string, SidebarLink[]>> = {};
  for (const phase of Object.keys(grouped)) {
    result[phase] = {};
    for (const section of Object.keys(grouped[phase])) {
      result[phase][section] = grouped[phase][section]
        .slice()
        .sort((a, b) => {
          if (a._sortKey !== b._sortKey) return a._sortKey - b._sortKey;
          return a._createdAt.localeCompare(b._createdAt);
        })
        .map(({ href, label }) => ({ href, label }));
    }
  }

  return result;
}
