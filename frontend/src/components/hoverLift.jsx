export default function HoverLift({ children, onClick, className = "" }) {
    return (
        <div className={`transition-all duration-200 ease-out hover:scale-105 cursor-pointer ${className}`} onClick={onClick}>
            {children}
        </div>
    );
}
