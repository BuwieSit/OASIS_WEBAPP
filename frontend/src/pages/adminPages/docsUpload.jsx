import AdminScreen from '../../layouts/adminScreen.jsx';
import Title from "../../utilities/title.jsx";
import { Container, Dropdown } from '../../components/adminComps.jsx';
import { FileUploadField, MultiField, SingleField } from '../../components/fieldComp.jsx';
import { AnnounceButton } from '../../components/button.jsx';
import { useEffect, useMemo, useState } from "react";
import useQueryParam from '../../hooks/useQueryParams.jsx';
import { Plus, Save } from 'lucide-react';
import Subtitle from '../../utilities/subtitle.jsx';
import { TreeRenderer } from '../../utilities/TreeRenderer.jsx';
import { AdminAPI } from '../../api/admin.api.js';


const EMPTY_SECTION_STATE = {
    header: "",
    description: "",
    items: []
};

const SECTION_LABELS = {
    procedures: "Procedures",
    moa: "MOA Process",
    guidelines: "Key Guidelines",
    forms: "Forms & Templates"
};

const ITEM_TYPE_OPTIONS = [
    { label: "Header", value: "header" },
    { label: "Description", value: "description" },
    { label: "Numerical List", value: "numerical_list" },
    { label: "Bulleted List", value: "bulleted_list" },
    { label: "Alphabetical List", value: "alphabetical_list" },
    { label: "Document", value: "document" }
];

function flattenItems(items, depth = 0, result = []) {
    items.forEach((item) => {
        result.push({
            id: item.id,
            label: `${"— ".repeat(depth)}${item.title}`
        });

        if (item.children?.length) {
            flattenItems(item.children, depth + 1, result);
        }
    });

    return result;
}

function insertItemIntoTree(items, newItem) {
    if (!newItem.parentId) {
        return [...items, { ...newItem, children: newItem.children || [] }];
    }

    return items.map((item) => {
        if (item.id === newItem.parentId) {
            return {
                ...item,
                children: [...(item.children || []), { ...newItem, children: newItem.children || [] }]
            };
        }

        if (item.children?.length) {
            return {
                ...item,
                children: insertItemIntoTree(item.children, newItem)
            };
        }

        return item;
    });
}

function normalizeTreeForSave(items) {
    return items.map((item) => ({
        id: item.id,
        type: item.type,
        title: item.title,
        description: item.description || null,
        parentId: item.parentId || null,
        file: item.file || null,
        originalFilename: item.originalFilename || null,
        children: normalizeTreeForSave(item.children || [])
    }));
}

function extractSectionMeta(items) {
    const headerItem = items.find(
        (item) => item.parentId === null && item.type === "header" && item.isSectionMeta
    );

    const descriptionItem = items.find(
        (item) => item.parentId === null && item.type === "description" && item.isSectionMeta
    );

    return {
        header: headerItem?.title || "",
        description: descriptionItem?.description || descriptionItem?.title || ""
    };
}

function buildItemsWithSectionMeta(sectionState) {
    const metaItems = [];

    if (sectionState.header.trim()) {
        metaItems.push({
            id: `section-header-${crypto.randomUUID()}`,
            type: "header",
            title: sectionState.header.trim(),
            description: null,
            parentId: null,
            children: [],
            isSectionMeta: true
        });
    }

    if (sectionState.description.trim()) {
        metaItems.push({
            id: `section-description-${crypto.randomUUID()}`,
            type: "description",
            title: sectionState.description.trim(),
            description: sectionState.description.trim(),
            parentId: null,
            children: [],
            isSectionMeta: true
        });
    }

    return [...metaItems, ...sectionState.items];
}

function stripMetaItems(items) {
    return items.filter((item) => !item.isSectionMeta);
}

export default function DocsUpload() {
    const [activeFilter, setFilter] = useQueryParam("tab", "procedures");
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [sections, setSections] = useState({
        procedures: { ...EMPTY_SECTION_STATE },
        moa: { ...EMPTY_SECTION_STATE },
        guidelines: { ...EMPTY_SECTION_STATE },
        forms: { ...EMPTY_SECTION_STATE }
    });

    const activeSectionState = sections[activeFilter] || EMPTY_SECTION_STATE;

    const parentOptions = useMemo(() => {
        return flattenItems(activeSectionState.items).map((item) => item.label);
    }, [activeSectionState.items]);

    const parentOptionMap = useMemo(() => {
        const flat = flattenItems(activeSectionState.items);
        const map = {};
        flat.forEach((item) => {
            map[item.label] = item.id;
        });
        return map;
    }, [activeSectionState.items]);

    useEffect(() => {
        loadSection(activeFilter);
    }, [activeFilter]);

    async function loadSection(section) {
        try {
            setLoading(true);

            const response = await AdminAPI.getDocuments(section);
            const backendItems = response?.data?.items || [];

            const meta = extractSectionMeta(backendItems);

            setSections((prev) => ({
                ...prev,
                [section]: {
                    header: meta.header,
                    description: meta.description,
                    items: stripMetaItems(backendItems)
                }
            }));
        } catch (error) {
            console.error(`Failed to load ${section}:`, error);
        } finally {
            setLoading(false);
        }
    }

    function updateSectionField(section, key, value) {
        setSections((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value
            }
        }));
    }

    function handleCreateItem(payload) {
        const itemToInsert = {
            id: crypto.randomUUID(),
            type: payload.type,
            title: payload.title,
            description: payload.description || null,
            parentId: payload.parentId || null,
            file: payload.file || null,
            originalFilename: payload.originalFilename || null,
            children: []
        };

        setSections((prev) => ({
            ...prev,
            [activeFilter]: {
                ...prev[activeFilter],
                items: insertItemIntoTree(prev[activeFilter].items, itemToInsert)
            }
        }));

        setShowModal(false);
    }

    async function handleSaveSection() {
        try {
            setSaving(true);

            const payloadItems = buildItemsWithSectionMeta(activeSectionState);
            const normalizedItems = normalizeTreeForSave(payloadItems);

            await AdminAPI.saveDocuments(activeFilter, normalizedItems);
            await loadSection(activeFilter);
        } catch (error) {
            console.error("Failed to save section:", error);
        } finally {
            setSaving(false);
        }
    }

    async function handleClearSection() {
        try {
            setSaving(true);
            await AdminAPI.clearDocuments(activeFilter);

            setSections((prev) => ({
                ...prev,
                [activeFilter]: { ...EMPTY_SECTION_STATE }
            }));
        } catch (error) {
            console.error("Failed to clear section:", error);
        } finally {
            setSaving(false);
        }
    }

    return (
        <AdminScreen>
            {showModal && (
                <DocsAddModal
                    section={activeFilter}
                    parents={parentOptions}
                    parentOptionMap={parentOptionMap}
                    onClick={() => setShowModal(false)}
                    onCreate={handleCreateItem}
                />
            )}

            <div>
                <Title text={"Documents Upload"} />
            </div>

            <Container column={true}>
                <section className="w-full flex flex-row justify-start items-center gap-5 mb-10">
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

                <div className='w-full flex flex-row p-3 gap-3 justify-evenly items-start'>
                    <section className='w-[40%] p-5 sticky top-0 flex flex-col gap-4 justify-start items-stretch transition duration-200 ease-in-out'>
                        <div onClick={() => setShowModal(true)}>
                            <AnnounceButton
                                textSize='text-[1rem]'
                                btnText='Add Items'
                                icon={<Plus size={25} />}
                            />
                        </div>

                        <div className="w-full mt-4">
                            <Subtitle
                                text={`${SECTION_LABELS[activeFilter]} Preview`}
                                size="text-[1rem]"
                            />
                            <div className="mt-3">
                                <TreeRenderer
                                    items={[
                                        ...buildItemsWithSectionMeta(activeSectionState)
                                    ]}
                                />
                            </div>
                        </div>
                    </section>

                    <div className="w-full">
                        <SectionForm
                            section={activeFilter}
                            label={SECTION_LABELS[activeFilter]}
                            state={activeSectionState}
                            loading={loading}
                            saving={saving}
                            onHeaderChange={(value) => updateSectionField(activeFilter, "header", value)}
                            onDescriptionChange={(value) => updateSectionField(activeFilter, "description", value)}
                            onSave={handleSaveSection}
                            onClear={handleClearSection}
                        />
                    </div>
                </div>
            </Container>
        </AdminScreen>
    );
}

export function DocsAddModal({
    section,
    onClick,
    onCreate,
    parents = [],
    parentOptionMap = {}
}) {
    const [itemType, setItemType] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [parent, setParent] = useState("");
    const [isChecked, setIsChecked] = useState(false);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const itemTypeLabels = ITEM_TYPE_OPTIONS
        .filter((option) => section === "forms" ? true : option.value !== "document")
        .map((option) => option.label);

    const labelToValueMap = ITEM_TYPE_OPTIONS.reduce((acc, option) => {
        acc[option.label] = option.value;
        return acc;
    }, {});

    const selectedTypeValue = labelToValueMap[itemType] || "";

    const handleCheckbox = (e) => {
        const checked = e.target.checked;
        setIsChecked(checked);

        if (!checked) {
            setParent("");
        }
    };

    const isCreateEnabled =
        selectedTypeValue !== "" &&
        title.trim() !== "" &&
        (!isChecked || parent !== "") &&
        (selectedTypeValue !== "document" || file !== null);

    const handleCreate = async (e) => {
        e.preventDefault();

        if (!isCreateEnabled) return;

        try {
            let uploadedFile = null;

            if (selectedTypeValue === "document") {
                setUploading(true);
                const response = await AdminAPI.uploadDocument(section, title.trim(), file);
                uploadedFile = response?.data || null;
            }

            onCreate({
                type: selectedTypeValue,
                title: title.trim(),
                description: description.trim() || null,
                parentId: isChecked ? parentOptionMap[parent] || null : null,
                file: uploadedFile?.file || null,
                originalFilename: uploadedFile?.originalFilename || null
            });

            setItemType("");
            setTitle("");
            setDescription("");
            setParent("");
            setIsChecked(false);
            setFile(null);
        } catch (error) {
            console.error("Failed to create item:", error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="w-full h-screen fixed top-0 left-0 flex items-center justify-center bg-black/50 z-110 pointer-events-none">
            <div className="min-w-[30%] p-10 backdrop-blur-2xl bg-oasis-gradient border border-gray-500 rounded-3xl drop-shadow-lg flex flex-col gap-5 pointer-events-auto">
                <form className="w-full flex flex-col gap-5" onSubmit={handleCreate}>
                    <Subtitle size="text-[1.5rem]" text="Add new item"/>

                    <Dropdown
                        placeholder="Select Item type"
                        categories={itemTypeLabels}
                        value={itemType}
                        onChange={setItemType}
                    />

                    <SingleField
                        fieldHolder="Enter a title..."
                        fieldId="itemTitle"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <MultiField
                        labelText="Description (Optional)"
                        fieldHolder="Enter item description..."
                        fieldId="itemDescription"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    {selectedTypeValue === "document" && (
                        <FileUploadField
                            labelText="Upload Document *"
                            fieldId="documentFile"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                    )}

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
                        <AnnounceButton btnText="Cancel" onClick={onClick} type="button" />
                        <AnnounceButton
                            btnText={uploading ? "Creating..." : "Create"}
                            disabled={!isCreateEnabled || uploading}
                            type="submit"
                        />
                    </div>
                </form>
            </div>
        </div>
    );
}

export function FormLayout({
    children,
    onSave,
    onClear,
    saving = false
}) {
    return (
        <form
            className='w-full flex flex-col items-start justify-evenly gap-5'
            onSubmit={(e) => {
                e.preventDefault();
                onSave?.();
            }}
        >
            {children}
            <div className='flex flex-row gap-5'>
                <AnnounceButton
                    icon={<Save/>}
                    btnText={saving ? 'Saving...' : 'Save'}
                    type="submit"
                    disabled={saving}
                />
                <AnnounceButton
                    btnText='Clear all'
                    type="button"
                    onClick={onClear}
                    disabled={saving}
                />
            </div>
        </form>
    );
}

export function SectionForm({
    section,
    label,
    state,
    loading,
    saving,
    onHeaderChange,
    onDescriptionChange,
    onSave,
    onClear
}) {
    return (
        <FormLayout onSave={onSave} onClear={onClear} saving={saving}>
            <section className='w-full flex flex-col items-start justify-start'>
                <SingleField
                    labelText={`${label} Header *`}
                    fieldHolder={`Enter ${label} header...`}
                    fieldId={`${section}-uploadHead`}
                    value={state.header}
                    onChange={(e) => onHeaderChange(e.target.value)}
                    disabled={loading}
                />

                <MultiField
                    labelText={"Description"}
                    fieldHolder={`Enter ${label} description...`}
                    fieldId={`${section}-uploadDesc`}
                    value={state.description}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    disabled={loading}
                />
            </section>
        </FormLayout>
    );
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