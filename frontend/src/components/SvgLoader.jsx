
export default function SvgLoader({ size = 60 }) {
    return (
        <div className="w-full flex justify-center items-center py-10">
            <svg
                width={size}
                height={size}
                viewBox="0 0 50 50"
                className="animate-spin"
            >
                <circle
                    cx="25"
                    cy="25"
                    r="20"
                    fill="none"
                    strokeWidth="5"
                    stroke="#377268"
                    strokeLinecap="round"
                    strokeDasharray="31.4 31.4"
                />
            </svg>
        </div>
    );
}
