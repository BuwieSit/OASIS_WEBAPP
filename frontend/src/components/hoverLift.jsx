export default function HoverLift({ children, onClick }) {
    return (
        <div className={`transition-all duration-200 ease-out hover:-translate-y-1 hover:scale-110 hover:cursor-pointer`} onClick={onClick}>
            {children}
        </div>
    );
}
