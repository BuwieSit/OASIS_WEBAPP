export default function HoverLift({ children, onClick }) {
    return (
        <div className={`transition-all duration-200 ease-out hover:scale-105 cursor-pointer hover:`} onClick={onClick}>
            {children}
        </div>
    );
}
