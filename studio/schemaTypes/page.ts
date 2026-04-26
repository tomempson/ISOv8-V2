import {defineType, defineField, defineArrayMember} from 'sanity'

const SECTION_OPTIONS: Record<string, {title: string; value: string}[]> = {
  understand: [
    {title: 'Base Platforms & Structural Principles', value: 'base-platforms-and-structural-principles'},
    {title: 'Structural Behaviour & Modification Limits', value: 'structural-behavior-and-modification-limits'},
    {title: 'Performance, Comfort & Longevity', value: 'performance-comfort-and-longevity'},
    {title: 'Planning, Legal & Compliance', value: 'planning-legal-and-compliance'},
    {title: 'Commercial & Financial Hub', value: 'commercial-and-financial-hub'},
  ],
  define: [
    {title: 'Decision Framework', value: 'decision-framework'},
    {title: 'Red Flag Warnings', value: 'red-flag-warnings'},
    {title: 'Reality CHQ', value: 'reality-chq'},
    {title: 'Platform Section', value: 'platform-section'},
  ],
  see: [
    {title: 'Real-World Product Examples', value: 'real-world-product-examples'},
    {title: 'Industries & Operational Use', value: 'industries-and-operational-use'},
  ],
  perform: [
    {title: 'From A to Done', value: 'from-a-to-done'},
    {title: 'Internal Finishes & Fit-Out Options', value: 'internal-finishes-and-fit-out-options'},
    {title: 'Maintenance, Condition Control & Aftercare', value: 'maintenance-condition-control-and-aftercare'},
    {title: 'Practical Execution & Ownership', value: 'practical-execution-and-ownership'},
  ],
  align: [
    {title: 'Technical Reference Hub', value: 'technical-reference-hub'},
    {title: 'Project Definition & Alignment', value: 'project-definition-and-alignment'},
    {title: 'Transport & Geography', value: 'transport-and-geography'},
  ],
}

const ALL_SECTION_OPTIONS = Object.values(SECTION_OPTIONS).flat()

export const page = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    defineField({
      name: 'phase',
      title: 'Phase',
      type: 'string',
      description: 'Used for the phase part of the URL of the page (ensure this is reflected also by the links to the page on the website)',
      options: {
        list: [
          {title: 'Understand', value: 'understand'},
          {title: 'Define', value: 'define'},
          {title: 'See', value: 'see'},
          {title: 'Perform', value: 'perform'},
          {title: 'Align', value: 'align'},
        ],
        layout: 'dropdown',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'section',
      title: 'Section',
      type: 'string',
      description: 'Used for the section part of the URL of the page (ensure this is reflected also by the links to the page on the website)',
      options: {
        list: ALL_SECTION_OPTIONS,
        layout: 'dropdown',
      },
      hidden: ({document}) => !document?.phase,
      validation: (Rule) =>
        Rule.required().custom((value, context) => {
          const phase = (context.document as any)?.phase
          if (!phase || !value) return true
          const validSections = SECTION_OPTIONS[phase]?.map((s) => s.value) || []
          if (!validSections.includes(value)) {
            return `"${value}" is not a valid section for the "${phase}" phase`
          }
          return true
        }),
    }),
    defineField({
      name: 'metaTitle',
      title: 'Meta Title',
      type: 'string',
      description: 'Used for <title> tag and as a derivative for the slug',
      validation: (Rule) =>
        Rule.required().max(70).warning('Keep under 70 characters for best SEO'),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      rows: 3,
      description: 'Used for <meta name="description"> tag',
      validation: (Rule) =>
        Rule.required()
          .max(160)
          .warning('Keep under 160 characters for best SEO'),
    }),
    defineField({
      name: 'metaKeywords',
      title: 'Meta Keywords',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      options: {layout: 'tags'},
      description: 'Used for <meta name="keywords"> tag',
    }),
    defineField({
      name: 'h1Title',
      title: 'Heading 1 Title',
      type: 'string',
      description: 'Used for <h1> tag (main title)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'h2Title',
      title: 'Heading 2 Title',
      type: 'string',
      description: 'Used for <h2> tag (secondary title)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'h3Title',
      title: 'Heading 3 Title',
      type: 'string',
      description: 'Used for <h3> tag (tertiary title)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Content',
      type: 'array',
      validation: (Rule) => Rule.required(),
      of: [
        defineArrayMember({
          type: 'block',
          of: [
            defineArrayMember({
              name: 'inlineImageInline',
              title: 'Image',
              type: 'object',
              fields: [
                defineField({
                  name: 'asset',
                  title: 'Image',
                  type: 'image',
                  options: {hotspot: true},
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: 'alt',
                  title: 'Alt Text',
                  type: 'string',
                  description: 'Required for accessibility',
                  validation: (Rule) =>
                    Rule.required().error('Alt text is required for accessibility'),
                }),
                defineField({
                  name: 'side',
                  title: 'Float Side',
                  type: 'string',
                  options: {
                    list: [
                      {title: 'Left', value: 'left'},
                      {title: 'Right', value: 'right'},
                    ],
                    layout: 'radio',
                  },
                  initialValue: 'left',
                }),
              ],
              preview: {
                select: {
                  title: 'alt',
                  media: 'asset',
                },
              },
            }),
          ],
          marks: {
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'},
              {title: 'Underline', value: 'underline'},
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  defineField({
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                    validation: (Rule) =>
                      Rule.required().uri({
                        allowRelative: true,
                        scheme: ['http', 'https', 'mailto', 'tel'],
                      }),
                  }),
                  defineField({
                    name: 'openInNewTab',
                    type: 'boolean',
                    title: 'Open in new tab',
                    initialValue: false,
                  }),
                ],
              },
            ],
          },
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H2', value: 'h2'},
            {title: 'H3', value: 'h3'},
            {title: 'H4', value: 'h4'},
            {title: 'Quote', value: 'blockquote'},
          ],
          lists: [
            {title: 'Bullet', value: 'bullet'},
            {title: 'Numbered', value: 'number'},
          ],
        }),
      ],
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'Used for the URL of the page (ensure this is reflected also by the links to the page on the website)',
      options: {
        source: 'metaTitle',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'metaTitle',
      subtitle: 'slug.current',
    },
  },
})
