import { Search } from "lucide-react";

export default function SearchBar() {
    return (
        <div className="relative w-full flex justify-end my-5">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 pointer-events-none" size={18}/>
            <input
                className="sm:w-40 sm:h-6 md:w-50 md:h-8 lg:w-60 lg:h-10 bg-oasis-gradient border p-3 pr-10 rounded-full"
                placeholder="Search..."
            />
           
        </div>
    );
}
