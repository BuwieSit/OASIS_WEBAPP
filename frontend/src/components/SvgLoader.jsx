
// export default function SvgLoader({ size = 60 }) {
//     return (
//         <div className="w-full flex justify-center items-center py-10">
//             <svg
//                 width={size}
//                 height={size}
//                 viewBox="0 0 50 50"
//                 className="animate-spin"
//             >
//                 <circle
//                     cx="25"
//                     cy="25"
//                     r="20"
//                     fill="none"
//                     strokeWidth="5"
//                     stroke="#377268"
//                     strokeLinecap="round"
//                     strokeDasharray="31.4 31.4"
//                 />
//             </svg>
//         </div>
//     );
// }

export default function SvgLoader({ size = 150 }) {
  return (
    <div className="w-full flex justify-center items-center py-10">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size / 2} 
        viewBox="0 0 300 150"
      >
        <path 
          fill="none" 
          stroke="#377268" 
          strokeWidth="12" 
          strokeLinecap="round" 
          /* The dasharray creates the "head" (300) and the "gap" (385).
             The total path length is 685.
          */
          strokeDasharray="300 385" 
          d="M275 75c0 31-27 50-50 50-58 0-92-100-150-100-28 0-50 22-50 50s23 50 50 50c58 0 92-100 150-100 24 0 50 19 50 50Z"
        >
          <animate 
            attributeName="stroke-dashoffset" 
            /* Linear calculation mode for a consistent flow */
            calcMode="spline" 
            /* Increased to 3 seconds for a slower, calmer chase */
            dur="3" 
            /* Moves the dash from one end of the path to the other */
            values="685;-685" 
            keySplines="0 0 1 1" 
            repeatCount="indefinite" 
          />
        </path>
      </svg>
    </div>
  );
}