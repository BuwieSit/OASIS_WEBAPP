export default function SvgLoader({ size = 60 }) {
  return (
    <div className="w-full flex justify-center items-center py-10">
      <style>
        {`
          @keyframes waveFlow {
            0% { transform: translateX(0); }
            100% { transform: translateX(-40px); }
          }
          .solid-wave {
            animation: waveFlow 1.2s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite alternate;
          }
        `}
      </style>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size / 3} 
        viewBox="0 0 100 40"
        className="overflow-hidden"
      >
        {/* We make the path longer than the viewBox (140px) 
            so that when it slides, we don't see the ends. 
        */}
        <path 
          className="solid-wave"
          fill="none" 
          stroke="#377268" 
          strokeWidth="6" 
          strokeLinecap="round" 
          d="M -40 20 Q -30 5 -20 20 T 0 20 T 20 20 T 40 20 T 60 20 T 80 20 T 100 20 T 120 20"
        />
      </svg>
    </div>
  );
}