"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { type FC, createContext, memo, useContext, useState } from "react";
import { CheckIcon, CopyIcon, Maximize2 } from "lucide-react";

import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import { useArtifact } from "@/lib/artifact-context";
import { cn } from "@/lib/utils";

const CodeBlockContext = createContext(false);

function useIsCodeBlock() {
  return useContext(CodeBlockContext);
}

const useCopyToClipboard = ({ copiedDuration = 3000 } = {}) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = (value: string) => {
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), copiedDuration);
    });
  };

  return { isCopied, copyToClipboard };
};

const CodeHeader: FC<{ language?: string; children?: string }> = ({ language, children: code }) => {
  const { isCopied, copyToClipboard } = useCopyToClipboard();
  const { openArtifact } = useArtifact();

  const onCopy = () => {
    if (!code || isCopied) return;
    copyToClipboard(code);
  };

  return (
    <div className="mt-3 flex items-center justify-between rounded-t-lg border border-border/50 border-b-0 bg-muted/50 px-3 py-1.5 text-xs">
      <span className="font-medium text-muted-foreground lowercase">{language}</span>
      <div className="flex items-center gap-0.5">
        <TooltipIconButton
          tooltip="Open in Artifact"
          onClick={() => openArtifact({ code: code ?? "", language: language ?? "text" })}
        >
          <Maximize2 />
        </TooltipIconButton>
        <TooltipIconButton tooltip="Copy" onClick={onCopy}>
          {isCopied ? <CheckIcon /> : <CopyIcon />}
        </TooltipIconButton>
      </div>
    </div>
  );
};

const InlinePreview: FC<{ language: string; code: string }> = ({ language, code }) => {
  const { openArtifact } = useArtifact();
  const { isCopied, copyToClipboard } = useCopyToClipboard();
  const [showCode, setShowCode] = useState(false);

  return (
    <div className="my-3 overflow-hidden rounded-lg border border-border/50">
      {/* Header */}
      <div className="flex items-center justify-between bg-muted/50 px-3 py-1.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-medium text-muted-foreground lowercase">{language}</span>
          <div className="flex rounded-md border border-border/50 text-[11px]">
            <button
              type="button"
              onClick={() => setShowCode(false)}
              className={cn(
                "px-2 py-0.5 transition-colors",
                !showCode ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              Preview
            </button>
            <button
              type="button"
              onClick={() => setShowCode(true)}
              className={cn(
                "border-l border-border/50 px-2 py-0.5 transition-colors",
                showCode ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              Code
            </button>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <TooltipIconButton
            tooltip="Open in Artifact"
            onClick={() => openArtifact({ code, language })}
          >
            <Maximize2 />
          </TooltipIconButton>
          <TooltipIconButton
            tooltip="Copy"
            onClick={() => !isCopied && copyToClipboard(code)}
          >
            {isCopied ? <CheckIcon /> : <CopyIcon />}
          </TooltipIconButton>
        </div>
      </div>
      {/* Content */}
      {showCode ? (
        <pre className="overflow-x-auto bg-muted/30 p-3 font-mono text-xs leading-relaxed">
          <code>{code}</code>
        </pre>
      ) : (
        <iframe
          srcDoc={code}
          sandbox="allow-scripts allow-modals"
          className="h-[360px] w-full border-0 bg-white"
          title="Code preview"
        />
      )}
    </div>
  );
};

const markdownComponents = {
  h1: ({ className, ...props }: React.ComponentProps<"h1">) => (
    <h1 className={cn("mt-6 mb-3 font-bold text-2xl leading-tight first:mt-0 last:mb-0", className)} {...props} />
  ),
  h2: ({ className, ...props }: React.ComponentProps<"h2">) => (
    <h2 className={cn("mt-5 mb-2.5 font-bold text-xl leading-tight first:mt-0 last:mb-0", className)} {...props} />
  ),
  h3: ({ className, ...props }: React.ComponentProps<"h3">) => (
    <h3 className={cn("mt-4 mb-2 font-bold text-lg leading-tight first:mt-0 last:mb-0", className)} {...props} />
  ),
  h4: ({ className, ...props }: React.ComponentProps<"h4">) => (
    <h4 className={cn("mt-3 mb-1.5 font-bold text-base leading-tight first:mt-0 last:mb-0", className)} {...props} />
  ),
  p: ({ className, ...props }: React.ComponentProps<"p">) => (
    <p className={cn("my-2.5 leading-[1.8] tracking-[0.02em] first:mt-0 last:mb-0", className)} {...props} />
  ),
  a: ({ className, ...props }: React.ComponentProps<"a">) => (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className={cn("text-primary underline underline-offset-2 hover:text-primary/80", className)}
      {...props}
    />
  ),
  blockquote: ({ className, ...props }: React.ComponentProps<"blockquote">) => (
    <blockquote
      className={cn("my-3 border-border border-l-4 pl-4 text-muted-foreground", className)}
      {...props}
    />
  ),
  ul: ({ className, ...props }: React.ComponentProps<"ul">) => (
    <ul
      className={cn("my-2.5 ml-4 list-none [&>li]:relative [&>li]:mt-1.5 [&>li]:pl-4", className)}
      {...props}
    />
  ),
  ol: ({ className, ...props }: React.ComponentProps<"ol">) => (
    <ol className={cn("my-2.5 ml-4 list-decimal marker:text-muted-foreground [&>li]:mt-1.5 [&>li]:pl-1", className)} {...props} />
  ),
  hr: ({ className, ...props }: React.ComponentProps<"hr">) => (
    <hr className={cn("my-6 border-border border-dashed", className)} {...props} />
  ),
  table: ({ className, ...props }: React.ComponentProps<"table">) => (
    <div className="my-3 overflow-x-auto">
      <table
        className={cn("w-max max-w-full rounded-lg shadow-[0_0_0_1px_var(--color-border)]", className)}
        {...props}
      />
    </div>
  ),
  th: ({ className, ...props }: React.ComponentProps<"th">) => (
    <th
      className={cn(
        "min-w-[120px] bg-muted/50 px-4 py-3 text-left font-medium first:rounded-tl-lg last:rounded-tr-lg",
        className,
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }: React.ComponentProps<"td">) => (
    <td
      className={cn(
        "min-w-[120px] px-4 py-3 text-left shadow-[0_1px_0_var(--color-border)]",
        className,
      )}
      {...props}
    />
  ),
  tr: ({ className, ...props }: React.ComponentProps<"tr">) => (
    <tr
      className={cn(
        "[&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg [&:last-child>td]:shadow-none",
        className,
      )}
      {...props}
    />
  ),
  li: ({ className, ...props }: React.ComponentProps<"li">) => (
    <li
      className={cn(
        "leading-[1.8] before:absolute before:left-0 before:content-['-'] before:text-muted-foreground/50",
        className,
      )}
      {...props}
    />
  ),
  sup: ({ className, ...props }: React.ComponentProps<"sup">) => (
    <sup className={cn("[&>a]:text-xs [&>a]:no-underline", className)} {...props} />
  ),
  pre: ({ children, className, ...props }: React.ComponentProps<"pre">) => {
    let language = "";
    let codeText = "";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const child = children as any;
    if (child?.props?.className) {
      const match = /language-(\w+)/.exec(child.props.className);
      if (match) language = match[1]!;
    }
    if (child?.props?.children) {
      codeText = typeof child.props.children === "string" ? child.props.children : "";
    }

    const isPreviewable = /^(html?|jsx|tsx|react)$/i.test(language);

    if (isPreviewable && codeText) {
      return (
        <CodeBlockContext.Provider value={true}>
          <InlinePreview language={language} code={codeText} />
        </CodeBlockContext.Provider>
      );
    }

    return (
      <CodeBlockContext.Provider value={true}>
        <CodeHeader language={language}>{codeText}</CodeHeader>
        <pre
          className={cn(
            "overflow-x-auto rounded-t-none rounded-b-lg border border-border/50 border-t-0 bg-muted/30 p-3 font-mono text-xs leading-relaxed",
            className,
          )}
          {...props}
        >
          {children}
        </pre>
      </CodeBlockContext.Provider>
    );
  },
  code: function Code({ className, ...props }: React.ComponentProps<"code">) {
    const isCodeBlock = useIsCodeBlock();
    return (
      <code
        className={cn(
          !isCodeBlock &&
            "mx-1 rounded border border-border/50 bg-muted/50 px-1.5 py-0.5 font-mono text-[0.875em] leading-none",
          className,
        )}
        {...props}
      />
    );
  },
};

export const MarkdownText: FC<{ text: string; isStreaming?: boolean }> = memo(
  ({ text, isStreaming }) => (
    <div className={cn(isStreaming && "streaming-dot")}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {text}
      </ReactMarkdown>
    </div>
  ),
);
MarkdownText.displayName = "MarkdownText";
