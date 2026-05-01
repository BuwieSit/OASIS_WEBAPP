import { useState, useEffect } from "react";
import Subtitle from "../utilities/subtitle";
import Title from "../utilities/title";
import { AnnounceButton } from "./button";
import { FileUploadField, SingleField } from "./fieldComp";
import imgBg from "../assets/fallbackImage.jpg";
import { submitMoaProspect } from "../api/student.service";
import { GeneralPopupModal } from "./popupModal";
import { 
    X, 
    Building2, 
    Briefcase, 
    MapPin, 
    User, 
    Mail, 
    Phone, 
    FileText, 
    CheckCircle,
    Info
} from "lucide-react";

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

    const [errMsg, setErrMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);
    const [fileKey, setFileKey] = useState(Date.now());

    const initialFormData = {
        company_name: "",
        industry: "",
        address: "",
        contact_person: "",
        contact_position: "",
        contact_email: "",
        contact_number: "",
        moa_file: null,
    };

    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        setErrMsg("");
    }, [formData]);

    const handleChange = (field) => (e) => {
        let value = e.target.value;
        if (field === "contact_number") {
            value = value.replace(/\D/g, "");
        }
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0] || null;
        if (file && file.type !== "application/pdf") {
            setErrMsg("Only PDF files are allowed.");
            setFormData((prev) => ({
                ...prev,
                moa_file: null,
            }));
            setFileKey(Date.now());
            return;
        }
        setErrMsg("");
        setFormData((prev) => ({
            ...prev,
            moa_file: file,
        }));
    };

    const requiredFields = [
        "company_name",
        "industry",
        "address",
        "contact_person",
        "contact_position",
        "contact_email",
        "contact_number",
    ];

    const isEmailValid = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const emptyFields = requiredFields.filter(
        (field) => !String(formData[field] || "").trim()
    );

    const invalidFields = [];
    if (formData.contact_email && !isEmailValid(formData.contact_email)) {
        invalidFields.push("contact_email (invalid format)");
    }

    const allErrors = [
        ...emptyFields.map(f => f.replaceAll("_", " ")),
        ...invalidFields.map(f => f.replaceAll("_", " "))
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAttemptedSubmit(true);

        if (allErrors.length > 0) {
            setErrMsg("Invalid Entry. Please fill in all required fields correctly.");
            return;
        }

        const payload = new FormData();
        payload.append("company_name", formData.company_name.trim());
        payload.append("industry", formData.industry.trim());
        payload.append("address", formData.address.trim());
        payload.append("contact_person", formData.contact_person.trim());
        payload.append("contact_position", formData.contact_position.trim());
        payload.append("contact_email", formData.contact_email.trim());
        payload.append("contact_number", formData.contact_number.trim());

        if (formData.moa_file) {
            payload.append("moa_file", formData.moa_file);
        }

        try {
            await submitMoaProspect(payload);
            setSuccessMsg("MOA Prospect submitted successfully.");
            setFormData(initialFormData);
            setAttemptedSubmit(false);

            const fileInput = document.getElementById("moa_file");
            if (fileInput) {
                fileInput.value = "";
            }
        } catch (err) {
            console.error("MOA Prospect submission failed", err);

            const data = err?.response?.data;
            const duplicateType = data?.duplicate_type;
            const existingRecord = data?.existing_record;

            if (duplicateType === "APPROVED_HTE") {
                setErrMsg(
                    `"${existingRecord?.company_name || formData.company_name}" is already an approved HTE.` +
                    (existingRecord?.moa_status
                        ? ` Current MOA status: ${existingRecord.moa_status}.`
                        : "")
                );
                return;
            }

            if (duplicateType === "EXISTING_MOA_PROSPECT") {
                setErrMsg(
                    `"${existingRecord?.company_name || formData.company_name}" already exists as a MOA prospect.` +
                    (existingRecord?.status
                        ? ` Current status: ${existingRecord.status}.`
                        : "")
                );
                return;
            }

            const errorMessage =
                data?.message ||
                data?.error ||
                "Failed to submit MOA Prospect.";

            setErrMsg(errorMessage);
        }
    };

    return (
        <>
            {successMsg && 
                <GeneralPopupModal 
                    text={successMsg} 
                    title={"Successful"} 
                    time={3000} 
                    isSuccess={true}
                    onClose={() => setSuccessMsg("")}
                />
            }

            {errMsg && 
                <GeneralPopupModal 
                    text={errMsg} 
                    title={"Submission Error"} 
                    time={4000} 
                    icon={<X color="#800020" size={35}/>}
                    isFailed={true}
                    onClose={() => setErrMsg("")}
                />
            }
            
            <div
                id="prospectForm"
                className="relative w-full px-5 py-20 flex flex-col gap-10 justify-center items-center overflow-hidden"
            >
                {/* Visual Background Elements */}
                <img
                    src={imgBg}
                    className="w-full h-full object-cover z-0 absolute top-0 left-0 opacity-40 blur-[2px]"
                />
                <div className="absolute inset-0 z-0 bg-linear-to-b from-black/40 to-black/40" />

                <section className="relative z-10 text-center max-w-4xl px-4 flex flex-col items-center">
                    <div className="animate__animated animate__fadeInDown">
                        <Subtitle text={"MOA Prospect Submission"} size="text-3xl md:text-5xl" color={"text-white"} weight={"font-bold"}/>
                        <div className="w-24 h-1 bg-white mx-auto mt-4 rounded-full mb-6" />
                        <Subtitle 
                            color="text-white/90" 
                            size="text-sm md:text-base" 
                            weight="font-medium"
                            isCenter={true}
                            text={"Partner with us! Submit a new Host Training Establishment (HTE) for MOA processing."} 
                        />
                    </div>
                </section>

                <section className="relative z-10 w-full max-w-7xl grid lg:grid-cols-5 gap-8 items-start px-4">
                    
                    {/* LEFT PANEL: PROCESS FLOW */}
                    <div className="lg:col-span-2 order-2 lg:order-1 h-full">
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 md:p-10 rounded-[2.5rem] shadow-2xl sticky top-20 flex flex-col gap-8">
                            <div className="flex items-center gap-3 border-b border-white/10 pb-6">
                                <div className="p-3 bg-oasis-button-light/20 rounded-2xl text-oasis-button-light">
                                    <Info size={28} />
                                </div>
                                <Subtitle 
                                    size={"text-xl"} 
                                    color={"text-white"} 
                                    weight={"font-black"} 
                                    text={"MOA Process Flow"} 
                                />
                            </div>

                            <div className="overflow-y-auto max-h-[600px] custom-scrollbar pr-2">
                                <MOAStepList steps={moaSteps} />
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL: FORM */}
                    <div className="lg:col-span-3 order-1 lg:order-2">
                        <form
                            onSubmit={handleSubmit}
                            className="bg-white p-8 md:p-12 flex flex-col shadow-2xl rounded-[2.5rem] gap-8 relative border border-white/50"
                        >
                            {/* Form Header */}
                            <div className="space-y-2 border-b border-gray-100 pb-6">
                                <div className="flex items-center gap-2 text-oasis-button-dark">
                                    <Building2 size={24} />
                                    <Subtitle
                                        size={"text-lg"}
                                        color={"text-oasis-button-dark"}
                                        weight={"font-black"}
                                        text={"HTE INFORMATION"}
                                    />
                                </div>
                                <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">General details of the establishment</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <SingleField
                                        labelText={"HTE / Company Name"}
                                        fieldHolder={"Enter legal company name"}
                                        fieldId={"company_name"}
                                        value={formData.company_name}
                                        onChange={handleChange("company_name")}
                                        icon={<Building2 size={18} />}
                                        hasError={attemptedSubmit && !formData.company_name.trim()}
                                    />
                                </div>

                                <SingleField
                                    labelText={"Nature of Business"}
                                    fieldHolder={"e.g. IT, Finance, Healthcare"}
                                    fieldId={"industry"}
                                    value={formData.industry}
                                    onChange={handleChange("industry")}
                                    icon={<Briefcase size={18} />}
                                    hasError={attemptedSubmit && !formData.industry.trim()}
                                />

                                <SingleField
                                    labelText={"HTE Address"}
                                    fieldHolder={"Complete street address"}
                                    fieldId={"address"}
                                    value={formData.address}
                                    onChange={handleChange("address")}
                                    icon={<MapPin size={18} />}
                                    hasError={attemptedSubmit && !formData.address.trim()}
                                />
                            </div>

                            <div className="bg-oasis-blue/5 p-6 rounded-3xl border border-oasis-blue/10">
                                <FileUploadField
                                    key={fileKey}
                                    labelText={"Supporting MOA Document"}
                                    fieldId={"moa_file"}
                                    onChange={handleFileChange}
                                    hasError={attemptedSubmit && errMsg.includes("PDF")}
                                />
                                <p className="mt-2 text-[0.7rem] text-oasis-blue font-medium flex items-center gap-1.5">
                                    <Info size={12} />
                                    Optional: Upload a pre-signed or template MOA (PDF only)
                                </p>
                            </div>

                            {/* Contact Person Section */}
                            <div className="space-y-2 border-b border-gray-100 pb-6 pt-4">
                                <div className="flex items-center gap-2 text-oasis-button-dark">
                                    <User size={24} />
                                    <Subtitle
                                        size={"text-lg"}
                                        color={"text-oasis-button-dark"}
                                        weight={"font-black"}
                                        text={"PRIMARY CONTACT PERSON"}
                                    />
                                </div>
                                <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">Who should we communicate with?</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <SingleField
                                    labelText={"Full Name"}
                                    fieldHolder={"Enter contact person name"}
                                    fieldId={"contact_person"}
                                    value={formData.contact_person}
                                    onChange={handleChange("contact_person")}
                                    icon={<User size={18} />}
                                    hasError={attemptedSubmit && !formData.contact_person.trim()}
                                />

                                <SingleField
                                    labelText={"Position"}
                                    fieldHolder={"Enter their designation"}
                                    fieldId={"contact_position"}
                                    value={formData.contact_position}
                                    onChange={handleChange("contact_position")}
                                    icon={<CheckCircle size={18} />}
                                    hasError={attemptedSubmit && !formData.contact_position.trim()}
                                />

                                <SingleField
                                    labelText={"Email Address"}
                                    fieldHolder={"example@company.com"}
                                    fieldId={"contact_email"}
                                    fieldType={"email"}
                                    value={formData.contact_email}
                                    onChange={handleChange("contact_email")}
                                    icon={<Mail size={18} />}
                                    hasError={attemptedSubmit && (!formData.contact_email.trim() || !isEmailValid(formData.contact_email))}
                                />

                                <SingleField
                                    labelText={"Contact Number"}
                                    fieldHolder={"Enter 11-digit mobile/landline"}
                                    fieldId={"contact_number"}
                                    value={formData.contact_number}
                                    onChange={handleChange("contact_number")}
                                    icon={<Phone size={18} />}
                                    hasError={attemptedSubmit && !formData.contact_number.trim()}
                                />
                            </div>

                            {/* Error Summary */}
                            {attemptedSubmit && allErrors.length > 0 && (
                                <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex items-start gap-3 animate__animated animate__shakeX">
                                    <div className="p-1.5 bg-red-100 rounded-lg text-red-600 shrink-0">
                                        <X size={16} />
                                    </div>
                                    <Subtitle
                                        color="text-red-600"
                                        size="text-[0.75rem]"
                                        weight="font-bold"
                                        text={`Missing Required Fields: ${allErrors.join(", ")}`}
                                    />
                                </div>
                            )}

                            <div className="pt-6">
                                <AnnounceButton
                                    isFullWidth={true}
                                    btnText="Submit MOA Prospect"
                                    type="submit"
                                    icon={<FileText size={20} />}
                                    className="py-5 text-lg rounded-2xl shadow-xl shadow-oasis-button-dark/20"
                                />
                                <p className="text-center text-gray-400 text-[0.65rem] mt-4 font-bold uppercase tracking-tighter italic">
                                    By submitting, you ensure that the contact information is accurate for OJT processing.
                                </p>
                            </div>
                        </form>
                    </div>
                </section>
            </div>
        </>
    );
}

export function MOAStepList({ steps }) {
    return (
        <div className="relative flex flex-col gap-8 py-4">
            {/* Timeline Line */}
            <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-linear-to-b from-oasis-button-light via-oasis-aqua/50 to-oasis-blue/20" />

            {steps.map((step, index) => (
                <div key={index} className="group relative flex gap-6 items-start animate__animated animate__fadeInLeft" style={{ animationDelay: `${index * 100}ms` }}>
                    {/* Step Number Circle */}
                    
                    <div
                        className={`
                        relative z-10 shrink-0 w-10 h-10 rounded-xl
                        flex items-center justify-center
                        text-white font-black text-sm shadow-lg 
                        ${step.bg || "bg-oasis-aqua"}
                    `}
                    >
                        {(index + 1).toString().padStart(2, "0")}

                    </div>

                    <div className="flex flex-col gap-1 pt-0.5">
                        <h3 className="font-black text-white text-[1rem] group-hover:text-oasis-button-light transition-colors duration-300">
                            {step.title}
                        </h3>

                        <p className="text-white/60 text-[0.75rem] leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                            {step.description}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}