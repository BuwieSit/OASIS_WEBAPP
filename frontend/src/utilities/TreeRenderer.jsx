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

export function TreeRenderer({ items = [] }) {
    if (!items || items.length === 0) return null;

    return (
        <div className="ml-4 border-l border-oasis-header pl-4 flex flex-col gap-4">
            {items.map((item) => (
                <div key={item.id} className="flex flex-col gap-1">
                    {!LIST_TYPES.includes(item.type) && item.title && (
                        <div className="font-semibold text-black text-[0.95rem]">
                            {item.title}
                        </div>
                    )}

                    <div className="text-xs text-gray-400">
                        {TYPE_LABELS[item.type] || item.type}
                    </div>

                    {item.description && (
                        <div className="text-sm text-gray-200 whitespace-pre-wrap">
                            {item.description}
                        </div>
                    )}

                    {LIST_TYPES.includes(item.type) && item.listItems && (
                        <>
                            {item.type === "bulleted_list" && (
                                <ul className="list-disc ml-6 text-gray-200 text-sm">
                                    {item.listItems.map((listItem, index) => (
                                        <li key={index}>{listItem}</li>
                                    ))}
                                </ul>
                            )}

                            {item.type === "numerical_list" && (
                                <ol className="list-decimal ml-6 text-gray-200 text-sm">
                                    {item.listItems.map((listItem, index) => (
                                        <li key={index}>{listItem}</li>
                                    ))}
                                </ol>
                            )}

                            {item.type === "alphabetical_list" && (
                                <ol type="A" className="ml-6 text-gray-200 text-sm">
                                    {item.listItems.map((listItem, index) => (
                                        <li key={index}>{listItem}</li>
                                    ))}
                                </ol>
                            )}
                        </>
                    )}

                    {item.type === "document" && item.file && (
                        <a
                            href={item.file}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-blue-300 underline break-all"
                        >
                            {item.originalFilename || "View uploaded document"}
                        </a>
                    )}

                    {item.children && item.children.length > 0 && (
                        <TreeRenderer items={item.children} />
                    )}
                </div>
            ))}
        </div>
    );
}