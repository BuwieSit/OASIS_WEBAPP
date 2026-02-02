import { Form, Link } from 'react-router-dom'
import AdminScreen from '../../layouts/adminScreen.jsx';
import { AdminHeader } from '../../components/headers.jsx'
import Title from "../../utilities/title.jsx";
import { Container, Filter } from '../../components/adminComps.jsx';
import { BulletField, FileUploadField, MultiField, SingleField } from '../../components/fieldComp.jsx';
import { AnnounceButton } from '../../components/button.jsx';
import { useState } from "react";
import { useSearchParams } from 'react-router-dom';
import { Label } from '../../utilities/label.jsx';
import { useLocalStorage } from '../../hooks/useLocalStorage.jsx';
import useQueryParam from '../../hooks/useQueryParams.jsx';

export default function DocsUpload() {
    const [uploads, setUploads] = useLocalStorage("uploads", []);

    const [activeFilter, setFilter] = useQueryParam("tab", "procedures")


    const addUpload = (data) => {
        setUploads(prev => [data, ...prev]);
    };
    return (
        <AdminScreen>
            <AdminHeader />

            <div>
                <Title text={"Documents Upload"} />
            </div>

            <Container column={true}>
                {/* FILTERS */}
                <section className="w-full flex flex-row justify-start items-center gap-5 mb-10">
                    {/* VINCENT - filtering lng to kung ano nalabas sa forms */}
                    <Filter
                        text="Procedures"
                        isActive={activeFilter === "procedures"}
                        onClick={() => setFilter("procedures")}
                    />
                    <Filter
                        text="MOA Process"
                        isActive={activeFilter === "moa"}
                        onClick={() => setFilter("moa")}
                    />
                    <Filter
                        text="Key Guidelines"
                        isActive={activeFilter === "guidelines"}
                        onClick={() => setFilter("guidelines")}
                    />
                    <Filter
                        text="Forms & Templates"
                        isActive={activeFilter === "forms"}
                        onClick={() => setFilter("forms")}
                    />
                </section>

                {/* CONTENT */}
                    {activeFilter === "procedures" && <Procedures onSave={addUpload} />}
                    {activeFilter === "moa" && <MoaProcess onSave={addUpload} />}
                    {activeFilter === "guidelines" && <KeyGuidelines onSave={addUpload} />}
                    {activeFilter === "forms" && <FormsTemplates onSave={addUpload} />}
            </Container>
        </AdminScreen>
    );
}

export function FormLayout({ children }) {
    return(
        <>
        <form className='w-full flex flex-col items-start justify-evenly gap-5'>
            {children}
        </form>
        </>
    )

}

export function Procedures({ onSave }) {
    const [header, setHeader] = useState("");
    const [steps, setSteps] = useState([{ id: 1, value: "" }]);

    const handleSubmit = () => {
        if (!header || steps.every(s => !s.value)) return;

        const now = new Date();

        onSave({
            id: crypto.randomUUID(),
            type: "procedures",
            title: header,
            steps: steps.map(s => s.value).filter(Boolean),
            date: now.toLocaleDateString(),
            time: now.toLocaleTimeString()
        });

        setHeader("");
        setSteps([{ id: 1, value: "" }]);
    };

    const MAX_STEPS = 50;

    const addStep = () => {
        if (steps.length >= MAX_STEPS) return;
        setSteps(prev => [...prev, { id: crypto.randomUUID(), value: "" }]);
    };

    const removeStep = (id) => {
        setSteps(prev => prev.filter(step => step.id !== id));
    };

    const handleClear = () => {
        setSteps([{ id: crypto.randomUUID(), value: "" }]);
    };

    const updateStep = (id, value) => {
        setSteps(prev =>
            prev.map(step =>
                step.id === id ? { ...step, value } : step
            )
        );
    };

    return (
        <FormLayout>
            <section className="w-full">
                <SingleField
                    labelText={"Procedure Header"}
                    fieldId={"procedureHeader"}
                    fieldHolder={"Enter Procedure header..."}
                    value={header}
                    onChange={(e) => setHeader(e.target.value)}
                />
            </section>

            <div>
                <Label labelText={"Add steps"} />
            </div>

            {/* STEPS */}
            {steps.map((step, index) => (
                <div key={step.id} className="w-full flex items-center gap-3">
                    <MultiField
                        labelText={`Step ${index + 1}`}
                        fieldId={`step${index + 1}`}
                        fieldHolder={`Enter step ${index + 1}`}
                        value={step.value}
                        onChange={(e) => updateStep(step.id, e.target.value)}
                    />

                    {steps.length > 1 && (
                        <AnnounceButton
                            btnText="Delete"
                            onClick={() => removeStep(step.id)}
                        />
                    )}
                </div>
            ))}

            <section className="flex flex-row gap-5 mt-3">
                <AnnounceButton btnText="Add" onClick={addStep} />
                {steps.length > 1 && (
                    <AnnounceButton onClick={handleClear} btnText="Clear All" />
                )}
                {steps.length >= MAX_STEPS && (
                    <p className="text-[0.7rem] text-red-700 italic">
                        Maximum of {MAX_STEPS} steps reached
                    </p>
                )}
            </section>
            <AnnounceButton btnText="Save Procedure" onClick={handleSubmit} />

        </FormLayout>
    );
}

export function MoaProcess({ onSave }) {
    const [header, setHeader] = useState("");
    const [steps, setSteps] = useState([{ id: crypto.randomUUID(), value: "" }]);

    const MAX_STEPS = 50;

    const addStep = () => {
        if (steps.length >= MAX_STEPS) return;
        setSteps(prev => [...prev, { id: crypto.randomUUID(), value: "" }]);
    };

    const removeStep = (id) => {
        setSteps(prev => prev.filter(step => step.id !== id));
    };

    const handleClear = () => {
        setSteps([{ id: crypto.randomUUID(), value: "" }]);
    };

    const updateStep = (id, value) => {
        setSteps(prev =>
            prev.map(step =>
                step.id === id ? { ...step, value } : step
            )
        );
    };

    const handleSubmit = () => {
        const cleanSteps = steps.map(s => s.value.trim()).filter(Boolean);
        if (!header.trim() || !cleanSteps.length) return;

        const now = new Date();

        onSave({
            id: crypto.randomUUID(),
            type: "moa",
            title: header,
            steps: cleanSteps,
            date: now.toLocaleDateString(),
            time: now.toLocaleTimeString(),
            createdAt: Date.now()
        });

        setHeader("");
        setSteps([{ id: crypto.randomUUID(), value: "" }]);
    };

    return (
        <FormLayout>
            <section className="w-full">
                <SingleField
                    labelText="MOA Process Header"
                    fieldHolder="Enter Process Header..."
                    value={header}
                    onChange={(e) => setHeader(e.target.value)}
                />
            </section>

            <Label labelText="Add steps" />

            {steps.map((step, index) => (
                <div key={step.id} className="w-full flex items-center gap-3">
                    <MultiField
                        labelText={`Step ${index + 1}`}
                        fieldHolder={`Enter step ${index + 1}`}
                        value={step.value}
                        onChange={(e) => updateStep(step.id, e.target.value)}
                    />

                    {steps.length > 1 && (
                        <AnnounceButton
                            btnText="Delete"
                            type="button"
                            onClick={() => removeStep(step.id)}
                        />
                    )}
                </div>
            ))}

            <section className="flex gap-5 mt-3">
                <AnnounceButton btnText="Add" type="button" onClick={addStep} />
                {steps.length > 1 && (
                    <AnnounceButton btnText="Clear All" type="button" onClick={handleClear} />
                )}
            </section>

            <AnnounceButton
                btnText="Save MOA Process"
                type="button"
                onClick={handleSubmit}
            />
        </FormLayout>
    );
}
    


export function KeyGuidelines() {
    
    const [steps, setSteps] = useState([{ id: 1, value: "" }]);
    const [stepCounter, setStepCounter] = useState(2); 

    const MAX_STEPS = 50;

    const addStep = () => {
        if (steps.length >= MAX_STEPS) return;

        setSteps(prev => [
            ...prev,
            { id: stepCounter, value: "" } 
        ]);
        setStepCounter(prev => prev + 1);
    };

    const removeStep = (id) => {
        setSteps(prev => prev.filter(step => step.id !== id));
    };

    const handleClear = () => {
        setSteps(prev => prev.length > 1 ? [prev[0]] : prev);
    };

    const updateStep = (id, value) => {
        setSteps(prev =>
            prev.map(step => (step.id === id ? { ...step, value } : step))
        );
    };

    return (
        <FormLayout>
            <section className="w-full">
                <SingleField
                    labelText={"Key Guidelines Header"}
                    fieldId={"keyGuidelineHeader"}
                    fieldHolder={"Enter Guideline Header..."}
                />
            </section>

            <div>
                <Label labelText={"Add steps"} />
            </div>

            {/* STEPS */}
            {steps.map((step, index) => (
                <div key={step.id} className="w-full flex items-center gap-3">
                    <MultiField
                        labelText={`Step ${index + 1}`}
                        fieldId={`step${index + 1}`}
                        fieldHolder={`Enter step ${index + 1}`}
                        value={step.value}
                        onChange={(e) => updateStep(step.id, e.target.value)}
                    />

                    {steps.length > 1 && (
                        <AnnounceButton
                            btnText="Delete"
                            onClick={() => removeStep(step.id)}
                        />
                    )}
                </div>
            ))}

            <section className="flex flex-row gap-5 mt-3">
                <AnnounceButton btnText="Add" onClick={addStep} />
                {steps.length > 1 && (
                    <AnnounceButton onClick={handleClear} btnText="Clear All" />
                )}
                {steps.length >= MAX_STEPS && (
                    <p className="text-[0.7rem] text-red-700 italic">
                        Maximum of {MAX_STEPS} steps reached
                    </p>
                )}
            </section>
        </FormLayout>
    );
}
export function FormsTemplates() {
    return (
        <>
            <FormLayout>       
                <SingleField labelText={"Document Title"} fieldHolder={"Enter Document Title..."} fieldId={"documentName"} fieldType={"text"}/>
                
                <MultiField labelText={"Description"} fieldHolder={"Enter description"} fieldId={"documentDescription"}/>
                             
                <FileUploadField labelText={"Upload Document"} fieldId={"documentFile"}/>

                <section className='w-full flex flex-row items-center justify-start gap-3 '>
                    <AnnounceButton btnText='Upload Document'/>
                    <AnnounceButton btnText='Clear'/>
                </section>
            </FormLayout>

                
           
        </>
    )
}