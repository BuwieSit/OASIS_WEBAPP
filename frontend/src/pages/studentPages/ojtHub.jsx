import { useEffect, useState } from 'react';
import MainScreen from '../../layouts/mainScreen';
import Title from '../../utilities/title';
import Subtitle from '../../utilities/subtitle';
import useQueryParam from '../../hooks/useQueryParams';
import FormDownloadable from '../../components/formDownloadable';
import { getOjtHubDocuments } from '../../api/student.service';
import Accordion from '../../components/accordion.jsx';
import { useLoading } from '../../context/LoadingContext';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { 
    ClipboardList, 
    FileText, 
    ShieldCheck, 
    FolderOpen, 
    Info, 
    ChevronRight,
    BookOpen,
    HelpCircle
} from 'lucide-react';

const SECTION_KEYS = {
    procedures: "Procedures",
    moa: "MOA Process",
    guidelines: "Key Guidelines",
    forms: "Internship Forms and Templates"
};

const SECTION_ICONS = {
    procedures: <ClipboardList className="w-5 h-5" />,
    moa: <FileText className="w-5 h-5" />,
    guidelines: <ShieldCheck className="w-5 h-5" />,
    forms: <FolderOpen className="w-5 h-5" />
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

    // TanStack Query for OJT Hub Documents
    const { data: sectionsData, isLoading } = useQuery({
        queryKey: ['ojtHubDocuments'],
        queryFn: getOjtHubDocuments,
    });

    useEffect(() => {
        const normalized = normalizeTabKey(activeFilterParam);
        if (normalized !== activeFilterParam) {
            setActiveFilter(normalized);
        }
    }, [activeFilterParam, setActiveFilter]);

    // Global loading state sync
    useEffect(() => {
        setLoading(isLoading);
    }, [isLoading, setLoading]);

    const sections = {
        procedures: sectionsData?.procedures || [],
        moa: sectionsData?.moa || [],
        guidelines: sectionsData?.guidelines || [],
        forms: sectionsData?.forms || []
    };

    return (
        <MainScreen>
            {/* Header Section */}
            <div className="w-full flex flex-col items-center mb-6 sm:mb-12 px-4 text-center animate__animated animate__fadeIn">
                <div className="bg-oasis-blue/10 p-3 rounded-full mb-4">
                    <BookOpen className="w-8 h-8 text-oasis-header" />
                </div>
                <Title
                    text={"OJT Hub"}
                    size="text-3xl sm:text-4xl lg:text-5xl"
                />
                <Subtitle
                    size="text-sm sm:text-base lg:text-lg"
                    color="text-oasis-button-dark/80"
                    text="Your centralized repository for internship procedures, guidelines, and essential forms."
                    isCenter
                    isItalic
                    className="max-w-2xl mt-2"
                />
            </div>

            <div className="
                w-full
                px-4 sm:px-8 lg:px-16
                pb-20
                flex
                flex-col lg:flex-row
                gap-8 lg:gap-12
                items-start
            ">
                {/* Navigation Sidebar */}
                <div className="
                    w-full
                    lg:min-w-[300px] lg:max-w-[300px]
                    lg:shrink-0
                    bg-white/80 backdrop-blur-md
                    p-6
                    rounded-[2.5rem]
                    shadow-xl shadow-oasis-blue/5
                    border border-oasis-blue/10
                    lg:sticky lg:top-24
                    animate__animated animate__fadeInLeft
                ">
                    <div className="flex items-center gap-3 mb-8 px-2">
                        <div className="w-1.5 h-6 bg-oasis-header rounded-full"></div>
                        <h3 className="font-oasis-text font-bold text-lg text-oasis-header">Contents</h3>
                    </div>

                    <nav className="flex flex-col gap-2">
                        <SideNavItem
                            text={"Procedures"}
                            icon={SECTION_ICONS.procedures}
                            onClick={() => setActiveFilter("procedures")}
                            isActive={activeFilter === "procedures"}
                        />
                        <SideNavItem
                            text={"MOA Process"}
                            icon={SECTION_ICONS.moa}
                            onClick={() => setActiveFilter("moa")}
                            isActive={activeFilter === "moa"}
                        />
                        <SideNavItem
                            text={"Key Guidelines"}
                            icon={SECTION_ICONS.guidelines}
                            onClick={() => setActiveFilter("guidelines")}
                            isActive={activeFilter === "guidelines"}
                        />
                        <SideNavItem
                            text={"Forms & Templates"}
                            icon={SECTION_ICONS.forms}
                            onClick={() => setActiveFilter("forms")}
                            isActive={activeFilter === "forms"}
                        />
                    </nav>

                    {/* Quick Help Card */}
                    <div className="mt-10 p-5 bg-oasis-gradient rounded-3xl text-white shadow-lg shadow-oasis-header/20">
                        <div className="flex items-center gap-2 mb-2">
                            <HelpCircle className="w-4 h-4" />
                            <span className="text-xs text-oasis-header font-bold uppercase tracking-wider">Need Help?</span>
                        </div>
                        <p className="text-xs text-oasis-header opacity-90 leading-relaxed font-oasis-text">
                            If you have questions about these procedures, consult ORBI or contact the OJT Coordinator for assistance.
                        </p>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="
                    w-full
                    lg:flex-1
                    flex
                    flex-col
                    gap-8
                    animate__animated animate__fadeIn
                ">
                    <div className="bg-white/70 backdrop-blur-sm p-6 sm:p-10 rounded-[3rem] shadow-sm border border-white/50 min-h-[500px]">
                        <DynamicSection
                            sectionKey={activeFilter}
                            title={SECTION_KEYS[activeFilter]}
                            icon={SECTION_ICONS[activeFilter]}
                            items={sections[activeFilter] || []}
                        />
                    </div>
                </div>
            </div>
        </MainScreen>
    );
}

function SideNavItem({ text, icon, isActive = false, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`
                group flex items-center gap-4 px-5 py-4 rounded-2xl
                transition-all duration-300 ease-in-out text-left
                ${isActive 
                    ? "bg-oasis-header text-white shadow-lg shadow-oasis-header/20 scale-[1.02]" 
                    : "text-gray-600 hover:bg-oasis-blue/5 hover:text-oasis-header"}
            `}
        >
            <span className={`transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                {icon}
            </span>
            <span className="font-oasis-text font-semibold text-[0.95rem]">{text}</span>
            {isActive && <ChevronRight className="ml-auto w-4 h-4 opacity-70" />}
        </button>
    );
}

export function DynamicSection({ sectionKey, title, icon, items = [] }) {
    const isForms = sectionKey === "forms";
    const API_BASE = api.defaults.baseURL;

    return (
        <section className='w-full flex flex-col items-start gap-8'>
            <div className="w-full flex items-center justify-between border-b border-oasis-blue/10 pb-8">
                <div className="flex items-center gap-5">
                    <div className="p-4 bg-oasis-header/5 rounded-[1.5rem] text-oasis-header">
                        {icon}
                    </div>
                    <h2 className="font-oasis-text font-extrabold text-2xl sm:text-3xl text-oasis-header tracking-tight">
                        {title}
                    </h2>
                </div>
            </div>

            <div className={`w-full flex flex-col ${isForms ? "gap-12" : "gap-3"}`}>
                {items.length === 0 ? (
                    <div className="py-24 flex flex-col items-center justify-center text-center opacity-30">
                        <Info className="w-16 h-16 mb-4" />
                        <Subtitle
                            size={"text-lg"}
                            text={`No content available yet for ${title}.`}
                            color="text-gray-500"
                            isItalic
                        />
                    </div>
                ) : (
                    items.map((component) => (
                        isForms ? (
                            <div key={component.id} className="w-full animate__animated animate__fadeIn">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-1.5 h-6 bg-oasis-blue rounded-full"></div>
                                    <h3 className="font-bold text-oasis-button-dark text-xl font-oasis-text">
                                        {component.title}
                                    </h3>
                                </div>
                                <div className="bg-gray-50/50 rounded-[2rem] p-6 sm:p-10 border border-gray-100/50">
                                    <StudentTreeRenderer items={component.children} apiBase={API_BASE} isGrid={true} />
                                </div>
                            </div>
                        ) : (
                            <div key={component.id} className="w-full animate__animated animate__fadeInUp">
                                <Accordion headerText={component.title}>
                                    <div className="p-4">
                                        <StudentTreeRenderer items={component.children} apiBase={API_BASE} />
                                    </div>
                                </Accordion>
                            </div>
                        )
                    ))
                )}
            </div>
        </section>
    );
}

export function StudentTreeRenderer({ items = [], apiBase, level = 0, isGrid = false }) {
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

    const containerClasses = `
        w-full flex 
        ${isGrid ? "grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6" : "flex-col"}
        ${level > 0 && !isGrid 
            ? "mt-2 ml-1 md:ml-2 border-l-2 border-oasis-blue/10 pl-3 md:pl-4 space-y-4" 
            : "space-y-6"}
    `;

    return (
        <div className={containerClasses}>
            {renderItems.map((group, idx) => {
                if (group.items) {
                    const listClass = group.type === "numerical_list" ? "list-decimal" : group.type === "bulleted_list" ? "list-disc" : "list-[lower-alpha]";
                    return (
                        <ul key={idx} className={`${listClass} space-y-2 px-4 md:px-5 text-gray-700 font-oasis-text text-[0.95rem]`}>
                            {group.items.map(li => (
                                <li key={li.id} className="leading-relaxed marker:text-oasis-header marker:font-bold marker:text-base pl-1">
                                    <div className="flex flex-col gap-2">
                                        <span className="font-medium">{li.title}</span>
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
                        <div key={item.id} className={`w-full flex flex-col gap-2 ${isGrid ? "col-span-full" : ""}`}>
                            <h4 className={`
                                font-oasis-text font-bold text-oasis-header flex items-center gap-2
                                ${level === 0 ? "text-lg" : "text-base"}
                                ${level > 0 ? "mt-1" : ""}
                            `}>
                                {level === 0 && <div className="w-2 h-2 bg-oasis-header rounded-full shadow-[0_0_5px_rgba(45,95,93,0.3)]" />}
                                {item.title}
                            </h4>
                            {item.children?.length > 0 && (
                                <StudentTreeRenderer items={item.children} apiBase={apiBase} level={level + 1} isGrid={isGrid} />
                            )}
                        </div>
                    );
                }

                if (item.type === "description") {
                    return (
                        <div key={item.id} className={`w-full flex flex-col gap-2 ${isGrid ? "col-span-full" : ""}`}>
                            <div className="bg-oasis-blue/5 p-4 rounded-2xl border-l-4 border-oasis-blue/20">
                                <p className="text-[0.9rem] text-gray-700 font-oasis-text leading-relaxed whitespace-pre-wrap">
                                    {item.title}
                                </p>
                            </div>
                            {item.children?.length > 0 && (
                                <StudentTreeRenderer items={item.children} apiBase={apiBase} level={level + 1} isGrid={isGrid} />
                            )}
                        </div>
                    );
                }

                if (item.type === "document") {
                    return (
                        <div key={item.id} className="group transition-all duration-300 hover:-translate-y-1">
                            <FormDownloadable 
                                text={item.title} 
                                link={`${apiBase}${item.file}`} 
                            />
                        </div>
                    );
                }

                return null;
            })}
        </div>
    );
}

