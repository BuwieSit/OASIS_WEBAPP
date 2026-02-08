import { useState } from "react";
import Title from "./title";
import Subtitle from "./subtitle";
import { Label, RatingLabel } from "./label";
import { AnnounceButton } from "../components/button";
import goldStar from "../assets/icons/goldStar.png";
import blackStar from "../assets/icons/blackStar.png"
import { MultiField, SingleField } from "../components/fieldComp";
import fallbackImg from "../assets/oasisLogo.png";

export function TutorialCard({title = "What is OASIS?", desc = "A short video of what OASIS can do.", thumbnail = fallbackImg, onClick }) {

  return(
      <div className="relative bg-oasis-gradient overflow-hidden sm:w-65 md:w-75 lg:w-80 aspect-square cursor-pointer rounded-3xl shadow-[0px_0px_5px_rgba(0,0,0,0.4)] group perspective transition-all duration-150 ease-in-out hover:-translate-y-3 hover:shadow-[0px_5px_5px_rgba(0,0,0,0.5)]" onClick={onClick}>

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

export function AdmCard({ cardTitle, cardIcon, cardNumber, cardDate}) {
    
    return (
      <>
      
        <div className="p-3 w-full min-w-70 min-h-42 rounded-2xl font-oasis-text text-[0.8rem] flex flex-col justify-between items-center hover:bg-oasis-gradient bg-oasis-gradient">

          <section className="w-full flex flex-row justify-between items-center gap-2">
              <p className="text-wrap text-[0.9rem] font-bold">{cardTitle}</p>
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