import { Star } from "lucide-react";
import Subtitle from "./subtitle";

export function Label({ fieldId, labelText}) {
    return (
        <>
             <label htmlFor={fieldId} className='font-bold text-[1rem] text-oasis-button-dark'>{labelText}</label>
        </>
    )
}

// import Star from "../assets/icons/star.png";

export function RatingLabel({ rating }) {
    const starsCount = Math.min(rating, 5);

    return (
        <div className="w-full flex flex-row justify-start items-center gap-1">
            <Subtitle text={"Rating:"} weight="font-bold" size="text-[0.9rem]"/>

            {Array.from({ length: starsCount }).map((_, index) => (
                <Star key={index} size={15}/>
            ))}
        </div>
    );
}
