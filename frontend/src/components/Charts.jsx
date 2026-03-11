import { useMemo, useState, useEffect } from "react";

export function PieChart({ items = [] }) {

    const total = useMemo(
        () => items.reduce((sum, item) => sum + item.value, 0),
        [items]
    );
    const gradient = useMemo(() => {
        if (!total) return "";
        let current = 0;
        return items
            .map(item => {

                const percentage = (item.value / total) * 100;
                const start = current;
                const end = current + percentage;
                current = end;
                return `${item.color} ${start}% ${end}%`;
            })
            .join(", ");

    }, [items, total]);

    const [animatedGradient, setAnimatedGradient] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedGradient(gradient);
        }, 50);

        return () => clearTimeout(timer);
    }, [gradient]);

    return (
        <div className="flex flex-col items-center gap-4">
            
            {/* PIE */}
            <div
                className="w-80 aspect-square rounded-full transition-all duration-700"
                style={{
                    background: `conic-gradient(${animatedGradient})`
                }}
            />

            {/* LEGEND */}
            <div className="flex flex-col gap-2">
                {items.map((item, i) => {

                    const percent = total
                        ? ((item.value / total) * 100).toFixed(1)
                        : 0;

                    return (
                        <div
                            key={i}
                            className="flex items-center gap-3 text-sm"
                        >
                            <div
                                className="w-4 h-4 rounded-sm"
                                style={{ background: item.color }}
                            />
                            <span>
                                {item.label} ({percent}%)
                            </span>
                        </div>
                    );
                })}
            </div>

        </div>
    );
}

// import * as React from 'react';
// import { pieArcLabelClasses, PieChart } from '@mui/x-charts/PieChart';
// import Stack from '@mui/material/Stack';
// import Button from '@mui/material/Button';


// export default function OasisPieChart() {
    
//     const data = [
//     { id: 0, value: 10, label: 'series A' },
//     { id: 1, value: 15, label: 'series B' },
//     { id: 2, value: 20, label: 'series C' },
//     ];
    
//     const [key, rerender] = React.useReducer((x) => x + 1, 0);

//     return (
//         <Stack>
//         <PieChart
//             key={key}
//             series={[{ data, arcLabel: (item) => `${item.value}` }]}
//             width={200}
//             height={200}
//             hideLegend
//             sx={{
//             [`& .${pieArcLabelClasses.root}.${pieArcLabelClasses.animate}`]: {
//                 animationDuration: '2s',
//             },
//             }}
//         />
//         <Button onClick={() => rerender()}>Restart Animation</Button>
//         </Stack>
//     );
// }
