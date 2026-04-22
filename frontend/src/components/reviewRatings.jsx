import { useInView } from "../hooks/useInView";
import { Star } from "lucide-react";


export default function ReviewRatings({ distribution }) {
    const ratings = distribution || [
        { stars: 5, count: 0 },
        { stars: 4, count: 0 },
        { stars: 3, count: 0 },
        { stars: 2, count: 0 },
        { stars: 1, count: 0 },
    ];

    const maxCount = Math.max(...ratings.map(r => r.count), 0);
    const [ref, isVisible] = useInView();

    return (
        <div ref={ref} className="w-full p-5 flex flex-col gap-1">
            {ratings.map((rating) => (
                <div
                    key={rating.stars}
                    className="w-full flex items-center gap-5"
                >
                    {/* STARS */}
                    <div className="w-24 flex justify-end gap-1">
                        {Array.from({ length: rating.stars }).map((_, i) => (
                            <Star key={i} size={14} fill="#2B6259" color="#2B6259" />
                        ))}
                    </div>

                    {/* BAR */}
                    <div className="flex-1 bg-white border h-2 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-oasis-dark rounded-full transition-[width] duration-700 ease-out"
                            style={{
                                width: isVisible && maxCount > 0
                                    ? `${(rating.count / maxCount) * 100}%`
                                    : "0%",
                            }}
                        />
                    </div>

                    {/* COUNT */}
                    <p className="w-14 font-oasis-text font-bold text-right">
                        {rating.count}
                    </p>
                </div>
            ))}
        </div>
    );
}


export function RatingSect({ children }) {
    return (
        <section className="w-full grid grid-cols-[100px_1fr_50px] items-center gap-4">
            {children}
        </section>
    );
}
