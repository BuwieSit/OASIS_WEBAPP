// import { useState, useMemo } from "react";

// export function usePagination(data = [], columns = [], pageSize = 5) {

//     const [page, setPage] = useState(0);

//     const displayData = useMemo(() => {

//         if (!data.length) {
//             return [Object.fromEntries(columns.map(col => [col.header, "-"]))];
//         }

//         const start = page * pageSize;
//         return data.slice(start, start + pageSize);

//     }, [data, page, columns, pageSize]);

//     const totalPages = Math.ceil(data.length / pageSize);

//     return {
//         page,
//         setPage,
//         displayData,
//         totalPages
//     };
// }

import { useState, useMemo } from "react";

export function usePagination(data = [], pageSize = 5) {

    const [page, setPage] = useState(0);

    const totalPages = Math.ceil(data.length / pageSize);

    const displayData = useMemo(() => {

        const start = page * pageSize;
        const end = start + pageSize;

        return data.slice(start, end);

    }, [data, page, pageSize]);

    return {
        page,
        setPage,
        displayData,
        totalPages
    };
}