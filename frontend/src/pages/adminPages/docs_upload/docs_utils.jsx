import { Type, AlignLeft, ListOrdered, List, FileText } from 'lucide-react';

export const SECTION_LABELS = {
    procedures: "Procedures",
    moa: "MOA Process",
    guidelines: "Key Guidelines",
    forms: "Forms & Templates"
};

export const ITEM_TYPES = [
    { label: "Header", value: "header", icon: <Type size={16} />, prefix: "Head: " },
    { label: "Description", value: "description", icon: <AlignLeft size={16} />, prefix: "" },
    { label: "Numerical List", value: "numerical_list", icon: <ListOrdered size={16} />, prefix: "1. " },
    { label: "Bulleted List", value: "bulleted_list", icon: <List size={16} />, prefix: "- " },
    { label: "Alphabetical List", value: "alphabetical_list", icon: <List size={16} />, prefix: "a. " },
    { label: "Document", value: "document", icon: <FileText size={16} />, prefix: "Doc: " }
];

export const getSequentialPrefix = (items, index, type) => {
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

export const parseBulkAdd = (text) => {
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
            children: [],
            isDraft: true
        };

        while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
            stack.pop();
        }

        stack[stack.length - 1].children.push(newItem);
        stack.push({ indent, children: newItem.children });
    });

    return rootItems;
};

export const findAndRemove = (list, id) => {
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

export const insertAt = (list, targetId, itemToInsert, position = 'inside') => {
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

export const isChildOf = (parent, childId) => {
    if (!parent.children) return false;
    return parent.children.some(child => child.id === childId || isChildOf(child, childId));
};

export function normalizeTreeForSave(items) {
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
