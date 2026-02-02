import { useSearchParams } from "react-router-dom";

export default function useQueryParam(key, defaultValue) {
    const [searchParams, setSearchParams] = useSearchParams();

    const value = searchParams.get(key) ?? defaultValue;

    const setValue = (newValue) => {
        const next = new URLSearchParams(searchParams);

        if (newValue === null || newValue === undefined) {
            next.delete(key);
        } else {
            next.set(key, newValue);
        }

        setSearchParams(next);
    };

    return [value, setValue];
}
