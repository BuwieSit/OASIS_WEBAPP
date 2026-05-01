import { useSearchParams } from "react-router-dom";
import { useCallback } from "react";

export default function useQueryParam(key, defaultValue) {
    const [searchParams, setSearchParams] = useSearchParams();
    const value = searchParams.get(key) ?? defaultValue;

    const setValue = useCallback((newValue) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            if (newValue === null || newValue === undefined) {
                next.delete(key);
            } else {
                next.set(key, newValue);
            }
            return next;
        });
    }, [key, setSearchParams]);

    return [value, setValue];
}
