import { Document, Page, pdfjs } from "react-pdf";
import { useState, useRef, useEffect } from "react";
import workerSrc from "pdfjs-dist/build/pdf.worker.min?url";

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

export default function PdfViewer({ file }) {
  const [numPages, setNumPages] = useState(null);
  const [width, setWidth] = useState(0);
  const [err, setErr] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const resize = () => {
      if (containerRef.current) setWidth(containerRef.current.offsetWidth);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    if (containerRef.current) setWidth(containerRef.current.offsetWidth);
    setErr(null);
    setNumPages(null);
  }, [file]);

  if (!file) return null;

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-y-auto overflow-x-hidden bg-white"
    >
      {err ? (
        <div className="p-5 text-center">
          <p className="font-oasis-text text-[1rem]">Failed to load PDF.</p>
          <p className="font-oasis-text text-[0.9rem] text-gray-600 break-all">
            {String(err)}
          </p>
        </div>
      ) : (
        <Document
          file={{ url: file }}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          onLoadError={(e) => setErr(e?.message || e)}
          loading={<div className="p-5 text-center">Loading PDF...</div>}
        >
          {numPages &&
            Array.from(new Array(numPages), (_, i) => (
              <Page
                key={i}
                pageNumber={i + 1}
                width={width}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="mx-auto"
              />
            ))}
        </Document>
      )}
    </div>
  );
}