import { useState } from "react";
import Title from "./title";
import Subtitle from "./subtitle";
import { Label, RatingLabel } from "./label";
import { AnnounceButton } from "../components/button";
import goldStar from "../assets/icons/goldStar.png";
import blackStar from "../assets/icons/blackStar.png"
import { MultiField, SingleField } from "../components/fieldComp";
import fallbackImg from "../assets/oasisLogo.png";
import { Star } from "lucide-react";

export function TutorialCard({title = "What is OASIS?", desc = "A short video of what OASIS can do.", thumbnail = fallbackImg, onClick }) {

  return(
      <div className="relative w-full max-w-[320px] mx-auto bg-oasis-gradient overflow-hidden aspect-square cursor-pointer rounded-3xl shadow-[0px_0px_5px_rgba(0,0,0,0.4)] group transition-all duration-150 ease-in-out hover:-translate-y-3 hover:shadow-[0px_5px_5px_rgba(0,0,0,0.5)]" onClick={onClick}>

          <img src={thumbnail} alt="thumbnail" className="w-full h-[70%] object-cover transition-all duration-150 ease-in-out shadow-[inset_0px_0px_10px_#54A194]"/>
          <section className="h-[30%] w-full z-50 bg-white p-3 flex flex-col justify-start items-start">
            <Subtitle text={title} size="text-[1.2rem]" weight="font-bold"/>
            <Subtitle text={desc}/>
          </section>

      </div>
  )
}
export function CustomCard({ title, desc }) {
  const [showBack, setShowBack] = useState(false);

  return (
    <div
      className="w-60 h-60 perspective cursor-pointer"
      onMouseOver={() => setShowBack(true)}
      onMouseLeave={() => setShowBack(false)}
    >
      <div
        className={`
          relative w-full h-full transition-transform duration-500 
          transform-3d
          ${showBack ? "transform-[rotateY(180deg)]" : ""}
        `}
      >
        
        <div className="absolute inset-0 bg-linear-to-tl from-oasis-blue to-oasis-button-light to-90% p-8 rounded-[20px] shadow-[3px_3px_5px_rgba(0,0,0,0.3)] flex items-center justify-center backface-hidden">
          <Title text={title} />
        </div>

        <div className="absolute inset-0 bg-oasis-button-dark p-8 rounded-[20px] shadow-[3px_3px_5px_rgba(0,0,0,0.3)] flex items-center justify-center transform-[rotateY(180deg)] backface-hidden">
          <Subtitle size={'text-[0.8rem]'} color={'text-white'} text={desc} />
        </div>
      </div>
    </div>
  );
}

export function AdmCard({ 
  cardTitle, 
  cardIcon, 
  cardNumber, 
  cardDate, 
  hasRibbon, 
  ribbonColor
}) {

    return (
      <>
      
        <div className="p-3  w-full min-w-70 min-h-42 font-oasis-text text-[0.8rem] flex flex-col justify-between items-center border border-gray-300 transition ease-in-out hover:bg-oasis-blue relative">
          {hasRibbon && 
            <div className={`w-[10%] h-[30%] ${ribbonColor ? ribbonColor : "bg-oasis-header"} absolute top-0 left-0`}/>
          }
          

          <section className={`w-full ${hasRibbon ? "pl-10" : ""} flex flex-row justify-between items-center gap-2`}>
              <p className="text-wrap text-[0.9rem] font-bold text-oasis-header">{cardTitle}</p>
              {cardIcon}
          </section>

          <section className={`w-full ${hasRibbon ? "pl-5" : ""} flex flex-col justify-start items-start`}>
            <p className="text-[3rem] font-semibold">{cardNumber}</p>
            <p>as of {cardDate}</p>
          </section>

        </div>
      </>
    );

}

export function ReviewCard({
    username = "Francine Ishael Hardy",
    hteName = "Prima Tech",
    role = "Student intern",
    dateTime = "22/11/2025, 8:41 PM",
    rating = "5",
    message = "Prima Tech is such a good company to take an intern job since they have benefits like allowance as well as a healthy environment with supportive and kind employees and mentors! Really had a great time here.",
}) {

    return (
        <div className="
            w-full
            sm:w-[calc(50%-0.5rem)]
            lg:w-[calc(33.33%-1rem)]
            min-h-[220px]
            p-4 sm:p-5
            hover:bg-white
            cursor-pointer
            rounded-3xl
            hover:shadow-[0px_2px_5px_rgba(0,0,0,0.5)]
            transition duration-300 ease-in-out
            flex flex-col justify-between gap-3
        ">

            {/* HTE Name */}
            <section className="w-full flex justify-center items-center">
                <h3 className="font-oasis-text font-bold text-lg sm:text-xl text-center">
                    {hteName}
                </h3>
            </section>

            {/* Message */}
            <section className="w-full flex flex-col">
                <p className="
                    font-oasis-text
                    text-xs sm:text-sm
                    text-justify
                    w-full

                    line-clamp-4
                ">
                    {message}
                </p>
            </section>

            {/* Footer Info */}
            <div className="w-full flex flex-col gap-1">

                <Label labelText={username}/>

                <Subtitle text={role}/>

                {/* Rating Stars */}
                <div className="flex flex-row flex-wrap">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <img
                            key={index}
                            src={goldStar}
                            className="w-6 sm:w-7 aspect-square object-contain"
                        />
                    ))}
                </div>

            </div>
        </div>
    );
}

export function AddReviewCard({ hteName, onSubmit }) {
  const [reviewerName, setReviewerName] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const handleSubmit = async () => {
    if (!reviewMessage) {
      alert("Review message required.")
      setErrMsg("Review message required.");
    };

    setSubmitting(true);
    try {
      await onSubmit({
        message: reviewMessage,
        rating: reviewRating,
      });

      setReviewMessage("");
      setReviewRating(5);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
   
    <form className="w-full max-w-80 sm:w-80 p-5 flex flex-col gap-5 bg-linear-to-br bg-oasis-gradient rounded-2xl drop-shadow-[0px_0px_10px_rgba(0,0,0,0.5)]">
        
        {/* Header */}
        <div className="w-full p-2 bg-oasis-button-dark rounded">
          <p className="text-white text-[0.9rem] text-center">
            {`Leave a review for ${hteName || "-"}`}
          </p>
        </div>

        {/* Rating */}
        <section className="w-full flex justify-evenly items-center">
          <ul className="flex justify-evenly items-center w-full">
            {[1, 2, 3, 4, 5].map((star) => (
              <li key={star}>
                <Star
                  size={30}
                  strokeWidth={2}
                  className={`cursor-pointer transition-colors duration-200
                    ${reviewRating >= star ? "text-[#FFD700] " : "text-oasis-header"}
                  `}
                  fill={reviewRating >= star ? "#FFD700" : "none"}
                  onClick={() => setReviewRating(star)}
                />
              </li>
            ))}
          </ul>
        </section>

        {/* Inputs */}
        <section className="w-full flex flex-col gap-2">
          <MultiField
            fieldHolder="Enter review"
            fieldId="reviewContent"
            value={reviewMessage}
            onChange={(e) => setReviewMessage(e.target.value)}
          />
        </section>

        {/* Submit */}
        <AnnounceButton
          btnText={submitting ? "Submitting..." : "Submit"}
          onClick={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        />
    </form>
  );
}



// export function AddReviewCard({ hteName, rating, onChange, msgValue, reviewValue}) {
//   return (
//     <>
//       <form className=" w-80 aspect-square p-5 flex flex-col gap-5 bg-linear-to-br from-oasis-button-dark via-oasis-blue via-50% to-oasis-blue to-50% rounded-2xl drop-shadow-[0px_0px_10px_rgba(0,0,0,0.5)]">
//           <div className="w-full p-2 bg-oasis-button-dark rounded ">
//               <p className="text-white text-[0.9rem] text-center">{`Leave a review for ${hteName || "-"}`}</p>
//           </div>
//           <section className="w-full flex justify-evenly items-center">
//               <ul className="flex justify-evenly items-center w-full">
               
//                   <li><Star size={30} className="cursor-pointer"/></li>
//                   <li><Star size={30} className="cursor-pointer"/></li>
//                   <li><Star size={30} className="cursor-pointer"/></li>
//                   <li><Star size={30} className="cursor-pointer"/></li>
//                   <li><Star size={30} className="cursor-pointer"/></li>
//               </ul>

//           </section>
//           <section className="w-full flex flex-col gap-2">
//               <SingleField fieldHolder={"Enter name..."} fieldId={"reviewerName"}/>
//               <MultiField onChange={onChange} fieldHolder={"Enter review"} fieldId={"reviewContent"}/>
//           </section>
//           <AnnounceButton btnText="Submit"/>

//       </form>
//     </>
//   )
// }