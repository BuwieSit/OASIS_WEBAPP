import { ArchiveRestore, CircleX, PencilIcon } from "lucide-react";
import { AnnounceButton } from "../components/button";
import Subtitle from "./subtitle";

export function Text({ text, isGray, className = "" }) {
    return(
        <div className="flex justify-center items-center w-full">
            <p 
                title={text}
                className={`font-oasis-text text-table-text-size line-clamp-1 leading-tight ${isGray ? "italic text-gray-500" : "text-oasis-button-dark"} ${className}`}
            >
                {text}
            </p>
        </div>
    )
}

export function DateTime({ date, time}) {
    return(
        <>
            <div className="">
                <Subtitle text={date}/>
                <Subtitle text={time}/>
            </div>
        </>      
    )
}

export function SignedExpiryDate({ signedDate, mode }) {
    if (!signedDate) return <Subtitle text="—" />;

    const signed = new Date(signedDate);

    if (isNaN(signed)) {
        return <Subtitle text="Invalid date" />;
    }

    const expiry = new Date(signed);
    expiry.setFullYear(expiry.getFullYear() + 3);

    const format = date =>
        date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });

    if (mode === "signed") {
        return <Subtitle text={format(signed)} size="text-[1rem]"/>;
    }

    if (mode === "expiry") {
        return <Subtitle text={format(expiry)} size="text-[1rem]"/>;
    }

    return null;
}

export function StatusDots({color = "oasis-blue"}) {
    return (
        <>  
        <div className={`rounded-full w-5 aspect-square bg-${color} z-50 cursor-pointer`}/>
        </>
    )
}
export function StatusDropdown({ value, onChange }) {
    
    return (
        <>
            <div id="status" className="relative p-3 bg-oasis-button-dark rounded-3xl w-[80%] m-auto group">
                <Subtitle text={"Active"} isCenter={true} size="text-[0.8]" color={"text-white"} className={"cursor-pointer"}/>
                
                {/* popup */}
                <div className="absolute top-0 mt-2 left-1/2 -translate-x-1/2 -translate-y-15 p-2 round ed-3xl max-h-10 opacity-0 group-hover:opacity-100 transition duration-200 ease-in-out">
                    {/* bar wrapper */}
                    <div className="max-w-100 relative bg-oasis-blue shadow-[0px_2px_10px_rgba(0,0,0,0.5)] px-4 py-2 flex gap-5 items-center rounded-full overflow-hidden flex-row">
                        {/* dots */}
                        
                        <StatusDots color="gray-400"/>
                        <StatusDots color="oasis-button-dark"/>
                        <StatusDots color="oasis-button-dark"/>
                        <StatusDots color="oasis-button-dark"/>
                        <StatusDots color="oasis-button-dark"/>
                        <StatusDots color="oasis-button-dark"/>
                        <StatusDots color="oasis-button-dark"/>
                        {/* bar */}

                        <div className="absolute left-0 -translate-x-1/2 bg-black p-1 w-[20%] rounded-full transition-[width] duration-700 ease-out"/>
                    </div>
                </div>
            </div>
        </>
    )
}


export function StatusView({ value }) {
    const text = value?.toLowerCase();
    const statusClasses = {
        active: "bg-oasis-button-light text-white",
        pending: "bg-amber-400 text-white",
        expired: "bg-red-400 text-white",
        rejected: "bg-gray-400 text-white",
    };

    const colorClass = statusClasses[text] ?? "bg-gray-200 text-black";

    return(
        <>
            {/* Status: Active, Pending, Expired, Rejected*/}
            <div className={`w-[80%] m-auto px-2 py-1.5 rounded-3xl flex justify-center items-center ${colorClass}`}>
                <Subtitle text={value} weight={"font-bold"} size={"text-[0.9rem]"}/>
            </div>
        </>      
    )
}

export function ActionButtons({ onEdit, onArchive, onReject}) {
    return(
        <>
            {/* Actions, these are icons with Edit, Archive, Delete. */}
            <div className="flex justify-center gap-3">
                <button className="cursor-pointer" onClick={onEdit}><PencilIcon color="#2B6259"/></button>
                <button className="cursor-pointer" onClick={onArchive}><ArchiveRestore color="#2B6259"/></button>
                {onReject ? <button className="cursor-pointer" onClick={onReject}><CircleX color="#2B6259"/></button> : ""}
                
            </div>
            {/* Tooltip */}
            <div>
                
            </div>
        </>      
    )
}

export function AdviserDropdown({ value, options = [], onChange }) {
    return (
        <select
            className="px-3 py-2 rounded-lg border text-sm"
            value={value || ""}
            onChange={(e) => onChange?.(Number(e.target.value))}
        >
            <option value="" disabled>
                Select adviser
            </option>

            {options.map(adviser => (
                <option key={adviser.id} value={adviser.id}>
                    {adviser.name}
                </option>
            ))}
        </select>
    )
}

// render: row => (
//   <AdviserDropdown
//     advisers={advisersFromAPI}
//     value={row.adviserId}
//     onChange={(id) => updateAdviser(row.id, id)}
//   />
// )

export function ViewMoaButton({ url, onClick, label = "View MOA", disabled = false, loading = false }) {
    if (!url) {
        return <span className="text-gray-400 text-[0.8rem] italic font-medium">No MOA</span>
    }
    return(
        <>
            <AnnounceButton
                btnText={loading ? "Viewing..." : label}
                disabled={disabled || loading}
                onClick={(e) => {
                    e.stopPropagation();
                    if (onClick) {
                        onClick();
                    } else if (url) {
                        window.open(url, "_blank");
                    }
                }}
            />
        </>      
    )
}

export function HteLocation({ address, mapUrl}) {
    if (!address) return <span className="text-gray-400">—</span>

    const googleMapsEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

    return(
        <>
            <div className="relative group w-full max-w-[200px] mx-auto">

                <p 
                    title={address}
                    onClick={() => mapUrl && window.open(mapUrl, "_blank")} 
                    className="text-table-text-size line-clamp-1 cursor-pointer text-oasis-header hover:underline text-center"
                >
                    {address}
                </p>

                {/* Black Tooltip with Embedded Map */}
                <div className="absolute z-50 hidden group-hover:block bottom-full mb-4 left-1/2 -translate-x-1/2 w-[250px] bg-black/90 backdrop-blur-md text-white p-2 rounded-2xl shadow-[0px_10px_30px_rgba(0,0,0,0.5)] border border-gray-800 pointer-events-none animate__animated animate__fadeIn animate__faster">
                    
                    {/* Map Container */}
                    <div className="w-full h-[140px] rounded-xl overflow-hidden bg-gray-900 mb-2">
                        <iframe
                            className="w-full h-full border-0 grayscale-20 invert-5 contrast-110"
                            src={googleMapsEmbedUrl}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title={`Map of ${address}`}
                        />
                    </div>

                    {/* Address Text */}
                    <p className="text-[0.65rem] text-center leading-tight px-2 pb-1 text-gray-300 italic">
                        {address}
                    </p>

                    {/* Arrow/Tail */}
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-black/90 border-b border-r border-gray-800 rotate-45" />
                </div>
            </div>
        </>      
    )
}

// render: row => (
//   <HteLocation
//     address={row.hteAddress}
//     mapUrl={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(row.hteAddress)}`}
//   />
// )