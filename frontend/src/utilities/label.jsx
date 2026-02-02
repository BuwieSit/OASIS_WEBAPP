

export function Label({ fieldId, labelText}) {
    return (
        <>
             <label htmlFor={fieldId} className='font-bold text-[1rem] text-oasis-button-dark'>{labelText}</label>
        </>
    )
}

import Star from "../assets/icons/star.png";

export function RatingLabel({ rating }) {
    const starsCount = Math.min(rating, 5);

    return (
        <div className="w-fit flex flex-row justify-start items-center gap-2 rounded-3xl rounded-l-none bg-oasis-blue p-2">
            <p className="font-oasis-text text-[0.7rem] italic">Rating:</p>

            {Array.from({ length: starsCount }).map((_, index) => (
                <img
                    key={index}
                    src={Star}
                    className="w-4"
                    alt="star"
                />
            ))}
        </div>
    );
}
