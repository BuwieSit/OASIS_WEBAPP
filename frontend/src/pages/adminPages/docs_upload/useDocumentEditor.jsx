import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminAPI } from '../../../api/admin.api';
import { 
    findAndRemove, 
    insertAt, 
    isChildOf, 
    normalizeTreeForSave, 
    parseBulkAdd, 
    SECTION_LABELS 
} from './docs_utils.jsx';

export const useDocumentEditor = (activeFilter, setPopup) => {
    const queryClient = useQueryClient();
    const [items, setItems] = useState([]);
    const [isEditMode, setIsEditMode] = useState(true);
    const [hasDraft, setHasDraft] = useState(false);
    const [restoringDraft, setRestoringDraft] = useState(false);
    const backendDataRef = useRef("");
    const isInitialLoad = useRef(true);

    // =============================
    // FETCH STRUCTURE
    // =============================
    const { data: sectionData, isLoading: loading, refetch: refetchStructure } = useQuery({
        queryKey: ['adminDocuments', activeFilter],
        queryFn: () => AdminAPI.getDocuments(activeFilter),
    });

    // Handle initial data load and filter changes
    useEffect(() => {
        if (sectionData) {
            const fetchedItems = sectionData.items || [];
            const fetchedItemsJson = JSON.stringify(fetchedItems);
            backendDataRef.current = fetchedItemsJson;
            
            // Only set items from backend if we're not currently restoring a draft
            // and we're either on initial load or the filter changed
            if (!restoringDraft) {
                setItems(fetchedItems);
                
                // Check if a draft exists in local storage
                const savedDraft = localStorage.getItem(`docs_upload_draft_${activeFilter}`);
                const needsDraft = !!savedDraft && savedDraft !== fetchedItemsJson;
                setHasDraft(needsDraft);
            }
            
            isInitialLoad.current = true;
            const timer = setTimeout(() => { isInitialLoad.current = false; }, 200);
            return () => clearTimeout(timer);
        }
    }, [sectionData, activeFilter]); // Removed restoringDraft dependency

    // Handle draft saving to local storage
    useEffect(() => {
        if (!loading && !restoringDraft && !isInitialLoad.current) {
            const currentItemsJson = JSON.stringify(items);
            const needsDraft = currentItemsJson !== backendDataRef.current;
            
            if (needsDraft) {
                localStorage.setItem(`docs_upload_draft_${activeFilter}`, currentItemsJson);
                if (!hasDraft) setHasDraft(true);
            } else {
                localStorage.removeItem(`docs_upload_draft_${activeFilter}`);
                if (hasDraft) setHasDraft(false);
            }
        }
    }, [items, activeFilter, loading, restoringDraft, hasDraft]);

    // =============================
    // MUTATIONS
    // =============================
    const saveMutation = useMutation({
        mutationFn: (payload) => AdminAPI.saveDocuments(activeFilter, payload),
        onSuccess: (data) => {
            const savedItems = data?.items || items;
            setItems(savedItems);
            backendDataRef.current = JSON.stringify(savedItems);
            localStorage.removeItem(`docs_upload_draft_${activeFilter}`);
            setHasDraft(false);
            setPopup({ title: "Success", text: `${SECTION_LABELS[activeFilter]} saved successfully.`, type: "success" });
            queryClient.invalidateQueries({ queryKey: ['adminDocuments', activeFilter] });
        },
        onError: () => setPopup({ title: "Error", text: "Failed to save section.", type: "failed" })
    });

    const clearMutation = useMutation({
        mutationFn: () => AdminAPI.clearDocuments(activeFilter),
        onSuccess: () => {
            setItems([]);
            backendDataRef.current = "[]";
            localStorage.removeItem(`docs_upload_draft_${activeFilter}`);
            setHasDraft(false);
            setPopup({ title: "Cleared", text: "Section data reset.", type: "neutral" });
            queryClient.invalidateQueries({ queryKey: ['adminDocuments', activeFilter] });
        }
    });

    const uploadMutation = useMutation({
        mutationFn: ({ parentId, title, file }) => AdminAPI.uploadDocument(activeFilter, title, file),
        onSuccess: (data, { parentId, title }) => {
            const newItem = {
                id: crypto.randomUUID(),
                type: "document",
                title: title,
                file: data.file,
                originalFilename: data.originalFilename,
                children: [],
                isDraft: true
            };
            setItems(insertAt(items, parentId, newItem));
        },
        onError: () => setPopup({ title: "Upload Failed", text: "Could not upload document.", type: "failed" })
    });

    // =============================
    // ACTIONS
    // =============================
    const handleRestoreDraft = () => {
        const savedDraft = localStorage.getItem(`docs_upload_draft_${activeFilter}`);
        if (savedDraft) {
            setRestoringDraft(true);
            setItems(JSON.parse(savedDraft));
            setHasDraft(false);
            setTimeout(() => setRestoringDraft(false), 100);
            setPopup({ title: "Restored", text: "Your unsaved changes have been loaded.", type: "success" });
        }
    };

    const handleDiscardDraft = () => {
        localStorage.removeItem(`docs_upload_draft_${activeFilter}`);
        setHasDraft(false);
        refetchStructure();
    };

    const handleSaveSection = () => {
        const normalizedItems = normalizeTreeForSave(items);
        saveMutation.mutate(normalizedItems);
    };

    const handleClearSection = () => {
        clearMutation.mutate();
    };

    const addComponent = () => {
        const newComp = { id: crypto.randomUUID(), type: "header", title: "New Component", children: [], isDraft: true };
        setItems([...items, newComp]);
        return newComp.id;
    };

    const deleteItem = (id) => {
        const [newList] = findAndRemove(items, id);
        setItems(newList);
        // Automatically save after deletion
        const normalizedItems = normalizeTreeForSave(newList);
        saveMutation.mutate(normalizedItems);
    };

    const updateItemTitle = (id, newTitle) => {
        const updateInTree = (list) => list.map(item => {
            if (item.id === id) return { ...item, title: newTitle, isDraft: true };
            return { ...item, children: item.children ? updateInTree(item.children) : [] };
        });
        setItems(updateInTree(items));
    };

    const handleMove = (draggedId, targetId, position = 'inside') => {
        if (draggedId === targetId) return;
        
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
        
        const markedDraggedItem = { ...draggedItem, isDraft: true };
        setItems(insertAt(listWithoutDragged, targetId, markedDraggedItem, position));
    };

    const addItemToParent = (parentId, type) => {
        const newItem = { id: crypto.randomUUID(), type, title: `New ${type.replace('_', ' ')}`, children: [], isDraft: true };
        setItems(insertAt(items, parentId, newItem));
        return newItem.id;
    };

    const handleBulkAdd = (parentId, bulkText) => {
        const parsed = parseBulkAdd(bulkText);
        const addToTree = (list) => list.map(item => {
            if (item.id === parentId) return { ...item, children: [...(item.children || []), ...parsed] };
            return { ...item, children: item.children ? addToTree(item.children) : [] };
        });
        setItems(addToTree(items));
    };

    const handleDocUpload = (parentId, title, file) => {
        uploadMutation.mutate({ parentId, title, file });
    };

    return {
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
        saving: saveMutation.isPending || clearMutation.isPending || uploadMutation.isPending
    };
};
