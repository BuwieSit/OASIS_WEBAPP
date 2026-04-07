import { useMemo, useState, useEffect } from "react";
import Subtitle from "../utilities/subtitle";

export function PieChart({ items = [] }) {
    const total = useMemo(
        () => items.reduce((sum, item) => sum + item.value, 0),
        [items]
    );
    const gradient = useMemo(() => {
        if (!total) return "";
        let current = 0;
        return items
            .map(item => {

                const percentage = (item.value / total) * 100;
                const start = current;
                const end = current + percentage;
                current = end;
                return `${item.color} ${start}% ${end}%`;
            })
            .join(", ");

    }, [items, total]);

    const [animatedGradient, setAnimatedGradient] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedGradient(gradient);
        }, 50);

        return () => clearTimeout(timer);
    }, [gradient]);

    return (
        <div className="flex flex-col items-center gap-4">
            
            {/* PIE */}
            <div
                className="w-80 aspect-square rounded-full transition-all duration-700"
                style={{
                    background: `conic-gradient(${animatedGradient})`
                }}
            />

            {/* LEGEND */}
            <div className="flex gap-2">
                {items.map((item, i) => {

                    const percent = total
                        ? ((item.value / total) * 100).toFixed(1)
                        : 0;

                    return (
                        <div
                            key={i}
                            className="flex items-center gap-2"
                        >
                            <Subtitle text={item.label}/>

                            <div
                                className="w-4 h-4 rounded-sm"
                                style={{ background: item.color }}
                            />

                            <Subtitle text={item.value} weight={"font-bold"}/>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
