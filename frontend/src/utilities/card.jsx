import { useState } from "react";
import Title from "./title";
import Subtitle from "./subtitle";
import { Label, RatingLabel } from "./label";
import { AnnounceButton } from "../components/button";
import star from "../assets/icons/star.png";
import goldStar from "../assets/icons/goldStar.png";
import blackStar from "../assets/icons/blackStar.png"
import { MultiField, SingleField } from "../components/fieldComp";

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

export function AdmCard({ cardTitle, cardIcon, cardNumber, cardDate}) {
    
    return (
      <>
      
        <div className="bg-admin-element p-3 w-full min-w-70 min-h-42 rounded-2xl font-oasis-text text-[0.8rem] flex flex-col justify-between items-center">

          <section className="w-full flex flex-row justify-between items-center">
              <p>{cardTitle}</p>
              {cardIcon}
          </section>

          <section className="w-full flex flex-col justify-start items-start">
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
    role, // student intern, prof
    dateTime = "22/11/2025, 8:41 PM", 
    rating = "5",
    message = "Prima Tech is such a good company to take an intern job since they have benefits like allowance as well as a healthy environment with supportive and kind employees and mentors! Really had a great time here.",

}) {
  return (
    <>
        <div className="basis-[calc(50%-0.5rem)] aspect-video max-h-75 p-5 hover:bg-white cursor-pointer rounded-3xl hover:shadow-[0px_2px_5px_rgba(0,0,0,0.5)] transition duration-300 ease-in-out flex flex-col justify-evenly items-start gap-3">
            <section className="w-full flex justify-center items-center">
              <h3 className='font-oasis-text font-bold text-[1.3rem] text-center'>{hteName}</h3>
            </section>

            <sections className='w-full flex flex-col justify-start items-start'>
                <p className='font-oasis-text text-[0.7rem] text-justify w-full overflow-y-auto'>{message}</p>
            </sections>
    
            <div className='w-full flex flex-row justify-between items-center'>

                <section className="w-full flex flex-col justify-start items-start">
                  <Label labelText={username}/>
                  <Subtitle text={"Student intern"}/>
                  <div className="flex flex-row">
                     
                      <img src={goldStar} className="w-7.5 aspect-square object-contain"/>
                      <img src={goldStar} className="w-7.5 aspect-square object-contain"/>
                      <img src={goldStar} className="w-7.5 aspect-square object-contain"/>
                      <img src={goldStar} className="w-7.5 aspect-square object-contain"/>
                      <img src={goldStar} className="w-7.5 aspect-square object-contain"/>
                  </div>
                  
                </section>
                

            </div>
    </div>
    </>
  )
}


export function AddReviewCard() {
  return (
    <>
      <form className=" w-80 aspect-square p-5 flex flex-col gap-5 bg-linear-to-br from-oasis-button-dark via-oasis-blue via-50% to-oasis-blue to-50% rounded-2xl drop-shadow-[0px_0px_10px_rgba(0,0,0,0.5)]">
          <div className="w-full p-2 bg-oasis-button-dark rounded ">
              <p className="text-white text-[0.9rem] text-center">Add review for Prima Tech</p>
          </div>
          <section className="w-full flex justify-evenly items-center">
              <img src={blackStar} className="w-8 aspect-square object-contain"/> 
              <img src={blackStar} className="w-8 aspect-square object-contain"/> 
              <img src={blackStar} className="w-8 aspect-square object-contain"/> 
              <img src={blackStar} className="w-8 aspect-square object-contain"/> 
              <img src={blackStar} className="w-8 aspect-square object-contain"/> 
          </section>
          <section className="w-full flex flex-col gap-2">
              <SingleField fieldHolder={"Enter name..."} fieldId={"reviewerName"}/>
              <MultiField fieldHolder={"Enter review"} fieldId={"reviewContent"}/>
          </section>
          <AnnounceButton btnText="Submit"/>

      </form>
    </>
  )
}