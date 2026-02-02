import { AnnounceButton } from "../components/button";
import Subtitle from "./subtitle"

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
        return <Subtitle text={format(signed)} />;
    }

    if (mode === "expiry") {
        return <Subtitle text={format(expiry)} />;
    }

    return null;
}

export function StatusDropdown({ value, onChange }) {
  const statusClasses = {
    Active: "bg-green-100 text-green-700 border-green-400",
    Pending: "bg-orange-100 text-orange-700 border-orange-400",
    Expired: "bg-red-100 text-red-700 border-red-400",
    Rejected: "bg-gray-200 text-gray-600 border-gray-400",
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className={`
        px-3 py-2 rounded-xl border text-sm
        focus:outline-none focus:ring-2 focus:ring-offset-1
        ${statusClasses[value] || "bg-white text-black border-gray-300"}
      `}
    >
      <option value="Active">Active</option>
      <option value="Pending">Pending</option>
      <option value="Expired">Expired</option>
      <option value="Rejected">Rejected</option>
    </select>
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
                <button onClick={onEdit}>✏️</button>
                <button onClick={onArchive}>📦</button>
                <button onClick={onDelete}>🗑️</button>
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