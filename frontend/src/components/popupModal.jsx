import { useEffect, useState } from "react";
import { CheckIcon } from "../utilities/animatedIcons";
import { ArrowUpRight, CircleX, Download, X } from "lucide-react";
import { AnnounceButton } from "./button";
import Subtitle from "../utilities/subtitle";
import PdfViewer from "../utilities/pdfViewer";

export function ConfirmModal({ time = 2000, onClose }) {
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
        <div className="z-120 fixed inset-0 bg-[rgba(0,0,0,0.3)] flex items-center justify-center">
            <div className="w-100 h-50 p-5 bg-white rounded-3xl drop-shadow-lg flex flex-col items-center justify-center gap-5 font-oasis-text font-bold text-[1.3rem] duration-700 transition ease-in-out">
                <CheckIcon />
                <p>Done</p>
            </div>
        </div>
    );
}

export function ViewModal({ 
    videoLink = "https://www.youtube.com/embed/BhNSauna0eo?si=nPWjtw7Her6y6pFv", 
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
                        <section className="z-50 w-50 p-2 flex flex-row justify-center items-center gap-5  rounded-4xl">
                            <AnnounceButton icon={<ArrowUpRight/>} btnText="Go to page" />
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
