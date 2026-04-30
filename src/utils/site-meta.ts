export const SITE_ORIGIN = "https://isov8-v2.netlify.app";

export const SITE_NAME = "ISOv8®";
export const ORG_NAME = "ISOv8® by ContainerKing® Limited";
export const ORG_TELEPHONE = "01724 870000";
export const ORG_TELEPHONE_E164 = "+441724870000";
export const ORG_LOCALITY = "Scunthorpe";
export const ORG_REGION = "North Lincolnshire";
export const ORG_COUNTRY = "GB";
export const ORG_DESCRIPTION =
  "UK business delivering shipping container conversions and steel anti-vandal buildings with a focus on clarity, specification, and long-term performance.";

export const ORG_ID = `${SITE_ORIGIN}/#organization`;
export const WEBSITE_ID = `${SITE_ORIGIN}/#website`;
export const ORG_LOGO_URL = `${SITE_ORIGIN}/assets/images/isov8-logo-colour.svg`;

export const ORG_REF = { "@id": ORG_ID } as const;

export function organizationJsonLd() {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: ORG_NAME,
    url: SITE_ORIGIN,
    logo: ORG_LOGO_URL,
    telephone: ORG_TELEPHONE,
    address: {
      "@type": "PostalAddress",
      addressLocality: ORG_LOCALITY,
      addressRegion: ORG_REGION,
      addressCountry: ORG_COUNTRY,
    },
    description: ORG_DESCRIPTION,
  };
}

export function websiteJsonLd() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE_NAME,
    url: SITE_ORIGIN,
    publisher: ORG_REF,
  };
}

export interface BreadcrumbEntry {
  name: string;
  item?: string;
}

export function breadcrumbJsonLd(entries: BreadcrumbEntry[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: entries.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      ...(entry.item ? { item: entry.item } : {}),
    })),
  };
}

export interface ArticleJsonLdInput {
  headline: string;
  description?: string;
  url: string;
  dateModified?: string;
}

export function articleJsonLd({
  headline,
  description,
  url,
  dateModified,
}: ArticleJsonLdInput) {
  return {
    "@type": "Article",
    headline,
    ...(description ? { description } : {}),
    author: { "@type": "Organization", name: ORG_NAME },
    publisher: ORG_REF,
    ...(dateModified ? { dateModified } : {}),
    mainEntityOfPage: url,
  };
}

export function siteGraphJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [organizationJsonLd(), websiteJsonLd()],
  };
}
