import AdminScreen from '../../layouts/adminScreen.jsx';
import Title from "../../utilities/title.jsx";
import { Container, Dropdown } from '../../components/adminComps.jsx';
import { FileUploadField, MultiField, SingleField } from '../../components/fieldComp.jsx';
import { AnnounceButton } from '../../components/button.jsx';
import { useEffect, useMemo, useState } from "react";
import useQueryParam from '../../hooks/useQueryParams.jsx';
import { Plus, PlusCircle, Save, Trash } from 'lucide-react';
import Subtitle from '../../utilities/subtitle.jsx';
import { TreeRenderer } from '../../utilities/TreeRenderer.jsx';
import { AdminAPI } from '../../api/admin.api.js';
import { ConfirmModal, GeneralPopupModal } from '../../components/popupModal.jsx';


const EMPTY_SECTION_STATE = {
    header: "",
    description: "",
    items: []
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
            label: `${"— ".repeat(depth)}${item.title}`
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

function extractSectionMeta(items) {
    const headerItem = items.find(
        (item) => item.parentId === null && item.type === "header" && item.isSectionMeta
    );

    const descriptionItem = items.find(
        (item) => item.parentId === null && item.type === "description" && item.isSectionMeta
    );

    return {
        header: headerItem?.title || "",
        description: descriptionItem?.description || descriptionItem?.title || ""
    };
}

function buildItemsWithSectionMeta(sectionState) {
    const metaItems = [];

    if (sectionState.header.trim()) {
        metaItems.push({
            id: `section-header-${crypto.randomUUID()}`,
            type: "header",
            title: sectionState.header.trim(),
            description: null,
            parentId: null,
            children: [],
            isSectionMeta: true
        });
    }

    if (sectionState.description.trim()) {
        metaItems.push({
            id: `section-description-${crypto.randomUUID()}`,
            type: "description",
            title: sectionState.description.trim(),
            description: sectionState.description.trim(),
            parentId: null,
            children: [],
            isSectionMeta: true
        });
    }

    return [...metaItems, ...sectionState.items];
}

function stripMetaItems(items) {
    return items.filter((item) => !item.isSectionMeta);
}

export default function DocsUpload() {
    const [activeFilter, setFilter] = useQueryParam("tab", "procedures");
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [actionCompleted, setActionCompleted] = useState(false);

    const [sections, setSections] = useState({
        procedures: { ...EMPTY_SECTION_STATE },
        moa: { ...EMPTY_SECTION_STATE },
        guidelines: { ...EMPTY_SECTION_STATE },
        forms: { ...EMPTY_SECTION_STATE }
    });

    const activeSectionState = sections[activeFilter] || EMPTY_SECTION_STATE;

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

            const meta = extractSectionMeta(backendItems);

            setSections((prev) => ({
                ...prev,
                [section]: {
                    header: meta.header,
                    description: meta.description,
                    items: stripMetaItems(backendItems)
                }
            }));
        } catch (error) {
            console.error(`Failed to load ${section}:`, error);
        } finally {
            setLoading(false);
        }
    }

    function updateSectionField(section, key, value) {
        setSections((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value
            }
        }));
    }

    function handleCreateItem(payload) {
        const itemToInsert = {
            id: crypto.randomUUID(),
            type: payload.type,
            title: payload.title,
            description: payload.description || null,
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

    async function handleSaveSection() {
        try {
            setSaving(true);

            const payloadItems = buildItemsWithSectionMeta(activeSectionState);
            const normalizedItems = normalizeTreeForSave(payloadItems);

            await AdminAPI.saveDocuments(activeFilter, normalizedItems);
            await loadSection(activeFilter);
        } catch (error) {
            console.error("Failed to save section:", error);
        } finally {
            setSaving(false);
        }
    }

    async function handleClearSection() {
        try {
            setSaving(true);
            await AdminAPI.clearDocuments(activeFilter);

            setSections((prev) => ({
                ...prev,
                [activeFilter]: { ...EMPTY_SECTION_STATE }
            }));
        } catch (error) {
            console.error("Failed to clear section:", error);
        } finally {
            setSaving(false);
        }
    }


    return (
        <AdminScreen>
            {showModal && (
                <DocsAddModal
                    section={activeFilter}
                    parents={parentOptions}
                    parentOptionMap={parentOptionMap}
                    onClick={() => setShowModal(false)}
                    onCreate={handleCreateItem}
                />
            )}
            {showConfirmModal && 
                <ConfirmModal
                    confText='clear the tree and all fields?'
                    onConfirm={() => {
                        handleClearSection();
                        setShowConfirmModal(false);
                        setActionCompleted(true);
                        setTimeout(() => {setActionCompleted(false)}, 3000);
                    }}
                    onCancel={() => setShowConfirmModal(false)}
                />
            }
            {actionCompleted && 
                <GeneralPopupModal isSuccess time={3000} title={"Action Completed"} text={"Section Fields Cleared"}/>
            }
            
            <div className='w-[90%] flex flex-col gap-3 items-start justify-center border-b-2 py-5'>
                <Title text="Documents Upload" size='text-[2rem]'/>
                <Subtitle text={"Upload and Manage Guidelines, Procedures, MOA Process, and Forms & Templates"}/>
            </div>

            <Container column={true}>
                <section className="w-full flex flex-row justify-start items-center gap-5 mb-10">
                    <Subtitle
                        size='text-[0.9rem]'
                        isLink={true}
                        text="Procedures"
                        isActive={activeFilter === "procedures"}
                        onClick={() => setFilter("procedures")}
                        className={"rounded-2xl"}
                    />

                    <Subtitle
                        size='text-[0.9rem]'
                        isLink={true}
                        text="MOA Process"
                        isActive={activeFilter === "moa"}
                        onClick={() => setFilter("moa")}
                        className={"rounded-2xl"}
                    />

                    <Subtitle
                        size='text-[0.9rem]'
                        isLink={true}
                        text="Key Guidelines"
                        isActive={activeFilter === "guidelines"}
                        onClick={() => setFilter("guidelines")}
                        className={"rounded-2xl"}
                    />

                    <Subtitle
                        size='text-[0.9rem]'
                        isLink={true}
                        text="Forms & Templates"
                        isActive={activeFilter === "forms"}
                        onClick={() => setFilter("forms")}
                        className={"rounded-2xl"}
                    />
                </section>

                <div className='w-full flex flex-row p-3 gap-3 justify-evenly items-start'>
                    <section className='w-[40%] p-5 sticky top-0 flex flex-col gap-4 justify-start items-stretch transition duration-200 ease-in-out'>
                        <div onClick={() => setShowModal(true)}>
                            <AnnounceButton
                                textSize='text-[1rem]'
                                btnText='Add Items'
                                icon={<Plus size={25} />}
                            />
                        </div>

                        <div className="w-full mt-4">
                            <Subtitle
                                text={`${SECTION_LABELS[activeFilter]} Preview`}
                                size="text-[1rem]"
                            />
                            <div className="mt-3">
                                <TreeRenderer
                                    items={[
                                        ...buildItemsWithSectionMeta(activeSectionState)
                                    ]}
                                />
                            </div>
                        </div>
                    </section>

                    <div className="w-full">
                        <SectionForm
                            section={activeFilter}
                            label={SECTION_LABELS[activeFilter]}
                            state={activeSectionState}
                            loading={loading}
                            saving={saving}
                            onHeaderChange={(value) => updateSectionField(activeFilter, "header", value)}
                            onDescriptionChange={(value) => updateSectionField(activeFilter, "description", value)}
                            onSave={() => {
                                handleSaveSection();

                            }}
                            onClear={() => {
                                setShowConfirmModal(true)
                            }}
                        />
                    </div>
                </div>
            </Container>
        </AdminScreen>
    );
}

export function DocsAddModal({
    section,
    onClick,
    onCreate,
    parents = [],
    parentOptionMap = {}
}) {
    const [itemType, setItemType] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [parent, setParent] = useState("");
    const [isChecked, setIsChecked] = useState(false);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const LIST_TYPES = [
        "numerical_list",
        "bulleted_list",
        "alphabetical_list"
    ];

    const itemTypeLabels = ITEM_TYPE_OPTIONS
        .filter((option) => section === "forms" ? true : option.value !== "document")
        .map((option) => option.label);

    const labelToValueMap = ITEM_TYPE_OPTIONS.reduce((acc, option) => {
        acc[option.label] = option.value;
        return acc;
    }, {});

    const selectedTypeValue = labelToValueMap[itemType] || "";
    const isListType = LIST_TYPES.includes(selectedTypeValue);
    const [listItems, setListItems] = useState([""]);

    const handleCheckbox = (e) => {
        const checked = e.target.checked;
        setIsChecked(checked);

        if (!checked) {
            setParent("");
        }
    };

    const isCreateEnabled =
        selectedTypeValue !== "" &&
        (!isListType && title.trim() !== "" || isListType) &&
        (!isChecked || parent !== "") &&
        (selectedTypeValue !== "document" || file !== null) &&
        (!isListType || listItems.some(i => i.trim() !== ""));

    const handleCreate = async (e) => {
        e.preventDefault();

        if (!isCreateEnabled) return;

        try {
            let uploadedFile = null;

            if (selectedTypeValue === "document") {
                setUploading(true);
                const response = await AdminAPI.uploadDocument(section, title.trim(), file);
                uploadedFile = response?.data || null;
            }

            // onCreate({
            //     type: selectedTypeValue,
            //     title: title.trim(),
            //     description: description.trim() || null,
            //     parentId: isChecked ? parentOptionMap[parent] || null : null,
            //     file: uploadedFile?.file || null,
            //     originalFilename: uploadedFile?.originalFilename || null
            // });

            onCreate({
                type: selectedTypeValue,
                title: title.trim() || null,
                description: description.trim() || null,
                listItems: isListType ? listItems.filter(i => i.trim() !== "") : null,
                parentId: isChecked ? parentOptionMap[parent] || null : null,
                file: uploadedFile?.file || null,
                originalFilename: uploadedFile?.originalFilename || null
            });

            setItemType("");
            setTitle("");
            setDescription("");
            setParent("");
            setIsChecked(false);
            setFile(null);
        } catch (error) {
            console.error("Failed to create item:", error);
        } finally {
            setUploading(false);
        }
    };


    const addListItem = () => {
        setListItems(prev => [...prev, ""]);
    };

    const updateListItem = (index, value) => {
        setListItems(prev =>
            prev.map((item, i) => (i === index ? value : item))
        );
    };

    const removeListItem = (index) => {
        setListItems(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="w-full h-screen fixed top-0 left-0 flex items-center justify-center bg-black/50 z-110 pointer-events-none">
            <div className="min-w-[30%] p-10 backdrop-blur-2xl bg-oasis-gradient border border-gray-500 rounded-3xl drop-shadow-lg flex flex-col gap-5 pointer-events-auto">
                <form className="w-full flex flex-col gap-5" onSubmit={handleCreate}>
                    <Subtitle size="text-[1.5rem]" text="Add new item"/>
                  
                    <Dropdown
                        placeholder="Select Item type"
                        categories={itemTypeLabels}
                        value={itemType}
                        onChange={setItemType}
                    />
                    {selectedTypeValue === "header" && (
                        <>
                            <SingleField
                                fieldHolder="Enter a title..."
                                fieldId="itemTitle"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />

                        </>
                    )}

                    {selectedTypeValue === "description" && (
                        <MultiField
                            labelText="Description"
                            fieldHolder="Enter description..."
                            fieldId="itemDescription"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    )}

                    {isListType && (
                        <div className="flex flex-col gap-3 max-h-50 overflow-y-auto">
                            {listItems.map((item, index) => (
                                <div key={index} className="flex gap-2">
                                    <SingleField
                                        fieldHolder={`List item ${index + 1}`}
                                        value={item}
                                        onChange={(e) =>
                                            updateListItem(index, e.target.value)
                                        }
                                    />

                                {listItems.length > 1 && (
                                    <button type="button" onClick={() => removeListItem(index)}>
                                        <Trash className='cursor-pointer'/>
                                    </button>
                                )}

                                </div>
                            ))}

                            <button type="button" onClick={addListItem}>
                                <PlusCircle className='cursor-pointer'/>
                            </button>

                        </div>
                    )}

                    {selectedTypeValue === "document" && (
                        <>
                            <SingleField
                                fieldHolder="Enter a title..."
                                fieldId="itemTitle"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />

                            <FileUploadField
                                labelText="Upload Document *"
                                fieldId="documentFile"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                            />
                        </>
                    )}

                    <label className="flex gap-3 items-center cursor-pointer">
                        <Subtitle size="text-[1rem]" text="Nest under a parent?"/>
                        <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={handleCheckbox}
                            className="w-5 h-5 cursor-pointer"
                        />
                    </label>

                    <Dropdown
                        placeholder="Select parent"
                        disabled={!isChecked}
                        categories={parents}
                        value={parent}
                        onChange={setParent}
                    />

                    <div className="flex justify-end gap-3 w-full">
                        <AnnounceButton btnText="Cancel" onClick={onClick} type="button" />
                        <AnnounceButton
                            btnText={uploading ? "Creating..." : "Create"}
                            disabled={!isCreateEnabled || uploading}
                            type="submit"
                        />
                    </div>
                </form>
            </div>
        </div>
    );
}

export function FormLayout({
    children,
    onSave,
    onClear,
    saving = false
}) {
    return (
        <form
            className='w-full flex flex-col items-start justify-evenly gap-5'
            onSubmit={(e) => {
                e.preventDefault();
                onSave?.();
            }}
        >
            {children}
            <div className='flex flex-row gap-5'>
                <AnnounceButton
                    icon={<Save/>}
                    btnText={saving ? 'Saving...' : 'Save'}
                    type="submit"
                    disabled={saving}
                />
                <AnnounceButton
                    btnText='Clear all'
                    type="button"
                    onClick={onClear}
                    disabled={saving}
                />
            </div>
        </form>
    );
}

export function SectionForm({
    section,
    label,
    state,
    loading,
    saving,
    onHeaderChange,
    onDescriptionChange,
    onSave,
    onClear
}) {
    return (
        <FormLayout onSave={onSave} onClear={onClear} saving={saving}>
            <section className='w-full flex flex-col items-start justify-start'>
                <SingleField
                    labelText={`${label} Header *`}
                    fieldHolder={`Enter ${label} header...`}
                    fieldId={`${section}-uploadHead`}
                    value={state.header}
                    onChange={(e) => onHeaderChange(e.target.value)}
                    disabled={loading}
                />

                <MultiField
                    labelText={"Description"}
                    fieldHolder={`Enter ${label} description...`}
                    fieldId={`${section}-uploadDesc`}
                    value={state.description}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    disabled={loading}
                />
            </section>
        </FormLayout>
    );
}

