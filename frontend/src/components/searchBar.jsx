import { Search } from "lucide-react";

export default function SearchBar({ value, onChange }) {
    return (
        <div className="relative w-full flex justify-end my-5 px-4">

            <Search
                className="absolute right-6 top-1/2 -translate-y-1/2 opacity-60 pointer-events-none"
                size={18}
            />

            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="
                    w-full
                    max-w-[320px] sm:max-w-[350px] md:max-w-[400px] lg:max-w-[450px]
                    bg-white border
                    px-4 py-2
                    pr-10
                    rounded-full
                    text-sm md:text-base
                    outline-none
                    transition-all duration-200
                    focus:ring-2 focus:ring-oasis-header/40
                "
                placeholder="Search..."
            />

        </div>
    );
}