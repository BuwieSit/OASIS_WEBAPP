import SvgLoader from "./SvgLoader";

export default function LoadingScreen() {
    return (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-white">
            <div className="flex items-center gap-4">
                
                <p className="font-oasis-text text-oasis-button-dark text-sm">
                    Loading...
                </p>
                <SvgLoader/>
            </div>
        </div>
    );
}
