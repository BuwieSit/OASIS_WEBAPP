import MainScreen from '../../layouts/mainScreen';
import Title from '../../utilities/title';
import Subtitle from '../../utilities/subtitle';
import { Filter } from '../../components/adminComps';
import { useEffect, useState } from 'react';
import { AnnouncementModal } from '../../components/userModal';
import api from "../../api/axios.jsx";
import SearchBar from '../../components/searchBar.jsx';
import { ArrowRight } from 'lucide-react';
import pupImage from "../../assets/pupImage.jpg";
import { useLoading } from '../../context/LoadingContext';

export default function Announcements() {
    const { setLoading } = useLoading();
    const [announcements, setAnnouncements] = useState([]);
    const [activeFilter, setActiveFilter] = useState("All");
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    const [search, setSearch] = useState("");

    const CATEGORY_TO_ENUM = {
        "HTE Related": "HTE_RELATED",
        "Deadlines": "DEADLINES",
        "Newly Approved HTEs": "NEWLY_APPROVED_HTES",
        "Events and Webinars": "EVENTS_AND_WEBINARS",
        "Others": "OTHERS"
    };

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const res = await api.get("/api/student/announcements");
                setAnnouncements(res.data || []);
            } catch (err) {
                console.error("Student announcements error:", err);
                setAnnouncements([]);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [setLoading]);

    const filteredAnnouncements = announcements.filter((a) => {

        const categoryMatch = 
            activeFilter === "All" || 
            a.category === (CATEGORY_TO_ENUM[activeFilter] || activeFilter);

        const searchTerm = search.toLowerCase();
        const searchMatch = 
            a.title?.toLowerCase().includes(searchTerm) || 
            a.content?.toLowerCase().includes(searchTerm);

        return categoryMatch && searchMatch;
    });

    return (
        <MainScreen>
            <AnnouncementModal
                visible={!!selectedAnnouncement}
                onClose={() => setSelectedAnnouncement(null)}
                {...selectedAnnouncement}
                date={selectedAnnouncement?.created_at ? new Date(selectedAnnouncement.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                }) : ""}
            />

           <div className="w-full flex flex-col items-center mb-10 px-4 text-center">
                <Title 
                    text={"Announcements"} 
                    size="text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
                />
                <Subtitle
                    size="text-xs sm:text-sm md:text-base"
                    color="text-oasis-button-dark"
                    text="See the latest news about OJT and internship concerns in ITECH"
                    isCenter
                    isItalic
                />
            </div>

            <div className="
                w-full
                lg:w-[70%]
                px-4 sm:px-6
                py-5
                flex flex-col
            ">
                {/* SEARCH */}
                <section>
                    <SearchBar isFull={true} value={search} onChange={setSearch}/>
                </section>
                
                {/* FILTERS */}
                <section className="
                    flex
                    flex-wrap
                    gap-2 sm:gap-3 mt-5
                    mb-5
                ">
                    {["All", "HTE Related", "Deadlines", "Newly Approved HTEs", "Events and Webinars", "Others"].map(f => (
                        <Filter
                            key={f}
                            text={f}
                            onClick={() => setActiveFilter(f)}
                            isActive={activeFilter === f}
                            size={"text-[0.8rem]"}
                        />
                    ))}
                </section>

                {/* ANNOUNCEMENTS */}
                <section className="flex flex-col gap-3">

                    {filteredAnnouncements.length === 0 && (
                        <div className='w-full flex flex-col items-center justify-center py-10'>
                            <Subtitle 
                                text={search ? `No results found for "${search}"` : "No announcements in this category yet."} 
                                color={"text-oasis-gray"}
                            />
                            {search && (
                                <button 
                                    onClick={() => setSearch("")}
                                    className="text-oasis-header underline text-sm mt-2 cursor-pointer"
                                >
                                    Clear search
                                </button>
                            )}
                        </div>
                    )}

                    <div className="flex flex-col gap-6 p-4">
                        {filteredAnnouncements.map((a) => {

                            const isNew = a.created_at && (new Date() - new Date(a.created_at)) < 3 * 24 * 60 * 60 * 1000;

                            return (
                                <div 
                                    key={a.id} 
                                    className="relative w-full p-3 bg-oasis-gradient border border-oasis-gray rounded flex justify-between items-center cursor-pointer hover:border-oasis-header hover:shadow-md transition-all group animate__animated animate__fadeInDown overflow-hidden"
                                    onClick={() => setSelectedAnnouncement(a)}
                                >
                                    <img 
                                        src={pupImage} 
                                        className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full opacity-10 pointer-events-none object-contain transition-transform ' 
                                        alt=""
                                    />

                                    {/* LEFT: Date */}
                                    <div className="flex flex-col sm:w-36 shrink-0 h-full items-center justify-center">
                                        <Subtitle 
                                            text={
                                                a.created_at 
                                                ? new Date(a.created_at).toLocaleDateString('en-US', {
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                }) 
                                                : "-"
                                            }
                                            color={"text-oasis-gray"}
                                            size={"text-[0.8rem]"}
                                            isItalic
                                        />
                                    </div>

                                    {/* MIDDLE: Title and Content */}
                                    <div className='flex-1 flex flex-col min-w-0 px-4'>
                                        <div className="flex items-center gap-2">
                                            <Subtitle 
                                                text={a.title} 
                                                size={"text-[1rem]"}
                                                weight={"font-bold"}
                                                color={"text-oasis-button-dark"}
                                                className="truncate"
                                            />
                                            {isNew && (
                                                <span className="bg-oasis-header text-white text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0">New</span>
                                            )}
                                        </div>
                                        <Subtitle
                                            text={a.content}
                                            className="line-clamp-2 text-sm text-black mt-1"
                                        />
                                    </div>
                                    
                                    {/* RIGHT: Icon */}
                                    <div className='px-5 shrink-0'>
                                        <ArrowRight color='#2B6259' className='group-hover:scale-125 transition'/>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                   
                </section>
            </div>
        </MainScreen>
    );
}