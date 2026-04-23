import { useEffect, useState } from "react";
import { ArrowUpRight, Check, Download, X, Star } from "lucide-react";
import { AnnounceButton } from "./button";
import Subtitle from "../utilities/subtitle";
import { Link } from "react-router-dom";
import PdfViewer from "../utilities/pdfViewer";

export function GeneralPopupModal({ 
    time = 2000, 
    onClose, 
    text, 
    title,
    icon = <Check size={35}/>,
    isSuccess,
    isFailed,
    isNeutral = true
}) {
    const [visible, setVisible] = useState(true);
    const [isExiting, setIsExiting] = useState(false);
    const exitDuration = 500; 

    useEffect(() => {
        const exitTimer = setTimeout(() => {
            setIsExiting(true);
        }, time - exitDuration);

        const removeTimer = setTimeout(() => {
            setVisible(false);
            onClose?.();
        }, time);

        return () => {
            clearTimeout(exitTimer);
            clearTimeout(removeTimer);
        };
    }, [time, onClose]);

    if (!visible) return null;

    return (
        <div className={`animate__animated animate__faster ${isExiting ? "animate__fadeOutUp" : "animate__fadeInDown"} fixed top-0 translate-y-5 min-w-[30%] p-3 pl-5 rounded-[5px] flex items-center justify-center font-oasis-text font-bold duration-300 transition ease-in-out z-100 border bg-white
            ${isSuccess && "text-oasis-button-dark border-oasis-button-dark"}
            ${isFailed && "text-oasis-red border-oasis-red"} 
            ${isNeutral && "text-[#36454F] border-gray-400"}
        `}>
            {icon}
            <div className="rounded-2xl p-3 w-full flex flex-col justify-center items-start">
                <Subtitle text={title} size="text-[1.3rem]" weight="font-bold"/>
                <Subtitle color={"text-black"} text={text} size="text-[0.8rem]"/>
            </div>
        </div>

    );
}


export function ConfirmModal({ confText = "complete action?", onCancel, onLogOut, onConfirm}) {
    return (
        <>
            <div className="w-full h-screen fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-110 bg-[rgba(0,0,0,0.5)] pointer-events-none">
            
                <div 
                    className={`fixed top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-[min(25rem,90vw)] p-10 backdrop-blur-2xl 
                    ${onConfirm ? "bg-page-white" : "bg-white"} 
                    border border-gray-300 rounded-3xl drop-shadow-lg flex flex-col items-center justify-center gap-5 font-oasis-text font-bold text-[1.3rem] duration-300 transition ease-in-out pointer-events-auto
                `}>

                    <Subtitle text={`Do you want to ${confText}`} size="text-[1rem]" weight="font-bold" isCenter={true}/>
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

export function ReviewDetailModal({ review, visible, onClose, hteName }) {
    useEffect(() => {
        if (typeof document === "undefined") return;
        document.body.style.overflow = visible ? "hidden" : "auto";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [visible]);

    if (!visible || !review) return null;

    return (
        <div 
            className="fixed inset-0 z-110 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate__animated animate__fadeIn"
            onClick={onClose}
        >
            <div 
                className="bg-white w-full max-w-2xl max-h-[80vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* CLOSE BUTTON */}
                <button 
                    onClick={onClose}
                    className="absolute top-5 right-5 z-10 p-2 bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-500 rounded-full transition-all"
                >
                    <X size={20} />
                </button>

                {/* HEADER */}
                <div className="p-8 bg-oasis-gradient flex flex-col gap-2 border-b border-gray-100">
                    <Subtitle text={hteName || "HTE Review"} weight="font-bold" size="text-xl" />
                    <div className="flex items-center gap-3">
                         <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    size={18}
                                    color={review.rating >= star ? "#EAB308" : "#D1D5DB"}
                                    fill={review.rating >= star ? "#EAB308" : "none"}
                                />
                            ))}
                        </div>
                        <span className="text-sm font-bold text-gray-500 bg-white/50 px-3 py-1 rounded-full uppercase tracking-wider">
                            {review.rating}.0 Rating
                        </span>
                    </div>
                </div>

                {/* MESSAGE AREA */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-gray-50/30">
                    <p className="text-gray-700 leading-relaxed text-lg font-oasis-text italic whitespace-pre-wrap">
                        "{review.message}"
                    </p>
                </div>

                {/* FOOTER */}
                <div className="p-6 bg-white border-t border-gray-100 flex justify-between items-center">
                    <div className="flex flex-col">
                        <Subtitle text={review.reviewer || "Anonymous"} weight="font-bold" size="text-sm" />
                        <p className="text-xs text-gray-400 font-medium">
                            {review.criteria || "IT Intern"} • {new Date(review.created_at).toLocaleDateString()}
                        </p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 bg-oasis-button-dark text-white rounded-xl font-bold text-sm hover:bg-oasis-header transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
