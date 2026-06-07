"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { richHtmlForEditor, sanitizeRichTextHtml } from "@/lib/rich-text-html";

const TEXT_COLORS = [
  { label: "Schwarz", value: "#0a1a15" },
  { label: "Primärfarbe", value: "var(--gj-primary)" },
  { label: "Rot", value: "#ef4444" },
  { label: "Grün", value: "#16a34a" },
  { label: "Grau", value: "#6b7280" },
] as const;

type Props = {
  name: string;
  defaultValue?: string;
  rows?: number;
  placeholder?: string;
};

export function RichTextEditor({
  name,
  defaultValue = "",
  rows = 12,
  placeholder = "Beschreibung eingeben…",
}: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const [color, setColor] = useState<string>(TEXT_COLORS[0].value);

  const minHeight = Math.max(160, rows * 22);

  function syncFromEditor() {
    const raw = editorRef.current?.innerHTML ?? "";
    const safe = sanitizeRichTextHtml(raw);
    if (editorRef.current && safe !== raw) {
      editorRef.current.innerHTML = safe;
    }
    if (hiddenRef.current) hiddenRef.current.value = safe;
  }

  function runCommand(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    syncFromEditor();
  }

  useEffect(() => {
    if (!editorRef.current) return;
    editorRef.current.innerHTML = richHtmlForEditor(defaultValue);
    syncFromEditor();
  }, [defaultValue]);

  useEffect(() => {
    const form = editorRef.current?.closest("form");
    if (!form) return;
    const onSubmit = () => syncFromEditor();
    form.addEventListener("submit", onSubmit);
    return () => form.removeEventListener("submit", onSubmit);
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1 rounded-t-[var(--gj-radius)] border border-b-0 border-[var(--gj-border)] bg-[var(--gj-bg)]/80 p-2">
        <ToolbarButton label="Fett" onClick={() => runCommand("bold")}>
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton label="Kursiv" onClick={() => runCommand("italic")}>
          <em>I</em>
        </ToolbarButton>
        <span className="mx-1 h-6 w-px bg-[var(--gj-border)]" aria-hidden />
        <label className="flex items-center gap-1.5 text-xs text-[var(--gj-muted)]">
          <span className="sr-only">Textfarbe</span>
          <select
            className="gj-input max-w-[9rem] py-1 text-xs"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            aria-label="Textfarbe wählen"
          >
            {TEXT_COLORS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="gj-btn-ghost px-2 py-1 text-xs"
            onClick={() => runCommand("foreColor", color)}
          >
            Anwenden
          </button>
        </label>
        <span className="mx-1 h-6 w-px bg-[var(--gj-border)]" aria-hidden />
        <ToolbarButton label="Aufzählung" onClick={() => runCommand("insertUnorderedList")}>
          •≡
        </ToolbarButton>
        <ToolbarButton label="Nummerierung" onClick={() => runCommand("insertOrderedList")}>
          1.
        </ToolbarButton>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline
        aria-label={placeholder}
        data-placeholder={placeholder}
        className="gj-rich-text-editor gj-rich-text min-h-[var(--editor-min-h)] rounded-b-[var(--gj-radius)] border border-[var(--gj-border)] bg-white px-3 py-2 text-sm leading-relaxed outline-none focus:border-[var(--gj-primary)] focus:ring-2 focus:ring-[var(--gj-primary)]/20"
        style={{ "--editor-min-h": `${minHeight}px` } as CSSProperties}
        onInput={syncFromEditor}
        onBlur={syncFromEditor}
        onPaste={(e) => {
          e.preventDefault();
          const text = e.clipboardData.getData("text/plain");
          document.execCommand("insertText", false, text);
          syncFromEditor();
        }}
      />

      <input ref={hiddenRef} type="hidden" name={name} defaultValue="" />
    </div>
  );
}

function ToolbarButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className="rounded-md border border-transparent px-2.5 py-1 text-sm text-[var(--gj-text)] hover:border-[var(--gj-border)] hover:bg-white"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
