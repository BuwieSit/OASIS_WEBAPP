import AdminScreen from '../../layouts/adminScreen.jsx';
import Title from "../../utilities/title.jsx";
import { Container, Dropdown } from '../../components/adminComps.jsx';
import { FileUploadField, MultiField, SingleField } from '../../components/fieldComp.jsx';
import { AnnounceButton } from '../../components/button.jsx';
import { useEffect, useMemo, useState } from "react";
import useQueryParam from '../../hooks/useQueryParams.jsx';
import { Plus, PlusCircle, Save, Trash, FileText, AlignLeft, X, Check } from 'lucide-react';
import Subtitle from '../../utilities/subtitle.jsx';
import { TreeRenderer } from '../../utilities/TreeRenderer.jsx';
import { AdminAPI } from '../../api/admin.api.js';
import { ConfirmModal, GeneralPopupModal } from '../../components/popupModal.jsx';


const EMPTY_SECTION_STATE = {
    header: "",
    description: "",
    items: [],
    file: null,
    originalFilename: null
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

function removeItemFromTree(items, targetId) {
    return items
        .filter((item) => item.id !== targetId)
        .map((item) => {
            if (item.children?.length) {
                return {
                    ...item,
                    children: removeItemFromTree(item.children, targetId)
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
        (item) =>
            typeof item.id === "string" &&
            item.id.startsWith("section-header-")
    );

    const descriptionItem = items.find(
        (item) =>
            typeof item.id === "string" &&
            item.id.startsWith("section-description-")
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
    return items.filter(
        (item) =>
            !(
                typeof item.id === "string" &&
                (
                    item.id.startsWith("section-header-") ||
                    item.id.startsWith("section-description-")
                )
            )
    );
}

export default function DocsUpload() {
    const [activeFilter, setFilter] = useQueryParam("tab", "procedures");
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [deleteItemConfirm, setDeleteItemConfirm] = useState(null);
    const [popup, setPopup] = useState(null);

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
            const items = stripMetaItems(backendItems);

            let file = null;
            let originalFilename = null;

            if (section === "forms") {
                const docItem = items.find(i => i.type === "document");
                if (docItem) {
                    file = docItem.file;
                    originalFilename = docItem.originalFilename;
                }
            }

            setSections((prev) => ({
                ...prev,
                [section]: {
                    header: meta.header,
                    description: meta.description,
                    items: items,
                    file: file,
                    originalFilename: originalFilename
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
            title:
                payload.title ||
                (payload.type === "description"
                    ? (payload.description || "").trim()
                    : payload.listItems?.find(i => i.trim() !== "")?.trim() || ""),
            description:
                payload.description || (
                    payload.listItems?.length ? payload.listItems.join("\n") : null
                ),
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

    async function handleDeleteItem(item) {
        try {
            setSaving(true);
            
            // 1. Calculate the new state with the item removed
            const updatedItems = removeItemFromTree(activeSectionState.items, item.id);
            const tempState = {
                ...activeSectionState,
                items: updatedItems
            };

            // 2. Persist the new structure to the backend
            // Note: We use the same logic as handleSaveSection but with the updated items
            let itemsToSave = buildItemsWithSectionMeta(tempState);
            const normalizedItems = normalizeTreeForSave(itemsToSave);
            
            await AdminAPI.saveDocuments(activeFilter, normalizedItems);

            // 3. Update local state on success
            setSections((prev) => ({
                ...prev,
                [activeFilter]: tempState
            }));
            
            setPopup({
                title: "Deleted",
                text: `"${item.title}" and its children have been removed from the database.`,
                icon: <Trash size={50} />,
                type: "success",
                time: 2000
            });
        } catch (error) {
            console.error("Failed to delete item from database:", error);
            setPopup({
                title: "Error",
                text: "Failed to delete item from database. Please try again.",
                icon: <X size={50} />,
                type: "failed",
                time: 2000
            });
        } finally {
            setSaving(false);
            setDeleteItemConfirm(null);
        }
    }

    async function handleSaveSection() {
        try {
            setSaving(true);

            let itemsToSave = [];

            if (activeFilter === "forms") {
                let finalFile = activeSectionState.file;
                let finalOriginalFilename = activeSectionState.originalFilename;

                if (!activeSectionState.header.trim()) {
                    setPopup({
                        title: "Failed",
                        text: "Header is required for Forms & Templates.",
                        icon: <X size={50} />,
                        type: "failed",
                        time: 2000
                    });
                    setSaving(false);
                    return;
                }

                if (!finalFile) {
                    setPopup({
                        title: "Failed",
                        text: "A document upload is required for this section.",
                        icon: <X size={50} />,
                        type: "failed",
                        time: 2000
                    });
                    setSaving(false);
                    return;
                }

                if (activeSectionState.file instanceof File) {
                    const response = await AdminAPI.uploadDocument(activeFilter, activeSectionState.header, activeSectionState.file);
                    finalFile = response?.data?.file;
                    finalOriginalFilename = response?.data?.originalFilename;
                }

                const docItem = {
                    id: crypto.randomUUID(),
                    type: "document",
                    title: activeSectionState.header.trim(),
                    description: activeSectionState.description.trim() || null,
                    parentId: null,
                    file: finalFile,
                    originalFilename: finalOriginalFilename,
                    children: []
                };

                const metaItems = buildItemsWithSectionMeta(activeSectionState);
                itemsToSave = [...metaItems, docItem];
            } else {
                itemsToSave = buildItemsWithSectionMeta(activeSectionState);
            }

            const normalizedItems = normalizeTreeForSave(itemsToSave);

            await AdminAPI.saveDocuments(activeFilter, normalizedItems);
            
            setPopup({
                title: "Success",
                text: `${SECTION_LABELS[activeFilter]} saved successfully.`,
                icon: <Check size={50} />,
                type: "success",
                time: 2000
            });
            
            await loadSection(activeFilter);
        } catch (error) {
            console.error("Failed to save section:", error);
            setPopup({
                title: "Error",
                text: "Failed to save section.",
                icon: <X size={50} />,
                type: "failed",
                time: 2000
            });
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
            
            setPopup({
                title: "Cleared",
                text: "Section data has been reset.",
                icon: <Trash size={50} />,
                type: "neutral",
                time: 2000
            });
        } catch (error) {
            console.error("Failed to clear section:", error);
        } finally {
            setSaving(false);
        }
    }

    return (
        <AdminScreen>
            {popup && (
                <GeneralPopupModal
                    icon={popup.icon}
                    time={popup.time}
                    title={popup.title}
                    text={popup.text}
                    onClose={() => setPopup(null)}
                    isSuccess={popup.type === "success"}
                    isFailed={popup.type === "failed"}
                    isNeutral={popup.type === "neutral"}
                />
            )}
            {showModal && (
                <DocsAddModal
                    section={activeFilter}
                    parents={parentOptions}
                    parentOptionMap={parentOptionMap}
                    onClick={() => setShowModal(false)}
                    onCreate={handleCreateItem}
                />
            )}
            {showConfirmModal && 
                <ConfirmModal
                    confText='clear the tree and all fields?'
                    onConfirm={() => {
                        handleClearSection();
                        setShowConfirmModal(false);
                    }}
                    onCancel={() => setShowConfirmModal(false)}
                />
            }
            {deleteItemConfirm && (
                <ConfirmModal
                    confText={`delete "${deleteItemConfirm.title}" and all its children?`}
                    onConfirm={() => handleDeleteItem(deleteItemConfirm)}
                    onCancel={() => setDeleteItemConfirm(null)}
                />
            )}
            
            <div className='w-[90%] flex flex-col gap-3 items-start justify-center border-b border-gray-400 py-5'>
                <Title text="Documents Upload" size='text-[2.2rem]'/>
                <Subtitle text={"Configure the guidelines, procedures, and resources for the Student OJT Hub."}/>
            </div>

            <div className="w-[90%] mt-8">
                {/* MODERN TAB BAR */}
                <div className="flex flex-row items-center gap-2 p-1.5 bg-gray-100/80 backdrop-blur rounded-2xl w-fit mb-8 border border-gray-200 shadow-inner">
                    {Object.keys(SECTION_LABELS).map((key) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ease-out flex items-center gap-2
                                ${activeFilter === key 
                                    ? "bg-white text-oasis-header shadow-md scale-105" 
                                    : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                                }
                            `}
                        >
                            {key === "procedures" && <Plus size={16} />}
                            {key === "moa" && <Save size={16} />}
                            {key === "guidelines" && <AlignLeft size={16} />}
                            {key === "forms" && <FileText size={16} />}
                            {SECTION_LABELS[key]}
                        </button>
                    ))}
                </div>

                <div className='w-full flex flex-col lg:flex-row gap-8 items-start mb-20 animate__animated animate__fadeIn'>
                    {/* LEFT PANEL: PREVIEW & STRUCTURE */}
                    {activeFilter !== "forms" && (
                        <div className='w-full lg:w-[45%] flex flex-col gap-6'>
                            <div className="bg-admin-element border border-gray-200 rounded-4xl shadow-sm overflow-hidden flex flex-col h-[700px]">
                                <div className="p-6 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <Subtitle text="Visual Structure" weight="font-bold" size="text-lg" />
                                        <p className="text-xs text-gray-500">Live preview of the document hierarchy</p>
                                    </div>
                                    <button 
                                        onClick={() => setShowModal(true)}
                                        className="p-3 bg-oasis-header text-white rounded-2xl hover:bg-oasis-button-dark transition-all hover:rotate-90 duration-300 shadow-lg shadow-oasis-header/20"
                                    >
                                        <Plus size={24} />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                                    <div className="bg-gray-50/30 rounded-2xl p-4 border border-dashed border-gray-200">
                                        <TreeRenderer
                                            items={[
                                                ...buildItemsWithSectionMeta(activeSectionState)
                                            ]}
                                            onDelete={(item) => setDeleteItemConfirm(item)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* RIGHT PANEL: CONFIGURATION FORM */}
                    <div className={`${activeFilter === "forms" ? "w-full max-w-3xl mx-auto" : "flex-1"} flex flex-col gap-6`}>
                        <div className="bg-admin-element rounded-4xl shadow-sm p-8 flex flex-col gap-8">
                            <div className=" pb-4">
                                <Subtitle text={`${SECTION_LABELS[activeFilter]} Configuration`} weight="font-bold" size="text-lg" />
                                <p className="text-sm text-gray-500 italic mt-1">
                                    {activeFilter === "forms" 
                                        ? "This section will appear as a dedicated download card in the student hub." 
                                        : "Configure the landing metadata for this section."
                                    }
                                </p>
                            </div>

                            <SectionForm
                                section={activeFilter}
                                label={SECTION_LABELS[activeFilter]}
                                state={activeSectionState}
                                loading={loading}
                                saving={saving}
                                onHeaderChange={(value) => updateSectionField(activeFilter, "header", value)}
                                onDescriptionChange={(value) => updateSectionField(activeFilter, "description", value)}
                                onFileChange={(file) => updateSectionField(activeFilter, "file", file)}
                                onSave={() => handleSaveSection()}
                                onClear={() => setShowConfirmModal(true)}
                            />
                        </div>

                        {/* HELPER CARD */}
                        <div className="bg-oasis-blue/5 border border-oasis-blue/10 rounded-[2rem] p-6 flex items-start gap-4">
                            <div className="bg-white p-3 rounded-2xl shadow-sm">
                                <Plus size={20} className="text-oasis-header" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="text-sm font-bold text-oasis-header">Admin Tip</p>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    Changes made here will reflect immediately on the student's OJT Hub. Make sure to click <strong>Save</strong> after every major structural change.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
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

    const LIST_TYPES = [
        "numerical_list",
        "bulleted_list",
        "alphabetical_list"
    ];

    const itemTypeLabels = ITEM_TYPE_OPTIONS
        .filter((option) => {
            if (section === "forms") {
                return ["header", "description", "document"].includes(option.value);
            }
            return option.value !== "document";
        })
        .map((option) => option.label);

    const labelToValueMap = ITEM_TYPE_OPTIONS.reduce((acc, option) => {
        acc[option.label] = option.value;
        return acc;
    }, {});

    const selectedTypeValue = labelToValueMap[itemType] || "";
    const isListType = LIST_TYPES.includes(selectedTypeValue);
    const [listItems, setListItems] = useState([""]);

    const handleCheckbox = (e) => {
        const checked = e.target.checked;
        setIsChecked(checked);
        if (!checked) setParent("");
    };

    const isCreateEnabled =
        selectedTypeValue !== "" &&
        ((selectedTypeValue === "description" && description.trim() !== "") ||
         (selectedTypeValue === "header" && title.trim() !== "") ||
         (selectedTypeValue === "document" && title.trim() !== "" && file !== null) ||
         (isListType && listItems.some(i => i.trim() !== "")));

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
                title:
                    title.trim() ||
                    (selectedTypeValue === "description"
                        ? description.trim()
                        : isListType
                            ? listItems.find(i => i.trim() !== "")?.trim() || selectedTypeValue.replace("_", " ")
                            : null),

                description:
                    (selectedTypeValue === "description" || selectedTypeValue === "document")
                        ? description.trim()
                        : isListType
                            ? listItems.filter(i => i.trim() !== "").join("\n")
                            : null,

                listItems: isListType ? listItems.filter(i => i.trim() !== "") : null,
                parentId: isChecked ? parentOptionMap[parent] || null : null,
                file: uploadedFile?.file || null,
                originalFilename: uploadedFile?.originalFilename || null
            });

            setItemType(""); setTitle(""); setDescription(""); setParent(""); setIsChecked(false); setFile(null);
        } catch (error) {
            console.error("Failed to create item:", error);
        } finally {
            setUploading(false);
        }
    };

    const addListItem = () => setListItems(prev => [...prev, ""]);
    const updateListItem = (index, value) => setListItems(prev => prev.map((item, i) => (i === index ? value : item)));
    const removeListItem = (index) => setListItems(prev => prev.filter((_, i) => i !== index));

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[150] p-4">
            <div className="w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate__animated animate__zoomIn animate__faster flex flex-col max-h-[90vh]">
                {/* MODAL HEADER */}
                <div className="p-8 flex items-center justify-between bg-admin-element">
                    <div className="flex flex-col">
                        <h2 className="text-2xl font-bold text-gray-800">Add Content Item</h2>
                        <p className="text-sm text-gray-500">Define a new element for your document structure</p>
                    </div>
                    <div className="p-3 rounded-2xl">
                        <PlusCircle size={28} className="text-oasis-header" />
                    </div>
                </div>

                {/* MODAL CONTENT */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-admin-element">
                    <form className="flex flex-col gap-8" onSubmit={handleCreate}>
                        {/* TYPE SELECTOR */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Component Type</label>
                            <Dropdown
                                placeholder="What kind of item is this?"
                                categories={itemTypeLabels}
                                value={itemType}
                                onChange={setItemType}
                                hasBorder
                            />
                        </div>

                        {/* DYNAMIC FIELDS BASED ON TYPE */}
                        {selectedTypeValue && (
                            <div className="p-6 bg-gray-50/50 rounded-3xl border border-gray-100 space-y-6">
                                {(selectedTypeValue === "header" || selectedTypeValue === "document") && (
                                    <SingleField
                                        labelText="Title / Label *"
                                        fieldHolder="e.g., Section 1: Introduction"
                                        fieldId="itemTitle"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                )}

                                {(selectedTypeValue === "description" || selectedTypeValue === "document") && (
                                    <MultiField
                                        labelText={selectedTypeValue === "document" ? "Notes (Optional)" : "Content Description *"}
                                        fieldHolder="Provide the detailed text for this section..."
                                        fieldId="itemDescription"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                )}

                                {isListType && (
                                    <div className="space-y-4">
                                        <label className="text-sm font-bold text-gray-700 block">List Entries</label>
                                        <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                            {listItems.map((item, index) => (
                                                <div key={index} className="flex gap-2 group animate__animated animate__fadeIn">
                                                    <div className="flex-1">
                                                        <SingleField
                                                            fieldHolder={`Enter item ${index + 1}...`}
                                                            value={item}
                                                            onChange={(e) => updateListItem(index, e.target.value)}
                                                        />
                                                    </div>
                                                    {listItems.length > 1 && (
                                                        <button 
                                                            type="button" 
                                                            onClick={() => removeListItem(index)}
                                                            className="p-2 text-black hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                        >
                                                            <Trash size={20}/>
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={addListItem}
                                            className="flex items-center gap-2 text-xs font-bold text-oasis-header hover:text-oasis-button-dark transition-colors ml-1"
                                        >
                                            <PlusCircle size={16}/> Add another row
                                        </button>
                                    </div>
                                )}

                                {selectedTypeValue === "document" && (
                                    <div className="pt-2">
                                        <FileUploadField
                                            labelText="Source Document (PDF/Docx) *"
                                            fieldId="documentFile"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* NESTING CONFIGURATION */}
                        <div className="p-6 bg-admin-element rounded-3xl space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="nestToggle"
                                        checked={isChecked}
                                        onChange={handleCheckbox}
                                        className="w-5 h-5 rounded-lg border-gray-300 text-oasis-header focus:ring-oasis-header cursor-pointer"
                                    />
                                    <label htmlFor="nestToggle" className="text-sm font-bold text-gray-700 cursor-pointer">
                                        Nest under an existing parent?
                                    </label>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${isChecked ? "bg-oasis-header text-white" : "bg-gray-200 text-gray-400"}`}>
                                    {isChecked ? "Active" : "Disabled"}
                                </span>
                            </div>
                            
                            <div className={`transition-all duration-300 ${isChecked ? "opacity-100 max-h-40" : "opacity-40 max-h-0 pointer-events-none overflow-hidden"}`}>
                                <Dropdown
                                    placeholder="Choose parent item..."
                                    categories={parents}
                                    value={parent}
                                    onChange={setParent}
                                    hasBorder
                                />
                            </div>
                        </div>
                    </form>
                </div>

                {/* MODAL FOOTER */}
                <div className="p-8 bg-admin-element flex gap-4 justify-end">
                    <button 
                        onClick={onClick}
                        className="px-8 py-3 rounded-2xl font-bold text-gray-500 hover:bg-gray-200 transition-all flex items-center gap-2"
                    >
                        <X size={18} /> Cancel
                    </button>
                    <button 
                        onClick={handleCreate}
                        disabled={!isCreateEnabled || uploading}
                        className={`px-10 py-3 rounded-2xl font-bold text-oasis-header shadow-xl shadow-oasis-header/20 flex items-center gap-2 transition-all
                            ${!isCreateEnabled || uploading 
                                ? "bg-gray-300 cursor-not-allowed shadow-none" 
                                : "bg-oasis-header text-white hover:bg-oasis-button-dark hover:scale-105"
                            }
                        `}
                    >
                        {uploading ? "Uploading..." : <><Check size={18} /> Add Component</>}
                    </button>
                </div>
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
    onFileChange,
    onSave,
    onClear
}) {
    return (
        <FormLayout onSave={onSave} onClear={onClear} saving={saving}>
            <section className='w-full flex flex-col items-start justify-start gap-6'>
                <SingleField
                    labelText={`${label} Header *`}
                    fieldHolder={`Enter ${label} header...`}
                    fieldId={`${section}-uploadHead`}
                    value={state.header}
                    onChange={(e) => onHeaderChange(e.target.value)}
                    disabled={loading}
                />

                <MultiField
                    labelText={"Description (Optional)"}
                    fieldHolder={`Enter ${label} description...`}
                    fieldId={`${section}-uploadDesc`}
                    value={state.description}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    disabled={loading}
                />

                {section === "forms" && (
                    <div className="w-full flex flex-col gap-2">
                        <FileUploadField
                            labelText="Upload Document (Required) *"
                            fieldId="forms-uploadFile"
                            onChange={(e) => onFileChange(e.target.files?.[0] || null)}
                            disabled={loading}
                        />
                        {state.originalFilename && (
                            <p className="text-xs text-oasis-button-dark font-medium italic pl-1">
                                Currently active: {state.originalFilename}
                            </p>
                        )}
                    </div>
                )}
            </section>
        </FormLayout>
    );
}

