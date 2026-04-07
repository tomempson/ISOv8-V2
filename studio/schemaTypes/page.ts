import {defineType, defineField, defineArrayMember} from 'sanity'

export const page = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
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
        defineArrayMember({
          name: 'inlineImage',
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
              name: 'caption',
              title: 'Caption',
              type: 'string',
            }),
            defineField({
              name: 'alignment',
              title: 'Alignment',
              type: 'string',
              options: {
                list: [
                  {title: 'Left', value: 'left'},
                  {title: 'Centre', value: 'center'},
                  {title: 'Right', value: 'right'},
                  {title: 'Full Width', value: 'full-width'},
                ],
                layout: 'radio',
              },
              initialValue: 'center',
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
