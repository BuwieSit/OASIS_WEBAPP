import star from "../assets/icons/star.png"

export default function AverageRating() {
    return (
        <>
            <div className="w-full p-5 flex flex-col justify-center items-center bg-white border gap-3">
                <p className="font-bold font-oasis-text text-oasis-button-dark text-[2rem]">4.3</p>
                <div className="flex flex-row w-full gap-5 justify-center items-center">
                    <img src={star}/>
                    <img src={star}/>
                    <img src={star}/>
                    <img src={star}/>
                    <img src={star}/> 
                </div>
                <p className="font-oasis-text text-oasis-button-dark text-[0.8rem]">Average number of ratings</p>
            </div>
        </>
    )
}