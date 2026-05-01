import AdminScreen from '../../layouts/adminScreen.jsx';
import Title from "../../utilities/title.jsx";
import { Container, Dropdown, Filter } from '../../components/adminComps.jsx';
import { FileUploadField, MultiField, SingleField } from '../../components/fieldComp.jsx';
import { AnnounceButton } from '../../components/button.jsx';
import { useEffect, useMemo, useState, useRef } from "react";
import useQueryParam from '../../hooks/useQueryParams.jsx';
import { 
    Plus, 
    PlusCircle, 
    Pencil, 
    Save, 
    Trash, 
    FileText, 
    AlignLeft, 
    X, 
    Check, 
    Type, 
    ListOrdered, 
    List, 
    GripVertical, 
    CopyPlus, 
    Edit2, 
    Eye, 
    Layout 
} from 'lucide-react';
import Subtitle from '../../utilities/subtitle.jsx';
import { AdminAPI } from '../../api/admin.api.js';
import { ConfirmModal, GeneralPopupModal, ViewModal } from '../../components/popupModal.jsx';
import api from "../../api/axios.jsx";
import Accordion from '../../components/accordion.jsx';
import FormDownloadable from '../../components/formDownloadable.jsx';

const API_BASE = api.defaults.baseURL;

// --- CONSTANTS & HELPERS ---

const SECTION_LABELS = {
    procedures: "Procedures",
    moa: "MOA Process",
    guidelines: "Key Guidelines",
    forms: "Forms & Templates"
};

const ITEM_TYPES = [
    { label: "Header", value: "header", icon: <Type size={16} />, prefix: "Head: " },
    { label: "Description", value: "description", icon: <AlignLeft size={16} />, prefix: "" },
    { label: "Numerical List", value: "numerical_list", icon: <ListOrdered size={16} />, prefix: "1. " },
    { label: "Bulleted List", value: "bulleted_list", icon: <List size={16} />, prefix: "- " },
    { label: "Alphabetical List", value: "alphabetical_list", icon: <List size={16} />, prefix: "a. " },
    { label: "Document", value: "document", icon: <FileText size={16} />, prefix: "Doc: " }
];

const getSequentialPrefix = (items, index, type) => {
    if (type === 'header') return "Head: ";
    if (type === 'description') return "";
    if (type === 'bulleted_list') return "- ";
    if (type === 'document') return "Doc: ";
    
    if (type !== 'numerical_list' && type !== 'alphabetical_list') return "";
    
    let startIndex = index;
    while (startIndex > 0 && items[startIndex - 1].type === type) {
        startIndex--;
    }
    const sequencePos = index - startIndex + 1;
    
    if (type === 'numerical_list') return `${sequencePos}. `;
    if (type === 'alphabetical_list') return `${String.fromCharCode(96 + (sequencePos % 26 || 26))}. `;
    return "";
};

const parseBulkAdd = (text) => {
    const lines = text.split('\n');
    const rootItems = [];
    const stack = [{ indent: -1, children: rootItems }];

    lines.forEach(line => {
        if (!line.trim()) return;
        const indentMatch = line.match(/^(\s*)/);
        const indent = indentMatch ? indentMatch[1].length : 0;
        const content = line.trim();
        let type = 'description';
        let title = content;

        if (content.startsWith('Head: ')) {
            type = 'header';
            title = content.substring(6);
        } else if (content.startsWith('- ')) {
            type = 'bulleted_list';
            title = content.substring(2);
        } else if (content.match(/^[a-z]\.\s/i)) {
            type = 'alphabetical_list';
            title = content.substring(content.indexOf('.') + 2);
        } else if (content.match(/^\d+\.\s/)) {
            type = 'numerical_list';
            title = content.substring(content.indexOf('.') + 2);
        }

        const newItem = {
            id: crypto.randomUUID(),
            type,
            title,
            children: []
        };

        while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
            stack.pop();
        }

        stack[stack.length - 1].children.push(newItem);
        stack.push({ indent, children: newItem.children });
    });

    return rootItems;
};

const findAndRemove = (list, id) => {
    let removed = null;
    const search = (items) => {
        let result = [];
        for (let item of items) {
            if (item.id === id) {
                removed = item;
            } else {
                const [newChildren, found] = search(item.children || []);
                if (found) removed = found;
                result.push({ ...item, children: newChildren });
            }
        }
        return [result, removed];
    };
    return search(list);
};

const insertAt = (list, targetId, itemToInsert, position = 'inside') => {
    if (position === 'inside') {
        if (!targetId) return [...list, { ...itemToInsert, parentId: null }];
        return list.map(item => {
            if (item.id === targetId) {
                return {
                    ...item,
                    children: [...(item.children || []), { ...itemToInsert, parentId: targetId }]
                };
            }
            return {
                ...item,
                children: item.children ? insertAt(item.children, targetId, itemToInsert, 'inside') : []
            };
        });
    }

    const newItems = [];
    for (let i = 0; i < list.length; i++) {
        const item = list[i];
        if (item.id === targetId) {
            if (position === 'before') newItems.push({ ...itemToInsert, parentId: item.parentId });
            newItems.push(item);
            if (position === 'after') newItems.push({ ...itemToInsert, parentId: item.parentId });
        } else {
            newItems.push({
                ...item,
                children: item.children ? insertAt(item.children, targetId, itemToInsert, position) : []
            });
        }
    }
    return newItems;
};

const isChildOf = (parent, childId) => {
    if (!parent.children) return false;
    return parent.children.some(child => child.id === childId || isChildOf(child, childId));
};

function normalizeTreeForSave(items) {
    return items.map((item) => ({
        id: typeof item.id === 'string' && item.id.length > 30 ? null : item.id,
        type: item.type,
        title: item.title,
        description: item.description || null,
        parentId: item.parentId || null,
        file: item.file || null,
        originalFilename: item.originalFilename || null,
        children: normalizeTreeForSave(item.children || [])
    }));
}

// --- MAIN COMPONENT ---

export default function DocsUpload() {
    const [activeFilter, setFilter] = useQueryParam("tab", "procedures");
    const [items, setItems] = useState([]);
    const [isEditMode, setIsEditMode] = useState(true);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [popup, setPopup] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null); // { text, action }
    const [viewDoc, setViewDoc] = useState(null);
    const [editingItem, setEditingItem] = useState(null); // { id, title }
    const [showAddItemDropdown, setShowAddItemDropdown] = useState(null);
    const [showBulkAdd, setShowBulkAdd] = useState(null);
    const [bulkText, setBulkText] = useState("");
    const [showDocUploadModal, setShowDocUploadModal] = useState(null); // id of parent

    // DRAG AND DROP STATES
    const [draggedId, setDraggedId] = useState(null);
    const [dropTarget, setDropTarget] = useState(null); // { id, position: 'before' | 'after' | 'inside' }

    // DRAFT STATES
    const [hasDraft, setHasDraft] = useState(false);
    const [restoringDraft, setRestoringDraft] = useState(false);
    const backendDataRef = useRef("");
    const isInitialLoad = useRef(true);

    const isForms = activeFilter === "forms";

    useEffect(() => {
        loadSection(activeFilter);
    }, [activeFilter]);

    // AUTO-SAVE TO LOCAL STORAGE
    useEffect(() => {
        if (!loading && !restoringDraft && !isInitialLoad.current) {
            const currentItemsJson = JSON.stringify(items);
            if (currentItemsJson !== backendDataRef.current) {
                localStorage.setItem(`docs_upload_draft_${activeFilter}`, currentItemsJson);
                setHasDraft(true);
            } else {
                localStorage.removeItem(`docs_upload_draft_${activeFilter}`);
                setHasDraft(false);
            }
        }
    }, [items, activeFilter, loading, restoringDraft]);

    async function loadSection(section) {
        try {
            setLoading(true);
            isInitialLoad.current = true;
            const response = await AdminAPI.getDocuments(section);
            const fetchedItems = response?.data?.items || [];
            
            backendDataRef.current = JSON.stringify(fetchedItems);
            setItems(fetchedItems);
            
            const savedDraft = localStorage.getItem(`docs_upload_draft_${section}`);
            setHasDraft(!!savedDraft && savedDraft !== backendDataRef.current);

            setTimeout(() => { isInitialLoad.current = false; }, 100);
        } catch (error) {
            console.error(`Failed to load ${section}:`, error);
        } finally {
            setLoading(false);
        }
    }

    const handleRestoreDraft = () => {
        const savedDraft = localStorage.getItem(`docs_upload_draft_${activeFilter}`);
        if (savedDraft) {
            setRestoringDraft(true);
            setItems(JSON.parse(savedDraft));
            setHasDraft(false);
            setTimeout(() => setRestoringDraft(false), 100);
            setPopup({ title: "Restored", text: "Your unsaved changes have been loaded.", icon: <Check size={50} />, type: "success" });
        }
    };

    const handleDiscardDraft = () => {
        localStorage.removeItem(`docs_upload_draft_${activeFilter}`);
        setHasDraft(false);
        loadSection(activeFilter);
    };

    const triggerConfirm = (text, action) => {
        setConfirmAction({ text, action });
        setShowConfirmModal(true);
    };

    async function handleSaveSection() {
        try {
            setSaving(true);
            const normalizedItems = normalizeTreeForSave(items);
            await AdminAPI.saveDocuments(activeFilter, normalizedItems);
            
            backendDataRef.current = JSON.stringify(items);
            localStorage.removeItem(`docs_upload_draft_${activeFilter}`);
            setHasDraft(false);

            setPopup({ title: "Success", text: `${SECTION_LABELS[activeFilter]} saved successfully.`, icon: <Check size={50} />, type: "success" });
        } catch (error) {
            console.error("Failed to save:", error);
            setPopup({ title: "Error", text: "Failed to save section.", icon: <X size={50} />, type: "failed" });
        } finally {
            setSaving(false);
            setShowConfirmModal(false);
        }
    }

    async function handleClearSection() {
        try {
            setSaving(true);
            await AdminAPI.clearDocuments(activeFilter);
            setItems([]);
            backendDataRef.current = "[]";
            localStorage.removeItem(`docs_upload_draft_${activeFilter}`);
            setHasDraft(false);
            setPopup({ title: "Cleared", text: "Section data reset.", icon: <Trash size={50} />, type: "neutral" });
        } catch (error) {
            console.error("Failed to clear:", error);
        } finally {
            setSaving(false);
            setShowConfirmModal(false);
        }
    }

    const addComponent = () => {
        const newComp = { id: crypto.randomUUID(), type: "header", title: "New Component", children: [] };
        setItems([...items, newComp]);
        setEditingItem({ id: newComp.id, title: newComp.title });
    };

    const deleteItem = (id, title) => {
        triggerConfirm(`delete "${title}" and all its children?`, () => {
            const [newList] = findAndRemove(items, id);
            setItems(newList);
            setPopup({ title: "Removed", text: "Item removed from local structure. Save to apply changes.", icon: <Trash size={50} />, type: "neutral" });
        });
    };

    const updateItemTitle = (id, newTitle) => {
        const updateInTree = (list) => list.map(item => {
            if (item.id === id) return { ...item, title: newTitle };
            return { ...item, children: item.children ? updateInTree(item.children) : [] };
        });
        setItems(updateInTree(items));
        setEditingItem(null);
    };

    const handleMove = (draggedId, targetId, position = 'inside') => {
        if (draggedId === targetId) return;
        
        // Circular check: dragging a parent into its own child
        const checkCircular = (list) => {
            for (let item of list) {
                if (item.id === draggedId && isChildOf(item, targetId)) return true;
                if (item.children && checkCircular(item.children)) return true;
            }
            return false;
        };
        if (checkCircular(items)) return;

        const [listWithoutDragged, draggedItem] = findAndRemove(items, draggedId);
        if (!draggedItem) return;
        
        setItems(insertAt(listWithoutDragged, targetId, draggedItem, position));
        setDropTarget(null);
        setDraggedId(null);
    };

    const addItemToParent = (parentId, type) => {
        if (type === 'document') {
            setShowDocUploadModal(parentId);
            setShowAddItemDropdown(null);
            return;
        }
        const newItem = { id: crypto.randomUUID(), type, title: `New ${type.replace('_', ' ')}`, children: [] };
        setItems(insertAt(items, parentId, newItem));
        setShowAddItemDropdown(null);
        setEditingItem({ id: newItem.id, title: newItem.title });
    };

    const handleBulkAdd = (parentId) => {
        const parsed = parseBulkAdd(bulkText);
        const addToTree = (list) => list.map(item => {
            if (item.id === parentId) return { ...item, children: [...(item.children || []), ...parsed] };
            return { ...item, children: item.children ? addToTree(item.children) : [] };
        });
        setItems(addToTree(items));
        setShowBulkAdd(null);
        setBulkText("");
    };

    const handleDocUpload = async (parentId, title, file) => {
        try {
            setSaving(true);
            const response = await AdminAPI.uploadDocument(activeFilter, title, file);
            const uploaded = response?.data;
            const newItem = {
                id: crypto.randomUUID(),
                type: "document",
                title: title,
                file: uploaded.file,
                originalFilename: uploaded.originalFilename,
                children: []
            };
            setItems(insertAt(items, parentId, newItem));
            setShowDocUploadModal(null);
        } catch (error) {
            console.error("Upload failed:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleViewDocument = (item) => {
        if (item.file) setViewDoc({ url: `${API_BASE}${item.file}`, title: item.title, originalFilename: item.originalFilename });
    };

    return (
        <AdminScreen>
            {popup && <GeneralPopupModal icon={popup.icon} title={popup.title} text={popup.text} onClose={() => setPopup(null)} isSuccess={popup.type === "success"} isFailed={popup.type === "failed"} isNeutral={popup.type === "neutral"} />}
            {showConfirmModal && <ConfirmModal confText={confirmAction?.text} onConfirm={() => confirmAction?.action()} onCancel={() => setShowConfirmModal(false)} />}
            <ViewModal visible={!!viewDoc} onClose={() => setViewDoc(null)} isDocument={true} resourceTitle={viewDoc?.title} file={viewDoc?.url} />
            {showDocUploadModal && <DocUploadModal parentId={showDocUploadModal} onCancel={() => setShowDocUploadModal(null)} onUpload={handleDocUpload} saving={saving} />}

            <div className='w-[90%] flex flex-col gap-3 items-start justify-center border-b border-gray-400 py-5'>
                <Title text="Documents Upload" size='text-[2.2rem]'/>
                <Subtitle text={"Configure the guidelines, procedures, and resources for the Student OJT Hub."}/>
            </div>

            <div className="w-[90%] mt-8">
                <div className='flex flex-row gap-3 w-full mb-8'>
                    {Object.entries(SECTION_LABELS).map(([key, label], index) => (
                        <div key={key} className="flex flex-row gap-3 items-center">
                            <Subtitle text={label} onClick={() => setFilter(key)} isActive={activeFilter === key} isLink weight={"font-bold"} size="text-[1rem]" className={"rounded-2xl"} />
                            {index < Object.keys(SECTION_LABELS).length - 1 && <Subtitle text="|" size="text-[1rem]" />}
                        </div>
                    ))}
                </div>

                <div className='w-full max-w-5xl mx-auto mb-20 flex flex-col gap-6'>
                    {hasDraft && (
                        <div className="bg-amber-50 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 animate__animated animate__slideInDown animate__faster shadow-lg shadow-amber-900/5 border border-amber-100">
                            <div className="flex items-center gap-4">
                                <div className="p-3 text-amber-600 bg-white rounded-2xl shadow-sm"><Save size={24} /></div>
                                <div><p className="font-bold text-amber-900">Unsaved changes detected</p><p className="text-xs text-amber-700">We found a local draft for {SECTION_LABELS[activeFilter]} that wasn't saved.</p></div>
                            </div>
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <button onClick={handleDiscardDraft} className="flex-1 md:flex-none px-6 py-2.5 text-xs font-bold text-amber-700 hover:bg-amber-100 rounded-xl transition-all">Discard</button>
                                <button onClick={handleRestoreDraft} className="flex-1 md:flex-none px-8 py-2.5 text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 rounded-xl transition-all shadow-md shadow-amber-600/20">Restore Draft</button>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl">
                            <button onClick={() => setIsEditMode(true)} className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all ${isEditMode ? "bg-white text-oasis-header shadow-sm" : "text-gray-500 hover:text-gray-700"}`}><Edit2 size={18} /> Edit Mode</button>
                            <button onClick={() => setIsEditMode(false)} className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all ${!isEditMode ? "bg-white text-oasis-header shadow-sm" : "text-gray-500 hover:text-gray-700"}`}><Eye size={18} /> Preview Mode</button>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => triggerConfirm("clear the entire structure?", handleClearSection)} className="flex items-center gap-2 px-5 py-2 text-gray-500 hover:text-red-500 font-bold transition-all"><Trash size={18} /> Clear</button>
                            <button onClick={() => triggerConfirm(`save changes to ${SECTION_LABELS[activeFilter]}?`, handleSaveSection)} disabled={saving || loading} className="flex items-center gap-2 px-8 py-2 bg-oasis-header text-white rounded-xl font-bold hover:bg-oasis-button-dark transition-all shadow-lg shadow-oasis-header/20"><Save size={18} /> {saving ? "Saving..." : `Save ${SECTION_LABELS[activeFilter]}`}</button>
                        </div>
                    </div>

                    {isEditMode ? (
                        <div className="flex flex-col gap-6 animate__animated animate__fadeIn">
                            <div className="flex justify-between items-center px-2"><Subtitle text="Visual Structure" weight="font-bold" size="text-xl" /><button onClick={addComponent} className="flex items-center gap-2 px-5 py-2.5 bg-oasis-header/10 text-oasis-header rounded-2xl font-bold hover:bg-oasis-header hover:text-white transition-all border border-oasis-header/20"><Plus size={20} /> Add Component</button></div>
                            <div className="space-y-6">
                                {loading ? <div className="py-20 text-center text-gray-400 animate-pulse font-bold tracking-widest uppercase text-xs">Loading structure...</div> : 
                                items.length === 0 ? <div className="py-20 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 gap-4"><Layout size={48} className="text-gray-200" /><p className="font-bold">No components added yet</p><button onClick={addComponent} className="text-oasis-header underline font-bold text-sm">Add your first component</button></div> : 
                                items.map((component) => (
                                    <div key={component.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden border-l-4 border-l-oasis-header" onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }} onDrop={(e) => { e.preventDefault(); e.stopPropagation(); handleMove(e.dataTransfer.getData("draggedId"), component.id); }}>
                                        <div className="p-6 flex items-center justify-between bg-gray-50/50">
                                            <div className="flex items-center gap-4 flex-1"><div draggable onDragStart={(e) => { e.dataTransfer.setData("draggedId", component.id); e.dataTransfer.effectAllowed = "move"; }} className="mt-1 cursor-grab active:cursor-grabbing text-gray-300 hover:text-oasis-header transition-colors"><GripVertical size={20} /></div><div className="p-2 bg-white rounded-xl shadow-sm text-oasis-header"><Layout size={20} /></div>
                                                {editingItem?.id === component.id ? <div className="flex items-center gap-2 w-full max-w-md"><span className="text-gray-400 font-bold text-lg whitespace-nowrap">Head:</span><input autoFocus className="bg-white border border-oasis-header px-4 py-1.5 rounded-lg font-bold text-lg w-full focus:outline-none" value={editingItem.title} onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })} onBlur={() => updateItemTitle(component.id, editingItem.title)} onKeyDown={(e) => e.key === 'Enter' && updateItemTitle(component.id, editingItem.title)} /></div> : 
                                                <h3 className="font-bold text-lg text-gray-800 cursor-pointer hover:text-oasis-header transition-colors flex items-center gap-2" onClick={() => setEditingItem({ id: component.id, title: component.title })}><span className="text-gray-400">Head:</span> {component.title}</h3>}
                                            </div>
                                            <div className="flex items-center gap-2"><button onClick={() => setShowAddItemDropdown(showAddItemDropdown === component.id ? null : component.id)} className="p-2.5 text-gray-400 hover:text-oasis-header hover:bg-white rounded-xl transition-all shadow-sm" title="Add Item"><PlusCircle size={20} /></button>
                                                {!isForms && <button onClick={() => setShowBulkAdd(showBulkAdd === component.id ? null : component.id)} className="p-2.5 text-gray-400 hover:text-oasis-header hover:bg-white rounded-xl transition-all shadow-sm" title="Bulk Add"><CopyPlus size={20} /></button>}
                                                <button onClick={() => deleteItem(component.id, component.title)} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-white rounded-xl transition-all shadow-sm" title="Delete Component"><Trash size={20} /></button>
                                            </div>
                                        </div>
                                        {showAddItemDropdown === component.id && <div className="px-6 py-4 bg-white border-b border-gray-100 flex flex-wrap gap-2 animate__animated animate__fadeInDown animate__faster">{ITEM_TYPES.filter(t => isForms ? ["header", "document"].includes(t.value) : t.value !== "document").map(type => <button key={type.value} onClick={() => addItemToParent(component.id, type.value)} className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-oasis-header hover:text-white rounded-xl text-xs font-bold transition-all border border-gray-100">{type.icon} {type.label}</button>)}</div>}
                                        {showBulkAdd === component.id && (
                                            <div className="p-6 bg-white border-b border-gray-100 flex flex-col gap-4 animate__animated animate__fadeInDown animate__faster">
                                                <div className="flex flex-col gap-2 p-4 bg-oasis-header/5 rounded-2xl border border-oasis-header/10">
                                                    <p className="text-xs font-bold text-oasis-header uppercase tracking-wider">Bulk Add Legend</p>
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4">
                                                        <div className="flex items-center gap-2 text-[0.7rem] text-gray-600 font-medium"><span className="p-1 bg-white rounded border border-gray-100 font-bold text-oasis-header min-w-[3rem] text-center">Head:</span> Header</div>
                                                        <div className="flex items-center gap-2 text-[0.7rem] text-gray-600 font-medium"><span className="p-1 bg-white rounded border border-gray-100 font-bold text-oasis-header min-w-[3rem] text-center">-</span> Bulleted List</div>
                                                        <div className="flex items-center gap-2 text-[0.7rem] text-gray-600 font-medium"><span className="p-1 bg-white rounded border border-gray-100 font-bold text-oasis-header min-w-[3rem] text-center">1.</span> Numbered List</div>
                                                        <div className="flex items-center gap-2 text-[0.7rem] text-gray-600 font-medium"><span className="p-1 bg-white rounded border border-gray-100 font-bold text-oasis-header min-w-[3rem] text-center">a.</span> Alphabetical</div>
                                                        <div className="flex items-center gap-2 text-[0.7rem] text-gray-600 font-medium"><span className="p-1 bg-white rounded border border-gray-100 font-bold text-oasis-header min-w-[3rem] text-center">(none)</span> Description</div>
                                                    </div>
                                                    <p className="text-[0.65rem] text-oasis-header/60 italic mt-1">* Indent with spaces to create nested structures.</p>
                                                </div>
                                                <textarea className="w-full h-40 p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-oasis-header text-sm font-mono custom-scrollbar" placeholder="Paste lines here..." value={bulkText} onChange={(e) => setBulkText(e.target.value)}></textarea>
                                                <div className="flex justify-end gap-3">
                                                    <button onClick={() => setShowBulkAdd(null)} className="px-6 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl">Cancel</button>
                                                    <button disabled={!bulkText.trim()} onClick={() => handleBulkAdd(component.id)} className="px-6 py-2 bg-oasis-header text-white text-sm font-bold rounded-xl hover:bg-oasis-button-dark transition-all disabled:opacity-50">Add {bulkText.split('\n').filter(l => l.trim()).length} items</button>
                                                </div>
                                            </div>
                                        )}
                                        <div className="p-6">
                                            {component.children?.length > 0 ? (
                                                <RecursiveTree 
                                                    items={component.children} 
                                                    onDelete={deleteItem} 
                                                    onEdit={(id, title) => setEditingItem({ id, title })} 
                                                    editingItem={editingItem} 
                                                    onUpdateTitle={updateItemTitle} 
                                                    onMove={handleMove} 
                                                    onAddItem={addItemToParent} 
                                                    onView={handleViewDocument} 
                                                    isForms={isForms}
                                                    draggedId={draggedId}
                                                    setDraggedId={setDraggedId}
                                                    dropTarget={dropTarget}
                                                    setDropTarget={setDropTarget}
                                                />
                                            ) : (
                                                <div className="py-10 text-center text-gray-300 italic text-sm">Empty section. Add items above.</div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <div 
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        setDropTarget({ id: null, position: 'inside' });
                                    }}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        handleMove(draggedId, null, 'inside');
                                    }}
                                    className={`py-10 border-2 border-dashed rounded-[3rem] text-center text-gray-300 text-sm italic transition-all ${dropTarget?.id === null ? 'border-oasis-header bg-oasis-header/5 text-oasis-header' : 'border-gray-100'}`}
                                >
                                    Drop here to move to root
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-8 animate__animated animate__fadeIn">
                            <Subtitle text="Student Preview" weight="font-bold" size="text-xl" />
                            <div className="flex flex-col gap-6">
                                {items.length === 0 ? <div className="py-20 text-center text-gray-400 italic bg-white rounded-3xl border border-gray-100">Nothing to preview.</div> : 
                                items.map((component) => (
                                    isForms ? (
                                        <div key={component.id} className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 md:p-10 border border-gray-100 shadow-sm"><h2 className="font-bold text-oasis-button-dark text-xl mb-8 border-b border-gray-100 pb-4">{component.title}</h2><StudentTreeRenderer items={component.children} onView={handleViewDocument}/></div>
                                    ) : (
                                        <Accordion key={component.id} headerText={component.title}><div className="py-4"><StudentTreeRenderer items={component.children} onView={handleViewDocument}/></div></Accordion>
                                    )
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminScreen>
    );
}

function RecursiveTree({ 
    items, 
    onDelete, 
    onEdit, 
    editingItem, 
    onUpdateTitle, 
    onMove, 
    onAddItem, 
    onView, 
    isForms, 
    draggedId,
    setDraggedId,
    dropTarget,
    setDropTarget,
    level = 0 
}) {
    const handleDragOver = (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (draggedId === id) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const height = rect.height;
        
        let position = 'inside';
        if (y < height * 0.25) position = 'before';
        else if (y > height * 0.75) position = 'after';

        if (dropTarget?.id !== id || dropTarget?.position !== position) {
            setDropTarget({ id, position });
        }
    };

    return (
        <div className={`flex flex-col gap-3 ${level > 0 ? "ml-8 border-l border-gray-100 pl-4 mt-2" : ""}`}>
            {items.map((item, index) => {
                const prefix = getSequentialPrefix(items, index, item.type);
                const isBeingDragged = draggedId === item.id;
                const isDropTarget = dropTarget?.id === item.id;

                return (
                    <div 
                        key={item.id} 
                        className="group/item relative" 
                        onDragOver={(e) => handleDragOver(e, item.id)}
                        onDrop={(e) => { 
                            e.preventDefault(); 
                            e.stopPropagation(); 
                            if (dropTarget) {
                                onMove(draggedId, dropTarget.id, dropTarget.position); 
                            }
                        }}
                    >
                        {/* Visual Indicators */}
                        {isDropTarget && dropTarget.position === 'before' && (
                            <div className="absolute -top-1.5 left-0 right-0 h-1 bg-oasis-header rounded-full z-10 animate-pulse" />
                        )}

                        <div className={`
                            flex items-center gap-3 p-3 rounded-2xl border transition-all duration-200
                            ${isBeingDragged ? 'opacity-40 grayscale bg-gray-50 border-dashed' : 'bg-white border-gray-100'}
                            ${isDropTarget && dropTarget.position === 'inside' ? 'border-oasis-header bg-oasis-header/5 ring-2 ring-oasis-header/20' : 'hover:border-oasis-header/30 hover:shadow-sm'}
                        `}>
                            <div 
                                draggable 
                                onDragStart={(e) => { 
                                    setDraggedId(item.id); 
                                    e.dataTransfer.effectAllowed = "move"; 
                                }} 
                                onDragEnd={() => {
                                    setDraggedId(null);
                                    setDropTarget(null);
                                }}
                                className="text-gray-300 cursor-grab active:cursor-grabbing hover:text-oasis-header transition-colors"
                            >
                                <GripVertical size={14} />
                            </div>
                            <div className="p-1.5 bg-gray-50 rounded-lg text-gray-400 group-hover/item:text-oasis-header transition-colors">
                                {ITEM_TYPES.find(t => t.value === item.type)?.icon}
                            </div>
                            <div className="flex-1 flex items-center gap-2 overflow-hidden">
                                {editingItem?.id === item.id ? (
                                    <div className="flex items-center gap-1 w-full">
                                        <span className="text-gray-400 font-bold whitespace-nowrap">{prefix}</span>
                                        <input 
                                            autoFocus 
                                            className="bg-white border border-oasis-header px-3 py-1 rounded-lg text-sm w-full focus:outline-none" 
                                            value={editingItem.title} 
                                            onChange={(e) => onEdit(item.id, e.target.value)} 
                                            onBlur={() => onUpdateTitle(item.id, editingItem.title)} 
                                            onKeyDown={(e) => e.key === 'Enter' && onUpdateTitle(item.id, editingItem.title)} 
                                        />
                                    </div>
                                ) : (
                                    <span 
                                        className="text-sm font-medium text-gray-700 cursor-pointer hover:text-oasis-header flex items-center gap-1 truncate" 
                                        onClick={() => onEdit(item.id, item.title)}
                                    >
                                        <span className="text-gray-400">{prefix}</span> {item.title}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                {!isForms && item.type === "header" && (
                                    <button onClick={() => onAddItem(item.id, "description")} className="p-1.5 text-gray-400 hover:text-oasis-header hover:bg-gray-50 rounded-lg">
                                        <PlusCircle size={14}/>
                                    </button>
                                )}
                                {item.type === 'document' && (
                                    <button onClick={() => onView(item)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg">
                                        <Eye size={14}/>
                                    </button>
                                )}
                                <button onClick={() => onDelete(item.id, item.title)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                                    <Trash size={14}/>
                                </button>
                            </div>
                        </div>

                        {isDropTarget && dropTarget.position === 'after' && (
                            <div className="absolute -bottom-1.5 left-0 right-0 h-1 bg-oasis-header rounded-full z-10 animate-pulse" />
                        )}

                        {item.children?.length > 0 && (
                            <RecursiveTree 
                                items={item.children} 
                                onDelete={onDelete} 
                                onEdit={onEdit} 
                                editingItem={editingItem} 
                                onUpdateTitle={onUpdateTitle} 
                                onMove={onMove} 
                                onAddItem={onAddItem} 
                                onView={onView} 
                                isForms={isForms} 
                                draggedId={draggedId}
                                setDraggedId={setDraggedId}
                                dropTarget={dropTarget}
                                setDropTarget={setDropTarget}
                                level={level + 1} 
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function StudentTreeRenderer({ items = [], onView, level = 0 }) {
    const renderItems = [];
    let currentList = null;
    items.forEach((item) => {
        const isList = ["numerical_list", "bulleted_list", "alphabetical_list"].includes(item.type);
        if (isList) {
            if (currentList && currentList.type === item.type) currentList.items.push(item);
            else { currentList = { type: item.type, items: [item] }; renderItems.push(currentList); }
        } else { currentList = null; renderItems.push(item); }
    });

    return (
        <div className={`w-full flex flex-col gap-6 ${level > 0 ? "ml-4 md:ml-8 border-l-2 border-gray-100 pl-4 md:pl-6 mt-4" : ""}`}>
            {renderItems.map((group, idx) => {
                if (group.items) {
                    const listClass = group.type === "numerical_list" ? "list-decimal" : group.type === "bulleted_list" ? "list-disc" : "list-[lower-alpha]";
                    return (
                        <ul key={idx} className={`${listClass} px-6 md:px-10 py-1 text-justify flex flex-col gap-3 text-[0.95rem] font-oasis-text text-gray-700`}>
                            {group.items.map(li => <li key={li.id} className="leading-relaxed"><div className="flex flex-col gap-2"><span>{li.title}</span>{li.children?.length > 0 && <StudentTreeRenderer items={li.children} onView={onView} level={level + 1} />}</div></li>)}
                        </ul>
                    );
                }
                const item = group;
                if (item.type === "header") return <div key={item.id} className="w-full flex flex-col gap-2"><h2 className={`font-bold text-oasis-button-dark ${level === 0 ? "text-xl" : "text-lg"} tracking-tight`}>{item.title}</h2>{item.children?.length > 0 && <StudentTreeRenderer items={item.children} onView={onView} level={level + 1} />}</div>;
                if (item.type === "description") return <div key={item.id} className="w-full flex flex-col gap-2"><p className="text-[0.9rem] text-gray-700 leading-relaxed whitespace-pre-wrap">{item.title}</p>{item.children?.length > 0 && <StudentTreeRenderer items={item.children} onView={onView} level={level + 1} />}</div>;
                if (item.type === "document") return <FormDownloadable key={item.id} text={item.title} link={`${API_BASE}${item.file}`} />;
                return null;
            })}
        </div>
    );
}

function DocUploadModal({ parentId, onCancel, onUpload, saving }) {
    const [title, setTitle] = useState("");
    const [file, setFile] = useState(null);
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-150 p-4">
            <div className="w-full max-w-xl bg-admin-element rounded-[2.5rem] shadow-2xl p-8 animate__animated animate__zoomIn animate__faster">
                <h2 className="text-2xl font-bold mb-6">Upload Document</h2>
                <div className="space-y-6"><SingleField labelText="Document Name" fieldHolder="e.g. Internship Form" value={title} onChange={(e) => setTitle(e.target.value)} /><FileUploadField labelText="Choose File (PDF/Docx)" onChange={(e) => setFile(e.target.files[0])} /></div>
                <div className="flex justify-end gap-4 mt-8"><button onClick={onCancel} className="px-6 py-2 font-bold text-gray-500 hover:bg-gray-100 rounded-xl">Cancel</button><button onClick={() => onUpload(parentId, title, file)} disabled={!title || !file || saving} className="px-8 py-2 bg-oasis-header text-white font-bold rounded-xl hover:bg-oasis-button-dark disabled:opacity-50">{saving ? "Uploading..." : "Upload & Add"}</button></div>
            </div>
        </div>
    );
}
