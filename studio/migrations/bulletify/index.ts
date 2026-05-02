import {defineMigration, at, set, setIfMissing} from 'sanity/migrate'

const BULLET_PREFIX = /^\s*[•●◦∙·]\s*/

export default defineMigration({
  title: 'Convert "• " text blocks into bullet list items',
  documentTypes: ['page'],
  migrate: {
    object(node, path) {
      if (!node || (node as any)._type !== 'block') return
      const block = node as any
      if (block.listItem) return

      const firstSpan = block.children?.find(
        (c: any) => c?._type === 'span' && typeof c.text === 'string' && c.text.length > 0,
      )
      if (!firstSpan || !BULLET_PREFIX.test(firstSpan.text)) return

      const cleaned = firstSpan.text.replace(BULLET_PREFIX, '')

      return [
        at('listItem', setIfMissing('bullet')),
        at('level', setIfMissing(1)),
        at(['children', {_key: firstSpan._key}, 'text'], set(cleaned)),
      ]
    },
  },
})
