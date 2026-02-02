export default function LoadingScreen() {
    return (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-oasis-button-dark border-t-transparent rounded-full animate-spin"></div>
                <p className="font-oasis-text text-oasis-button-dark text-sm">
                    Loading...
                </p>
            </div>
        </div>
    );
}
