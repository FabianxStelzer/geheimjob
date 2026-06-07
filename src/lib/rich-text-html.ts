const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "ul",
  "ol",
  "li",
  "span",
  "div",
]);

export function looksLikeHtml(value: string): boolean {
  return /<\s*(p|br|strong|b|em|i|u|ul|ol|li|span|div)\b/i.test(value);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function plainTextToRichHtml(text: string): string {
  if (!text.trim()) return "";
  return text
    .split(/\n{2,}/)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function extractSafeColor(attrs: string): string | null {
  const quoted = attrs.match(/style\s*=\s*(["'])(.*?)\1/i);
  const unquoted = attrs.match(/style\s*=\s*([^>\s]+)/i);
  const style = quoted?.[2] ?? unquoted?.[1];
  if (!style) return null;

  const colorMatch = style.match(/color\s*:\s*([^;]+)/i);
  if (!colorMatch) return null;

  const raw = colorMatch[1].trim();
  if (/^#[0-9a-f]{3,8}$/i.test(raw)) return raw;
  if (/^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/i.test(raw)) return raw;
  if (raw === "var(--gj-primary)") return raw;

  const named = ["black", "red", "green", "blue", "gray", "teal"];
  if (named.includes(raw.toLowerCase())) return raw.toLowerCase();

  return null;
}

export function sanitizeRichTextHtml(dirty: string): string {
  let html = dirty.trim();
  if (!html) return "";

  html = html.replace(/<(script|style|iframe|object|embed|link|meta)[\s\S]*?<\/\1>/gi, "");
  html = html.replace(/<(script|style|iframe|object|embed|link|meta)\b[^>]*>/gi, "");
  html = html.replace(/\s(on\w+)\s*=\s*(["'])[^"']*\2/gi, "");
  html = html.replace(/javascript:/gi, "");

  html = html.replace(/<\/?([a-z][a-z0-9]*)\b([^>]*)>/gi, (full, tagName: string, attrs: string) => {
    const tag = tagName.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) return "";

    if (full.startsWith("</")) return `</${tag}>`;
    if (tag === "br") return "<br>";

    if (tag === "span") {
      const color = extractSafeColor(attrs);
      return color ? `<span style="color:${color}">` : "<span>";
    }

    return `<${tag}>`;
  });

  return html.trim();
}

export function richHtmlForEditor(value: string): string {
  if (!value.trim()) return "";
  if (looksLikeHtml(value)) return sanitizeRichTextHtml(value);
  return plainTextToRichHtml(value);
}
