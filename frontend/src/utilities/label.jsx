import { Star } from "lucide-react";
import Subtitle from "./subtitle";

export function Label({ fieldId, labelText, children}) {
    return (
        <>
             <label htmlFor={fieldId} className='font-bold text-[1rem] text-oasis-button-dark flex gap-5'>{children}{labelText}</label>
        </>
    )
}

export function RatingLabel({ rating }) {
    const starsCount = Math.min(rating, 5);

    return (
        <div className="w-full flex flex-row justify-start items-center gap-1">
            <Subtitle text={"Rating:"} weight="font-bold" size="text-[0.9rem]"/>

            {Array.from({ length: starsCount }).map((_, index) => (
                <Star key={index} size={15} fill="yellow" className={rating >= starsCount ? "text-yellow-400" : "text-gray-300"} />
            ))}
        </div>
    );
}
