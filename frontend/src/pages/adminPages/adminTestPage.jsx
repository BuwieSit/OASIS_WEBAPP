import AdminScreen from '../../layouts/adminScreen.jsx';
import Title from "../../utilities/title.jsx";
import { useEffect, useState, useRef } from "react";
import { 
    Plus, 
    Trash, 
    Type, 
    AlignLeft, 
    ListOrdered, 
    List, 
    GripVertical, 
    Edit2, 
    Eye, 
    Layout,
    ChevronRight,
    ChevronDown
} from 'lucide-react';
import Subtitle from '../../utilities/subtitle.jsx';

// --- HELPERS ---

const ITEM_TYPES = [
    { label: "Header", value: "header", icon: <Type size={16} /> },
    { label: "Description", value: "description", icon: <AlignLeft size={16} /> },
    { label: "Numerical List", value: "numerical_list", icon: <ListOrdered size={16} /> },
    { label: "Bulleted List", value: "bulleted_list", icon: <List size={16} /> },
    { label: "Alphabetical List", value: "alphabetical_list", icon: <List size={16} /> }
];

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
    // position: 'inside', 'before', 'after'
    
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

    // handle 'before' or 'after'
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

// --- COMPONENTS ---

export default function AdminTestPage() {
    const [items, setItems] = useState([
        { id: '1', type: 'header', title: 'Getting Started', children: [
            { id: '2', type: 'description', title: 'Welcome to the OJT program.', children: [] },
            { id: '3', type: 'numerical_list', title: 'Register an account', children: [] }
        ]},
        { id: '4', type: 'header', title: 'Requirements', children: [] }
    ]);
    const [isEditMode, setIsEditMode] = useState(true);
    const [draggedId, setDraggedId] = useState(null);
    const [dropTarget, setDropTarget] = useState(null); // { id, position: 'before' | 'after' | 'inside' }

    const handleMove = (draggedId, targetId, position) => {
        if (draggedId === targetId) return;
        
        const [listWithoutDragged, draggedItem] = findAndRemove(items, draggedId);
        if (!draggedItem) return;
        
        const newList = insertAt(listWithoutDragged, targetId, draggedItem, position);
        setItems(newList);
        setDropTarget(null);
        setDraggedId(null);
    };

    return (
        <AdminScreen>
            <div className='w-[90%] flex flex-col gap-3 items-start justify-center border-b border-gray-400 py-5 mb-8'>
                <Title text="Admin UX Test - Drag Reordering" size='text-[2.2rem]'/>
                <Subtitle text={"Test page for improved drag-and-drop experience with visual indicators."}/>
            </div>

            <div className="w-[90%] max-w-5xl flex flex-col gap-6">
                <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl">
                        <button onClick={() => setIsEditMode(true)} className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all ${isEditMode ? "bg-white text-oasis-header shadow-sm" : "text-gray-500 hover:text-gray-700"}`}><Edit2 size={18} /> Edit Mode</button>
                        <button onClick={() => setIsEditMode(false)} className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all ${!isEditMode ? "bg-white text-oasis-header shadow-sm" : "text-gray-500 hover:text-gray-700"}`}><Eye size={18} /> Preview Mode</button>
                    </div>
                </div>

                {isEditMode ? (
                    <div className="space-y-4">
                        <RecursiveTree 
                            items={items} 
                            draggedId={draggedId}
                            setDraggedId={setDraggedId}
                            dropTarget={dropTarget}
                            setDropTarget={setDropTarget}
                            onMove={handleMove}
                        />
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
                ) : (
                    <div className="bg-gray-50 p-8 rounded-[3rem] border border-gray-100 italic text-gray-400">
                        Preview mode currently placeholder for test page.
                    </div>
                )}
            </div>
        </AdminScreen>
    );
}

function RecursiveTree({ items, draggedId, setDraggedId, dropTarget, setDropTarget, onMove, level = 0 }) {
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
        <div className={`flex flex-col gap-2 ${level > 0 ? "ml-8 border-l border-gray-100 pl-4 mt-1" : ""}`}>
            {items.map((item) => (
                <div 
                    key={item.id} 
                    className="relative"
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
                    {dropTarget?.id === item.id && dropTarget.position === 'before' && (
                        <div className="absolute -top-1 left-0 right-0 h-1 bg-oasis-header rounded-full z-10 animate-pulse" />
                    )}
                    
                    <div className={`
                        flex items-center gap-3 p-3 rounded-2xl border transition-all duration-200
                        ${draggedId === item.id ? 'opacity-40 grayscale bg-gray-50 border-dashed' : 'bg-white border-gray-100'}
                        ${dropTarget?.id === item.id && dropTarget.position === 'inside' ? 'border-oasis-header bg-oasis-header/5 ring-2 ring-oasis-header/20' : 'hover:border-oasis-header/30 hover:shadow-sm'}
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
                            <GripVertical size={16} />
                        </div>
                        
                        <div className="p-1.5 bg-gray-50 rounded-lg text-gray-400">
                            {ITEM_TYPES.find(t => t.value === item.type)?.icon || <Layout size={16} />}
                        </div>
                        
                        <div className="flex-1 flex items-center gap-2 overflow-hidden">
                            <span className="text-sm font-medium text-gray-700 truncate">{item.title}</span>
                        </div>
                    </div>

                    {dropTarget?.id === item.id && dropTarget.position === 'after' && (
                        <div className="absolute -bottom-1 left-0 right-0 h-1 bg-oasis-header rounded-full z-10 animate-pulse" />
                    )}

                    {item.children?.length > 0 && (
                        <RecursiveTree 
                            items={item.children} 
                            draggedId={draggedId}
                            setDraggedId={setDraggedId}
                            dropTarget={dropTarget}
                            setDropTarget={setDropTarget}
                            onMove={onMove}
                            level={level + 1}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}
