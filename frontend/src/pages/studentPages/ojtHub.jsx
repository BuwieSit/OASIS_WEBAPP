import { useEffect, useState } from 'react';
import MainScreen from '../../layouts/mainScreen';
import Title from '../../utilities/title';
import Subtitle from '../../utilities/subtitle';
import useQueryParam from '../../hooks/useQueryParams';
import FormDownloadable from '../../components/formDownloadable';
import { getOjtHubDocuments } from '../../api/student.service';
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
    HelpCircle,
    ArrowRight,
    Sparkles,
    Download,
    Layers,
    Pin,
    Flag,
    CheckCircle2,
    ArrowDown,
    Box
} from 'lucide-react';

const SECTION_ICONS = {
    procedures: <ClipboardList className="w-6 h-6" />,
    moa: <FileText className="w-6 h-6" />,
    guidelines: <ShieldCheck className="w-6 h-6" />,
    forms: <FolderOpen className="w-6 h-6" />
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
            {/* IMMERSIVE BACKGROUND */}
            <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-oasis-blue/10 via-white to-transparent opacity-60"></div>
            
            <div className="w-full min-h-screen pb-20 px-4 sm:px-8 lg:px-12 flex flex-col gap-10 max-w-[1600px] mx-auto">
                
                {/* ORIGINAL HEADER */}
                <div className="w-full flex flex-col items-center mt-10 px-4 text-center animate__animated animate__fadeIn">
                    <Title
                        text={"OJT Hub"}
                        size="text-3xl sm:text-4xl lg:text-5xl"
                    />
                    <Subtitle
                        size="text-sm sm:text-base"
                        color="text-oasis-button-dark"
                        text="Your centralized repository for internship procedures, guidelines, and essential forms."
                        isCenter
                        isItalic
                    />
                </div>

                <main className="flex flex-col lg:flex-row gap-10 items-start">
                    
                    {/* ROADMAP NAVIGATION SIDEBAR */}
                    <aside className="w-full lg:w-[320px] lg:shrink-0 flex flex-col gap-6 lg:sticky lg:top-24 animate__animated animate__fadeInLeft">
                        <div className="bg-white/90 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/60 shadow-2xl shadow-oasis-blue/5">
                            <div className="flex items-center gap-3 mb-8 px-2">
                                <Layers className="text-oasis-header" size={18} />
                                <h3 className="font-oasis-text font-black text-[0.65rem] uppercase tracking-[0.3em] text-oasis-header/50">Navigation</h3>
                            </div>

                            <nav className="flex flex-col gap-3">
                                <RoadmapItem
                                    text={"Procedures"}
                                    subText={"Step-by-step Guide"}
                                    icon={<ClipboardList size={22} />}
                                    onClick={() => setActiveFilter("procedures")}
                                    isActive={activeFilter === "procedures"}
                                    phase="01"
                                />
                                <RoadmapItem
                                    text={"MOA Process"}
                                    subText={"Agreement Workflow"}
                                    icon={<FileText size={22} />}
                                    onClick={() => setActiveFilter("moa")}
                                    isActive={activeFilter === "moa"}
                                    phase="02"
                                />
                                <RoadmapItem
                                    text={"Key Guidelines"}
                                    subText={"Rules & Policies"}
                                    icon={<ShieldCheck size={22} />}
                                    onClick={() => setActiveFilter("guidelines")}
                                    isActive={activeFilter === "guidelines"}
                                    phase="03"
                                />
                                <RoadmapItem
                                    text={"Resources"}
                                    subText={"Forms & Vault"}
                                    icon={<FolderOpen size={22} />}
                                    onClick={() => setActiveFilter("forms")}
                                    isActive={activeFilter === "forms"}
                                    phase="04"
                                />
                            </nav>
                        </div>

                        <div className="bg-oasis-header p-8 rounded-[2.5rem] text-white shadow-2xl shadow-oasis-header/20 relative overflow-hidden group">
                            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
                            <Sparkles className="text-oasis-blue mb-4 animate-pulse" size={24} />
                            <h4 className="font-bold text-lg mb-2 font-oasis-text leading-tight">Expert Guidance.</h4>
                            <p className="text-xs opacity-70 font-oasis-text leading-relaxed mb-6">
                                Not sure about a process? Ask ORBI, your AI companion.
                            </p>
                            <button className="w-full py-3 bg-white text-oasis-header text-[0.65rem] font-black uppercase tracking-widest rounded-xl shadow-lg hover:scale-[1.02] transition-transform active:scale-95">
                                Start Consultation
                            </button>
                        </div>
                    </aside>

                    {/* CONTEXTUAL CONTENT AREA */}
                    <section className="flex-1 w-full min-h-[800px] animate__animated animate__fadeIn">
                        <DynamicContentSwitcher
                            sectionKey={activeFilter}
                            items={sections[activeFilter] || []}
                            icon={SECTION_ICONS[activeFilter]}
                        />
                    </section>
                </main>
            </div>
        </MainScreen>
    );
}

function RoadmapItem({ text, subText, icon, phase, isActive = false, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`
                group relative flex items-center gap-4 p-4 rounded-3xl
                transition-all duration-500 ease-out text-left
                ${isActive 
                    ? "bg-white shadow-2xl shadow-oasis-blue/10 scale-[1.05] z-10" 
                    : "hover:bg-white/50"}
            `}
        >
            <div className={`
                w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500
                ${isActive 
                    ? "bg-oasis-header text-white shadow-lg shadow-oasis-header/20" 
                    : "bg-oasis-blue/10 text-oasis-header group-hover:bg-oasis-header/5"}
            `}>
                {icon}
            </div>
            
            <div className="flex-1">
                <p className={`font-black text-[0.9rem] font-oasis-text leading-tight ${isActive ? "text-oasis-header" : "text-gray-600"}`}>
                    {text}
                </p>
                <p className={`text-[0.65rem] font-medium font-oasis-text opacity-50`}>
                    {subText}
                </p>
            </div>

            <div className={`
                text-[0.7rem] font-black opacity-10 transition-all duration-500
                ${isActive ? "opacity-30 scale-125 text-oasis-header" : "group-hover:opacity-20"}
            `}>
                {phase}
            </div>

            {isActive && (
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-8 bg-oasis-header rounded-full shadow-lg"></div>
            )}
        </button>
    );
}

function DynamicContentSwitcher({ sectionKey, items, icon }) {
    const API_BASE = api.defaults.baseURL;

    if (items.length === 0) {
        return (
            <div className="bg-white/40 backdrop-blur-xl rounded-[3rem] p-20 flex flex-col items-center justify-center text-center border border-white/60">
                <div className="w-20 h-20 bg-oasis-blue/5 text-oasis-header rounded-full flex items-center justify-center mb-6">
                    <Info size={40} className="opacity-40" />
                </div>
                <h3 className="text-xl font-black text-oasis-header mb-2 font-oasis-text uppercase tracking-widest">Workspace Empty</h3>
                <p className="text-sm text-gray-400 font-oasis-text italic">The admin has not populated this section yet.</p>
            </div>
        );
    }

    switch (sectionKey) {
        case "procedures":
            return <ProceduresRoadmap items={items} apiBase={API_BASE} />;
        case "moa":
            return <MoaProcessFlow items={items} apiBase={API_BASE} />;
        case "guidelines":
            return <GuidelinesBulletin items={items} apiBase={API_BASE} />;
        case "forms":
            return <ResourcesVault items={items} apiBase={API_BASE} />;
        default:
            return null;
    }
}

/* ==========================================================================
   STYLE 1: PROCEDURES ROADMAP (Vertical Journey)
   ========================================================================== */
function ProceduresRoadmap({ items, apiBase }) {
    return (
        <div className="w-full flex flex-col gap-4">
            <div className="flex items-center gap-4 mb-8 px-6">
                <div className="w-12 h-12 bg-oasis-header text-white rounded-2xl flex items-center justify-center shadow-lg">
                    <Flag size={24} />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-oasis-header tracking-tight font-oasis-text uppercase">OJT Roadmap</h2>
                    <p className="text-sm text-gray-400 font-medium font-oasis-text">Follow this vertical path to complete your requirements.</p>
                </div>
            </div>

            <div className="relative pl-8 sm:pl-16 space-y-12 pb-10">
                {/* THE ROAD LINE */}
                <div className="absolute left-[31px] sm:left-[63px] top-4 bottom-4 w-1 bg-linear-to-b from-oasis-header via-oasis-blue/30 to-transparent rounded-full shadow-inner"></div>

                {items.map((item, idx) => (
                    <div key={item.id} className="relative group animate__animated animate__fadeInUp" style={{ animationDelay: `${idx * 0.1}s` }}>
                        {/* THE NODE */}
                        <div className={`
                            absolute left-[-45px] sm:left-[-61px] top-0 w-12 h-12 sm:w-16 sm:h-16 rounded-[1.5rem] 
                            flex items-center justify-center z-10 transition-all duration-500
                            bg-white border-4 border-oasis-header shadow-xl group-hover:scale-110
                        `}>
                            <span className="text-xl sm:text-2xl font-black text-oasis-header font-oasis-text">
                                {idx + 1}
                            </span>
                        </div>

                        <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-6 sm:p-10 border border-white/60 shadow-xl shadow-oasis-blue/5 hover:shadow-2xl transition-all duration-500">
                            <h3 className="text-2xl sm:text-3xl font-black text-oasis-header font-oasis-text mb-6 tracking-tighter">
                                {item.title}
                            </h3>
                            <div className="h-1 w-16 bg-oasis-header/10 rounded-full mb-8"></div>
                            <StudentTreeRenderer items={item.children} apiBase={apiBase} />
                        </div>
                    </div>
                ))}
                
                {/* FINISH INDICATOR */}
                <div className="relative flex items-center gap-6 pt-10">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-oasis-header text-white flex items-center justify-center shadow-2xl shadow-oasis-header/30">
                        <CheckCircle2 size={32} />
                    </div>
                    <span className="text-xl font-black text-oasis-header font-oasis-text opacity-40 uppercase tracking-widest">End of Procedures</span>
                </div>
            </div>
        </div>
    );
}

/* ==========================================================================
   STYLE 2: MOA PROCESS FLOW (Linear Steps)
   ========================================================================== */
function MoaProcessFlow({ items, apiBase }) {
    const [activeStep, setActiveStep] = useState(0);

    return (
        <div className="w-full flex flex-col gap-10">
            {/* PROGRESS TRACKER */}
            <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[3rem] border border-white/60 shadow-xl overflow-x-auto">
                <div className="flex items-center gap-4 min-w-[600px] justify-between px-4">
                    {items.map((item, idx) => (
                        <div key={item.id} className="flex items-center gap-4 flex-1">
                            <button 
                                onClick={() => setActiveStep(idx)}
                                className={`
                                    w-14 h-14 rounded-2xl flex items-center justify-center font-black transition-all duration-500
                                    ${idx === activeStep 
                                        ? "bg-oasis-header text-white shadow-xl scale-110" 
                                        : idx < activeStep 
                                            ? "bg-oasis-header/10 text-oasis-header" 
                                            : "bg-gray-100 text-gray-400"}
                                `}
                            >
                                {idx < activeStep ? <CheckCircle2 size={24} /> : idx + 1}
                            </button>
                            {idx < items.length - 1 && (
                                <div className={`h-1 flex-1 rounded-full transition-all duration-1000 ${idx < activeStep ? "bg-oasis-header" : "bg-gray-100"}`}></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* ACTIVE STEP CONTENT */}
            <div key={activeStep} className="animate__animated animate__fadeInRight animate__faster">
                <div className="bg-white/80 backdrop-blur-md rounded-[3.5rem] p-8 sm:p-12 border border-white/60 shadow-2xl relative overflow-hidden">
                    {/* ACCENT CIRCLE */}
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-oasis-header/5 rounded-full blur-3xl"></div>
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10 relative z-10">
                        <div>
                            <span className="text-xs font-black text-oasis-blue uppercase tracking-[0.4em] mb-2 block">Step {activeStep + 1}</span>
                            <h3 className="text-3xl sm:text-4xl font-black text-oasis-header font-oasis-text tracking-tighter">{items[activeStep].title}</h3>
                        </div>
                        <div className="flex items-center gap-4">
                            <button 
                                disabled={activeStep === 0}
                                onClick={() => setActiveStep(prev => prev - 1)}
                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${activeStep === 0 ? "opacity-20" : "bg-oasis-header/5 text-oasis-header hover:bg-oasis-header hover:text-white"}`}
                            >
                                <ChevronRight className="rotate-180" size={20} />
                            </button>
                            <button 
                                disabled={activeStep === items.length - 1}
                                onClick={() => setActiveStep(prev => prev + 1)}
                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${activeStep === items.length - 1 ? "opacity-20" : "bg-oasis-header/5 text-oasis-header hover:bg-oasis-header hover:text-white"}`}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="bg-white/50 p-6 sm:p-10 rounded-[2.5rem] border border-oasis-blue/5 shadow-inner relative z-10">
                        <StudentTreeRenderer items={items[activeStep].children} apiBase={apiBase} />
                    </div>

                    {/* NAVIGATION TRIGGER */}
                    {activeStep < items.length - 1 && (
                        <button 
                            onClick={() => setActiveStep(prev => prev + 1)}
                            className="mt-12 group flex items-center gap-4 py-5 px-10 bg-oasis-header text-white rounded-[2rem] shadow-2xl hover:scale-[1.05] transition-all duration-500 font-black uppercase tracking-widest text-sm"
                        >
                            Next Process <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ==========================================================================
   STYLE 3: KEY GUIDELINES (Interactive Bulletin Board)
   ========================================================================== */
function GuidelinesBulletin({ items, apiBase }) {
    const [expandedIndex, setExpandedIndex] = useState(null);

    const stickyColors = [
        "bg-[#fff9c4] border-[#fbc02d]/20 text-[#827717]", // Yellow
        "bg-[#e1f5fe] border-[#03a9f4]/20 text-[#01579b]", // Blue
        "bg-[#f3e5f5] border-[#9c27b0]/20 text-[#4a148c]", // Purple
        "bg-[#e8f5e9] border-[#4caf50]/20 text-[#1b5e20]", // Green
        "bg-[#fff3e0] border-[#ff9800]/20 text-[#e65100]", // Orange
    ];

    return (
        <div className="w-full flex flex-col gap-10 pb-20">
            <div className="flex items-center gap-4 px-6">
                <div className="w-12 h-12 bg-white text-oasis-header rounded-2xl flex items-center justify-center shadow-xl border border-oasis-blue/10 rotate-3">
                    <Pin size={24} />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-oasis-header tracking-tight font-oasis-text uppercase">Guidelines Board</h2>
                    <p className="text-sm text-gray-400 font-medium font-oasis-text italic">Click a note to expand its details.</p>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 px-2">
                {items.map((item, idx) => {
                    const isExpanded = expandedIndex === idx;
                    const colorClasses = stickyColors[idx % stickyColors.length];
                    
                    return (
                        <div 
                            key={item.id}
                            className={`
                                relative transition-all duration-500 ease-in-out cursor-pointer
                                ${isExpanded 
                                    ? "col-span-full md:col-span-2 row-span-2 scale-100 z-50" 
                                    : "hover:scale-105 hover:-rotate-2 z-10"}
                            `}
                            onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                        >
                            {/* THE STICKY NOTE */}
                            <div className={`
                                h-full p-6 sm:p-8 rounded-lg shadow-lg border-b-4 flex flex-col
                                ${colorClasses}
                                ${isExpanded ? "rounded-2xl shadow-2xl ring-4 ring-black/5" : "aspect-square justify-center text-center"}
                                transition-all duration-500
                            `}>
                                {/* PIN ICON */}
                                <div className={`
                                    absolute top-2 left-1/2 -translate-x-1/2 transition-opacity duration-300
                                    ${isExpanded ? "opacity-100 top-4" : "opacity-40 group-hover:opacity-100"}
                                `}>
                                    <Pin size={isExpanded ? 28 : 18} className="fill-current" />
                                </div>

                                <h3 className={`
                                    font-black font-oasis-text leading-tight transition-all duration-500
                                    ${isExpanded ? "text-2xl mb-6 mt-4 border-b border-current/10 pb-4 text-left" : "text-sm sm:text-base line-clamp-3 px-2"}
                                `}>
                                    {item.title}
                                </h3>

                                {isExpanded && (
                                    <div className="animate__animated animate__fadeIn animate__faster overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                                        <StudentTreeRenderer items={item.children} apiBase={apiBase} isBulletin={true} />
                                        <button 
                                            className="mt-8 text-xs font-black uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity flex items-center gap-2"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setExpandedIndex(null);
                                            }}
                                        >
                                            <ChevronRight className="rotate-180" size={14} /> Close Note
                                        </button>
                                    </div>
                                )}

                                {!isExpanded && (
                                    <div className="mt-4 opacity-30 text-[0.6rem] font-black uppercase tracking-widest">
                                        View Details
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* OVERLAY FOR EXPANDED VIEW */}
            {expandedIndex !== null && (
                <div 
                    className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40 animate__animated animate__fadeIn"
                    onClick={() => setExpandedIndex(null)}
                />
            )}
        </div>
    );
}

/* ==========================================================================
   STYLE 4: RESOURCES VAULT (Bento Box)
   ========================================================================== */
function ResourcesVault({ items, apiBase }) {
    return (
        <div className="w-full flex flex-col gap-10">
            <div className="flex items-center gap-4 px-6">
                <div className="w-12 h-12 bg-oasis-gradient text-white rounded-2xl flex items-center justify-center shadow-xl">
                    <Box size={24} />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-oasis-header tracking-tight font-oasis-text uppercase">Resource Vault</h2>
                    <p className="text-sm text-gray-400 font-medium font-oasis-text">Download essential templates and internship forms.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                {items.map((component, idx) => (
                    <div 
                        key={component.id} 
                        className={`
                            bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col group animate__animated animate__fadeIn
                            ${idx === 0 ? "md:col-span-4" : "md:col-span-2"}
                            ${idx === 1 ? "md:row-span-2" : ""}
                        `}
                        style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className="p-4 bg-oasis-header/5 text-oasis-header rounded-2xl group-hover:bg-oasis-header group-hover:text-white transition-colors duration-500">
                                <Download size={24} />
                            </div>
                            <div className="text-[0.6rem] font-black uppercase tracking-widest text-oasis-header/30">Vault Item</div>
                        </div>

                        <h3 className="text-2xl font-black text-oasis-header font-oasis-text mb-4 leading-tight group-hover:translate-x-1 transition-transform">{component.title}</h3>
                        <p className="text-xs text-gray-400 font-oasis-text mb-8 leading-relaxed">Essential documents related to {component.title.toLowerCase()}. Click to access downloads.</p>
                        
                        <div className="mt-auto space-y-3">
                            <StudentTreeRenderer items={component.children} apiBase={apiBase} isVault={true} />
                        </div>
                    </div>
                ))}

                {/* QUICK DOWNLOAD ALL BENTO TILE */}
                <div className="md:col-span-2 bg-oasis-gradient p-8 rounded-[2.5rem] text-white flex flex-col justify-between shadow-2xl relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform">
                    <div className="absolute right-0 top-0 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                        <Download size={150} />
                    </div>
                    <div className="z-10">
                        <h4 className="text-xl font-bold font-oasis-text">Need Everything?</h4>
                        <p className="text-xs opacity-70 mt-2 leading-relaxed">Access all downloadable forms in one place through the centralized database.</p>
                    </div>
                    <button className="mt-8 z-10 w-full py-4 bg-white text-oasis-header rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 group-hover:bg-oasis-blue transition-colors">
                        Centralized Database <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ==========================================================================
   MODERNIZED TREE RENDERER
   ========================================================================== */
export function StudentTreeRenderer({ items = [], apiBase, level = 0, isBulletin = false, isVault = false }) {
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
        w-full flex flex-col
        ${level > 0 ? "mt-4 ml-4 sm:ml-6 border-l-2 border-oasis-blue/10 pl-4 sm:pl-6 space-y-4" : "space-y-6"}
    `;

    return (
        <div className={containerClasses}>
            {renderItems.map((group, idx) => {
                if (group.items) {
                    const listClass = group.type === "numerical_list" ? "list-decimal" : group.type === "bulleted_list" ? "list-disc" : "list-[lower-alpha]";
                    return (
                        <ul key={idx} className={`${listClass} space-y-3 px-6 md:px-8 text-gray-700 font-oasis-text text-[0.9rem]`}>
                            {group.items.map(li => (
                                <li key={li.id} className="leading-relaxed marker:text-oasis-header marker:font-bold pl-1">
                                    <div className="flex flex-col gap-2">
                                        <span className={isBulletin ? "font-bold" : "font-medium"}>{li.title}</span>
                                        {li.children?.length > 0 && (
                                            <StudentTreeRenderer items={li.children} apiBase={apiBase} level={level + 1} isBulletin={isBulletin} isVault={isVault} />
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
                        <div key={item.id} className="w-full flex flex-col gap-3">
                            <h4 className={`font-oasis-text font-black text-oasis-header ${level === 0 ? "text-lg" : "text-base"} flex items-center gap-3`}>
                                {level === 0 && !isBulletin && <div className="w-2 h-2 bg-oasis-blue rounded-full" />}
                                {item.title}
                            </h4>
                            {item.children?.length > 0 && (
                                <StudentTreeRenderer items={item.children} apiBase={apiBase} level={level + 1} isBulletin={isBulletin} isVault={isVault} />
                            )}
                        </div>
                    );
                }

                if (item.type === "description") {
                    return (
                        <div key={item.id} className="w-full flex flex-col gap-3">
                            <div className={`${isBulletin ? "bg-white/40" : "bg-oasis-blue/5"} p-4 rounded-2xl border-l-4 ${isBulletin ? "border-oasis-header/20" : "border-oasis-header/30"}`}>
                                <p className="text-[0.85rem] text-gray-600 font-oasis-text leading-relaxed whitespace-pre-wrap">
                                    {item.title}
                                </p>
                            </div>
                            {item.children?.length > 0 && (
                                <StudentTreeRenderer items={item.children} apiBase={apiBase} level={level + 1} isBulletin={isBulletin} isVault={isVault} />
                            )}
                        </div>
                    );
                }

                if (item.type === "document") {
                    return (
                        <div key={item.id} className="group transition-transform active:scale-95">
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
