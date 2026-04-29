import { useEffect } from "react";
import { X, MapPin, Building2, Briefcase, User, Phone, Mail, Globe } from "lucide-react";
import Subtitle from "../utilities/subtitle";

export default function HteDetailModal({ hte, visible, onClose }) {
    useEffect(() => {
        if (typeof document === "undefined") return;
        document.body.style.overflow = visible ? "hidden" : "auto";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [visible]);

    if (!visible || !hte) return null;

    const googleMapsEmbedUrl = hte.address 
        ? `https://www.google.com/maps?q=${encodeURIComponent(hte.address)}&output=embed`
        : null;

    return (
        <div className="fixed inset-0 z-110 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate__animated animate__fadeIn">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative">
                
                {/* CLOSE BUTTON */}
                <button 
                    onClick={onClose}
                    className="absolute top-5 right-5 z-10 p-2 bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-500 rounded-full transition-all"
                >
                    <X size={24} />
                </button>

                {/* HEADER */}
                <div className="p-8 bg-oasis-gradient flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <Building2 className="text-oasis-button-dark" size={32} />
                        <h2 className="text-2xl md:text-3xl font-black text-gray-800 font-oasis-text">
                            {hte.company_name}
                        </h2>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-2">
                        <div className="flex items-center gap-1.5 text-oasis-button-dark bg-white/50 px-3 py-1 rounded-full text-sm font-bold">
                            <Briefcase size={16} />
                            {hte.industry || "N/A"}
                        </div>
                        {hte.website && (
                            <a 
                                href={hte.website.startsWith('http') ? hte.website : `https://${hte.website}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-blue-600 bg-white/50 px-3 py-1 rounded-full text-sm font-bold hover:bg-white transition-all"
                            >
                                <Globe size={16} />
                                Website
                            </a>
                        )}
                    </div>
                </div>

                {/* CONTENT AREA */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        
                        {/* LEFT: DETAILS */}
                        <div className="space-y-8 font-oasis-text">
                            
                            <section>
                                <div className="flex items-center gap-2 mb-4 border-b pb-2 border-gray-100">
                                    <MapPin className="text-oasis-header" size={20} />
                                    <p className="font-bold text-gray-800 uppercase tracking-widest text-xs">Location & Address</p>
                                </div>
                                <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    {hte.address || "No address provided."}
                                </p>
                            </section>

                            <section>
                                <div className="flex items-center gap-2 mb-4 border-b pb-2 border-gray-100">
                                    <User className="text-oasis-header" size={20} />
                                    <p className="font-bold text-gray-800 uppercase tracking-widest text-xs">Contact Information</p>
                                </div>
                                <div className="bg-oasis-blue/10 p-5 rounded-2xl border border-oasis-blue/20 space-y-4">
                                    <div className="flex flex-col">
                                        <span className="text-[0.65rem] text-oasis-icons font-black uppercase">Contact Person</span>
                                        <span className="font-bold text-gray-800">{hte.contact_person || "—"}</span>
                                        <span className="text-xs text-gray-500 italic">{hte.contact_position || ""}</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-white rounded-lg text-oasis-header"><Phone size={14} /></div>
                                            <span className="text-sm font-medium text-gray-700">{hte.contact_number || "—"}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-white rounded-lg text-oasis-header"><Mail size={14} /></div>
                                            <span className="text-sm font-medium text-gray-700 break-all">{hte.contact_email || "—"}</span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {hte.description && (
                                <section>
                                    <div className="flex items-center gap-2 mb-4 border-b pb-2 border-gray-100">
                                        <Subtitle text="About the Company" weight="font-bold" className="uppercase tracking-widest text-xs" />
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed italic">
                                        "{hte.description}"
                                    </p>
                                </section>
                            )}
                        </div>

                        {/* RIGHT: GOOGLE MAP */}
                        <div className="flex flex-col h-full min-h-[300px] lg:min-h-full">
                             <div className="flex items-center gap-2 mb-4 border-b pb-2 border-gray-100">
                                <MapPin className="text-oasis-header" size={20} />
                                <p className="font-bold text-gray-800 uppercase tracking-widest text-xs">Map Location</p>
                            </div>
                            <div className="flex-1 w-full rounded-3xl overflow-hidden border-4 border-gray-100 shadow-inner bg-gray-50 flex items-center justify-center relative min-h-[350px]">
                                {googleMapsEmbedUrl ? (
                                    <iframe
                                        className="w-full h-full border-0"
                                        src={googleMapsEmbedUrl}
                                        loading="lazy"
                                        allowFullScreen
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title={`Map of ${hte.company_name}`}
                                    />
                                ) : (
                                    <div className="flex flex-col items-center gap-3 text-gray-400 p-10 text-center">
                                        <MapPin size={48} className="opacity-20" />
                                        <p className="font-oasis-text italic">Invalid or missing location data. Map cannot be displayed.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

                {/* FOOTER */}
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end items-center gap-4">
                     <p className="text-[0.65rem] text-gray-400 font-medium italic">HTE Record Details • OASIS Admin System</p>
                     <button 
                        onClick={onClose}
                        className="px-8 py-2 bg-gray-800 text-white rounded-xl font-bold text-sm hover:bg-gray-700 transition-all"
                     >
                        Close
                     </button>
                </div>

            </div>
        </div>
    );
}
