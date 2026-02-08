import { ArchiveRestore, Delete, PencilIcon, Trash } from "lucide-react";
import { Filter } from "../components/adminComps";
import { AnnounceButton } from "../components/button";
import Subtitle from "./subtitle";
import { useState } from "react";

export function Text({ text }) {
    return(
        <>

            <p className="font-oasis-text text-[1rem] truncate">{text}</p>
        </>      
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
//   const statusClasses = {
//     Active: "bg-green-100 text-green-700 border-green-400",
//     Pending: "bg-orange-100 text-orange-700 border-orange-400",
//     Expired: "bg-red-100 text-red-700 border-red-400",
//     Rejected: "bg-gray-200 text-gray-600 border-gray-400",
//   }

//   return (
//     <select
//       value={value}
//       onChange={(e) => onChange?.(e.target.value)}
//       className={`
//         px-3 py-2 rounded-xl border text-sm
//         focus:outline-none focus:ring-2 focus:ring-offset-1
//         ${statusClasses[value] || "bg-white text-black border-gray-300"}
//       `}
//     >
//       <option value="Active">Active</option>
//       <option value="Pending">Pending</option>
//       <option value="Expired">Expired</option>
//       <option value="Rejected">Rejected</option>
//     </select>
//   )
    
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
    const text = value.toLowerCase();
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

export function ActionButtons({ onEdit, onArchive, onDelete}) {
    return(
        <>
            {/* Actions, these are icons with Edit, Archive, Delete. */}
            <div className="flex justify-center gap-3">
                <button className="cursor-pointer" onClick={onEdit}><PencilIcon color="#2B6259"/></button>
                <button className="cursor-pointer" onClick={onArchive}><ArchiveRestore color="#2B6259"/></button>
                {/* <button className="cursor-pointer" onClick={onDelete}><Trash color="#2B6259"/></button> */}
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


export function ViewMoaButton({ url, label = "View MOA", disabled = false}) {
    if (!url) {
        return <span className="text-gray-400 text-[0.8rem]">No file found</span>
    }
    return(
        <>
            {/* A button which when clicked will show a pdf file that can be downloaded */}
            <AnnounceButton btnText={label} onClick={() => window.open(url, "_blank")}/>
        </>      
    )
}
// render: row => (
//   <ViewMoaButton url={row.moaFileUrl} />
// )

export function HteLocation({ address, mapUrl}) {
    if (!address) return <span className="text-gray-400">—</span>

    return(
        <>
            {/* HTE Location, it's an address text but when the text is too long, it will have ... and when hovered, the full address will popup up top of that text address. If clicked, a mapbox or Google maps will show the location */}
            <div className="relative group max-w-[180px] mx-auto">

                <p onClick={() => mapUrl && window.open(mapUrl, "_blank")} className="text-[1rem] truncate cursor-pointer text-oasis-header hover:underline">
                    {address}
                </p>

                <div className="absolute z-50 hidden group-hover:block bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-xs bg-black text-white text-[0.75rem] p-3 rounded shadow-lg">
                    {address}
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