export function resolveMediaUrl(path) {
    if (!path || typeof path !== "string") {
        return null;
    }

    if (path.startsWith("http")) return path;

    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    return `${import.meta.env.VITE_API_BASE_URL}/${cleanPath}`;
}