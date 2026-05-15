import { SingleField, FileUploadField } from '../../../components/fieldComp.jsx';
import { useState } from 'react';

export default function DocUploadModal({ parentId, onCancel, onUpload, saving }) {
    const [title, setTitle] = useState("");
    const [file, setFile] = useState(null);
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-150 p-4">
            <div className="w-full max-w-xl bg-admin-element rounded-[2.5rem] shadow-2xl p-8 animate__animated animate__zoomIn animate__faster">
                <h2 className="text-2xl font-bold mb-6">Upload Document</h2>
                <div className="space-y-6">
                    <SingleField labelText="Document Name" fieldHolder="e.g. Internship Form" value={title} onChange={(e) => setTitle(e.target.value)} />
                    <FileUploadField labelText="Choose File (PDF/Docx)" onChange={(e) => setFile(e.target.files[0])} />
                </div>
                <div className="flex justify-end gap-4 mt-8">
                    <button onClick={onCancel} className="px-6 py-2 font-bold text-gray-500 hover:bg-gray-100 rounded-xl">Cancel</button>
                    <button onClick={() => onUpload(parentId, title, file)} disabled={!title || !file || saving} className="px-8 py-2 bg-oasis-header text-white font-bold rounded-xl hover:bg-oasis-button-dark disabled:opacity-50">
                        {saving ? "Uploading..." : "Upload & Add"}
                    </button>
                </div>
            </div>
        </div>
    );
}
