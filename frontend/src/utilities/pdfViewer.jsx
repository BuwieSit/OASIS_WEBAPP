import { Document, Page } from "react-pdf";
import { useState, useRef, useEffect } from "react";
import { pdfjs } from "react-pdf";
import workerSrc from "pdfjs-dist/build/pdf.worker.min?url";

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
export default function PdfViewer({ file }) {
  const [numPages, setNumPages] = useState(null);
  const [width, setWidth] = useState(0);
  const containerRef = useRef(null);

    useEffect(() => {
      const resize = () => {
        if (containerRef.current) setWidth(containerRef.current.offsetWidth);
      };

      resize(); // initial
      window.addEventListener("resize", resize);
      return () => window.removeEventListener("resize", resize);
    }, []);

    //listen to modal opening to trigger width recalculation

    useEffect(() => {
      if (containerRef.current) setWidth(containerRef.current.offsetWidth);
    }, [file]); //recalculate width if file changes


  return (
    <div ref={containerRef} className="w-full h-full overflow-y-auto overflow-x-hidden bg-white">
      <Document
        file={file}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
      >
        {Array.from(new Array(numPages), (_, i) => (
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
    </div>
  );
}
