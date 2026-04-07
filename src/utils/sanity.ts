import { sanityClient } from "sanity:client";
import { createImageUrlBuilder } from "@sanity/image-url";

const builder = createImageUrlBuilder(sanityClient);

export function urlFor(source: any) {
  return builder.image(source);
}

const PAGES_QUERY = `*[_type == "page" && defined(slug.current)]{
  _id,
  metaTitle,
  metaDescription,
  metaKeywords,
  h1Title,
  h2Title,
  h3Title,
  body[]{
    ...,
    _type == "inlineImage" => {
      ...,
      "imageUrl": asset->url,
      "imageDimensions": asset->metadata.dimensions
    }
  },
  "slug": slug.current
}`;

export async function getAllPages() {
  return await sanityClient.fetch(PAGES_QUERY);
}

const PAGE_BY_SLUG_QUERY = `*[_type == "page" && slug.current == $slug][0]{
  _id,
  metaTitle,
  metaDescription,
  metaKeywords,
  h1Title,
  h2Title,
  h3Title,
  body[]{
    ...,
    _type == "inlineImage" => {
      ...,
      "imageUrl": asset->url,
      "imageDimensions": asset->metadata.dimensions
    }
  },
  "slug": slug.current
}`;

export async function getPageBySlug(slug: string) {
  return await sanityClient.fetch(PAGE_BY_SLUG_QUERY, { slug });
}
