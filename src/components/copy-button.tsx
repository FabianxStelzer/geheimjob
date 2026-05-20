"use client";

import { useState } from "react";
import { CheckIcon } from "@/components/icons";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function onClick() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      alert("Kopieren fehlgeschlagen.");
    }
  }

  return (
    <button type="button" onClick={onClick} className="gj-btn-primary">
      {copied ? (
        <>
          <CheckIcon /> Kopiert
        </>
      ) : (
        "Kopieren"
      )}
    </button>
  );
}
