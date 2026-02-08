import { useEffect, useState } from "react";
import { ArrowUpRight, Check, CircleX, Download, X } from "lucide-react";
import { AnnounceButton } from "./button";
import Subtitle from "../utilities/subtitle";
import PdfViewer from "../utilities/pdfViewer";
import { Link } from "react-router-dom";

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
        <div className={`fixed top-0 right-0 translate-y-5 -translate-x-[3%] w-[30%] p-3 backdrop-blur-2xl bg-[rgba(255,255,255,1)] border  
        ${isSuccess ? "text-oasis-button-dark border-oasis-button-dark" : "text-black border-gray-400"} 
        ${isFailed ? "text-red-600 border-red-600": "text-black border-gray-400"} 
        rounded-3xl drop-shadow-lg flex flex-col items-center justify-center gap-5 font-oasis-text font-bold text-[1.3rem] duration-300 transition ease-in-out z-100`}>
            {icon}
            <Subtitle text={title} size="text-[1rem]" weight="font-bold"/>
            <Subtitle text={text} size="text-[0.8rem]"/>
        </div>

    );
}

export function ConfirmModal({ confText = "complete action?", onCancel, onLogOut}) {
    return (
        <>
            <div className="w-full h-screen fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-110 bg-[rgba(0,0,0,0.5)] pointer-events-none">
            
                <div className={`fixed top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-[30%] aspect-video p-3 backdrop-blur-2xl bg-white border border-gray-300 rounded-3xl drop-shadow-lg flex flex-col items-center justify-center gap-5 font-oasis-text font-bold text-[1.3rem] duration-300 transition ease-in-out pointer-events-auto`}>
                    <Subtitle text={`Do you want to ${confText}`} size="text-[1rem]" weight="font-bold"/>
                    <div className="flex flex-row gap-3">
                        <AnnounceButton btnText="Confirm" onClick={onLogOut}/>
                        <AnnounceButton btnText="Cancel" onClick={onCancel}/>
                    </div>
                </div>
            </div>
        </>
    )
}

export function ViewModal({ 
    videoLink = "https://www.youtube.com/embed/ctyRKH4T_AY?si=Stqm7esXNJ6rKVlp", 
    visible,
    onClose,
    isVideo,
    isDocument,
    resourceTitle,
    file,
}) {

    useEffect(() => {
        if (typeof document === "undefined") return;

        if (visible) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        return () => {
            document.body.style.overflow = "auto";
        };
    }, [visible]);

    if (!visible) return null;
    
    return (
        <>
        {/* BLACK BG */}
            <div className="w-full h-screen p-5 flex flex-col justify-start gap-5 items-center bg-[rgba(0,0,0,.6)] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-150 overflow-y-auto">
                <div className="w-full rounded-3xl p-2 sticky top-0 z-10 flex flex-row justify-between items-center">
                    {/* LEFT */}
                    <section className="z-50 flex flex-row justify-center items-center gap-5 rounded-4xl">
                        <div className="p-2 rounded-full transition-all duration-100 ease-in-out cursor-pointer hover:bg-[rgba(255,255,255,0.5)] hover:shadow-[2px_2px_10px_rgba(0,0,0,0.5)]">
                            <X size={30} color="white" onClick={onClose}/>
                        </div>
                       <Subtitle text={resourceTitle} color={"text-white"} size="text-[1.2rem]"/>
                    </section>
                        
                    {/* RIGHT */}
                    {isVideo && 
                        <section className="z-50  p-2 flex flex-row justify-center items-center gap-5  rounded-4xl">
                            <Link to={"/home"}>
                                <AnnounceButton icon={<ArrowUpRight/>} btnText="Go to page" />
                            </Link>
                            
                        </section>
                    }
                    
                    {isDocument && 
                        <section className="z-50 w-50 p-2 flex flex-row justify-center items-center gap-5  rounded-4xl">
                            <AnnounceButton icon={<Download/>} btnText="Download MOA" />
                        </section>
                    }
                </div>
              
                {/* MAIN CONTAINER */}
                {isVideo && 
                    <div className="relative w-[60%] aspect-video bg-oasis-gradient">
                        <iframe className="w-full h-full" src={videoLink} title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                    </div>
                }

                {isDocument && 
                    <div className="relative min-w-[70%] max-w-[80%] bg-oasis-gradient">
                        <PdfViewer file={file}/>
                    </div>
                }

            </div>
        </>
    )
}
