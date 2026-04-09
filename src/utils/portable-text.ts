export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function extractText(node: any): string {
  if (!node) return "";
  // Direct text node
  if (node.text) return node.text;
  // Recurse into children
  if (node.children) {
    return node.children.map((child: any) => extractText(child)).join("");
  }
  return "";
}

export function extractH2s(body: any[]): { text: string; id: string }[] {
  if (!body) return [];
  return body
    .filter((block: any) => block.style === "h2")
    .map((block: any) => {
      const text = extractText(block);
      return { text, id: slugify(text) };
    });
}
