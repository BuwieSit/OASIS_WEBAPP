import Subtitle from '../../../utilities/subtitle.jsx';
import Accordion from '../../../components/accordion.jsx';
import FormDownloadable from '../../../components/formDownloadable.jsx';
import api from "../../../api/axios";

const API_BASE = api.defaults.baseURL;

export default function StudentPreview({ items, isForms, onView }) {
    return (
        <div className="flex flex-col gap-8 animate__animated animate__fadeIn">
            <Subtitle text="Student Preview" weight="font-bold" size="text-xl" />
            <div className="flex flex-col gap-6">
                {items.length === 0 ? (
                    <div className="py-20 text-center text-gray-400 italic bg-white rounded-3xl border border-gray-100">Nothing to preview.</div>
                ) : (
                    items.map((component) => (
                        isForms ? (
                            <div key={component.id} className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 md:p-10 border border-gray-100 shadow-sm">
                                <h2 className="font-bold text-oasis-button-dark text-xl mb-8 border-b border-gray-100 pb-4">{component.title}</h2>
                                <StudentTreeRenderer items={component.children} onView={onView}/>
                            </div>
                        ) : (
                            <Accordion key={component.id} headerText={component.title}>
                                <div className="py-4">
                                    <StudentTreeRenderer items={component.children} onView={onView}/>
                                </div>
                            </Accordion>
                        )
                    ))
                )}
            </div>
        </div>
    );
}

function StudentTreeRenderer({ items, onView, level = 0 }) {
    const safeItems = items || [];
    const renderItems = [];
    let currentList = null;
    
    safeItems.forEach((item) => {
        const isList = ["numerical_list", "bulleted_list", "alphabetical_list"].includes(item.type);
        if (isList) {
            if (currentList && currentList.type === item.type) currentList.items.push(item);
            else { currentList = { type: item.type, items: [item] }; renderItems.push(currentList); }
        } else { currentList = null; renderItems.push(item); }
    });

    return (
        <div className={`w-full flex flex-col gap-6 ${level > 0 ? "ml-4 md:ml-8 border-l-2 border-gray-100 pl-4 md:pl-6 mt-4" : ""}`}>
            {renderItems.map((group, idx) => {
                if (group.items) {
                    const listClass = group.type === "numerical_list" ? "list-decimal" : group.type === "bulleted_list" ? "list-disc" : "list-[lower-alpha]";
                    return (
                        <ul key={idx} className={`${listClass} px-6 md:px-10 py-3 text-justify flex flex-col gap-3 text-[0.95rem] font-oasis-text text-gray-700 hover:bg-emerald-50/30 rounded-3xl transition-all duration-300 border border-transparent hover:border-emerald-100/50`}>
                            {group.items.map(li => (
                                <li key={li.id} className="leading-relaxed">
                                    <div className="flex flex-col gap-2">
                                        <span>{li.title}</span>
                                        {li.children && li.children.length > 0 && <StudentTreeRenderer items={li.children} onView={onView} level={level + 1} />}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    );
                }
                const item = group;
                if (item.type === "header") return (
                    <div key={item.id} className={`w-full flex flex-col gap-2 transition-all duration-300 rounded-3xl p-4 border border-transparent ${item.children?.length > 0 ? "hover:bg-indigo-50/30 hover:border-indigo-100/50" : "hover:bg-gray-50"}`}>
                        <h2 className={`font-bold text-oasis-button-dark ${level === 0 ? "text-xl" : "text-lg"} tracking-tight`}>{item.title}</h2>
                        {item.children && item.children.length > 0 && <StudentTreeRenderer items={item.children} onView={onView} level={level + 1} />}
                    </div>
                );
                if (item.type === "description") return (
                    <div key={item.id} className="w-full flex flex-col gap-2 p-2 hover:bg-gray-50 rounded-2xl transition-all duration-300">
                        <p className="text-[0.9rem] text-gray-700 leading-relaxed whitespace-pre-wrap">{item.title}</p>
                        {item.children && item.children.length > 0 && <StudentTreeRenderer items={item.children} onView={onView} level={level + 1} />}
                    </div>
                );
                if (item.type === "document") return (
                    <div key={item.id} className="hover:scale-[1.01] transition-transform duration-300">
                        <FormDownloadable text={item.title} link={item.file ? (item.file.startsWith('http') ? item.file : `${API_BASE}${item.file}`) : "#"} />
                    </div>
                );
                return null;
            })}
        </div>
    );
}
