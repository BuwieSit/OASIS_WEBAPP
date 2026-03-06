import { useEffect, useState } from "react";
import { ArrowUpRight, Check, Download, X } from "lucide-react";
import { AnnounceButton } from "./button";
import Subtitle from "../utilities/subtitle";
import { Link } from "react-router-dom";
import PdfViewer from "../utilities/pdfViewer";

export function GeneralPopupModal({ 
    time = 5000, 
    onClose, 
    text, 
    title,
    icon = <Check/>,
    isSuccess = true,
    isFailed,
}) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            onClose?.(); 
        }, time);

        return () => clearTimeout(timer);
    }, [time, onClose]);

    if (!visible) return null;

    return (
        <div 
            className={`fixed top-0 translate-y-5 w-[30%] p-3 rounded-3xl flex flex-col items-center justify-center font-oasis-text font-bold text-[1.3rem] duration-300 transition ease-in-out z-100 
            ${isSuccess ? "text-oasis-button-dark drop-shadow-[0px_0px_2px_rgba(45,98,89,1)]" : "text-black"} 
            ${isFailed ? "text-oasis-red drop-shadow-[0px_0px_2px_rgba(128,0,32,1)]": "text-black "} 
        `}>
            <div className="bg-white rounded-t-2xl p-1 min-w-[100px] flex justify-center items-center">
                {icon}
            </div>
            <div className="bg-white rounded-2xl p-3 w-full flex flex-col justify-center items-center">
                <Subtitle text={title} size="text-[1rem]" weight="font-bold"/>
                <Subtitle text={text} size="text-[0.8rem]"/>
            </div>
            
        </div>

    );
}



export function ConfirmModal({ confText = "complete action?", onCancel, onLogOut, onConfirm}) {
    return (
        <>
            <div className="w-full h-screen fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-110 bg-[rgba(0,0,0,0.5)] pointer-events-none">
            
                <div 
                    className={`fixed top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-[30%] aspect-video p-10 backdrop-blur-2xl 
                    ${onConfirm ? "bg-page-white" : "bg-white"} 
                    border border-gray-300 rounded-3xl drop-shadow-lg flex flex-col items-center justify-center gap-5 font-oasis-text font-bold text-[1.3rem] duration-300 transition ease-in-out pointer-events-auto
                `}>

                    <Subtitle text={`Do you want to ${confText}`} size="text-[1rem]" weight="font-bold"/>
                    <div className="flex flex-row gap-3">
                        <AnnounceButton btnText="Confirm" onClick={onLogOut || onConfirm}/>
                        <AnnounceButton btnText="Cancel" onClick={onCancel}/>
                    </div>
                </div>
            </div>
        </>
    )
}



export function ViewModal({
    videoLink = "https://www.youtube.com/embed/ctyRKH4T_AY",
    visible,
    onClose,
    isVideo,
    isDocument,
    resourceTitle,
    file,
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
        <div className="
            fixed inset-0
            z-100
            bg-black/70
            flex
            items-start md:items-center
            justify-center
            p-3 md:p-6
            overflow-y-auto
        ">

            {/* Modal Container */}
            <div className="
                w-full
                max-w-6xl
                max-h-[95vh]
                rounded-3xl
                shadow-2xl
                flex flex-col
                animate__animated animate__fadeIn
                overflow-hidden
            ">

                {/* HEADER */}
                <div className="
                    sticky top-0 z-10
                    backdrop-blur-md
                    p-3 md:p-5
                    flex flex-col sm:flex-row
                    justify-between
                    items-center
                    gap-3
                ">

                    <section className="flex items-center gap-3">
                        <div
                            className="
                                p-2 rounded-full
                                hover:bg-white/40
                                transition cursor-pointer
                            "
                        >
                            <X size={28} color="white" onClick={onClose} />
                        </div>

                        <Subtitle
                            text={resourceTitle}
                            color="text-white"
                            size="text-base sm:text-lg md:text-xl"
                        />
                    </section>

                    {/* RIGHT ACTIONS */}
                    <section className="flex flex-wrap justify-center gap-3">

                        {isVideo && (
                            <Link to="/home">
                                <AnnounceButton
                                    icon={<ArrowUpRight />}
                                    btnText="Go to page"
                                />
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

                                        const filename =
                                            file.split("/").pop()?.split("?")[0] || "MOA.pdf";

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

                    {/* VIDEO */}
                    {isVideo && (
                        <div className="
                            w-full
                            max-w-4xl
                            aspect-video
                            rounded-2xl
                            overflow-hidden
                            bg-black
                        ">
                            <iframe
                                className="w-full h-full"
                                src={videoLink}
                                title="video"
                                frameBorder="0"
                                allowFullScreen
                            />
                        </div>
                    )}

                    {/* DOCUMENT */}
                    {isDocument && (
                        <div className="w-full max-w-5xl rounded-2xl overflow-hidden">

                            {visible && isDocument && (
                                <div className="flex justify-center items-center w-full aspect-auto overflow-y-auto ">
                                    <PdfViewer file={file}/>
                                </div>
                            )}
                        </div>
                    )}

                </div>

            </div>
        </div>
    );
}
