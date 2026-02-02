import search from "../assets/icons/search.png";

export default function SearchBar() {
    return (
        <div className="relative w-full">
             <img
                src={search}
                alt="search"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-60 pointer-events-none"
            />
            <input
                className="w-full max-h-100 min-h-12 bg-white p-3 pr-10 rounded-2xl rounded-tl-none"
                placeholder="Search..."
            />
           
        </div>
    );
}
