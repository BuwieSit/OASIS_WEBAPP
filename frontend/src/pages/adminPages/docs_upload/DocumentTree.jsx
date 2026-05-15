import { GripVertical, PlusCircle, CopyPlus, Trash, Layout, Plus, Eye, Edit2, Type } from 'lucide-react';
import { useState } from 'react';
import Subtitle from '../../../utilities/subtitle.jsx';
import { ITEM_TYPES, getSequentialPrefix } from './docs_utils.jsx';

export default function DocumentTree({ 
    items, 
    loading, 
    onAddRootComponent, 
    onDeleteItem, 
    onUpdateItemTitle, 
    onMove, 
    onAddItemToParent, 
    onBulkAdd, 
    onViewDocument, 
    isForms 
}) {
    const [editingItem, setEditingItem] = useState(null); // { id, title }
    const [showAddItemDropdown, setShowAddItemDropdown] = useState(null);
    const [showBulkAdd, setShowBulkAdd] = useState(null);
    const [bulkText, setBulkText] = useState("");
    const [draggedId, setDraggedId] = useState(null);
    const [dropTarget, setDropTarget] = useState(null); // { id, position: 'before' | 'after' | 'inside' }

    const handleUpdateTitle = (id, title) => {
        onUpdateItemTitle(id, title);
        setEditingItem(null);
    };

    const handleAddItem = (parentId, type) => {
        const newId = onAddItemToParent(parentId, type);
        setShowAddItemDropdown(null);
        if (newId && type !== 'document') setEditingItem({ id: newId, title: `New ${type.replace('_', ' ')}` });
    };

    const handleBulkSubmit = (parentId) => {
        onBulkAdd(parentId, bulkText);
        setShowBulkAdd(null);
        setBulkText("");
    };

    return (
        <div className="flex flex-col gap-6 animate__animated animate__fadeIn">
            <div className="flex justify-between items-center px-2">
                <Subtitle text="Visual Structure" weight="font-bold" size="text-xl" />
                <button onClick={() => {
                    const id = onAddRootComponent();
                    setEditingItem({ id, title: "New Component" });
                }} className="flex items-center gap-2 px-5 py-2.5 bg-oasis-header/10 text-oasis-header rounded-2xl font-bold hover:bg-oasis-header hover:text-white transition-all border border-oasis-header/20">
                    <Plus size={20} /> Add Component
                </button>
            </div>
            
            <div className="space-y-6">
                {loading ? (
                    <div className="py-20 text-center text-gray-400 animate-pulse font-bold tracking-widest uppercase text-xs">Loading structure...</div>
                ) : items.length === 0 ? (
                    <div className="py-20 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 gap-4">
                        <Layout size={48} className="text-gray-200" />
                        <p className="font-bold">No components added yet</p>
                        <button onClick={() => {
                            const id = onAddRootComponent();
                            setEditingItem({ id, title: "New Component" });
                        }} className="text-oasis-header underline font-bold text-sm">Add your first component</button>
                    </div>
                ) : (
                    items.map((component) => (
                        <RootComponentNode 
                            key={component.id}
                            component={component}
                            editingItem={editingItem}
                            setEditingItem={setEditingItem}
                            onUpdateTitle={handleUpdateTitle}
                            onDeleteItem={onDeleteItem}
                            onAddItem={handleAddItem}
                            onBulkAdd={setShowBulkAdd}
                            showBulkAdd={showBulkAdd === component.id}
                            bulkText={bulkText}
                            setBulkText={setBulkText}
                            handleBulkSubmit={() => handleBulkSubmit(component.id)}
                            setShowBulkAdd={setShowBulkAdd}
                            showAddItemDropdown={showAddItemDropdown === component.id}
                            setShowAddItemDropdown={setShowAddItemDropdown}
                            onMove={onMove}
                            draggedId={draggedId}
                            setDraggedId={setDraggedId}
                            dropTarget={dropTarget}
                            setDropTarget={setDropTarget}
                            isForms={isForms}
                            onViewDocument={onViewDocument}
                        />
                    ))
                )}
                
                <div 
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDropTarget({ id: null, position: 'inside' });
                    }}
                    onDrop={(e) => {
                        e.preventDefault();
                        onMove(draggedId, null, 'inside');
                    }}
                    className={`py-10 border-2 border-dashed rounded-[3rem] text-center text-gray-300 text-sm italic transition-all ${dropTarget?.id === null ? 'border-oasis-header bg-oasis-header/5 text-oasis-header' : 'border-gray-100'}`}
                >
                    Drop here to move to root
                </div>
            </div>
        </div>
    );
}

function RootComponentNode({ 
    component, editingItem, setEditingItem, onUpdateTitle, onDeleteItem, onAddItem, 
    showBulkAdd, bulkText, setBulkText, handleBulkSubmit, setShowBulkAdd,
    showAddItemDropdown, setShowAddItemDropdown, onMove, draggedId, setDraggedId,
    dropTarget, setDropTarget, isForms, onViewDocument 
}) {
    return (
        <div 
            className={`bg-white rounded-[2.5rem] border shadow-sm overflow-hidden border-l-4 border-l-oasis-header transition-all duration-300 ${component.isDraft ? 'border-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.2)] ring-1 ring-amber-400/10' : 'border-gray-100'}`} 
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }} 
            onDrop={(e) => { e.preventDefault(); e.stopPropagation(); onMove(draggedId, component.id); }}
        >
            <div className="p-6 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-4 flex-1">
                    <div 
                        draggable 
                        onDragStart={(e) => { e.dataTransfer.setData("draggedId", component.id); setDraggedId(component.id); e.dataTransfer.effectAllowed = "move"; }} 
                        className="mt-1 cursor-grab active:cursor-grabbing text-gray-300 hover:text-oasis-header transition-colors"
                    >
                        <GripVertical size={20} />
                    </div>
                    <div className="p-2 bg-white rounded-xl shadow-sm text-oasis-header"><Layout size={20} /></div>
                    {editingItem?.id === component.id ? (
                        <div className="flex items-center gap-2 w-full max-w-md">
                            <span className="text-gray-400 font-bold text-lg whitespace-nowrap">Head:</span>
                            <input 
                                autoFocus 
                                className="bg-white border border-oasis-header px-4 py-1.5 rounded-lg font-bold text-lg w-full focus:outline-none" 
                                value={editingItem.title} 
                                onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })} 
                                onBlur={() => onUpdateTitle(component.id, editingItem.title)} 
                                onKeyDown={(e) => e.key === 'Enter' && onUpdateTitle(component.id, editingItem.title)} 
                            />
                        </div>
                    ) : (
                        <h3 className="font-bold text-lg text-gray-800 cursor-pointer hover:text-oasis-header transition-colors flex items-center gap-2" onClick={() => setEditingItem({ id: component.id, title: component.title })}>
                            <span className="text-gray-400">Head:</span> {component.title}
                        </h3>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setShowAddItemDropdown(showAddItemDropdown ? null : component.id)} className="p-2.5 text-gray-400 hover:text-oasis-header hover:bg-white rounded-xl transition-all shadow-sm" title="Add Item"><PlusCircle size={20} /></button>
                    {!isForms && <button onClick={() => setShowBulkAdd(showBulkAdd ? null : component.id)} className="p-2.5 text-gray-400 hover:text-oasis-header hover:bg-white rounded-xl transition-all shadow-sm" title="Bulk Add"><CopyPlus size={20} /></button>}
                    <button onClick={() => onDeleteItem(component.id, component.title)} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-white rounded-xl transition-all shadow-sm" title="Delete Component"><Trash size={20} /></button>
                </div>
            </div>
            
            {showAddItemDropdown && (
                <div className="px-6 py-4 bg-white border-b border-gray-100 flex flex-wrap gap-2 animate__animated animate__fadeInDown animate__faster">
                    {ITEM_TYPES.filter(t => isForms ? ["header", "document"].includes(t.value) : t.value !== "document").map(type => (
                        <button key={type.value} onClick={() => onAddItem(component.id, type.value)} className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-oasis-header hover:text-white rounded-xl text-xs font-bold transition-all border border-gray-100">{type.icon} {type.label}</button>
                    ))}
                </div>
            )}
            
            {showBulkAdd && (
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
                    </div>
                    <textarea className="w-full h-40 p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-oasis-header text-sm font-mono custom-scrollbar" placeholder="Paste lines here..." value={bulkText} onChange={(e) => setBulkText(e.target.value)}></textarea>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setShowBulkAdd(null)} className="px-6 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl">Cancel</button>
                        <button disabled={!bulkText.trim()} onClick={handleBulkSubmit} className="px-6 py-2 bg-oasis-header text-white text-sm font-bold rounded-xl hover:bg-oasis-button-dark transition-all disabled:opacity-50">Add {bulkText.split('\n').filter(l => l.trim()).length} items</button>
                    </div>
                </div>
            )}

            <div className="p-6">
                {component.children?.length > 0 ? (
                    <RecursiveTree 
                        items={component.children} 
                        onDelete={onDeleteItem} 
                        onEdit={(id, title) => setEditingItem({ id, title })} 
                        editingItem={editingItem} 
                        onUpdateTitle={onUpdateTitle} 
                        onMove={onMove} 
                        onAddItem={onAddItem} 
                        onView={onViewDocument} 
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
    );
}

function RecursiveTree({ 
    items, onDelete, onEdit, editingItem, onUpdateTitle, onMove, onAddItem, onView, 
    isForms, draggedId, setDraggedId, dropTarget, setDropTarget, level = 0 
}) {
    const safeItems = items || [];
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

    const processedItems = [];
    let currentGroup = null;
    safeItems.forEach((item, index) => {
        const isList = ["numerical_list", "bulleted_list", "alphabetical_list"].includes(item.type);
        if (isList) {
            if (currentGroup && currentGroup.type === item.type) currentGroup.items.push({ item, index });
            else { currentGroup = { type: item.type, items: [{ item, index }], isGroup: true }; processedItems.push(currentGroup); }
        } else { currentGroup = null; processedItems.push({ item, index, isGroup: false }); }
    });

    const renderItemNode = (item, index, inGroup = false) => {
        const prefix = getSequentialPrefix(safeItems, index, item.type);
        const isBeingDragged = draggedId === item.id;
        const isDropTarget = dropTarget?.id === item.id;
        const hasChildren = item.children && item.children.length > 0;
        const isList = ["numerical_list", "bulleted_list", "alphabetical_list"].includes(item.type);
        const isDraft = !!item.isDraft;

        let hoverStyles = "hover:border-oasis-header/30 hover:shadow-sm";
        let iconBgClass = "bg-gray-50 text-gray-400";
        let baseBorderClass = isDraft ? "border-amber-200" : "border-gray-100";
        let baseBgClass = isDraft ? "bg-amber-50/20" : "bg-white";
        
        if (hasChildren) {
            hoverStyles = isDraft ? "hover:border-amber-400 hover:bg-amber-50/50 hover:shadow-[0_0_20px_rgba(251,191,36,0.15)]" : "hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]";
            iconBgClass = `bg-gray-50 text-gray-400 group-hover/item:${isDraft ? "bg-amber-100 text-amber-600" : "bg-indigo-100 text-indigo-600"}`;
        } else if (isList) {
            hoverStyles = isDraft ? "hover:border-amber-400 hover:bg-amber-50/50 hover:shadow-[0_0_20px_rgba(251,191,36,0.15)]" : "hover:border-emerald-300 hover:bg-emerald-50/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]";
            iconBgClass = `bg-gray-50 text-gray-400 group-hover/item:${isDraft ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"}`;
        } else {
            iconBgClass = `bg-gray-50 text-gray-400 group-hover/item:${isDraft ? "bg-amber-100 text-amber-600" : "bg-oasis-header/10 text-oasis-header"}`;
            if (isDraft) hoverStyles = "hover:border-amber-400 hover:bg-amber-50/50 hover:shadow-[0_0_20px_rgba(251,191,36,0.15)]";
        }

        return (
            <div key={item.id} className={`group/item relative ${inGroup ? "last:mb-0" : ""}`} onDragOver={(e) => handleDragOver(e, item.id)} onDrop={(e) => { e.preventDefault(); e.stopPropagation(); if (dropTarget) onMove(draggedId, dropTarget.id, dropTarget.position); }}>
                {isDropTarget && dropTarget.position === 'before' && <div className="absolute -top-1.5 left-0 right-0 h-1 bg-oasis-header rounded-full z-10 animate-pulse" />}
                <div className={`flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300 ${isBeingDragged ? 'opacity-40 grayscale bg-gray-50 border-dashed' : `${baseBgClass} ${baseBorderClass}`} ${isDropTarget && dropTarget.position === 'inside' ? 'border-oasis-header bg-oasis-header/5 ring-2 ring-oasis-header/20' : hoverStyles} ${isDraft && !isBeingDragged ? 'shadow-[0_0_15px_rgba(251,191,36,0.3)] border-amber-300 ring-1 ring-amber-400/20' : ''}`}>
                    <div draggable onDragStart={(e) => { setDraggedId(item.id); e.dataTransfer.effectAllowed = "move"; }} onDragEnd={() => { setDraggedId(null); setDropTarget(null); }} className="text-gray-300 cursor-grab active:cursor-grabbing hover:text-oasis-header transition-colors"><GripVertical size={14} /></div>
                    <div className={`p-1.5 rounded-lg transition-all duration-300 ${iconBgClass}`}>{ITEM_TYPES.find(t => t.value === item.type)?.icon}</div>
                    <div className="flex-1 flex items-center gap-2 overflow-hidden">
                        {editingItem?.id === item.id ? (
                            <div className="flex items-center gap-1 w-full"><span className="text-gray-400 font-bold whitespace-nowrap">{prefix}</span><input autoFocus className="bg-white border border-oasis-header px-3 py-1 rounded-lg text-sm w-full focus:outline-none" value={editingItem.title} onChange={(e) => onEdit(item.id, e.target.value)} onBlur={() => onUpdateTitle(item.id, editingItem.title)} onKeyDown={(e) => e.key === 'Enter' && onUpdateTitle(item.id, editingItem.title)} /></div>
                        ) : (
                            <span className="text-sm font-medium text-gray-700 cursor-pointer hover:text-oasis-header flex items-center gap-1 truncate" onClick={() => onEdit(item.id, item.title)}><span className="text-gray-400">{prefix}</span> {item.title}</span>
                        )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                        {!isForms && item.type === "header" && <button onClick={() => onAddItem(item.id, "description")} className="p-1.5 text-gray-400 hover:text-oasis-header hover:bg-gray-50 rounded-lg"><PlusCircle size={14}/></button>}
                        {item.type === 'document' && <button onClick={() => onView(item)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg"><Eye size={14}/></button>}
                        <button onClick={() => onDelete(item.id, item.title)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash size={14}/></button>
                    </div>
                </div>
                {isDropTarget && dropTarget.position === 'after' && <div className="absolute -bottom-1.5 left-0 right-0 h-1 bg-oasis-header rounded-full z-10 animate-pulse" />}
                {hasChildren && (
                    <RecursiveTree items={item.children} onDelete={onDelete} onEdit={onEdit} editingItem={editingItem} onUpdateTitle={onUpdateTitle} onMove={onMove} onAddItem={onAddItem} onView={onView} isForms={isForms} draggedId={draggedId} setDraggedId={setDraggedId} dropTarget={dropTarget} setDropTarget={setDropTarget} level={level + 1} />
                )}
            </div>
        );
    };

    return (
        <div className={`flex flex-col gap-3 ${level > 0 ? "ml-8 border-l border-gray-100 pl-4 mt-2" : ""}`}>
            {processedItems.map((node, idx) => {
                if (node.isGroup) return <div key={`group-${idx}`} className="flex flex-col gap-2 p-2 rounded-[2rem] border border-transparent hover:border-emerald-100/70 hover:bg-oasis-aqua/10 transition-all duration-300 group/list-group">{node.items.map((entry) => renderItemNode(entry.item, entry.index, true))}</div>;
                return renderItemNode(node.item, node.index, false);
            })}
        </div>
    );
}
