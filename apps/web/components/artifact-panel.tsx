"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { CheckIcon, CopyIcon, XIcon } from "lucide-react";
import { useArtifact } from "@/lib/artifact-context";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";

const PREVIEWABLE = new Set(["html", "htm", "jsx", "tsx", "react", "js", "javascript"]);
const REACT_LANGS = new Set(["jsx", "tsx", "react", "js", "javascript"]);

function buildReactSrcdoc(code: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>body{margin:0;font-family:system-ui,sans-serif;}</style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" data-presets="react">
    ${code}
    const rootEl = document.getElementById('root');
    if (typeof App !== 'undefined') {
      ReactDOM.createRoot(rootEl).render(React.createElement(App));
    }
  </script>
</body>
</html>`;
}

function useCopyToClipboard() {
  const [isCopied, setIsCopied] = useState(false);
  const copyToClipboard = useCallback((value: string) => {
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    });
  }, []);
  return { isCopied, copyToClipboard };
}

export function ArtifactPanel() {
  const { artifact, closeArtifact } = useArtifact();
  const { isCopied, copyToClipboard } = useCopyToClipboard();

  const lang = artifact?.language.toLowerCase() ?? "";
  const canPreview = PREVIEWABLE.has(lang);
  const [tab, setTab] = useState<"preview" | "code">(canPreview ? "preview" : "code");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeArtifact();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeArtifact]);

  useEffect(() => {
    setTab(canPreview ? "preview" : "code");
  }, [canPreview, artifact?.code]);

  const srcdoc = useMemo(() => {
    if (!artifact) return "";
    if (lang === "html" || lang === "htm") return artifact.code;
    if (REACT_LANGS.has(lang)) return buildReactSrcdoc(artifact.code);
    return "";
  }, [artifact, lang]);

  if (!artifact) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={closeArtifact}
    >
      <div
        className="flex h-[85vh] w-[90vw] max-w-5xl flex-col overflow-hidden rounded-xl border border-border bg-background shadow-elevated animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
            {artifact.language}
          </span>
          {canPreview && (
            <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
              <button
                onClick={() => setTab("preview")}
                className={`rounded px-2.5 py-1 text-xs transition-colors ${
                  tab === "preview"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Preview
              </button>
              <button
                onClick={() => setTab("code")}
                className={`rounded px-2.5 py-1 text-xs transition-colors ${
                  tab === "code"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Code
              </button>
            </div>
          )}
          <div className="ml-auto flex items-center gap-1">
            <TooltipIconButton
              tooltip="Copy code"
              onClick={() => copyToClipboard(artifact.code)}
              variant="ghost"
              className="size-8 rounded-md"
            >
              {isCopied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
            </TooltipIconButton>
            <TooltipIconButton
              tooltip="Close"
              onClick={closeArtifact}
              variant="ghost"
              className="size-8 rounded-md"
            >
              <XIcon className="size-4" />
            </TooltipIconButton>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {tab === "code" || !canPreview ? (
            <pre className="h-full overflow-auto bg-muted/30 p-4 font-mono text-xs leading-relaxed">
              <code>{artifact.code}</code>
            </pre>
          ) : (
            <iframe
              key={artifact.code}
              srcDoc={srcdoc}
              sandbox="allow-scripts allow-modals"
              className="h-full w-full border-0 bg-white"
              title="Artifact preview"
            />
          )}
        </div>
      </div>
    </div>
  );
}
