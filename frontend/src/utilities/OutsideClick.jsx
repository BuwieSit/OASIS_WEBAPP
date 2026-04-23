import { useEffect } from "react";

export default function useOutsideClick(ref, handler, enabled = true) {
    useEffect(() => {
        if (!enabled) return;

        const listener = (event) => {
            if (!ref.current) {
                return;
            }

            // Using composedPath() is more reliable when elements might be removed from the DOM
            // during the event lifecycle (like when clicking a filter that changes state/re-renders)
            const path = event.composedPath();
            if (path.includes(ref.current)) {
                return;
            }

            handler(event);
        };

        document.addEventListener("mousedown", listener);
        document.addEventListener("touchstart", listener);

        return () => {
            document.removeEventListener("mousedown", listener);
            document.removeEventListener("touchstart", listener);
        };
    }, [ref, handler, enabled]);
}