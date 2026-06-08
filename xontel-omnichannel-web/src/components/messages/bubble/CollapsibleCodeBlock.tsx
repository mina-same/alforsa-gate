import React, { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CollapsibleCodeBlockProps {
    raw: string;
    detectedLanguage: string;
    normalizedLanguage: string;
    isDarkMode: boolean;
    expanded: boolean;
    onToggleExpanded: () => void;
}

export default function CollapsibleCodeBlock({
    raw,
    detectedLanguage,
    normalizedLanguage,
    isDarkMode,
    expanded,
    onToggleExpanded,
}: CollapsibleCodeBlockProps) {
    const CODE_COLLAPSE_THRESHOLD_LINES = 30;
    const CODE_COLLAPSED_PREVIEW_LINES = 10;
    const [copied, setCopied] = useState(false);

    const lines = raw.split("\n");
    const isLong = lines.length > CODE_COLLAPSE_THRESHOLD_LINES;
    const displayRaw = !isLong || expanded
        ? raw
        : lines.slice(0, CODE_COLLAPSED_PREVIEW_LINES).join("\n");

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(raw);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1000);
        } catch {
            // ignore
        }
    };

    return (
        <div className="my-2 rounded-lg overflow-hidden border border-black/10 dark:border-white/10 bg-white dark:bg-[#0b1020]">
            <div className="flex items-center justify-between gap-2 px-3 py-1 text-[11px] bg-black/5 dark:bg-white/5">
                <span className="uppercase tracking-wide opacity-70">
                    {detectedLanguage}
                </span>
                <div className="flex items-center gap-2">
                    {isLong && (
                        <button
                            type="button"
                            onClick={onToggleExpanded}
                            className="text-[11px] px-2 py-0.5 rounded border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5"
                        >
                            {expanded ? "Show less" : "Show more"}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handleCopy}
                        className="inline-flex items-center gap-4 text-[11px] px-2 py-0.5 rounded border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5"
                    >
                        {copied ? (
                            <>
                                <Check className="h-3 w-3" />
                                <span>Copied</span>
                            </>
                        ) : (
                            <Copy className="h-3 w-3" />
                        )}
                    </button>
                </div>
            </div>
            <div
                className={`xon-scrollbar overflow-auto ${expanded ? "max-h-[420px]" : "max-h-[320px]"}`}
            >
                <SyntaxHighlighter
                    language={normalizedLanguage}
                    style={isDarkMode ? oneDark : oneLight}
                    showLineNumbers
                    wrapLongLines
                    customStyle={{
                        margin: 0,
                        background: "transparent",
                        padding: "12px",
                        fontSize: "12px",
                        lineHeight: 1.5,
                        overflow: "visible",
                    }}
                    lineNumberStyle={{
                        opacity: 0.5,
                        paddingRight: "12px",
                        minWidth: "2.5em",
                    }}
                >
                    {displayRaw}
                </SyntaxHighlighter>
            </div>
        </div>
    );
}
