import { Form, Link } from 'react-router-dom'
import AdminScreen from '../../layouts/adminScreen.jsx';
import Title from "../../utilities/title.jsx";
import { Container, Dropdown, Filter } from '../../components/adminComps.jsx';
import { FileUploadField, MultiField, SingleField } from '../../components/fieldComp.jsx';
import { AnnounceButton } from '../../components/button.jsx';
import { useState } from "react";
import { Label } from '../../utilities/label.jsx';
import { useLocalStorage } from '../../hooks/useLocalStorage.jsx';
import useQueryParam from '../../hooks/useQueryParams.jsx';
import { Delete, Plus, Save, X } from 'lucide-react';
import Subtitle from '../../utilities/subtitle.jsx';
import { TreeRenderer } from '../../utilities/TreeRenderer.jsx';



export default function DocsUpload() {
    const [activeFilter, setFilter] = useQueryParam("tab", "procedures");
    const [showModal, setShowModal] = useState(false);

    return (
        <AdminScreen>
           {showModal &&
                <DocsAddModal 
                    onClick={() => setShowModal(false)}
                />
            }

            <div>
                <Title text={"Documents Upload"} />
            </div>

            <Container column={true}>
                {/* FILTERS */}
                <section className="w-full flex flex-row justify-start items-center gap-5 mb-10">
                    {/* VINCENT - filtering lng to kung ano nalabas sa forms */}
                    <Subtitle
                        size='text-[0.9rem]'
                        isLink={true}
                        text="Procedures"
                        isActive={activeFilter === "procedures"}
                        onClick={() => setFilter("procedures")}
                    />
                    <Subtitle text={"|"} size='text-[0.9rem]'/>
                    <Subtitle
                        size='text-[0.9rem]'
                        isLink={true}
                        text="MOA Process"
                        isActive={activeFilter === "moa"}
                        onClick={() => setFilter("moa")}
                    />
                    <Subtitle text={"|"} size='text-[0.9rem]'/>
                    <Subtitle
                        size='text-[0.9rem]'
                        isLink={true}
                        text="Key Guidelines"
                        isActive={activeFilter === "guidelines"}
                        onClick={() => setFilter("guidelines")}
                    />
                    <Subtitle text={"|"} size='text-[0.9rem]'/>
                    <Subtitle
                        size='text-[0.9rem]'
                        isLink={true}
                        text="Forms & Templates"
                        isActive={activeFilter === "forms"}
                        onClick={() => setFilter("forms")}
                    />

                </section>


                {/* CONTENT */}
                
                <div className='w-full flex flex-row p-3 gap-3 justify-evenly items-center'>
                    
                    <section className='w-[40%] p-5 sticky top-0 flex flex-wrap gap-2 justify-center items-center transition duration-200 ease-in-out'>
                        <div onClick={() => setShowModal(true)}>
                            <AnnounceButton textSize='text-[1rem]' btnText='Add Items' icon={<Plus size={25} />}/>
                        </div>
                        
                    </section>

                    {activeFilter === "procedures" && <Procedures/>}
                    {activeFilter === "moa" && <MoaProcess/>}
                    {activeFilter === "guidelines" && <KeyGuidelines/>}
                    {activeFilter === "forms" && <FormsTemplates/>}
                </div>

            </Container>
        </AdminScreen>
    );
}


export function DocsAddModal({
    onClick,
    onCreate,
    parents = []
}) {

    const [itemType, setItemType] = useState("");
    const [title, setTitle] = useState("");
    const [parent, setParent] = useState("");
    const [isChecked, setIsChecked] = useState(false);

    const handleCheckbox = (e) => {
        const checked = e.target.checked;
        setIsChecked(checked);

        if (!checked) {
            setParent("");
        }
    };

    const isCreateEnabled =
        itemType !== "" &&
        title.trim() !== "" &&
        (!isChecked || parent !== "");

    const handleCreate = () => {

        if (!isCreateEnabled) return;

        onCreate({
            id: crypto.randomUUID(),
            type: itemType,
            title,
            parentId: isChecked ? parent : null,
            children: []
        });

        setItemType("");
        setTitle("");
        setParent("");
        setIsChecked(false);
    };

    return (
        <div className="w-full h-screen fixed top-0 left-0 flex items-center justify-center bg-black/50 z-110 pointer-events-none">

            <div className="min-w-[30%] p-10 backdrop-blur-2xl bg-oasis-gradient border border-gray-500 rounded-3xl drop-shadow-lg flex flex-col gap-5 pointer-events-auto">

                <form className="w-full flex flex-col gap-5">

                    <Subtitle size="text-[1.5rem]" text="Add new item"/>

                    <Dropdown
                        placeholder="Select Item type"
                        categories={[
                            "Header",
                            "Description",
                            "Numerical List",
                            "Bulleted List",
                            "Alphabetical List"
                        ]}
                        value={itemType}
                        onChange={setItemType}
                    />

                    <SingleField
                        fieldHolder="Enter a title..."
                        fieldId="itemTitle"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <label className="flex gap-3 items-center cursor-pointer">
                        <Subtitle size="text-[1rem]" text="Nest under a parent?"/>
                        <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={handleCheckbox}
                            className="w-5 h-5 cursor-pointer"
                        />
                    </label>

                    <Dropdown
                        placeholder="Select parent"
                        disabled={!isChecked}
                        categories={parents}
                        value={parent}
                        onChange={setParent}
                    />

                    <div className="flex justify-end gap-3 w-full">
                        <AnnounceButton btnText="Cancel" onClick={onClick}/>
                        <AnnounceButton
                            btnText="Create"
                            disabled={!isCreateEnabled}
                            onClick={handleCreate}
                        />
                    </div>

                </form>
            </div>
        </div>
    );
}

export function FormLayout({ children }) {
    return(
        <>
            <form className='w-full flex flex-col items-start justify-evenly gap-5'>
                {children}
                <div className='flex flex-row gap-5'>
                    <AnnounceButton icon={<Save/>} btnText='Save'/>
                    <AnnounceButton btnText='Clear all'/>
                </div>
                
            </form>
        </>
    )
}


export function Procedures() {
    return (
        <>
            <FormLayout>
                <section className='w-full flex flex-col items-start justify-start'>
                    <SingleField 
                        labelText={"Procedures Header *"} 
                        fieldHolder={"Enter upload title..."} 
                        fieldId={"uploadHead"}
                    />
                    <MultiField 
                        labelText={"Description"} 
                        fieldHolder={"Enter upload description..."}    
                        fieldId={"uploadDesc"}
                    />
                </section>


            </FormLayout>
        </>
    )
}
export function MoaProcess() {
    return (
        <>
            <FormLayout>
                <section className='w-full flex flex-col items-start justify-start'>
                    <SingleField 
                        labelText={"MOA Process Header *"} 
                        fieldHolder={"Enter upload title..."} 
                        fieldId={"uploadHead"}
                    />
                    <MultiField 
                        labelText={"Description"} 
                        fieldHolder={"Enter upload description..."}    
                        fieldId={"uploadDesc"}
                    />
                </section>

            </FormLayout>
        </>
    )
}

export function KeyGuidelines() {
    return (
        <>
            <FormLayout>
                <section className='w-full flex flex-col items-start justify-start'>
                    <SingleField 
                        labelText={"Key Guidelines Header *"} 
                        fieldHolder={"Enter upload title..."} 
                        fieldId={"uploadHead"}
                    />
                    <MultiField 
                        labelText={"Description"} 
                        fieldHolder={"Enter upload description..."}    
                        fieldId={"uploadDesc"}
                    />
                </section>

            </FormLayout>
        </>
    )
}

export function FormsTemplates() {
    return (
        <>
            <FormLayout>
                <section className='w-full flex flex-col items-start justify-start'>
                    <SingleField 
                        labelText={"Document Template Header *"} 
                        fieldHolder={"Enter upload title..."} 
                        fieldId={"uploadHead"}
                    />
                    <MultiField 
                        labelText={"Description"} 
                        fieldHolder={"Enter upload description..."}    
                        fieldId={"uploadDesc"}
                    />
                    <FileUploadField labelText={"Upload Document"} fieldId={"documentFile"}/>
                </section>

            </FormLayout>
        </>
    )
}



// export function DocsAddModal({ subId = "", onClick }) {

//     const [itemType, setItemType] = useState("");
//     const [title, setTitle] = useState("");
//     const [parent, setParent] = useState("");
//     const [isChecked, setIsChecked] = useState(false);

//     const handleCheckbox = (e) => {
//         const checked = e.target.checked;
//         setIsChecked(checked);


//         if (!checked) {
//             setParent("");
//         }
//     };

//     const isCreateEnabled =
//         itemType !== "" &&
//         title.trim() !== "" &&
//         (!isChecked || parent !== "");

//     const itemTypes = [
//         "Header",
//         "Description",
//         "Numerical List",
//         "Bulleted List",
//         "Alphabetical List"
//     ]

//     const parentsArr = [
//         "Header"
//     ]
//     return (
//         <>
//             <div className="w-full h-screen fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-110 bg-[rgba(0,0,0,0.5)] pointer-events-none">

//                 <div className={`fixed top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 min-w-[30%]  p-10 backdrop-blur-2xl bg-oasis-gradient border border-gray-500 rounded-3xl drop-shadow-lg flex flex-col items-center justify-center gap-5 font-oasis-text font-bold text-[1.3rem] duration-300 transition ease-in-out pointer-events-auto`}>
                
//                 <form className="w-full h-full flex flex-col justify-center items-start gap-5">

                    
//                     <div className="flex flex-col gap-3 ">
//                         <Subtitle size="text-[1.5rem]" text={"Add new item"}/>
//                         <Dropdown 
//                             placeholder="Select Item type" 
//                             categories={itemTypes}
//                             value={itemType}
//                             onChange={(value) => setItemType(value)}
//                         />
//                     </div>

//                     <div className="flex flex-col gap-3 ">
//                         <Subtitle size="text-[1.5rem]" text={"Add Title"}/>
//                         <SingleField 
//                             fieldHolder={"Enter a title..."} 
//                             fieldId={"itemTitle"}
//                             value={title}
//                             onChange={(e) => setTitle(e.target.value)}
//                         />
//                     </div>
                    
                
//                     <label className="flex gap-3 items-center cursor-pointer group">
//                         <Subtitle size="text-[1rem]" text={"Nest under a parent?"} />
//                         <input
//                             onClick={handleCheckbox}
//                             type="checkbox"
//                             className="w-5 h-5 cursor-pointer group-hover:shadow-[0px_0px_5px_rgba(0,0,0,0.3)] transition duration-100 ease-in-out"
//                         />
//                     </label>

//                     <Dropdown 
//                         placeholder="Select parent"
//                         disabled={!isChecked}
//                         categories={parentsArr}
//                         labelText="Select Category"
//                         value={parent}
//                         onChange={(value) => setParent(value)}
//                     />

//                     <div className="flex justify-end gap-3 w-full ">
//                         <AnnounceButton btnText="Cancel" onClick={onClick}/>
//                        <AnnounceButton btnText="Create" disabled={!isCreateEnabled}/>
//                     </div>
//                 </form>

//                 </div>
//             </div>
//         </>
//     )
// }


// export function DocsUploadGeneral() {
//     return (
//         <>
//             <FormLayout>
//                 <section className='w-full flex flex-col items-start justify-start'>
//                     <SingleField 
//                         labelText={"Header *"} 
//                         fieldHolder={"Enter upload title..."} 
//                         fieldId={"uploadHead"}
//                     />
//                     <MultiField 
//                         labelText={"Description"} 
//                         fieldHolder={"Enter upload description..."}    
//                         fieldId={"uploadDesc"}
//                     />
//                 </section>

//             </FormLayout>

//             <div>
//                 <TreeRenderer/>
//             </div>
//         </>
//     )
// }

// export function Procedures({ onSave }) {
//     const [header, setHeader] = useState("");
//     const [steps, setSteps] = useState([{ 
//         id: crypto.randomUUID(), value: "", sublist: [] 
//     }]);

//     const MAX_STEPS = 10;
//     const MAX_SUBLISTS = 5;
//     const categories = ['list-item1', 'list-item2', 'list-item3'];

//     const handleSubmit = () => {
//         if (!header || steps.every(s => !s.value)) return;
//         const now = new Date();
//         onSave({
//             id: crypto.randomUUID(),
//             type: "procedures",
//             title: header,
//             steps: steps.map(s => s.value).filter(Boolean),
//             date: now.toLocaleDateString(),
//             time: now.toLocaleTimeString()
//         });
//         setHeader("");
//         setSteps([{ id: crypto.randomUUID(), value: "", sublist: [] }]);
//     };

//     const addStep = () => {
//         if (steps.length >= MAX_STEPS) return;
//         setSteps(prev => [...prev, { id: crypto.randomUUID(), value: "", sublist: [] }]);
//     };
//     const addSubList = (stepId) => {
//         setSteps(prev =>
//             prev.map(step =>
//             step.id === stepId && step.sublist.length < MAX_SUBLISTS
//                 ? { 
//                     ...step, 
//                     sublist: [ 
//                         ...step.sublist, 
//                         {id: crypto.randomUUID(), value: ""}] 
//                 }
//                 : step
//             )
//         );
//     };


//     const removeSubList = (stepId, subId) => {
//         setSteps(prev =>
//             prev.map(step =>
//             step.id === stepId
//                 ? {
//                     ...step,
//                     sublist: step.sublist.filter(sub => sub.id !== subId)
//                 }
//                 : step
//             )
//         );
//     };
//     const removeStep = (id) => {
//         setSteps(prev => prev.filter(step => step.id !== id));
//     };


//     const handleClear = () => {
//         setSteps([{ id: crypto.randomUUID(), value: "", sublist: [] }]);
//     };
//     const updateStep = (id, value) => {
//         setSteps(prev =>
//             prev.map(step =>
//                 step.id === id ? { ...step, value } : step
//             )
//         );
//     };

//     return (
//         <FormLayout>
//             {/* <DocsAddModal /> */}
//             <section className="w-full">
//                 <SingleField
//                     labelText={"Procedure Header"}
//                     fieldId={"procedureHeader"}
//                     fieldHolder={"Enter Procedure header..."}
//                     value={header}
//                     onChange={(e) => setHeader(e.target.value)}
//                 />
//             </section>

//             {/* add steps button */}
//             <div className='flex gap-3 justify-center items-center'>

//                 <div onClick={addStep} className='relative p-2 aspect-video rounded-full flex justify-center items-center transition-all duration-100 ease-in-out group  cursor-pointer overflow-hidden'>
//                     <Plus  className='z-10 transition-all duration-300 ease-in-out group-hover:rotate-90 group-hover:scale-110 group-hover:invert'/>
//                     <Subtitle text={"Add Step"} className={"z-10"}/>
//                     <div className='w-0 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ease-in-out rounded-full group-hover:w-full aspect-video bg-green-400'></div>
//                 </div>

//                 <section className="flex flex-row gap-5 mt-3 justify-center items-center">

//                     {steps.length > 1 && (
//                         <AnnounceButton onClick={handleClear} btnText="Clear All" />
//                     )}
//                     {steps.length >= MAX_STEPS && (
//                         <Subtitle text={`Maximum capacity of ${MAX_STEPS} reached.`} color={"text-red-500"}/>
//                     )}
//                 </section>

//                 <div 
                    
//                     className={`relative p-2 aspect-video rounded-full flex justify-center items-center transition-all duration-100 ease-in-out overflow-hidden col-span-2 group cursor-pointer`}
//                 >
//                     <Plus  className='z-10 transition-all duration-300 ease-in-out group-hover:rotate-90 group-hover:scale-110 group-hover:invert'/>
//                     <Subtitle text={"Add Sublist"} className={"z-10"}/>
//                     <div className='w-0 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ease-in-out group-hover:w-full aspect-video bg-green-400'></div>
//                 </div>
//                 {/* ADD SUBLIST */}
//                 {/* {steps.map((step) => (
//                     <div 
//                         onClick={
//                             () => step.sublist.length < MAX_SUBLISTS && addSubList(step.id)
//                         } 
//                         className={`relative p-2 aspect-video rounded-full flex justify-center items-center transition-all duration-100 ease-in-out overflow-hidden col-span-2 group cursor-pointer
//                             `}
//                     >
//                         <Plus  className='z-10 transition-all duration-300 ease-in-out group-hover:rotate-90 group-hover:scale-110 group-hover:invert'/>
//                         <Subtitle text={"Add Sublist"} className={"z-10"}/>
//                         <div className='w-0 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ease-in-out group-hover:w-full aspect-video bg-green-400'></div>
//                     </div>
//                 ))} */}
//             </div>

//             {/* STEPS */}
//             {steps.map((step, index) => (
//                 <div key={step.id} className="w-full grid grid-cols-1 place-items-center justify-items-center gap-5">
                    
//                     <SingleField
//                         labelText={`Step ${index + 1}`}
//                         fieldId={`step${index + 1}`}
//                         fieldHolder={`Enter step ${index + 1}`}
//                         value={step.value}
//                         onChange={(e) => updateStep(step.id, e.target.value)}
//                     />

//                     {/* REMOVE STEP */}
//                     {steps.length > 1 && (
//                         <>
//                             <div className='flex gap-3 justify-center items-center'>
//                                 <div className='relative p-2 w-15 aspect-square rounded-full flex justify-center items-center transition-all duration-100 ease-in-out group overflow-hidden cursor-pointer'>
//                                     <Delete onClick={() => removeStep(step.id)} className='z-10 transition-all duration-300 ease-in-out group-hover:scale-110 group-hover:invert'/>

//                                     <div className='w-0 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ease-in-out rounded-full group-hover:w-full aspect-square bg-red-400'></div>
                                    
//                                 </div>
//                             </div>
//                         </>      
//                     )}

//                     {/* ADD SUBLIST */}
                    

//                     {/* SUBLISTS */}
//                     {step.sublist.map((sub, i) => (
//                         <div>
//                             <div key={sub.id} className="w-full grid grid-cols-1 place-items-center justify-items-center gap-5">
//                                 <Dropdown 
//                                     labelText={`Sublist ${i + 1}`}
//                                     fieldId={`sublist-${step.id}-${i}`}
//                                     categories={categories}
//                                 />
//                             </div>
//                             <div className='flex gap-3 justify-center items-center'>
//                                 <div className='relative p-2 w-15 aspect-square rounded-full flex justify-center items-center transition-all duration-100 ease-in-out group overflow-hidden cursor-pointer'>
//                                     <Delete onClick={() => removeSubList(step.id, sub.id)} className='z-10 transition-all duration-300 ease-in-out group-hover:scale-110 group-hover:invert'/>

//                                     <div className='w-0 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ease-in-out rounded-full group-hover:w-full aspect-square bg-red-400'></div>
                                    
//                                 </div>
//                             </div>
//                         </div>

//                     ))
                            
//                     }
//                 </div>
//             ))}
//             <AnnounceButton btnText="Save Procedure" onClick={handleSubmit} />

//         </FormLayout>
//     );
// }

// export function MoaProcess({ onSave }) {
//     const [header, setHeader] = useState("");
//     const [steps, setSteps] = useState([{ id: crypto.randomUUID(), value: "" }]);

//     const MAX_STEPS = 50;

//     const addStep = () => {
//         if (steps.length >= MAX_STEPS) return;
//         setSteps(prev => [...prev, { id: crypto.randomUUID(), value: "" }]);
//     };

//     const removeStep = (id) => {
//         setSteps(prev => prev.filter(step => step.id !== id));
//     };

//     const handleClear = () => {
//         setSteps([{ id: crypto.randomUUID(), value: "" }]);
//     };

//     const updateStep = (id, value) => {
//         setSteps(prev =>
//             prev.map(step =>
//                 step.id === id ? { ...step, value } : step
//             )
//         );
//     };

//     const handleSubmit = () => {
//         const cleanSteps = steps.map(s => s.value.trim()).filter(Boolean);
//         if (!header.trim() || !cleanSteps.length) return;

//         const now = new Date();

//         onSave({
//             id: crypto.randomUUID(),
//             type: "moa",
//             title: header,
//             steps: cleanSteps,
//             date: now.toLocaleDateString(),
//             time: now.toLocaleTimeString(),
//             createdAt: Date.now()
//         });

//         setHeader("");
//         setSteps([{ id: crypto.randomUUID(), value: "" }]);
//     };

//     return (
//         <FormLayout>
//             <section className="w-full">
//                 <SingleField
//                     labelText="MOA Process Header"
//                     fieldHolder="Enter Process Header..."
//                     value={header}
//                     onChange={(e) => setHeader(e.target.value)}
//                 />
//             </section>

//             <Label labelText="Add steps" />

//             {steps.map((step, index) => (
//                 <div key={step.id} className="w-full flex items-center gap-3">
//                     <MultiField
//                         labelText={`Step ${index + 1}`}
//                         fieldHolder={`Enter step ${index + 1}`}
//                         value={step.value}
//                         onChange={(e) => updateStep(step.id, e.target.value)}
//                     />

//                     {steps.length > 1 && (
//                         <AnnounceButton
//                             btnText="Delete"
//                             type="button"
//                             onClick={() => removeStep(step.id)}
//                         />
//                     )}
//                 </div>
//             ))}

//             <section className="flex gap-5 mt-3">
//                 <AnnounceButton btnText="Add" type="button" onClick={addStep} />
//                 {steps.length > 1 && (
//                     <AnnounceButton btnText="Clear All" type="button" onClick={handleClear} />
//                 )}
//             </section>

//             <AnnounceButton
//                 btnText="Save MOA Process"
//                 type="button"
//                 onClick={handleSubmit}
//             />
//         </FormLayout>
//     );
// }
    


// export function KeyGuidelines() {
    
//     const [steps, setSteps] = useState([{ id: 1, value: "" }]);
//     const [stepCounter, setStepCounter] = useState(2); 

//     const MAX_STEPS = 50;

//     const addStep = () => {
//         if (steps.length >= MAX_STEPS) return;

//         setSteps(prev => [
//             ...prev,
//             { id: stepCounter, value: "" } 
//         ]);
//         setStepCounter(prev => prev + 1);
//     };

//     const removeStep = (id) => {
//         setSteps(prev => prev.filter(step => step.id !== id));
//     };

//     const handleClear = () => {
//         setSteps(prev => prev.length > 1 ? [prev[0]] : prev);
//     };

//     const updateStep = (id, value) => {
//         setSteps(prev =>
//             prev.map(step => (step.id === id ? { ...step, value } : step))
//         );
//     };

//     return (
//         <FormLayout>
//             <section className="w-full">
//                 <SingleField
//                     labelText={"Key Guidelines Header"}
//                     fieldId={"keyGuidelineHeader"}
//                     fieldHolder={"Enter Guideline Header..."}
//                 />
//             </section>

//             <div>
//                 <Label labelText={"Add steps"} />
//             </div>

//             {/* STEPS */}
//             {steps.map((step, index) => (
//                 <div key={step.id} className="w-full flex items-center gap-3">
//                     <MultiField
//                         labelText={`Step ${index + 1}`}
//                         fieldId={`step${index + 1}`}
//                         fieldHolder={`Enter step ${index + 1}`}
//                         value={step.value}
//                         onChange={(e) => updateStep(step.id, e.target.value)}
//                     />

//                     {steps.length > 1 && (
//                         <AnnounceButton
//                             btnText="Delete"
//                             onClick={() => removeStep(step.id)}
//                         />
//                     )}
//                 </div>
//             ))}

//             <section className="flex flex-row gap-5 mt-3">
//                 <AnnounceButton btnText="Add" onClick={addStep} />
//                 {steps.length > 1 && (
//                     <AnnounceButton onClick={handleClear} btnText="Clear All" />
//                 )}
//                 {steps.length >= MAX_STEPS && (
//                     <p className="text-[0.7rem] text-red-700 italic">
//                         Maximum of {MAX_STEPS} steps reached
//                     </p>
//                 )}
//             </section>
//         </FormLayout>
//     );
// }
// export function FormsTemplates() {
//     return (
//         <>
//             <FormLayout>       
//                 <SingleField labelText={"Document Title"} fieldHolder={"Enter Document Title..."} fieldId={"documentName"} fieldType={"text"}/>
                
//                 <MultiField labelText={"Description"} fieldHolder={"Enter description"} fieldId={"documentDescription"}/>
                             
//                 <FileUploadField labelText={"Upload Document"} fieldId={"documentFile"}/>

//                 <section className='w-full flex flex-row items-center justify-start gap-3 '>
//                     <AnnounceButton btnText='Upload Document'/>
//                     <AnnounceButton btnText='Clear'/>
//                 </section>
//             </FormLayout>

                
           
//         </>
//     )
// }