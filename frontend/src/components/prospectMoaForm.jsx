import Subtitle from "../utilities/subtitle";
import Title from "../utilities/title";
import { AnnounceButton, Button } from "./button";
import { FileUploadField, SingleField } from "./fieldComp";
import imgBg from "../assets/fallbackImage.jpg";

export default function ProspectMoaForm() {
   return(
        <>
            {/* PARENT CONTAINER */}
            <div id="prospectForm" className="relative w-full px-5 py-10 flex flex-col gap-2 justify-center items-center shadow-[inset_0_0_50px_rgba(0,0,0,1)]">
                <img src={imgBg} className="w-full h-full z-1 absolute top-1/2 left-1/2 
                -translate-x-1/2 -translate-y-1/2 opacity-50 "/>

                <section className="mb-5 z-10">
                    <Title text={"MOA Prospect Submission"}/>
                    <Subtitle text={"Please fill out this form to propose a new Host Training Establishment (HTE) for partnership."}/>
                </section>
                <section className="w-full flex items-start justify-center gap-5 z-10">
                    
                    <div className="bg-oasis-gradient w-80 p-10 flex flex-col justify-center items-start shadow-[3px_3px_2px_rgba(0,0,0,0.8)] rounded-3xl">
                        <Subtitle size={"text-[1rem]"} color={"text-black"} weight={"font-bold"} text={"Important Notes for Students"}/>

                        <ul className="mt-5 w-full aspect-square text-wrap font-oasis-text text-[0.9rem] list-disc flex flex-col gap-2 text-justify">
                            <li>Download the official MOA template from the OJT Downloadables section.</li>
                            <li>Send the MOA to the HTE for review and completion (via email or in person — varies depending on the location of the company.)</li>
                            <li>Once signed or reviewed by the HTE, return the MOA to the OJT Office for processing</li>
                        </ul>
                    </div>
                        
                        
                    <div className="w-150">
                        <form className="bg-oasis-gradient p-10 flex flex-col justify-center items-start shadow-[3px_3px_2px_rgba(0,0,0,0.8)] rounded-3xl gap-3 ">
                            <Subtitle size={"text-[1rem]"} color={"text-black"} weight={"font-bold"} text={"HTE Information"}/>

                                <SingleField labelText={"HTE / Company Name"} fieldHolder={"Enter Company Name"} fieldId={"hteName"} />
                                <SingleField labelText={"Industry Category"} fieldHolder={"Enter Industry"} fieldId={"industryCategory"} />
                                <SingleField labelText={"HTE Address"} fieldHolder={"Enter Address"} fieldId={"hteAddress"} />
                                <FileUploadField labelText={"Upload Proposed MOA"}/>

                            <Subtitle size={"text-[1rem]"} color={"text-black"} weight={"font-bold"} text={"Primary Contact Person"}/>

                                <SingleField labelText={"Contact Person Name"} fieldHolder={"Enter contact name"} fieldId={"contactPersonName"} />
                                <SingleField labelText={"Position / Role"} fieldHolder={"Enter contact person position"} fieldId={"contactPersonRole"} />
                                <SingleField labelText={"Email Address"} fieldHolder={"Enter contact person email"} fieldId={"contactPersonEmail"} fieldType={"email"}/>
                                <SingleField labelText={"Contact Number"} fieldHolder={"Enter contact person number"} fieldId={"contactPersonNumber"}/>

                        <div className="w-full col-span-2 flex justify-center">
                                <button className="font-oasis-text text-[0.9rem] text-center py-3 px-5 w-[80%] rounded-3xl transition-all duration-200 hover:cursor-pointer bg-oasis-button-dark hover:bg-oasis-button-light text-white" type="button">Submit MOA Prospect</button>
                        </div>

                        </form>


                        
                     </div>

                </section>

            </div>
        </>
   )
}

