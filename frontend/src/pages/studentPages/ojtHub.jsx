import { useEffect, useState } from 'react';
import MainScreen from '../../layouts/mainScreen';
import Title from '../../utilities/title';
import Subtitle from '../../utilities/subtitle';
import useQueryParam from '../../hooks/useQueryParams';
import FormDownloadable from '../../components/formDownloadable';
import api from '../../api/axios.jsx';
import Accordion from '../../components/accordion.jsx';

const SECTION_KEYS = {
    procedures: "Procedures",
    moa: "MOA Process",
    guidelines: "Key Guidelines",
    forms: "Internship Forms and Templates"
};

const TAB_KEY_MAP = {
    procedures: "procedures",
    moa: "moa",
    moaprocess: "moa",
    guidelines: "guidelines",
    keyguidelines: "guidelines",
    forms: "forms",
    formstemplates: "forms"
};

function normalizeTabKey(tab) {
    return TAB_KEY_MAP[tab] || "procedures";
}

export default function OjtHub() {
    const [activeFilterParam, setActiveFilter] = useQueryParam("tab", "procedures");
    const activeFilter = normalizeTabKey(activeFilterParam);

    const [sections, setSections] = useState({
        procedures: [],
        moa: [],
        guidelines: [],
        forms: []
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const normalized = normalizeTabKey(activeFilterParam);
        if (normalized !== activeFilterParam) {
            setActiveFilter(normalized);
        }
    }, [activeFilterParam, setActiveFilter]);

    useEffect(() => {
        loadAllSections();
    }, []);

    async function loadAllSections() {
        try {
            setLoading(true);
            const response = await api.get("/api/documents/student/all");

            setSections({
                procedures: response?.data?.procedures || [],
                moa: response?.data?.moa || [],
                guidelines: response?.data?.guidelines || [],
                forms: response?.data?.forms || []
            });
        } catch (error) {
            console.error("Failed to load OJT hub content:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <MainScreen>
            <div className="w-full flex flex-col items-center mb-10 px-4 text-center">
                <Title
                    text={"OJT Hub"}
                    size="text-2xl sm:text-3xl md:text-base lg:text-5xl"
                />
                <Subtitle
                    size="text-xs sm:text-sm md:text-base"
                    color="text-oasis-button-dark"
                    text="Access internship procedures, MOA process, key guidelines, and downloadable forms prepared by the admin."
                    isCenter
                    isItalic
                />
            </div>

            <div className="
                w-full
                px-4 sm:px-8 lg:px-16
                py-10
                flex
                flex-col lg:flex-row
                gap-10
                items-start
                transition duration-500 ease-in-out
            ">
                <div className="
                    w-full
                    lg:w-[260px]
                    bg-linear-to-top bg-oasis-gradient
                    p-4 sm:p-5
                    rounded-3xl
                    lg:sticky lg:top-10
                ">
                    <section className="w-full border-b-2 py-2">
                        <Subtitle text={"Contents"} size={"text-base"} weight={"font-bold"} />
                    </section>

                    <section className="
                        w-full
                        flex
                        flex-wrap
                        lg:flex-col
                        gap-5
                        mt-4
                        justify-center
                    ">
                        <SideNavText
                            text={"Procedures"}
                            onClick={() => setActiveFilter("procedures")}
                            isActive={activeFilter === "procedures"}
                        />

                        <SideNavText
                            text={"MOA Process"}
                            onClick={() => setActiveFilter("moa")}
                            isActive={activeFilter === "moa"}
                        />

                        <SideNavText
                            text={"Key Guidelines"}
                            onClick={() => setActiveFilter("guidelines")}
                            isActive={activeFilter === "guidelines"}
                        />

                        <SideNavText
                            text={"Internship Forms and Templates"}
                            onClick={() => setActiveFilter("forms")}
                            isActive={activeFilter === "forms"}
                        />
                    </section>
                </div>

                <div className="
                    w-full
                    lg:flex-1
                    flex
                    flex-col
                    gap-16
                ">
                    {loading ? (
                        <div className="w-full py-10">
                            <Subtitle text="Loading OJT Hub content..." />
                        </div>
                    ) : (
                        <DynamicSection
                            sectionKey={activeFilter}
                            title={SECTION_KEYS[activeFilter]}
                            items={sections[activeFilter] || []}
                        />
                    )}
                </div>
            </div>
        </MainScreen>
    );
}

export function SideNavText({ text, link, isActive = false, onClick }) {
    return (
        <div className='py-2 duration-300 transition ease-in-out'>
            <a
                href={`#${link || ""}`}
                className={`text-[0.9rem] font-oasis-text cursor-pointer hover:underline underline-offset-2 hover:text-oasis-button-dark
                ${isActive ? "underline underline-offset-2 text-oasis-button-dark" : ""}
                `}
                onClick={onClick}
            >
                {text}
            </a>
        </div>
    );
}

export function DynamicSection({ sectionKey, title, items = [] }) {
    const findFirstHeader = (list) => {
        for (const item of list) {
            if (item.type === "header") return item.title;

            if (item.children && item.children.length > 0) {
                const childHeader = findFirstHeader(item.children);
                if (childHeader) return childHeader;
            }
        }
        return null;
    };
    const headerTitle = findFirstHeader(items) || title || "Section Content";
    return (
        <section className='w-full flex flex-col items-start justify-center gap-5'>
            
            <Title text={title} isAnimated={false} id={sectionKey} />
            <div className='w-full border'></div>


                <Accordion headerText={headerTitle}>
                    {items.length === 0 ? (
                        <Subtitle
                            size={"text-[0.9rem]"}
                            text={"No content available yet for this section."}
                        />
                    ) : (
                        <StudentTreeRenderer items={items} level={0} />
                    )}
                </Accordion>
            
        </section>
    );
}

export function StudentTreeRenderer({ items = [], level = 0 }) {
    if (!items.length) return null;

    return (
        <div className={`w-full flex flex-col gap-6 ${level > 0 ? "ml-4 md:ml-8 border-l-2 border-gray-100 pl-4 md:pl-6 mt-4" : ""}`}>
            {items.map((item) => (
                <StudentItemRenderer
                    key={item.id}
                    item={item}
                    level={level}
                />
            ))}
        </div>
    );
}

export function StudentItemRenderer({ item, level }) {
    const hasChildren = item.children && item.children.length > 0;

    // Type styles based on nesting level
    const headerSizes = ["text-lg md:text-xl", "text-md md:text-lg", "text-sm md:text-base"];
    const currentHeaderSize = headerSizes[Math.min(level, headerSizes.length - 1)];

    if (item.type === "header") {
        return (
            <div className="w-full flex flex-col gap-2">
                <h2 className={`font-oasis-text font-bold text-oasis-button-dark ${currentHeaderSize} tracking-tight`}>
                    {item.title}
                </h2>

                {item.description && (
                    <p className="text-[0.9rem] text-gray-700 font-oasis-text leading-relaxed whitespace-pre-wrap">
                        {item.description}
                    </p>
                )}

                {hasChildren && (
                    <StudentTreeRenderer items={item.children} level={level + 1} />
                )}
            </div>
        );
    }

    if (item.type === "description") {
        return (
            <div className="w-full flex flex-col gap-2">
                <p className="text-[0.9rem] text-gray-700 font-oasis-text leading-relaxed whitespace-pre-wrap">
                    {item.description || item.title}
                </p>

                {hasChildren && (
                    <StudentTreeRenderer items={item.children} level={level + 1} />
                )}
            </div>
        );
    }

    if (item.type === "document") {
        return (
            <div className="w-full flex flex-col gap-3">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                    <FormDownloadable
                        text={item.title}
                        link={item.downloadUrl || item.file}
                    />
                    {item.description && (
                        <p className="text-[0.85rem] text-gray-500 font-oasis-text mt-2 italic whitespace-pre-wrap pl-1">
                            {item.description}
                        </p>
                    )}
                </div>

                {hasChildren && (
                    <StudentTreeRenderer items={item.children} level={level + 1} />
                )}
            </div>
        );
    }

    if (
        item.type === "numerical_list" ||
        item.type === "bulleted_list" ||
        item.type === "alphabetical_list"
    ) {
        return (
            <div className="w-full">
                <ListBlock item={item} level={level} />
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-2">
            <p className="text-[0.95rem] font-oasis-text text-gray-800 leading-relaxed whitespace-pre-wrap">
                {item.title}
            </p>

            {item.description && (
                <p className="text-[0.9rem] text-gray-600 font-oasis-text whitespace-pre-wrap">
                    {item.description}
                </p>
            )}

            {hasChildren && (
                <StudentTreeRenderer items={item.children} level={level + 1} />
            )}
        </div>
    );
}

export function ListBlock({ item, level }) {
    const hasChildren = item.children && item.children.length > 0;

    const listStyles = {
        numerical_list: "list-decimal",
        bulleted_list: "list-disc",
        alphabetical_list: "list-[lower-alpha]"
    };

    return (
        <div className="w-full">
            <ul className={`${listStyles[item.type] || "list-disc"} px-6 md:px-10 py-1 text-justify flex flex-col gap-3 text-[0.95rem] font-oasis-text text-gray-700`}>
                <li className="leading-relaxed">
                    <span className="whitespace-pre-wrap">{item.title}</span>

                    {item.description && (
                        <div className="text-[0.85rem] text-gray-500 italic mt-1 whitespace-pre-wrap">
                            {item.description}
                        </div>
                    )}

                    {hasChildren && (
                        <StudentTreeRenderer items={item.children} level={level + 1} />
                    )}
                </li>
            </ul>
        </div>
    );
}

// CONNECTED TO BACKEND
