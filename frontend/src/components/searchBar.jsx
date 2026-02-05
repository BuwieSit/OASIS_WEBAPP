import { Search } from "lucide-react";

export default function SearchBar() {
    return (
        <div className="relative w-full flex justify-end my-5">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 pointer-events-none" size={18}/>
            <input
                className="w-[30%] max-w-80 max-h-100 min-h-12 bg-oasis-gradient border p-3 pr-10 rounded-full"
                placeholder="Search..."
            />
           
        </div>
    );
}
