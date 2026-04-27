import AdminScreen from '../../layouts/adminScreen.jsx';
import Title from "../../utilities/title.jsx";
import { Container, Dropdown } from '../../components/adminComps.jsx';
import { FileUploadField, MultiField, SingleField } from '../../components/fieldComp.jsx';
import { AnnounceButton } from '../../components/button.jsx';
import { useEffect, useMemo, useState, useRef } from "react";
import useQueryParam from '../../hooks/useQueryParams.jsx';
import { Plus, PlusCircle, Pencil, Save, Trash, FileText, AlignLeft, X, Check } from 'lucide-react';
import Subtitle from '../../utilities/subtitle.jsx';
import { TreeRenderer } from '../../utilities/TreeRenderer.jsx';
import { AdminAPI } from '../../api/admin.api.js';
import { ConfirmModal, GeneralPopupModal, ViewModal } from '../../components/popupModal.jsx';
import api from "../../api/axios.jsx";

const API_BASE = api.defaults.baseURL;


const EMPTY_SECTION_STATE = {
    items: [],
    isLoaded: false
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
            label: `${"— ".repeat(depth)}${item.title || (item.type === "description" ? "Description" : item.type)}`
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

function updateItemInTree(items, updatedItem) {
    return items.map((item) => {
        if (item.id === updatedItem.id) {
            return {
                ...item,
                ...updatedItem,
                children: item.children // Preserve children
            };
        }

        if (item.children?.length) {
            return {
                ...item,
                children: updateItemInTree(item.children, updatedItem)
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

export default function DocsUpload() {
    const [activeFilter, setFilter] = useQueryParam("tab", "procedures");
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [deleteItemConfirm, setDeleteItemConfirm] = useState(null);
    const [viewDoc, setViewDoc] = useState(null);
    const [popup, setPopup] = useState(null);
    const [editItem, setEditItem] = useState(null);
    
    // DRAFT STATES
    const [hasDraft, setHasDraft] = useState(false);
    const [restoringDraft, setRestoringDraft] = useState(false);
    const backendDataRef = useRef({});

    const [sections, setSections] = useState({
        procedures: { ...EMPTY_SECTION_STATE },
        moa: { ...EMPTY_SECTION_STATE },
        guidelines: { ...EMPTY_SECTION_STATE },
        forms: { ...EMPTY_SECTION_STATE }
    });

    const activeSectionState = sections[activeFilter] || EMPTY_SECTION_STATE;

    // AUTO-SAVE TO LOCAL STORAGE
    useEffect(() => {
        if (!loading && !restoringDraft && activeSectionState.isLoaded) {
            const currentItemsJson = JSON.stringify(activeSectionState.items);
            const backendItemsJson = backendDataRef.current[activeFilter];
            
            // Only save if current state is different from backend
            if (currentItemsJson !== backendItemsJson) {
                const draftKey = `docs_upload_draft_${activeFilter}`;
                localStorage.setItem(draftKey, currentItemsJson);
            }
        }
    }, [activeSectionState.items, activeSectionState.isLoaded, activeFilter, loading, restoringDraft]);

    // CHECK FOR DRAFTS ON LOAD
    useEffect(() => {
        if (loading || !activeSectionState.isLoaded) return; // Don't check while fetching or before loaded

        const draftKey = `docs_upload_draft_${activeFilter}`;
        const savedDraft = localStorage.getItem(draftKey);
        
        if (savedDraft) {
            try {
                const parsedDraft = JSON.parse(savedDraft);
                // Only show draft banner if draft items length > 0
                // and they aren't already exactly what's in state
                if (parsedDraft.length > 0 && JSON.stringify(parsedDraft) !== JSON.stringify(activeSectionState.items)) {
                    setHasDraft(true);
                } else {
                    setHasDraft(false);
                }
            } catch (e) {
                console.error("Failed to parse draft", e);
            }
        } else {
            setHasDraft(false);
        }
    }, [activeFilter, activeSectionState.items, activeSectionState.isLoaded, loading]);

    const handleRestoreDraft = () => {
        const draftKey = `docs_upload_draft_${activeFilter}`;
        const savedDraft = localStorage.getItem(draftKey);
        if (savedDraft) {
            setRestoringDraft(true);
            const parsed = JSON.parse(savedDraft);
            setSections(prev => ({
                ...prev,
                [activeFilter]: {
                    ...prev[activeFilter],
                    items: parsed
                }
            }));
            setHasDraft(false);
            setTimeout(() => setRestoringDraft(false), 100);
            
            setPopup({
                title: "Restored",
                text: "Your unsaved changes have been loaded.",
                icon: <Check size={50} />,
                type: "success",
                time: 2000
            });
        }
    };

    const handleDiscardDraft = () => {
        const draftKey = `docs_upload_draft_${activeFilter}`;
        localStorage.removeItem(draftKey);
        setHasDraft(false);
    };

    const buildFileUrl = (filePath) => {
        if (!filePath) return null;
        let path = String(filePath).trim();
        if (path.startsWith("/")) path = path.slice(1);
        if (path.startsWith("uploads/")) path = path.replace("uploads/", "");
        return `${API_BASE}/uploads/${path}`;
    };

    const handleViewDocument = (item) => {
        const url = buildFileUrl(item.file);
        if (url) {
            setViewDoc({
                url,
                title: item.title,
                originalFilename: item.originalFilename
            });
        }
    };

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

            // Store the backend state for comparison in auto-save
            backendDataRef.current[section] = JSON.stringify(backendItems);

            setSections((prev) => ({
                ...prev,
                [section]: {
                    items: backendItems,
                    isLoaded: true
                }
            }));
        } catch (error) {
            console.error(`Failed to load ${section}:`, error);
        } finally {
            setLoading(false);
        }
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
            listItems: payload.listItems || null,
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

    function handleEditItem(item) {
        setEditItem(item);
        setShowModal(true);
    }

    function handleUpdateItem(payload) {
        const updatedItem = {
            ...editItem,
            type: payload.type,
            title: payload.title,
            description: payload.description,
            listItems: payload.listItems,
            file: payload.file || editItem.file,
            originalFilename: payload.originalFilename || editItem.originalFilename
        };

        setSections((prev) => ({
            ...prev,
            [activeFilter]: {
                ...prev[activeFilter],
                items: updateItemInTree(prev[activeFilter].items, updatedItem)
            }
        }));

        setShowModal(false);
        setEditItem(null);
    }

    async function handleDeleteItem(item) {
        try {
            setSaving(true);
            
            const updatedItems = removeItemFromTree(activeSectionState.items, item.id);
            const tempState = {
                items: updatedItems
            };

            const normalizedItems = normalizeTreeForSave(updatedItems);
            
            await AdminAPI.saveDocuments(activeFilter, normalizedItems);
            
            // Clear draft after successful direct delete/save
            localStorage.removeItem(`docs_upload_draft_${activeFilter}`);

            setSections((prev) => ({
                ...prev,
                [activeFilter]: tempState
            }));
            
            setPopup({
                title: "Deleted",
                text: `"${item.title || item.type}" and its children have been removed.`,
                icon: <Trash size={50} />,
                type: "success",
                time: 2000
            });
        } catch (error) {
            console.error("Failed to delete item:", error);
            setPopup({
                title: "Error",
                text: "Failed to delete item.",
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
            const normalizedItems = normalizeTreeForSave(activeSectionState.items);

            await AdminAPI.saveDocuments(activeFilter, normalizedItems);
            
            // CLEAR DRAFT ON SUCCESSFUL SAVE
            localStorage.removeItem(`docs_upload_draft_${activeFilter}`);
            setHasDraft(false);

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

            // CLEAR DRAFT TOO
            localStorage.removeItem(`docs_upload_draft_${activeFilter}`);
            setHasDraft(false);

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
                    onClick={() => {
                        setShowModal(false);
                        setEditItem(null);
                    }}
                    onCreate={editItem ? handleUpdateItem : handleCreateItem}
                    editItem={editItem}
                />
            )}
            {showConfirmModal && 
                <ConfirmModal
                    confText='clear the entire structure?'
                    onConfirm={() => {
                        handleClearSection();
                        setShowConfirmModal(false);
                    }}
                    onCancel={() => setShowConfirmModal(false)}
                />
            }
            {deleteItemConfirm && (
                <ConfirmModal
                    confText={`delete "${deleteItemConfirm.title || deleteItemConfirm.type}" and all its children?`}
                    onConfirm={() => handleDeleteItem(deleteItemConfirm)}
                    onCancel={() => setDeleteItemConfirm(null)}
                />
            )}

            <ViewModal
                visible={!!viewDoc}
                onClose={() => setViewDoc(null)}
                isDocument={true}
                resourceTitle={viewDoc?.title || "Document Viewer"}
                file={viewDoc?.url}
            />
            
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

                <div className='w-full max-w-5xl mx-auto mb-20 animate__animated animate__fadeIn'>
                    {/* DRAFT NOTIFICATION BANNER */}
                    {hasDraft && (
                        <div className="mb-6 bg-amber-50 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 animate__animated animate__slideInDown animate__faster shadow-lg shadow-amber-900/5">
                            <div className="flex items-center gap-4">
                                <div className="p-3 text-amber-600 rounded-2xl">
                                    <Save size={24} />
                                </div>
                                <div>
                                    <p className="font-bold text-amber-900">Unsaved changes detected</p>
                                    <p className="text-xs text-amber-700">We found a local draft for {SECTION_LABELS[activeFilter]} that wasn't saved to the server.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <button 
                                    onClick={handleDiscardDraft}
                                    className="flex-1 md:flex-none px-6 py-2.5 text-xs font-bold text-amber-700 hover:bg-amber-100 rounded-xl transition-all"
                                >
                                    Discard
                                </button>
                                <button 
                                    onClick={handleRestoreDraft}
                                    className="flex-1 md:flex-none px-8 py-2.5 text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 rounded-xl transition-all shadow-md shadow-amber-600/20"
                                >
                                    Restore Draft
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="bg-admin-element border border-gray-200 rounded-4xl shadow-sm overflow-hidden flex flex-col h-[850px]">
                        {/* UPPER SECTION: Fixed Header */}
                        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white/50 backdrop-blur-sm z-10">
                            <div className="flex flex-col">
                                <Subtitle text="Visual Structure and Configuration" weight="font-bold" size="text-2xl" />
                                <p className="text-sm text-gray-500">Manage the hierarchy for {SECTION_LABELS[activeFilter]}</p>
                            </div>
                            <button 
                                onClick={() => setShowModal(true)}
                                className="px-6 py-3.5 bg-oasis-header text-white rounded-2xl hover:bg-oasis-button-dark transition-all hover:scale-105 duration-300 shadow-lg shadow-oasis-header/20 flex items-center gap-2 font-bold text-sm"
                            >
                                <Plus size={20} /> Add Component
                            </button>
                        </div>

                        {/* MIDDLE SECTION: Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-admin-element">
                            
                            <div className="bg-gray-50/30 rounded-[2.5rem] p-8 border border-dashed border-gray-200 min-h-[500px]">
                                {activeSectionState.items.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full py-32 text-gray-400 gap-4">
                                        <div className="p-6 bg-gray-100 rounded-full">
                                            <PlusCircle size={48} className="text-gray-300" />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold text-gray-500">Structure is empty</p>
                                            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">Start building your section by clicking the "Add Component" button above.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <TreeRenderer
                                        items={activeSectionState.items}
                                        onDelete={(item) => setDeleteItemConfirm(item)}
                                        onView={handleViewDocument}
                                        onEdit={handleEditItem}
                                    />
                                )}
                            </div>

                            {/* ADMIN TIP */}
                            <div className="mt-8 bg-oasis-blue/5 border border-oasis-blue/10 rounded-3xl p-6 flex items-start gap-4">
                                <div className="bg-white p-3 rounded-2xl shadow-sm">
                                    <Check size={20} className="text-oasis-header" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-bold text-oasis-header">Admin Tip</p>
                                    <p className="text-xs text-gray-600 leading-relaxed italic">
                                        Everything in this list, including titles and descriptions, can be added using the "Add Component" modal. Click on document names to preview them.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* LOWER SECTION: Fixed Buttons */}
                        <div className="p-8 border-t border-gray-100 bg-white/50 backdrop-blur-sm flex flex-row items-center justify-end gap-5">
                            <button 
                                onClick={() => setShowConfirmModal(true)}
                                className="px-8 py-3.5 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 hover:text-red-500 transition-all flex items-center gap-2 border border-transparent hover:border-red-100"
                                disabled={saving}
                            >
                                <Trash size={18} /> Clear Structure
                            </button>
                            <button 
                                onClick={handleSaveSection}
                                disabled={saving || loading}
                                className={`px-12 py-3.5 rounded-2xl font-bold text-white shadow-xl shadow-oasis-header/20 flex items-center gap-2 transition-all
                                    ${saving || loading 
                                        ? "bg-gray-300 cursor-not-allowed shadow-none" 
                                        : "bg-oasis-header hover:bg-oasis-button-dark hover:scale-105 active:scale-95"
                                    }
                                `}
                            >
                                {saving ? "Saving Changes..." : <><Save size={18} /> Save {SECTION_LABELS[activeFilter]}</>}
                            </button>
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
    parentOptionMap = {},
    editItem = null
}) {
    const isForms = section === "forms";
    const [itemType, setItemType] = useState(() => {
        if (editItem) {
            const option = ITEM_TYPE_OPTIONS.find(o => o.value === editItem.type);
            return option ? option.label : "";
        }
        return isForms ? "Document" : "";
    });
    const [title, setTitle] = useState(editItem?.title || "");
    const [description, setDescription] = useState(editItem?.description || "");
    const [parent, setParent] = useState(() => {
        if (editItem?.parentId) {
            const entry = Object.entries(parentOptionMap).find(([_, id]) => id === editItem.parentId);
            return entry ? entry[0] : "";
        }
        return "";
    });
    const [isChecked, setIsChecked] = useState(!!editItem?.parentId);
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
                return ["header", "document"].includes(option.value);
            }
            return true;
        })
        .map((option) => option.label);

    const labelToValueMap = ITEM_TYPE_OPTIONS.reduce((acc, option) => {
        acc[option.label] = option.value;
        return acc;
    }, {});

    const selectedTypeValue = labelToValueMap[itemType] || "";
    const isListType = LIST_TYPES.includes(selectedTypeValue);
    const [listItems, setListItems] = useState(editItem?.listItems || [""]);

    const handleCheckbox = (e) => {
        const checked = e.target.checked;
        setIsChecked(checked);
        if (!checked) setParent("");
    };

    const isCreateEnabled =
        selectedTypeValue !== "" &&
        ((selectedTypeValue === "description" && description.trim() !== "") ||
         (selectedTypeValue === "header" && title.trim() !== "") ||
         (selectedTypeValue === "document" && title.trim() !== "" && (file !== null || (editItem && editItem.file))) ||
         (isListType && listItems.some(i => i.trim() !== "")));

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!isCreateEnabled) return;

        try {
            let uploadedFile = null;
            if (selectedTypeValue === "document" && file) {
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
                    (selectedTypeValue === "description" || (selectedTypeValue === "document" && !isForms))
                        ? description.trim()
                        : isListType
                            ? listItems.filter(i => i.trim() !== "").join("\n")
                            : null,

                listItems: isListType ? listItems.filter(i => i.trim() !== "") : null,
                parentId: isChecked ? parentOptionMap[parent] || null : null,
                file: uploadedFile?.file || (editItem?.file || null),
                originalFilename: uploadedFile?.originalFilename || (editItem?.originalFilename || null)
            });

            if (!editItem) {
                setItemType(isForms ? "Document" : ""); setTitle(""); setDescription(""); setParent(""); setIsChecked(false); setFile(null);
            }
        } catch (error) {
            console.error("Failed to process item:", error);
        } finally {
            setUploading(false);
        }
    };

    const addListItem = () => setListItems(prev => [...prev, ""]);
    const updateListItem = (index, value) => setListItems(prev => prev.map((item, i) => (i === index ? value : item)));
    const removeListItem = (index) => setListItems(prev => prev.filter((_, i) => i !== index));

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-150 p-4">
            <div className="w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate__animated animate__zoomIn animate__faster flex flex-col max-h-[90vh]">
                {/* MODAL HEADER */}
                <div className="p-8 flex items-center justify-between bg-admin-element">
                    <div className="flex flex-col">
                        <h2 className="text-2xl font-bold text-gray-800">{editItem ? "Edit Content Item" : (isForms ? "Add Form / Template" : "Add Content Item")}</h2>
                        <p className="text-sm text-gray-500">{editItem ? "Update the details of this item" : (isForms ? "Upload a new document or add a header for organization" : "Define a new element for your document structure")}</p>
                    </div>
                    <div className="p-3 rounded-2xl">
                        {editItem ? <Pencil size={28} className="text-oasis-header" /> : (isForms ? <FileText size={28} className="text-oasis-header" /> : <PlusCircle size={28} className="text-oasis-header" />)}
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
                            <div className={`p-6 bg-gray-50/50 rounded-3xl border border-gray-100 space-y-6 ${isForms ? "mt-0" : ""}`}>
                                {(selectedTypeValue === "header" || selectedTypeValue === "document") && (
                                    <SingleField
                                        labelText={selectedTypeValue === "header" ? "Header Name *" : (isForms ? "Document Name *" : "Title / Label *")}
                                        fieldHolder={selectedTypeValue === "header" ? "e.g., Required Documents" : (isForms ? "e.g., Internship Application Form" : "e.g., Section 1: Introduction")}
                                        fieldId="itemTitle"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                )}

                                {(selectedTypeValue === "description" || (selectedTypeValue === "document" && !isForms)) && (
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
                                            labelText={editItem?.file ? `Source Document (Currently: ${editItem.originalFilename})` : "Source Document (PDF/Docx) *"}
                                            fieldId="documentFile"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        />
                                        {editItem?.file && <p className="text-[10px] text-gray-400 mt-2 ml-1 italic">Leave empty to keep the current file.</p>}
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
                                    categories={parents.filter(p => !editItem || (p !== editItem.title && p !== editItem.type))}
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
                        {uploading ? "Uploading..." : <>{editItem ? <Check size={18} /> : (isForms ? <FileText size={18} /> : <Check size={18} />)} {editItem ? "Save Changes" : (isForms ? "Add Document" : "Add Component")}</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
