---
name: Sanity CMS Integration
description: Project brief for integrating Sanity CMS with the Astro SSG site — page schema, Portable Text rendering, catch-all routing, webhook rebuilds
type: project
---

Integrating Sanity CMS as the content source for an Astro SSG site (ISOv8 V2). All pages generated statically at build time from Sanity `page` documents.

**Why:** Client needs editorial control over page content (headings, body text, inline images) without developer involvement. Content updates trigger rebuilds via webhook.

**How to apply:**
- Template page is structural-platforms-hub.astro — use its layout (sidebar, TOC, hero, content sections) as the shell for CMS content
- Single `[...slug].astro` catch-all route with getStaticPaths() fetching all published `page` documents
- Page schema: metaTitle, metaDescription, metaKeywords, h1/h2/h3Title, body (Portable Text with inline images), slug, publishedAt
- Portable Text images must have: asset, alt (required), caption (optional), alignment (left|center|right|full-width)
- Build reusable <SEO /> component for head meta injection
- Custom Astro Portable Text renderer — no dangerouslySetInnerHTML
- Use @sanity/image-url for responsive images
- Deploy: Netlify, webhook → build hook for auto-rebuilds on publish
- SSG only, no SSR/hybrid
- Stack: @sanity/astro, @sanity/client, @sanity/image-url, @portabletext/to-html
