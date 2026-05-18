import { useEffect } from "react";
import { ArrowUpRight, Download, X } from "lucide-react";
import { AnnounceButton } from "../button";
import Subtitle from "../../utilities/subtitle";
import { Link } from "react-router-dom";
import PdfViewer from "../../utilities/pdfViewer";

export function ViewModal({
    videoLink = "https://www.youtube.com/embed/ctyRKH4T_AY",
    visible,
    onClose,
    isVideo,
    isDocument,
    resourceTitle,
    file,
    filename: filenameProp
}) {

    useEffect(() => {
        if (typeof document === "undefined") return;
        document.body.style.overflow = visible ? "hidden" : "auto";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [visible]);

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-100 bg-black/70 flex items-start md:items-center justify-center p-3 md:p-6 overflow-y-auto">
            <div className="w-full max-w-6xl max-h-[95vh] rounded-3xl shadow-2xl flex flex-col animate__animated animate__fadeIn overflow-hidden">
                
                {/* HEADER */}
                <div className="sticky top-0 z-10 backdrop-blur-md p-3 md:p-5 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <section className="flex items-center gap-3">
                        <div className="p-2 rounded-full hover:bg-white/40 transition cursor-pointer">
                            <X size={28} color="white" onClick={onClose} />
                        </div>
                        <Subtitle text={resourceTitle} color="text-white" size="text-base sm:text-lg md:text-xl" />
                    </section>

                    <section className="flex flex-wrap justify-center gap-3">
                        {isVideo && (
                            <Link to="/home">
                                <AnnounceButton icon={<ArrowUpRight />} btnText="Go to page" />
                            </Link>
                        )}

                        {isDocument && (
                            <AnnounceButton
                                icon={<Download />}
                                btnText="Download MOA"
                                onClick={async () => {
                                    if (!file) return;
                                    try {
                                        const res = await fetch(file);
                                        if (!res.ok) throw new Error();
                                        const blob = await res.blob();
                                        const blobUrl = URL.createObjectURL(blob);
                                        const filename = filenameProp || "HTE_MOA.pdf";
                                        const a = document.createElement("a");
                                        a.href = blobUrl;
                                        a.download = filename;
                                        document.body.appendChild(a);
                                        a.click();
                                        a.remove();
                                        URL.revokeObjectURL(blobUrl);
                                    } catch {
                                        alert("Download failed.");
                                    }
                                }}
                            />
                        )}
                    </section>
                </div>

                {/* CONTENT AREA */}
                <div className="flex-1 overflow-y-auto p-4">
                    {isVideo && (
                        <div className="w-full max-w-4xl aspect-video rounded-2xl overflow-hidden bg-black mx-auto">
                            <iframe
                                className="w-full h-full"
                                src={videoLink}
                                title="video"
                                frameBorder="0"
                                allowFullScreen
                            />
                        </div>
                    )}
                    {isDocument && (
                        <div className="w-full max-w-5xl mx-auto rounded-2xl">
                            {visible && isDocument && (
                                <PdfViewer file={file}/>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
