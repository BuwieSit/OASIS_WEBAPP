import { DocsAddModal } from "../pages/adminPages/docsUpload";
import { TreeRenderer } from "./TreeRenderer";

export function DocsBuilder() {

    const [items, setItems] = useState([]);
    const [showModal, setShowModal] = useState(false);

    const addItem = (newItem) => {

        if (!newItem.parentId) {
            setItems(prev => [...prev, newItem]);
            return;
        }

        const insertTree = (nodes) =>
            nodes.map(node => {

                if (node.id === newItem.parentId) {
                    return {
                        ...node,
                        children: [...node.children, newItem]
                    };
                }

                return {
                    ...node,
                    children: insertTree(node.children || [])
                };
            });

        setItems(prev => insertTree(prev));
    };

    return (
        <div>

            <button onClick={() => setShowModal(true)}>
                Add Item
            </button>

            {showModal && (
                <DocsAddModal
                    parents={flattenHeaders(items)}
                    onCreate={addItem}
                    onClick={() => setShowModal(false)}
                />
            )}

            <TreeRenderer items={items}/>

        </div>
    );
}