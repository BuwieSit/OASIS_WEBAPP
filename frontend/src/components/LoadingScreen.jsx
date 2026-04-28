import SvgLoader from "./SvgLoader";

export default function LoadingScreen() {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/60 backdrop-blur-sm">
            <div className="flex items-center gap-4 bg-white/90 px-8 py-4 rounded-3xl shadow-2xl border border-gray-100 animate__animated animate__fadeIn">
                
                <p className="font-oasis-text text-oasis-button-dark text-sm font-bold tracking-wide">
                    Loading Data...
                </p>
                <SvgLoader/>
            </div>
        </div>
    );
}
