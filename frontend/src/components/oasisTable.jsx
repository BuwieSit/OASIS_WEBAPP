
const maxHeight = "max-h-150";

export default function OasisTable({ columns = [], data = [], children }) {
    return (
        <>
            <div className={`w-[80%] ${maxHeight} p-3 bg-admin-element rounded-2xl flex flex-col items-center justify-center font-oasis-text shadow-[0px_0px_10px_rgba(0,0,0,0.5)]`}>
                {children && 
                    <div className="w-[95%] flex flex-col justify-center items-start">
                        {children}
                    </div>
                }
                
                <table className="w-full p-5 border-separate border-spacing-y-2 ">
                    
                    {/* HEADER */}
                    <thead>
                        <tr className="bg-white rounded-2xl">
                            {columns.map((col, colIndex) => (
                                <th
                                    key={colIndex}
                                    className="p-3 text-[1rem] text-black text-center"
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
            <div className={`w-[90%] ${maxHeight} p-3 rounded-2xl flex flex-col items-center justify-center font-oasis-text`}>
                {children && 
                    <div className="w-[95%] flex flex-col justify-center items-start">
                        {children}
                    </div>
                }
                
                <table className="w-full border-spacing-y-2 shadow-[4px_4px_2px_rgba(0,0,0,0.5)]">
                    
                    {/* HEADER */}
                    <thead>
                        <tr className="bg-oasis-gradient rounded-2xl">
                            {columns.map((col, colIndex) => (
                                <th
                                    key={colIndex}
                                    className="p-3 text-[1rem] text-black text-center"
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


// export function UserTable({ headers = [], children }) {
//     return (
//         <>
//             <div className="w-[90%] p-3 rounded-2xl flex flex-col items-center justify-center font-oasis-text ">
//                 <div className="w-[95%] flex flex-col justify-center items-start">
//                     {children}
//                 </div>
//                 <table className="w-full p-5 border-separate border-spacing-y-2 ">
                    
//                     {/* HEADER */}
//                     <thead className="shadow-[2px_2px_1px_rgba(0,0,0,0.5)]">
//                         <tr className="bg-linear-to-b from-oasis-button-light to-oasis-blue to-90% rounded-2xl">
//                             {headers.map((header, index) => (
//                                 <th
//                                     key={index}
//                                     className="p-3 text-[1rem] text-black text-center"
//                                 >
//                                     {header}
//                                 </th>
//                             ))}
//                         </tr>
//                     </thead>

//                     {/* BODY */}
//                     <tbody>
//                         <tr className="shadow-[2px_2px_1px_rgba(0,0,0,0.5)] bg-white text-[0.9rem] text-center">
//                             {headers.map((_, index) => (
//                                 <td key={index} className="p-3">
//                                     Data
//                                 </td>
//                             ))}
//                         </tr>
//                     </tbody>

//                 </table>
//             </div>
//         </>
//     );
// }