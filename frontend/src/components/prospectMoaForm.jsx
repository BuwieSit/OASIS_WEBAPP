import { useState } from "react";
import Subtitle from "../utilities/subtitle";
import Title from "../utilities/title";
import { AnnounceButton } from "./button";
import { FileUploadField, SingleField } from "./fieldComp";
import imgBg from "../assets/fallbackImage.jpg";
import { submitMoaProspect } from "../api/student.service";

export default function ProspectMoaForm() {
    const moaSteps = [
        {
            title: "New Potential HTE's",
            description: "The Student/Trainee emails the contact information of the potential HTE's to the OJT Coordinator.",
            bg: "bg-[#4A9B8E]"
        },
        {
            title: "Submit the MOA to HTE",
            description: "The OJT Coordinator will email the MOA templates to HTEs for review and approval.",
            bg: "bg-[#4A9B8E]"
        },
        {
            title: "MOA to Coordinator",
            description: "Reviewed MOA template will be submitted to the OJT Coordinator.",
            bg: "bg-[#8B7355]"
        },
        {
            title: "MOA to Legal Approval",
            description: "Send MOA to Legal Office for review and approval.",
            bg: "bg-[#C85A54]"
        },
        {
            title: "Approved the MOA",
            description: "Approved MOA will be returned to Coordinator.",
            bg: "bg-[#C85A54]"
        },
        {
            title: "Printing of MOA",
            description: "Coordinator will print the approved MOA.",
            bg: "bg-[#6BB36B]"
        },
        {
            title: "MOA for Signature",
            description: "Endorse MOA to Dean and VPAA for signature.",
            bg: "bg-[#8B7355]"
        },
        {
            title: "Informing of Retrieval",
            description: "Email HTE for MOA retrieval.",
            bg: "bg-[#4A9B8E]"
        },
        {
            title: "Retrieval of MOA",
            description: "Students may retrieve MOA via OJT office.",
            bg: "bg-[#4A9B8E]"
        },
        {
            title: "Signature & Notarization",
            description: "Submit signed MOA for notarization.",
            bg: "bg-[#8B7355]"
        },
        {
            title: "Submission of MOA",
            description: "Submit notarized MOA to OJT Office.",
            bg: "bg-[#4A9B8E]"
        }
    ];
    
    const [formData, setFormData] = useState({
        company_name: "",
        industry: "",
        address: "",
        contact_person: "",
        contact_position: "",
        contact_email: "",
        contact_number: "",
        moa_file: null,
    });

    const handleChange = (field) => (e) => {
        setFormData({
            ...formData,
            [field]: e.target.value,
        });
    };

    const handleFileChange = (e) => {
        setFormData({
            ...formData,
            moa_file: e.target.files[0],
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = new FormData();
        payload.append("company_name", formData.company_name);
        payload.append("industry", formData.industry);
        payload.append("address", formData.address);
        payload.append("contact_person", formData.contact_person);
        payload.append("contact_position", formData.contact_position);
        payload.append("contact_email", formData.contact_email);
        payload.append("contact_number", formData.contact_number);
        payload.append("moa_file", formData.moa_file);

        try {
            await submitMoaProspect(payload);
            alert("MOA Prospect submitted successfully.");

            // Optional: reset form after success
            setFormData({
                company_name: "",
                industry: "",
                address: "",
                contact_person: "",
                contact_position: "",
                contact_email: "",
                contact_number: "",
                moa_file: null,
            });
        } catch (err) {
            console.error("MOA Prospect submission failed", err);
            alert("Failed to submit MOA Prospect.");
        }
    };

    return (
        <>
            {/* PARENT CONTAINER */}
            <div
                id="prospectForm"
                className="relative w-full px-5 py-10 flex flex-col gap-2 justify-center items-center shadow-[inset_0_0_50px_rgba(0,0,0,1)]"
            >
                <img
                    src={imgBg}
                    className="w-full h-full object-cover z-1 absolute top-1/2 left-1/2 
                    -translate-x-1/2 -translate-y-1/2 opacity-50"
                />

                <section className="mb-5 z-10">
                    <Title text={"MOA Prospect Submission"} />
                    <Subtitle text={"Please fill out this form to propose a new Host Training Establishment (HTE) for partnership."} />
                </section>

                <section className="w-full grid md:grid-cols-2 lg:grid-cols-2 place-items-start justify-items-center gap-5 z-10">
                    
                    {/* MOA PROCESS STEPS */}
                    <div className="bg-oasis-gradient hidden w-[450px] p-10 md:flex lg:flex flex-col justify-center items-start shadow-[3px_3px_2px_rgba(0,0,0,0.4)] rounded-3xl">
                        <Subtitle size={"text-[1.2rem]"} color={"text-black"} weight={"font-bold"} text={"MOA Process Flow"}/>

                        <div className="mt-5 w-full font-oasis-text text-[0.85rem] flex flex-col gap-4">
                            <MOAStepList steps={moaSteps}/> 
                        </div>
                    </div>

                    {/* FORM */}
                    <div className="w-full max-w-[600px] px-4 sm:px-6 lg:px-0">
                        <form
                            onSubmit={handleSubmit}
                            className="bg-oasis-gradient p-5 sm:p-8 md:p-10 flex flex-col justify-center items-start shadow-[3px_3px_2px_rgba(0,0,0,0.4)] rounded-3xl gap-3"
                        >
                            <Subtitle
                                size={"text-[1rem]"}
                                color={"text-black"}
                                weight={"font-bold"}
                                text={"HTE Information"}
                            />

                            <SingleField
                                labelText={"HTE / Company Name"}
                                fieldHolder={"Enter Company Name"}
                                fieldId={"company_name"}
                                value={formData.company_name}
                                onChange={handleChange("company_name")}
                            />

                            <SingleField
                                labelText={"Nature of Business"}
                                fieldHolder={"Enter nature of business"}
                                fieldId={"industry"}
                                value={formData.industry}
                                onChange={handleChange("industry")}
                            />

                            <SingleField
                                labelText={"HTE Address"}
                                fieldHolder={"Enter Address"}
                                fieldId={"address"}
                                value={formData.address}
                                onChange={handleChange("address")}
                            />

                            <FileUploadField
                                labelText={"Upload filled-up MOA"}
                                onChange={handleFileChange}
                            />

                            <Subtitle
                                size={"text-[1rem]"}
                                color={"text-black"}
                                weight={"font-bold"}
                                text={"Primary Contact Person"}
                            />

                            <SingleField
                                labelText={"Contact Person Name"}
                                fieldHolder={"Enter contact name"}
                                fieldId={"contact_person"}
                                value={formData.contact_person}
                                onChange={handleChange("contact_person")}
                            />

                            <SingleField
                                labelText={"Position / Designation"}
                                fieldHolder={"Enter contact person position"}
                                fieldId={"contact_position"}
                                value={formData.contact_position}
                                onChange={handleChange("contact_position")}
                            />

                            <SingleField
                                labelText={"Email Address"}
                                fieldHolder={"Enter contact person email"}
                                fieldId={"contact_email"}
                                fieldType={"email"}
                                value={formData.contact_email}
                                onChange={handleChange("contact_email")}
                            />

                            <SingleField
                                labelText={"Contact Number"}
                                fieldHolder={"Enter contact person number"}
                                fieldId={"contact_number"}
                                value={formData.contact_number}
                                onChange={handleChange("contact_number")}
                            />

                            <div className="w-full col-span-2 flex justify-center">
                                <AnnounceButton
                                    isFullWidth={true}
                                    btnText="Submit MOA Prospect"
                                />
                            </div>
                        </form>
                     </div>

                </section>
            </div>
        </>
   );
}

export function MOAStepList({ steps }) {
    const oasisBgClasses = [
        "bg-oasis-aqua",
        "bg-oasis-blue",
        "bg-oasis-dark",
        "bg-oasis-header"
    ];

    const getRandomBg = () => {
        return oasisBgClasses[
            Math.floor(Math.random() * oasisBgClasses.length)
        ];
    };
    return (
        <div className="flex flex-col gap-6">

            {steps.map((step, index) => (
                <div key={index} className="flex gap-3 items-start">

                    {/* Step Number Badge */}
                    <div className={`
                        shrink-0 w-10 h-10 rounded-full
                        flex items-center justify-center
                        text-white font-bold shadow-md
                        ${step.bg || getRandomBg()}
                    `}>
                        {(index + 1).toString().padStart(2, "0")}
                    </div>

                    {/* Content */}
                    <div>
                        <h3 className="font-bold text-[0.95rem] mb-1">
                            {step.title}
                        </h3>

                        <p className="text-justify text-sm">
                            {step.description}
                        </p>
                    </div>

                </div>
            ))}

        </div>
    );
}