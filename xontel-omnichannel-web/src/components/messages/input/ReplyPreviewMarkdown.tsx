import React from "react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function ReplyPreviewMarkdown({
  text,
  isDarkMode,
}: {
  text: string;
  isDarkMode: boolean;
}) {
  return (
    <div className="text-xs text-foreground/70 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }: { children?: React.ReactNode }) => (
            <p className="m-0 whitespace-pre-wrap">{children}</p>
          ),
          pre: ({ children }: any) => {
            if (React.isValidElement(children)) {
              return React.cloneElement(children as React.ReactElement<any>, { isBlock: true });
            }
            return <>{children}</>;
          },
          code: ({
            className,
            children,
            ...props
          }: any) => {
            const inline = !props.isBlock;

            if (inline) {
              return (
                <code className="px-1 py-0.5 rounded bg-black/10 dark:bg-white/10">
                  {children}
                </code>
              );
            }

            const raw = String(children ?? "").replace(/\n$/, "");
            const match = /language-([\w-]+)/.exec(className || "");
            const detected = (match?.[1] || "text").toLowerCase();
            const normalizedLanguage =
              detected === "ts"
                ? "typescript"
                : detected === "js"
                  ? "javascript"
                  : detected;

            return (
              <div className="my-2 rounded-lg overflow-hidden border border-black/10 dark:border-white/10 bg-white dark:bg-[#0b1020]">
                <SyntaxHighlighter
                  language={normalizedLanguage}
                  style={isDarkMode ? oneDark : oneLight}
                  wrapLongLines
                  customStyle={{
                    margin: 0,
                    background: "transparent",
                    padding: "10px",
                    fontSize: "11px",
                    lineHeight: 1.5,
                    overflow: "visible",
                  }}
                >
                  {raw}
                </SyntaxHighlighter>
              </div>
            );
          },
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
