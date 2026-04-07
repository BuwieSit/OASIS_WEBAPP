import { Document, Page, pdfjs } from "react-pdf";
import { useState, useRef, useEffect } from "react";
import workerSrc from "pdfjs-dist/build/pdf.worker.min?url";

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

export default function PdfViewer({ file }) {

  const [numPages, setNumPages] = useState(0);
  const [width, setWidth] = useState(0);
  const [err, setErr] = useState(null);

  const containerRef = useRef(null);
  const pageRefs = useRef([]);

  useEffect(() => {

    const resize = () => {
      if (containerRef.current)
        setWidth(containerRef.current.offsetWidth - 40);
    };

    resize();
    window.addEventListener("resize", resize);

    return () => window.removeEventListener("resize", resize);

  }, []);

  useEffect(() => {
    pageRefs.current = [];
  }, [file]);

  const scrollToPage = (pageIndex) => {
    const el = pageRefs.current[pageIndex];

    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  };

  if (!file) return null;

  return (
    <div className="flex w-full">

      {/* PAGE NAVIGATION SIDEBAR */}
      <div className="
        hidden md:flex
        flex-col w-40
        p-3 gap-2
        bg-oasis-header
        rounded-3xl
        sticky top-0
        self-start
        max-h-screen
        overflow-y-auto
      ">

        {Array.from({ length: numPages }, (_, i) => (
          <button
            key={i}
            className="
              text-sm p-2 rounded-lg
              hover:bg-oasis-button-light
              cursor-pointer transition
              text-center text-white w-full
            "
            onClick={() => scrollToPage(i)}
          >
            Page {i + 1}
          </button>
        ))}

      </div>

      {/* PDF DOCUMENT AREA */}
      <div ref={containerRef} className="flex-1 overflow-y-auto px-4">

        {err ? (
          <div className="p-5 text-center text-red-500">
            Failed to load PDF.
          </div>
        ) : (
          <Document
            file={{ url: file }}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            onLoadError={(e) => setErr(e?.message || e)}
          >

            {Array.from(new Array(numPages), (_, i) => (
              <div
                key={i}
                ref={el => pageRefs.current[i] = el}
                className="mb-8 flex justify-center"
              >
                <Page
                  pageNumber={i + 1}
                  width={width}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </div>
            ))}

          </Document>
        )}

      </div>
    </div>
  );
}