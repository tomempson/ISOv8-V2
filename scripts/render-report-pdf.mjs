import fs from "node:fs";
import path from "node:path";

const inputPath = process.argv[2];
const outputPath = process.argv[3];

if (!inputPath || !outputPath) {
  console.error("Usage: node scripts/render-report-pdf.mjs <input.md> <output.pdf>");
  process.exit(1);
}

const source = fs.readFileSync(inputPath, "utf8").replace(/\r\n/g, "\n");
const paragraphs = source.split("\n");

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_LEFT = 48;
const MARGIN_RIGHT = 48;
const MARGIN_TOP = 58;
const MARGIN_BOTTOM = 48;
const BODY_SIZE = 11;
const H1_SIZE = 22;
const H2_SIZE = 15;
const H3_SIZE = 12.5;
const FOOTER_SIZE = 9;

const styles = {
  h1: { font: "F2", size: H1_SIZE, leading: 28, gapBefore: 0, gapAfter: 6, maxChars: 48 },
  h2: { font: "F2", size: H2_SIZE, leading: 20, gapBefore: 12, gapAfter: 2, maxChars: 72 },
  h3: { font: "F2", size: H3_SIZE, leading: 17, gapBefore: 8, gapAfter: 2, maxChars: 82 },
  body: { font: "F1", size: BODY_SIZE, leading: 15, gapBefore: 0, gapAfter: 0, maxChars: 96 },
  bullet: { font: "F1", size: BODY_SIZE, leading: 15, gapBefore: 0, gapAfter: 0, maxChars: 90 },
  number: { font: "F1", size: BODY_SIZE, leading: 15, gapBefore: 0, gapAfter: 0, maxChars: 88 },
  code: { font: "F1", size: 10, leading: 13, gapBefore: 2, gapAfter: 0, maxChars: 98 },
  blank: { font: "F1", size: BODY_SIZE, leading: 9, gapBefore: 0, gapAfter: 0, maxChars: 1 },
};

function wrapText(text, maxChars) {
  const words = text.split(/\s+/).filter(Boolean);
  if (!words.length) return [""];
  const lines = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      if (word.length <= maxChars) {
        current = word;
      } else {
        let remainder = word;
        while (remainder.length > maxChars) {
          lines.push(remainder.slice(0, maxChars - 1) + "-");
          remainder = remainder.slice(maxChars - 1);
        }
        current = remainder;
      }
    }
  }
  if (current) lines.push(current);
  return lines;
}

function parseBlocks(lines) {
  const blocks = [];
  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (!line.trim()) {
      blocks.push({ type: "blank", text: "" });
      continue;
    }
    if (line.startsWith("# ")) {
      blocks.push({ type: "h1", text: line.slice(2).trim() });
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push({ type: "h2", text: line.slice(3).trim() });
      continue;
    }
    if (line.startsWith("### ")) {
      blocks.push({ type: "h3", text: line.slice(4).trim() });
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      blocks.push({ type: "number", text: line });
      continue;
    }
    if (line.startsWith("- ")) {
      blocks.push({ type: "bullet", text: line });
      continue;
    }
    if (line.startsWith("`") || line.includes("`")) {
      blocks.push({ type: "code", text: line.replace(/`/g, "") });
      continue;
    }
    blocks.push({ type: "body", text: line });
  }
  return blocks;
}

function escapePdfText(text) {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function blocksToPages(blocks) {
  const pages = [];
  let currentPage = [];
  let y = PAGE_HEIGHT - MARGIN_TOP;

  function newPage() {
    if (currentPage.length) pages.push(currentPage);
    currentPage = [];
    y = PAGE_HEIGHT - MARGIN_TOP;
  }

  for (const block of blocks) {
    const style = styles[block.type];
    const wrapped = block.type === "blank" ? [""] : wrapText(block.text, style.maxChars);
    const height = style.gapBefore + (wrapped.length * style.leading) + style.gapAfter;

    if (y - height < MARGIN_BOTTOM + 20) {
      newPage();
    }

    y -= style.gapBefore;

    for (const [index, line] of wrapped.entries()) {
      currentPage.push({
        font: style.font,
        size: style.size,
        x: MARGIN_LEFT + (block.type === "bullet" ? 10 : 0),
        y,
        text:
          block.type === "bullet" && index === 0
            ? `- ${line.slice(2)}`
            : block.type === "number" && index > 0
              ? `   ${line}`
              : line,
      });
      y -= style.leading;
    }

    y -= style.gapAfter;
  }

  if (currentPage.length) pages.push(currentPage);
  return pages;
}

function buildContentStream(pageLines, pageNumber, totalPages) {
  const ops = ["BT"];
  let currentFont = "";
  let currentSize = 0;

  for (const line of pageLines) {
    if (line.font !== currentFont || line.size !== currentSize) {
      ops.push(`/${line.font} ${line.size} Tf`);
      currentFont = line.font;
      currentSize = line.size;
    }
    ops.push(`1 0 0 1 ${line.x.toFixed(2)} ${line.y.toFixed(2)} Tm (${escapePdfText(line.text)}) Tj`);
  }

  ops.push(`/F1 ${FOOTER_SIZE} Tf`);
  ops.push(`1 0 0 1 ${MARGIN_LEFT.toFixed(2)} 22.00 Tm (Page ${pageNumber} of ${totalPages}) Tj`);
  ops.push("ET");
  return ops.join("\n");
}

function buildPdf(pages) {
  const objects = [];

  function addObject(content) {
    objects.push(content);
    return objects.length;
  }

  const catalogId = addObject("<< /Type /Catalog /Pages 2 0 R >>");
  const pagesId = 2;
  objects.push(null);
  const fontRegularId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const fontBoldId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");

  const pageIds = [];

  for (let i = 0; i < pages.length; i += 1) {
    const stream = buildContentStream(pages[i], i + 1, pages.length);
    const contentId = addObject(`<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}\nendstream`);
    const pageObject = `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >> /Contents ${contentId} 0 R >>`;
    const pageId = addObject(pageObject);
    pageIds.push(pageId);
  }

  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  for (let i = 0; i < objects.length; i += 1) {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefStart = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return pdf;
}

const blocks = parseBlocks(paragraphs);
const pages = blocksToPages(blocks);
const pdf = buildPdf(pages);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, pdf, "binary");
console.log(`Wrote ${outputPath}`);
