import { useEffect } from "react";

export default function useOutsideClick(ref, handler, enabled = true) {
    useEffect(() => {
        if (!enabled) return;

        const listener = (event) => {
            // If the element is no longer in the document, ignore the click
            // This happens if a click causes a re-render that removes the clicked element
            if (!document.body.contains(event.target)) {
                return;
            }

            if (!ref.current || ref.current.contains(event.target)) {
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