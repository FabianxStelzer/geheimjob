"use client";

import { useMemo } from "react";
import { looksLikeHtml, sanitizeRichTextHtml } from "@/lib/rich-text-html";

type Props = {
  html: string;
  className?: string;
  emptyText?: string;
};

export function RichTextContent({ html, className = "", emptyText }: Props) {
  const content = html.trim();

  const safeHtml = useMemo(() => {
    if (!content) return "";
    if (!looksLikeHtml(content)) return "";
    return sanitizeRichTextHtml(content);
  }, [content]);

  if (!content) {
    return emptyText ? <p className={`text-sm text-[var(--gj-muted)] ${className}`}>{emptyText}</p> : null;
  }

  if (!looksLikeHtml(content)) {
    return (
      <div className={`whitespace-pre-wrap text-sm leading-relaxed text-[var(--gj-text)]/90 ${className}`}>
        {content}
      </div>
    );
  }

  return (
    <div
      className={`gj-rich-text text-sm leading-relaxed text-[var(--gj-text)]/90 ${className}`}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
