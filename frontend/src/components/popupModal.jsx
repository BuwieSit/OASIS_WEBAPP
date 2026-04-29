import { useEffect, useState } from "react";
import { ArrowUpRight, Check, Download, X, Star, User, ShieldCheck, MailQuestionMark } from "lucide-react";
import { AnnounceButton } from "./button";
import Subtitle from "../utilities/subtitle";
import { Link } from "react-router-dom";
import PdfViewer from "../utilities/pdfViewer";

export function GeneralPopupModal({ 
    time = 3000, 
    onClose, 
    text, 
    title,
    icon,
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

    // Default icons if none provided
    const defaultIcon = isSuccess ? <Check size={28}/> : (isFailed ? <X size={28}/> : <ShieldCheck size={28}/>);
    const finalIcon = icon || defaultIcon;

    return (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-300 w-full max-w-sm px-4 pointer-events-none">
            <div 
                className={`
                    animate__animated animate__faster 
                    ${isExiting ? "animate__fadeOutUp" : "animate__fadeInDown"}
                    w-full bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.12)]
                    rounded-2xl flex flex-col overflow-hidden pointer-events-auto
                `}
            >
                <div className="p-4 flex items-center gap-4">
                    <div className={`
                        p-2.5 rounded-xl shrink-0
                        ${isSuccess ? "bg-green-100 text-green-600" : ""}
                        ${isFailed ? "bg-red-100 text-red-600" : ""}
                        ${isNeutral ? "bg-oasis-aqua/10 text-oasis-aqua" : ""}
                    `}>
                        {finalIcon}
                    </div>
                    
                    <div className="flex flex-col min-w-0">
                        <h4 className="font-oasis-text font-bold text-oasis-header text-sm truncate">
                            {title}
                        </h4>
                        <p className="font-oasis-text text-gray-500 text-xs leading-relaxed">
                            {text}
                        </p>
                    </div>

                    <button 
                        onClick={() => setIsExiting(true)}
                        className="ml-auto p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1 bg-gray-100/50">
                    <div 
                        className={`
                            h-full transition-all ease-linear
                            ${isSuccess ? "bg-green-500" : ""}
                            ${isFailed ? "bg-red-500" : ""}
                            ${isNeutral ? "bg-oasis-aqua" : ""}
                        `}
                        style={{ 
                            width: isExiting ? "0%" : "100%",
                            transitionDuration: `${time}ms`
                        }}
                    />
                </div>
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
                        <Subtitle text={review.criteria === "Anonymous" ? "Anonymous" : (review.reviewer || "Anonymous")} weight="font-bold" size="text-sm" />
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

/**
 * SetupProfileModal
 * Reusable modal to prompt students to complete their profile setup.
 */
export function SetupProfileModal({ visible, onGoToProfile }) {
    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-200 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate__animated animate__fadeIn">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col p-8 items-center text-center relative animate__animated animate__zoomIn animate__faster">
                
                {/* ICON / VISUAL */}
                <div className="w-20 h-20 bg-oasis-blue/20 rounded-full flex items-center justify-center mb-6 text-oasis-header">
                    <User size={40} />
                </div>

                <h2 className="text-2xl font-black text-gray-800 font-oasis-text mb-2 leading-tight">
                    Complete Your Profile!
                </h2>
                
                <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-8">
                    Welcome to OASIS! To get started, please set your <span className="font-bold text-oasis-header">First Name, Middle Initial, and Last Name</span> in your profile settings. This is required for official document generation.
                </p>

                <div className="w-full flex flex-col gap-3">
                    <button 
                        onClick={onGoToProfile}
                        className="w-full py-4 bg-oasis-header text-white rounded-2xl font-bold text-lg hover:bg-oasis-button-dark transition-all shadow-xl shadow-oasis-header/20 active:scale-95 flex items-center justify-center gap-2 group"
                    >
                        Go to Profile Settings
                        <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"/>
                    </button>
                </div>

                <div className="mt-6 flex items-center gap-2 text-gray-400">
                    <ShieldCheck size={16} />
                    <span className="text-[0.65rem] font-black uppercase tracking-widest">Secured Student Portal</span>
                </div>
                <div className="mt-6 flex items-center gap-2 text-gray-400">
                    <MailQuestionMark size={16} />
                    <span className="text-[0.5rem] font-black uppercase tracking-widest">For questions: oasiskomunidevs@gmail.com</span>
                </div>
            </div>
        </div>
    );
}

export function InactivityModal({ onStayActive, onLogout }) {
    return (
        <div className="fixed inset-0 z-500 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate__animated animate__fadeIn">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col p-10 items-center text-center relative animate__animated animate__zoomIn animate__faster border border-gray-100">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 text-red-500 animate-pulse">
                    <ShieldCheck size={40} />
                </div>

                <h2 className="text-2xl font-black text-gray-800 font-oasis-text mb-2 leading-tight">
                    Inactivity Warning
                </h2>
                
                <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-8 italic">
                    You have been inactive for quite some time. For security reasons, you will be automatically logged out after <span className="font-bold text-red-500">15 minutes</span> of inactivity.
                </p>

                <div className="w-full flex flex-col gap-3">
                    <button 
                        onClick={onStayActive}
                        className="w-full py-4 bg-oasis-header text-white rounded-2xl font-bold text-lg hover:bg-oasis-button-dark transition-all shadow-xl shadow-oasis-header/20 active:scale-95"
                    >
                        Confirm or I'm Active
                    </button>
                    <button 
                        onClick={onLogout}
                        className="w-full py-3 text-gray-400 font-bold hover:text-red-500 transition-all text-sm"
                    >
                        Logout Now
                    </button>
                </div>

                <p className="mt-6 text-[10px] text-gray-400 uppercase font-black tracking-widest">
                    OASIS Session Security
                </p>
            </div>
        </div>
    );
}

