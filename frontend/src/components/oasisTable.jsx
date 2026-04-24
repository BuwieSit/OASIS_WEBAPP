import Subtitle from "../utilities/subtitle";
import { usePagination } from "../hooks/usePagination";

export default function OasisTable({ columns = [], data = [], children, onRowClick }) {
        
    const { page, setPage, displayData, totalPages } = usePagination(data, 10); 

    return (
        <div
        className={`
            w-full xl:w-[90%] 2xl:w-[90%]
            max-w-[1200px]
            p-4 sm:p-5
            bg-admin-element
            rounded-2xl
            flex flex-col
            font-oasis-text
            shadow-[0px_0px_10px_rgba(0,0,0,0.5)]
        `}
        >
        
        {/* TOP CONTENT */}
        {children && (
            <div className="w-full flex flex-col justify-center items-start">
                {children}
            </div>
        )}

        {/* TABLE WRAPPER (SCROLL FIX) */}
        <div className="w-full max-w-screen overflow-x-auto mt-5 min-h-[420px]">
            <table className="min-w-[900px] w-full border-collapse rounded-2xl overflow-hidden">
            
            {/* HEADER */}
            <thead>
                <tr className="bg-white border-b border-gray-300 sticky top-0 z-40">
                {columns.map((col, colIndex) => (
                    <th
                    key={colIndex}
                    className="
                        p-3
                        text-table-text-size
                        font-bold
                        text-oasis-button-dark
                        text-center
                        whitespace-nowrap
                    "
                    >
                    {col.header}
                    </th>
                ))}
                </tr>
            </thead>

            {/* BODY */} 
            <tbody>
                {displayData.length === 0 ? (
                    <tr>
                        <td
                            colSpan={columns.length}
                            className="p-5 text-gray-500 text-center"
                        >
                            No data available
                        </td>
                    </tr>
                ) : (
                    displayData.map((row, rowIndex) => (
                        <tr
                            key={row.id ?? `${page}-${rowIndex}`}
                            className={`bg-white transition hover:bg-gray-200 text-center border-b border-gray-200 ${onRowClick ? "cursor-pointer" : ""}`}
                            onClick={() => onRowClick?.(row)}
                        >
                            {columns.map((col, colIndex) => (
                                <td key={colIndex} 
                                    className="p-3 whitespace-nowrap"
                                >
                                    {col.render(row)}
                                </td>
                            ))}
                        </tr>
                    ))
                )}
            </tbody>

            </table>
        </div>
        
            <div className='flex w-full items-center justify-between '>

               <Subtitle
                    text={`Showing ${displayData.length} entries of ${data.length}`}
                    size={"0.6rem"}
                    color={"text-gray-600"}
                    isItalic={true}
                />

                {/* PAGINATION */}
                {data.length > totalPages && (
                    <div className="flex items-center gap-3 mt-4">

                        <button
                            onClick={() => setPage(prev => Math.max(prev - 1, 0))}
                            disabled={page === 0}
                            className="px-3 py-1 rounded bg-oasis-button-light text-white disabled:opacity-40 transition cursor-pointer hover:bg-oasis-header"
                        >
                            Prev
                        </button>

                        <span className="text-sm">
                            Page {page + 1} of {totalPages}
                        </span>

                        <button
                            onClick={() => setPage(prev => Math.min(prev + 1, totalPages - 1))}
                            disabled={page === totalPages - 1}
                            className="px-3 py-1 rounded bg-oasis-button-light text-white disabled:opacity-40 transition cursor-pointer hover:bg-oasis-header"
                        >
                            Next
                        </button>

                    </div>
                )}
            </div>
            
        </div>
    );
}

export function StudentTable({ columns = [], data = [], children, onRowClick }) {
    const { page, setPage, displayData, totalPages } = usePagination(data, 5); 

    return (
        <div className="w-full xl:w-[90%] 2xl:w-[80%] p-3 rounded-2xl hidden md:flex flex-col items-center font-oasis-text">

            {children &&
                <div className="w-full flex flex-col justify-center items-start">
                    {children}
                </div>
            }

            {/* TABLE WRAPPER */}
            <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[800px] border-spacing-y-2 shadow-[4px_4px_2px_rgba(0,0,0,0.5)]">

                    {/* HEADER */}
                    <thead>
                        <tr className="bg-oasis-button-dark">
                            {columns.map((col, colIndex) => (
                                <th
                                    key={colIndex}
                                    className="p-3 text-[0.9rem] lg:text-[1rem] text-white text-center whitespace-nowrap"
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {/* BODY */}
                    <tbody>
                        {displayData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="py-5 text-gray-500 text-center">
                                    No data available
                                </td>
                            </tr>
                        ) : (
                            displayData.map((row, rowIndex) => (
                                <tr
                                    key={row.id ?? `${page}-${rowIndex}`}
                                    className="text-table-text-size lg:text-[0.9rem] text-center bg-white cursor-pointer transition hover:bg-gray-300"
                                    onClick={() => onRowClick?.(row.id)}
                                >
                                    {columns.map((col, colIndex) => (
                                        <td key={colIndex} className="py-2 px-2 whitespace-nowrap max-w-30">
                                            {col.render(row)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>

                </table>
            </div>

            {/* PAGINATION */}
            <div className='flex w-full items-center justify-center '>

                {/* PAGINATION */}
                {data.length > totalPages && (
                    <div className="flex items-center gap-3 mt-4">

                        <button
                            onClick={() => setPage(prev => Math.max(prev - 1, 0))}
                            disabled={page === 0}
                            className="px-3 py-1 rounded bg-oasis-button-light text-white disabled:opacity-40 transition cursor-pointer hover:bg-oasis-header"
                        >
                            Prev
                        </button>

                        <span className="text-sm">
                            Page {page + 1} of {totalPages}
                        </span>

                        <button
                            onClick={() => setPage(prev => Math.min(prev + 1, totalPages - 1))}
                            disabled={page === totalPages - 1}
                            className="px-3 py-1 rounded bg-oasis-button-light text-white disabled:opacity-40 transition cursor-pointer hover:bg-oasis-header"
                        >
                            Next
                        </button>

                    </div>
                )}
            </div>

        </div>
    );
}

export function MobileStudentTable({
    columns = [],
    data = [],
    onRowClick
}) {
    const { page, setPage, displayData, totalPages } = usePagination(data, 5); 

    return (
        <div className="w-full p-5 block md:hidden lg:hidden">

             {/* Pagination */}
            {totalPages > 1 && (
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
            {displayData.length === 0 && (
                <div className="text-center text-gray-500 py-5">
                    No students found
                </div>
            )}

            {displayData.map((row, index) => (
                <div
                    key={row.id ?? `${page}-${index}`}
                    onClick={() => onRowClick?.(row.id)}
                    className="w-full p-5 rounded-2xl flex flex-col text-oasis-header border border-oasis-header mb-5 cursor-pointer hover:shadow-md transition"
                >
                    {/* Header */}
                    <section className="w-full flex justify-center border-b border-gray-300 py-2 font-bold">
                        {columns[0]?.render?.(row) ?? "HTE -"}
                    </section>

                    {/* Details */}
                    <div className="flex flex-col gap-2 mt-2">
                        {columns.slice(1).map((col, colIndex) => (
                            <MobileTableSection
                                key={colIndex}
                                indicator={col.header}
                                detail={col.render?.(row) ?? "—"}
                            />
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="mt-3 flex justify-center">
                        {columns.find(col => col.header?.toLowerCase().includes("file"))?.render?.(row)}
                    </div>
                </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
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