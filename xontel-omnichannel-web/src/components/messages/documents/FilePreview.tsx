import { useEffect, useRef, useState } from "react";
import { renderAsync } from "docx-preview";

import { getFileIcon } from "@/utils/getFileIcon";

import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export default function FilePreview({ file }: { file: File }) {
  const docxRef = useRef<HTMLDivElement>(null);

  const type = file.type;
  const name = file.name.toLowerCase();
  const url = URL.createObjectURL(file);

  const pdfCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pdfPagesCount, setPdfPagesCount] = useState<number | null>(null);

  const formatBytes = (bytes: number) => {
    if (!Number.isFinite(bytes) || bytes <= 0) return "";
    const kb = bytes / 1024;
    if (kb < 1024) return `${Math.round(kb)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(mb >= 10 ? 0 : 1)} MB`;
  };

  const ext = (() => {
    const n = String(file.name || "").trim();
    const dot = n.lastIndexOf(".");
    if (dot === -1) return "";
    return n.slice(dot + 1).toLowerCase();
  })();

  const isPdf = type === "application/pdf" || name.endsWith(".pdf") || ext === "pdf";

  useEffect(() => {
    if (!isPdf) return;

    let cancelled = false;

    const run = async () => {
      try {
        const task = getDocument(url);
        const doc = await task.promise;
        if (cancelled) return;
        setPdfPagesCount(doc.numPages);

        const page = await doc.getPage(1);
        if (cancelled) return;

        const canvas = pdfCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const viewport = page.getViewport({ scale: 1 });
        const targetWidth = 520;
        const scale = viewport.width ? targetWidth / viewport.width : 1;
        const scaledViewport = page.getViewport({ scale });

        canvas.width = Math.floor(scaledViewport.width);
        canvas.height = Math.floor(scaledViewport.height);

        await page.render({ canvasContext: ctx, viewport: scaledViewport, canvas }).promise;
      } catch {
        if (cancelled) return;
        setPdfPagesCount(null);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [isPdf, url]);

  // DOCX preview
  useEffect(() => {
    if (
      (type.includes("word") ||
        name.endsWith(".docx") ||
        name.endsWith(".doc")) &&
      docxRef.current
    ) {
      renderAsync(file, docxRef.current, undefined, { inWrapper: false });
    }
  }, [file, type, name]);

  const icon = getFileIcon(file.type, file.name, "w-6 h-6");


  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {isPdf ? (
        <div className="w-full rounded-xl overflow-hidden border border-border bg-muted/30">
          <div className="bg-xon-surface-gray/40">
            <div className="w-full max-h-[300px] overflow-hidden flex items-center justify-center">
              <canvas ref={pdfCanvasRef} className="w-full h-auto" />
            </div>
          </div>

          <div className="px-4 py-3 flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-sm shrink-0">PDF</div>

            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-foreground/90 truncate">{file.name}</div>
              <div className="text-xs text-muted-foreground mt-1 truncate">
                {[
                  pdfPagesCount ? `${pdfPagesCount} page${pdfPagesCount === 1 ? "" : "s"}` : "",
                  formatBytes(file.size),
                  ext || "pdf",
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </div>
            </div>

            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-xon-primary hover:underline shrink-0"
            >
              Preview
            </a>
          </div>
        </div>
      ) : (
        <>
          {/* PREVIEW AREA */}
          <div className=" max-h-[250px] overflow-hidden rounded">
            {/* PDF */}
            {/* {type === "application/pdf" && (
          <iframe src={url} className="w-full h-[250px] rounded" />
        )} */}

            {/* IMAGE + SVG */}
            {/* {(type.startsWith("image/") || name.endsWith(".svg")) && (
          <img
            src={url}
            className="w-full h-[250px] object-contain rounded"
          />
        )} */}

            {/* VIDEO */}
            {/* {type.startsWith("video/") && (
          <video
            src={url}
            controls
            className="w-full max-h-[250px] rounded"
          />
        )} */}

            {/* AUDIO */}
            {/* {type.startsWith("audio/") && (
          <audio src={url} controls className="w-full" />
        )} */}
          </div>

          {/* ICON + FILENAME */}
          <div className="flex items-center gap-2  ">
            {icon}
            {/* <p className="text-xs text-gray-700">
          {file.name}
        </p> */}
          </div>
        </>
      )}
    </div>
  );
}
