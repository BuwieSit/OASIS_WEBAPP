import AdminScreen from '../../layouts/adminScreen.jsx';
import Title from "../../utilities/title.jsx";
import Subtitle from '../../utilities/subtitle.jsx';
import { useState } from "react";
import useQueryParam from '../../hooks/useQueryParams.jsx';
import { Save, Trash, Edit2, Eye } from 'lucide-react';
import { ConfirmModal, GeneralPopupModal, ViewModal } from '../../components/popupModal.jsx';
import api from "../../api/axios";

// Sub-components & Hooks
import { SECTION_LABELS } from './docs_upload/docs_utils.jsx';
import { useDocumentEditor } from './docs_upload/useDocumentEditor.jsx';
import DocumentTree from './docs_upload/DocumentTree.jsx';
import StudentPreview from './docs_upload/StudentPreview.jsx';
import DocUploadModal from './docs_upload/DocUploadModal.jsx';

const API_BASE = api.defaults.baseURL;

export default function DocsUpload() {
    const [activeFilter, setFilter] = useQueryParam("tab", "procedures");
    const [popup, setPopup] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [viewDoc, setViewDoc] = useState(null);
    const [showDocUploadModal, setShowDocUploadModal] = useState(null);

    const {
        items,
        loading,
        isEditMode,
        setIsEditMode,
        hasDraft,
        handleRestoreDraft,
        handleDiscardDraft,
        handleSaveSection,
        handleClearSection,
        addComponent,
        deleteItem,
        updateItemTitle,
        handleMove,
        addItemToParent,
        handleBulkAdd,
        handleDocUpload,
        saving
    } = useDocumentEditor(activeFilter, setPopup);

    const isForms = activeFilter === "forms";

    const triggerConfirm = (text, action) => {
        setConfirmAction({ text, action });
        setShowConfirmModal(true);
    };

    const handleViewDocument = (item) => {
        if (item.file) setViewDoc({ url: item.file.startsWith('http') ? item.file : `${API_BASE}${item.file}`, title: item.title, originalFilename: item.originalFilename });
    };

    const onAddItemToParent = (parentId, type) => {
        if (type === 'document') {
            setShowDocUploadModal(parentId);
            return null;
        }
        return addItemToParent(parentId, type);
    };

    return (
        <AdminScreen>
            {popup && <GeneralPopupModal title={popup.title} text={popup.text} onClose={() => setPopup(null)} isSuccess={popup.type === "success"} isFailed={popup.type === "failed"} isNeutral={popup.type === "neutral"} />}
            {showConfirmModal && <ConfirmModal confText={confirmAction?.text} onConfirm={() => confirmAction?.action()} onCancel={() => setShowConfirmModal(false)} />}
            <ViewModal visible={!!viewDoc} onClose={() => setViewDoc(null)} isDocument={true} resourceTitle={viewDoc?.title} file={viewDoc?.url} />
            {showDocUploadModal && (
                <DocUploadModal 
                    parentId={showDocUploadModal} 
                    onCancel={() => setShowDocUploadModal(null)} 
                    onUpload={(parentId, title, file) => { 
                        handleDocUpload(parentId, title, file); 
                        setShowDocUploadModal(null); 
                    }} 
                    saving={saving} 
                />
            )}

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
                            <button onClick={() => triggerConfirm("clear the entire structure?", () => { handleClearSection(); setShowConfirmModal(false); })} className="flex items-center gap-2 px-5 py-2 text-gray-500 hover:text-red-500 font-bold transition-all"><Trash size={18} /> Clear</button>
                            <button onClick={() => triggerConfirm(`save changes to ${SECTION_LABELS[activeFilter]}?`, () => { handleSaveSection(); setShowConfirmModal(false); })} disabled={saving || loading} className="flex items-center gap-2 px-8 py-2 bg-oasis-header text-white rounded-xl font-bold hover:bg-oasis-button-dark transition-all shadow-lg shadow-oasis-header/20"><Save size={18} /> {saving ? "Saving..." : `Save ${SECTION_LABELS[activeFilter]}`}</button>
                        </div>
                    </div>

                    {isEditMode ? (
                        <DocumentTree 
                            items={items}
                            loading={loading}
                            onAddRootComponent={addComponent}
                            onDeleteItem={(id, title) => triggerConfirm(`delete "${title}" and all its children?`, () => { deleteItem(id); setShowConfirmModal(false); })}
                            onUpdateItemTitle={updateItemTitle}
                            onMove={handleMove}
                            onAddItemToParent={onAddItemToParent}
                            onBulkAdd={handleBulkAdd}
                            onViewDocument={handleViewDocument}
                            isForms={isForms}
                        />
                    ) : (
                        <StudentPreview 
                            items={items}
                            isForms={isForms}
                            onView={handleViewDocument}
                        />
                    )}
                </div>
            </div>
        </AdminScreen>
    );
}
