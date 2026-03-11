
export function PieChart({ items = [], }) {
    return (
        <>
            {/* CIRCLE CONTAINER */}
            <div className="w-80 aspect-square bg-oasis-neutral rounded-full relative">
                
            </div>
        </>
    )
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
