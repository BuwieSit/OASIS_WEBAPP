import { Download } from "lucide-react";
import { AnnounceButton } from "./button";
import Subtitle from "../utilities/subtitle";
import { useState, useMemo } from "react";

const maxHeight = "max-h-150";

export default function OasisTable({ columns = [], data = [], children }) {
    return (
        <>
            <div className={`w-[80%] ${maxHeight} p-5 bg-admin-element rounded-2xl flex flex-col items-center justify-center font-oasis-text shadow-[0px_0px_10px_rgba(0,0,0,0.5)]`}>
                {children && 
                    <div className="w-full flex flex-col justify-center items-start">
                        {children}
                    </div>
                }
                

                <table className="w-full mt-5 rounded-3xl overflow-hidden ">
                    
                    {/* HEADER */}
                    <thead className="rounded-2xl ">
                        <tr className="bg-white rounded-2xl border-b border-gray-300">
                            {columns.map((col, colIndex) => (
                                <th
                                    key={colIndex}
                                    className="p-3 text-[1rem] font-bold text-oasis-button-dark text-center"
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
               
                    {/* BODY */}
                    <tbody>
                        {data.map((row, rowIndex) => (
                            <tr key={row.id || rowIndex} 
                            className="bg-white rounded-2xl text-[0.9rem] text-center">

                            {columns.map((col, colIndex) => (
                                <td key={colIndex} className="p-3">
                                    {col.render(row)}
                                </td>   
                            ))}
                            </tr>
                        ))}
                        
                    </tbody>

                </table>

            </div>
        </>
    );
}


export function StudentTable({ columns = [], data = [], children }) {
    return (
        <>
            <div className={`w-[90%] ${maxHeight} p-3 rounded-2xl hidden md:flex lg:flex flex-col items-center justify-center font-oasis-text`}>
                {children && 
                    <div className="w-full flex flex-col justify-center items-start">
                        {children}
                    </div>
                }
                
                <table className="w-full border-spacing-y-2 shadow-[4px_4px_2px_rgba(0,0,0,0.5)]">
                    
                    {/* HEADER */}
                    <thead>
                        <tr className="bg-oasis-button-dark rounded-2xl">
                            {columns.map((col, colIndex) => (
                                <th
                                    key={colIndex}
                                    className="p-3 text-[1rem] text-white text-center"
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {/* BODY */}
                    <tbody>
                        {data.map((row, rowIndex) => (
                            <tr key={row.id || rowIndex} 
                            className="rounded-2xl text-[0.9rem] text-center bg-white">

                            {columns.map((col, colIndex) => (
                                <td key={colIndex} className="py-2">
                                    {col.render(row)}
                                </td>   
                            ))}
                            </tr>
                        ))}
                        
                    </tbody>

                </table>
            </div>
        </>
    );
}

export function MobileStudentTable({
    columns = [],
    data = [],
    onRowClick
}) {

    const PAGE_SIZE = 3;
    const [page, setPage] = useState(0);
    // Empty state fallback
    const displayData = useMemo(() => {
        if (!data.length) {
            return [Object.fromEntries(columns.map(col => [col.header, "-"]))];
        }

        const start = page * PAGE_SIZE;
        return data.slice(start, start + PAGE_SIZE);

    }, [data, page, columns]);

    const totalPages = Math.ceil(data.length / PAGE_SIZE);

    return (
        <div className="w-full p-5 block md:hidden lg:hidden">
            
            {/* Pagination Controls */}
            {data.length > PAGE_SIZE && (
                <div className="flex justify-center items-center gap-4 my-4 font-oasis-text">

                    <button
                        disabled={page === 0}
                        onClick={() => setPage(p => Math.max(p - 1, 0))}
                        className="px-4 py-2 rounded-lg bg-gray-200 disabled:opacity-50"
                    >
                        Prev
                    </button>

                    <span className="text-sm font-bold text-oasis-button-dark">
                        Page {page + 1} / {totalPages}
                    </span>

                    <button
                        disabled={page >= totalPages - 1}
                        onClick={() => setPage(p => Math.min(p + 1, totalPages - 1))}
                        className="px-4 py-2 rounded-lg bg-gray-200 disabled:opacity-50"
                    >
                        Next
                    </button>

                </div>
            )}

            {/* Cards */}
            {displayData.map((row, index) => (
                <div
                    key={row.id || index}
                    onClick={() => onRowClick?.(row.id)}
                    className="w-full p-5 rounded-2xl flex flex-col text-oasis-header border border-oasis-header mb-5 cursor-pointer hover:shadow-md transition"
                >

                    {/* Header */}
                    <section className="w-full flex justify-center border-b border-gray-300 py-2 font-bold">
                        {data.length > 0
                            ? (columns[0]?.render?.(row) ?? "HTE -")
                            : "HTE -"}
                    </section>

                    {/* Details */}
                    <div className="flex flex-col gap-2 mt-2">
                        {columns.slice(1).map((col, colIndex) => (
                            <MobileTableSection
                                key={colIndex}
                                indicator={col.header}
                                detail={
                                    data.length > 0
                                        ? (col.render?.(row) ?? "—")
                                        : "—"
                                }
                            />
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="mt-3 flex justify-center">
                        {data.length > 0 &&
                            columns
                                .find(col =>
                                    col.header?.toLowerCase().includes("file")
                                )
                                ?.render?.(row)
                        }
                    </div>

                </div>
            ))}

            {/* Pagination Controls */}
            {data.length > PAGE_SIZE && (
                <div className="flex justify-center items-center gap-4 my-4 font-oasis-text">

                    <button
                        disabled={page === 0}
                        onClick={() => setPage(p => Math.max(p - 1, 0))}
                        className="px-4 py-2 rounded-lg bg-gray-200 disabled:opacity-50"
                    >
                        Prev
                    </button>

                    <span className="text-sm font-bold text-oasis-button-dark">
                        Page {page + 1} / {totalPages}
                    </span>

                    <button
                        disabled={page >= totalPages - 1}
                        onClick={() => setPage(p => Math.min(p + 1, totalPages - 1))}
                        className="px-4 py-2 rounded-lg bg-gray-200 disabled:opacity-50"
                    >
                        Next
                    </button>

                </div>
            )}

        </div>
    );
}

export function MobileTableSection({ indicator, detail}) {
    return (
        <section className="w-full flex flex-row justify-between border-b border-b-gray-200 py-1">
            <Subtitle text={indicator} size={"text-[0.9rem]"} className={"w-[50%]"}/>
            <Subtitle text={detail} weight={"font-bold"} size={"text-[1rem]"} className={"w-[50%]"}/>
        </section>
    )
}