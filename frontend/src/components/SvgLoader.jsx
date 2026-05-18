export default function SvgLoader() {
    return (
        <div className="relative w-20 h-20 flex items-center justify-center overflow-hidden rounded-full bg-oasis-blue/5 border-2 border-oasis-blue/10">
            {/* AMBIENT WATER BACKGROUND */}
            <div className="absolute inset-0 bg-oasis-blue/10 animate-pulse"></div>

            {/* WAVE CONTAINER */}
            <svg 
                viewBox="0 0 100 100" 
                preserveAspectRatio="none" 
                className="absolute bottom-0 w-[200%] h-full flex"
            >
                <style>
                    {`
                        @keyframes wave-move {
                            0% { transform: translateX(0); }
                            100% { transform: translateX(-50%); }
                        }
                        .wave-animate {
                            animation: wave-move var(--duration) linear infinite;
                        }
                    `}
                </style>
                
                {/* BACK WAVE */}
                <path 
                    d="M0 50 Q25 40 50 50 T100 50 V100 H0 Z" 
                    fill="#436259" 
                    fillOpacity="0.2" 
                    className="wave-animate"
                    style={{ '--duration': '3s' }}
                />
                <path 
                    d="M100 50 Q125 40 150 50 T200 50 V100 H100 Z" 
                    fill="#436259" 
                    fillOpacity="0.2" 
                    className="wave-animate"
                    style={{ '--duration': '3s' }}
                />

                {/* MIDDLE WAVE */}
                <path 
                    d="M0 60 Q25 50 50 60 T100 60 V100 H0 Z" 
                    fill="#2d5f5d" 
                    fillOpacity="0.4" 
                    className="wave-animate"
                    style={{ '--duration': '2s' }}
                />
                <path 
                    d="M100 60 Q125 50 150 60 T200 60 V100 H100 Z" 
                    fill="#2d5f5d" 
                    fillOpacity="0.4" 
                    className="wave-animate"
                    style={{ '--duration': '2s' }}
                />

                {/* FRONT WAVE */}
                <path 
                    d="M0 70 Q25 65 50 70 T100 70 V100 H0 Z" 
                    fill="#234948" 
                    className="wave-animate"
                    style={{ '--duration': '1.5s' }}
                />
                <path 
                    d="M100 70 Q125 65 150 70 T200 70 V100 H100 Z" 
                    fill="#234948" 
                    className="wave-animate"
                    style={{ '--duration': '1.5s' }}
                />
            </svg>

            {/* CENTER ICON/GLOW */}
            <div className="relative z-10 w-4 h-4 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-bounce"></div>
        </div>
    );
}
