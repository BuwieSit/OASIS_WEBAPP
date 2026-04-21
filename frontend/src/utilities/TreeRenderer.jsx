import React from 'react';
import { 
    ChevronRight, 
    Type, 
    AlignLeft, 
    ListOrdered, 
    List, 
    FileText, 
    CornerDownRight,
    Trash,
    
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

export function TreeRenderer({ items = [], isRoot = true, onDelete }) {
    if (!items || items.length === 0) return null;

    return (
        <div className={`${isRoot ? "" : "ml-6 border-l-2 border-gray-100 pl-4 mt-2"}`}>
            {items.map((item, index) => (
                <div key={item.id} className="relative mb-4 group/node">
                    {/* Visual Connector for nested items */}
                    {!isRoot && (
                        <div className="absolute -left-4 top-3 w-4 border-t-2 border-gray-100" />
                    )}

                    <div className="flex items-start gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative">
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
                                        <button 
                                            onClick={() => onDelete?.(item)}
                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            title="Delete item"
                                        >
                                            <Trash size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {item.title && (
                                <div className="font-semibold text-black text-[0.95rem] leading-tight">
                                    {item.title}
                                </div>
                            )}

                            {item.description && (
                                <div className="text-xs text-gray-600 whitespace-pre-wrap mt-1 italic">
                                    {item.description}
                                </div>
                            )}

                            {LIST_TYPES.includes(item.type) && item.listItems && (
                                <div className="mt-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                    {item.type === "bulleted_list" && (
                                        <ul className="list-disc ml-4 text-gray-600 text-xs gap-1 flex flex-col">
                                            {item.listItems.map((listItem, i) => (
                                                <li key={i}>{listItem}</li>
                                            ))}
                                        </ul>
                                    )}

                                    {(item.type === "numerical_list" || item.type === "alphabetical_list") && (
                                        <ol className={`ml-4 text-gray-600 text-xs gap-1 flex flex-col ${item.type === "numerical_list" ? "list-decimal" : "list-[lower-alpha]"}`}>
                                            {item.listItems.map((listItem, i) => (
                                                <li key={i}>{listItem}</li>
                                            ))}
                                        </ol>
                                    )}
                                </div>
                            )}

                            {item.type === "document" && item.file && (
                                <div className="mt-2 flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 font-medium">
                                    <FileText size={12} />
                                    <a href={item.file} target="_blank" rel="noreferrer" className="underline">
                                        {item.originalFilename || "View Attachment"}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {item.children && item.children.length > 0 && (
                        <div className="animate__animated animate__fadeIn">
                            <TreeRenderer items={item.children} isRoot={false} onDelete={onDelete} />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

