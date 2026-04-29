import React, { useState } from 'react';
import { 
    ChevronRight, 
    Type, 
    AlignLeft, 
    ListOrdered, 
    List, 
    FileText, 
    CornerDownRight,
    Trash,
    Pencil,
    GripVertical
} from 'lucide-react';

const TYPE_ICONS = {
    header: <Type size={14} className="text-blue-500" />,
    description: <AlignLeft size={14} className="text-gray-400" />,
    numerical_list: <ListOrdered size={14} className="text-green-500" />,
    bulleted_list: <List size={14} className="text-green-500" />,
    alphabetical_list: <List size={14} className="text-green-500" />,
    document: <FileText size={14} className="text-orange-500" />
};

const TYPE_LABELS = {
    header: "Header",
    description: "Description",
    numerical_list: "Numerical List",
    bulleted_list: "Bulleted List",
    alphabetical_list: "Alphabetical List",
    document: "Document"
};

const LIST_TYPES = [
    "numerical_list",
    "bulleted_list",
    "alphabetical_list"
];

export function TreeRenderer({ items = [], isRoot = true, onDelete, onView, onEdit, onMove }) {
    const [dragOverId, setDragOverId] = useState(null);

    if (!items || items.length === 0) return null;

    const handleDragStart = (e, item) => {
        e.dataTransfer.setData("draggedId", item.id);
        e.dataTransfer.effectAllowed = "move";
        // To avoid showing the whole tree while dragging
        const dragImage = e.currentTarget.cloneNode(true);
        dragImage.style.position = "absolute";
        dragImage.style.top = "-1000px";
        document.body.appendChild(dragImage);
        e.dataTransfer.setDragImage(dragImage, 0, 0);
        setTimeout(() => document.body.removeChild(dragImage), 0);
    };

    const handleDragOver = (e, item) => {
        e.preventDefault();
        e.stopPropagation();
        if (dragOverId !== item.id) {
            setDragOverId(item.id);
        }
    };

    const handleDragLeave = (e) => {
        setDragOverId(null);
    };

    const handleDrop = (e, targetItem) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOverId(null);
        const draggedId = e.dataTransfer.getData("draggedId");
        if (draggedId && draggedId !== targetItem.id) {
            onMove?.(draggedId, targetItem.id);
        }
    };

    return (
        <div className={`${isRoot ? "" : "ml-6 border-l-2 border-gray-100 pl-4 mt-2"}`}>
            {items.map((item, index) => (
                <div 
                    key={item.id} 
                    className="relative mb-4 group/node"
                    onDragOver={(e) => handleDragOver(e, item)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, item)}
                >
                    {/* Visual Connector for nested items */}
                    {!isRoot && (
                        <div className="absolute -left-4 top-3 w-4 border-t-2 border-gray-100" />
                    )}

                    <div 
                        className={`flex items-start gap-3 bg-white p-3 rounded-xl border transition-all relative ${
                            dragOverId === item.id 
                                ? "border-oasis-header bg-oasis-header/5 scale-[1.02] shadow-lg z-10" 
                                : "border-gray-100 shadow-sm hover:shadow-md"
                        }`}
                    >
                        <div 
                            draggable
                            onDragStart={(e) => handleDragStart(e, item)}
                            className="mt-1.5 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500"
                        >
                            <GripVertical size={16} />
                        </div>

                        <div className="mt-1 bg-gray-50 p-1.5 rounded-lg">
                            {TYPE_ICONS[item.type] || <FileText size={14} />}
                        </div>
                        
                        <div className="flex flex-col gap-1 w-full">
                            <div className="flex items-center justify-between w-full">
                                <span className="font-bold text-oasis-button-dark text-sm uppercase tracking-wider">
                                    {TYPE_LABELS[item.type]}
                                </span>
                                <div className="flex items-center gap-2">
                                    {item.children && item.children.length > 0 && (
                                        <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">
                                            {item.children.length} nested
                                        </span>
                                    )}
                                    {!item.isSectionMeta && (
                                        <>
                                            <button 
                                                onClick={() => onEdit?.(item)}
                                                className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                                                title="Edit item"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button 
                                                onClick={() => onDelete?.(item)}
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                title="Delete item"
                                            >
                                                <Trash size={14} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {item.title && !LIST_TYPES.includes(item.type) && (
                                <div className="font-semibold text-black text-[0.95rem] leading-tight">
                                    {item.title}
                                </div>
                            )}

                            {item.description && !LIST_TYPES.includes(item.type) && (
                                <div className="text-xs text-gray-600 whitespace-pre-wrap mt-1 italic">
                                    {item.description}
                                </div>
                            )}

                            {LIST_TYPES.includes(item.type) && (
                                <div className="mt-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                    {(() => {
                                        const items = item.listItems || (item.description ? item.description.split("\n") : []);
                                        if (items.length === 0) return null;

                                        if (item.type === "bulleted_list") {
                                            return (
                                                <ul className="list-disc ml-4 text-gray-600 text-xs gap-1 flex flex-col">
                                                    {items.map((listItem, i) => (
                                                        <li key={i}>{listItem}</li>
                                                    ))}
                                                </ul>
                                            );
                                        }

                                        return (
                                            <ol className={`ml-4 text-gray-600 text-xs gap-1 flex flex-col ${item.type === "numerical_list" ? "list-decimal" : "list-[lower-alpha]"}`}>
                                                {items.map((listItem, i) => (
                                                    <li key={i}>{listItem}</li>
                                                ))}
                                            </ol>
                                        );
                                    })()}
                                </div>
                            )}

                            {item.type === "document" && item.file && (
                                <div className="mt-2 flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 font-medium">
                                    <FileText size={12} />
                                    <button 
                                        onClick={() => onView?.(item)}
                                        className="underline hover:no-underline text-left"
                                    >
                                        {item.originalFilename || "View Attachment"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {item.children && item.children.length > 0 && (
                        <div className="animate__animated animate__fadeIn">
                            <TreeRenderer 
                                items={item.children} 
                                isRoot={false} 
                                onDelete={onDelete} 
                                onView={onView}
                                onEdit={onEdit}
                                onMove={onMove}
                            />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
