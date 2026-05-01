import { useEffect, useState } from 'react';
import MainScreen from '../../layouts/mainScreen';
import Title from '../../utilities/title';
import Subtitle from '../../utilities/subtitle';
import useQueryParam from '../../hooks/useQueryParams';
import FormDownloadable from '../../components/formDownloadable';
import api from '../../api/axios.jsx';
import Accordion from '../../components/accordion.jsx';
import { useLoading } from '../../context/LoadingContext';

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
    const { setLoading } = useLoading();
    const [activeFilterParam, setActiveFilter] = useQueryParam("tab", "procedures");
    const activeFilter = normalizeTabKey(activeFilterParam);

    const [sections, setSections] = useState({
        procedures: [],
        moa: [],
        guidelines: [],
        forms: []
    });

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
                    <DynamicSection
                        sectionKey={activeFilter}
                        title={SECTION_KEYS[activeFilter]}
                        items={sections[activeFilter] || []}
                    />
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
    const isForms = sectionKey === "forms";
    const API_BASE = api.defaults.baseURL;

    return (
        <section className='w-full flex flex-col items-start justify-center gap-6'>
            <div className="w-full flex flex-col gap-1.5">
                <Title text={title} isAnimated={false} id={sectionKey} />
                <div className='w-full border-b border-gray-100'></div>
            </div>

            <div className="w-full flex flex-col gap-4">
                {items.length === 0 ? (
                    <div className="p-5 text-center bg-white/30 backdrop-blur-sm rounded-3xl border border-dashed border-gray-200">
                        <Subtitle
                            size={"text-[0.9rem]"}
                            text={`No content available yet for ${title}.`}
                            color="text-gray-400"
                            isItalic
                        />
                    </div>
                ) : (
                    items.map((component) => (
                        isForms ? (
                            <div key={component.id} className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm animate__animated animate__fadeIn">
                                <h2 className="font-bold text-oasis-button-dark text-lg mb-6 border-b border-gray-100 pb-3">
                                    {component.title}
                                </h2>
                                <StudentTreeRenderer items={component.children} apiBase={API_BASE} />
                            </div>
                        ) : (
                            <Accordion key={component.id} headerText={component.title}>
                                <div className="py-2">
                                    <StudentTreeRenderer items={component.children} apiBase={API_BASE} />
                                </div>
                            </Accordion>
                        )
                    ))
                )}
            </div>
        </section>
    );
}

export function StudentTreeRenderer({ items = [], apiBase, level = 0 }) {
    const renderItems = [];
    let currentList = null;

    items.forEach((item) => {
        const isList = ["numerical_list", "bulleted_list", "alphabetical_list"].includes(item.type);
        if (isList) {
            if (currentList && currentList.type === item.type) {
                currentList.items.push(item);
            } else {
                currentList = { type: item.type, items: [item] };
                renderItems.push(currentList);
            }
        } else {
            currentList = null;
            renderItems.push(item);
        }
    });

    return (
        <div className={`w-full flex flex-col ${level > 0 ? "gap-2.5 ml-3 md:ml-5 border-l-2 border-gray-100 pl-3 md:pl-4 mt-1" : "gap-4"}`}>
            {renderItems.map((group, idx) => {
                if (group.items) {
                    const listClass = group.type === "numerical_list" ? "list-decimal" : group.type === "bulleted_list" ? "list-disc" : "list-[lower-alpha]";
                    return (
                        <ul key={idx} className={`${listClass} px-6 md:px-8 py-0.5 text-justify flex flex-col gap-1 text-[0.95rem] font-oasis-text text-gray-700`}>
                            {group.items.map(li => (
                                <li key={li.id} className="leading-relaxed">
                                    <div className="flex flex-col gap-0.5">
                                        <span>{li.title}</span>
                                        {li.children?.length > 0 && (
                                            <StudentTreeRenderer items={li.children} apiBase={apiBase} level={level + 1} />
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    );
                }

                const item = group;
                if (item.type === "header") {
                    return (
                        <div key={item.id} className="w-full flex flex-col gap-1">
                            <h2 className={`font-oasis-text font-bold text-oasis-button-dark ${level === 0 ? "text-lg" : "text-base"} tracking-tight`}>
                                {item.title}
                            </h2>
                            {item.children?.length > 0 && (
                                <StudentTreeRenderer items={item.children} apiBase={apiBase} level={level + 1} />
                            )}
                        </div>
                    );
                }

                if (item.type === "description") {
                    return (
                        <div key={item.id} className="w-full flex flex-col gap-1">
                            <p className="text-[0.9rem] text-gray-700 font-oasis-text leading-relaxed whitespace-pre-wrap">
                                {item.title}
                            </p>
                            {item.children?.length > 0 && (
                                <StudentTreeRenderer items={item.children} apiBase={apiBase} level={level + 1} />
                            )}
                        </div>
                    );
                }

                if (item.type === "document") {
                    return (
                        <FormDownloadable 
                            key={item.id} 
                            text={item.title} 
                            link={`${apiBase}${item.file}`} 
                        />
                    );
                }

                return null;
            })}
        </div>
    );
}

// CONNECTED TO BACKEND
