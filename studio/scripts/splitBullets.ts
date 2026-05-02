import {createClient} from '@sanity/client'
import {randomUUID} from 'node:crypto'

const BULLET_PREFIX = /^\s*[•●◦∙·]\s*/
const BULLET_LINE = /(\r?\n)\s*[•●◦∙·]\s*/g

const client = createClient({
  projectId: '7esgb0i4',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

type Span = {_type: 'span'; _key: string; text: string; marks?: string[]}
type Block = {
  _type: 'block'
  _key: string
  style?: string
  listItem?: string
  level?: number
  children?: Span[]
  markDefs?: any[]
}

function shortKey() {
  return randomUUID().replace(/-/g, '').slice(0, 12)
}

function splitBlock(block: Block): Block[] {
  if (block._type !== 'block') return [block]
  if (!block.children?.length) return [block]

  const fullText = block.children
    .map((c) => (c._type === 'span' ? c.text : ''))
    .join('')

  const hasBulletLines = BULLET_LINE.test(fullText)
  BULLET_LINE.lastIndex = 0
  const startsWithBullet = BULLET_PREFIX.test(fullText.trimStart())

  if (!hasBulletLines && !startsWithBullet) return [block]

  const lines: Span[][] = [[]]
  for (const child of block.children) {
    if (child._type !== 'span') {
      lines[lines.length - 1].push(child as Span)
      continue
    }
    const parts = child.text.split(/\r?\n/)
    parts.forEach((part, i) => {
      if (i > 0) lines.push([])
      if (part.length === 0) return
      lines[lines.length - 1].push({
        _type: 'span',
        _key: shortKey(),
        text: part,
        marks: child.marks ?? [],
      })
    })
  }

  const newBlocks: Block[] = []
  for (const line of lines) {
    if (line.length === 0) continue
    const firstSpan = line.find((s) => s._type === 'span' && s.text.length > 0)
    if (!firstSpan) continue

    let isBullet = false
    if (BULLET_PREFIX.test(firstSpan.text)) {
      firstSpan.text = firstSpan.text.replace(BULLET_PREFIX, '')
      isBullet = true
    }
    const trimmed: Span[] = firstSpan.text.length === 0 ? line.slice(1) : line
    if (trimmed.length === 0) continue

    const newBlock: Block = {
      _type: 'block',
      _key: shortKey(),
      style: block.style ?? 'normal',
      markDefs: block.markDefs ?? [],
      children: trimmed,
    }
    if (isBullet) {
      newBlock.listItem = 'bullet'
      newBlock.level = 1
    } else if (block.listItem) {
      newBlock.listItem = block.listItem
      newBlock.level = block.level ?? 1
    }
    newBlocks.push(newBlock)
  }

  return newBlocks.length > 0 ? newBlocks : [block]
}

function getFirstText(block: Block): string {
  const span = block.children?.find((c) => c._type === 'span')
  return span?.text ?? ''
}

function stripFirstBullet(block: Block): Block {
  const span = block.children?.find((c) => c._type === 'span')
  if (!span) return block
  return {
    ...block,
    listItem: block.listItem ?? 'bullet',
    level: block.level ?? 1,
    children: block.children!.map((c) =>
      c._key === span._key ? {...c, text: c.text.replace(BULLET_PREFIX, '')} : c,
    ),
  }
}

async function main() {
  if (!process.env.SANITY_WRITE_TOKEN) {
    console.error('Set SANITY_WRITE_TOKEN env var (Editor or higher).')
    process.exit(1)
  }

  const dryRun = !process.argv.includes('--apply')

  const docs: any[] = await client.fetch(
    `*[_type == "page" && defined(body)]{_id, _rev, body}`,
  )

  let changed = 0
  for (const doc of docs) {
    const oldBody = doc.body as any[]
    const newBody: any[] = []
    let mutated = false

    for (const item of oldBody) {
      if (item?._type === 'block') {
        const result = splitBlock(item as Block)
        if (result.length !== 1 || result[0] !== item) mutated = true
        newBody.push(...result)
      } else {
        newBody.push(item)
      }
    }

    if (!mutated) continue
    changed++
    console.log(`\n--- ${doc._id} ---`)
    console.log(`  blocks: ${oldBody.length} -> ${newBody.length}`)

    if (!dryRun) {
      await client
        .patch(doc._id)
        .ifRevisionId(doc._rev)
        .set({body: newBody})
        .commit({autoGenerateArrayKeys: false})
      console.log('  applied.')
    }
  }

  console.log(
    `\n${dryRun ? '[DRY RUN] ' : ''}${changed} document(s) ${dryRun ? 'would be' : 'were'} updated.`,
  )
  if (dryRun) console.log('Re-run with --apply to write changes.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
