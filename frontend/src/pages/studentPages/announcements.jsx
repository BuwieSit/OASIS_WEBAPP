import MainScreen from '../../layouts/mainScreen';
import Title from '../../utilities/title';
import Subtitle from '../../utilities/subtitle';
import { Filter } from '../../components/adminComps';
import { useEffect, useState } from 'react';
import { AnnouncementModal } from '../../components/userModal';

import api from "../../api/axios.jsx";
import SvgLoader from '../../components/SvgLoader.jsx';
import SearchBar from '../../components/searchBar.jsx';

export default function Announcements() {
    const [announcements, setAnnouncements] = useState([]);
    const [activeFilter, setActiveFilter] = useState("All");
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    const [loading, setLoading] = useState(true);

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
    }, []);

    const filteredAnnouncements =
        activeFilter === "All"
            ? announcements
            : announcements.filter(a => a.category === (CATEGORY_TO_ENUM[activeFilter] || activeFilter));

    return (
        <MainScreen>
            <AnnouncementModal
                visible={!!selectedAnnouncement}
                onClose={() => setSelectedAnnouncement(null)}
                {...selectedAnnouncement}
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
                    <SearchBar isFull={true}/>
                </section>
                
                {/* FILTERS */}
                <section className="
                    flex
                    flex-wrap
                    gap-2 sm:gap-3
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

                    {loading && (
                        <>
                            <div className='w-full flex items-center justify-center'>
                                <Subtitle text={"Loading announcements..."} color={"text-oasis-gray"}/>
                                <SvgLoader/>
                            </div>
                           
                        </>
                        
                    )}

                    {!loading && filteredAnnouncements.length === 0 && (
                        <>
                            <div className='w-full flex items-center justify-center'>
                                <Subtitle text={"No announcements yet."} color={"text-oasis-gray"}/>
                            </div>
                        </>
                        
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
                        {filteredAnnouncements.map((a) => {

                            const isNew = a.created_at && (new Date() - new Date(a.created_at)) < 3 * 24 * 60 * 60 * 1000;

                            return (
                                <div 
                                    key={a.id} 
                                    className="relative aspect-video w-full p-5 border border-oasis-gray rounded-2xl flex flex-col justify-between cursor-pointer hover:border-oasis-header hover:shadow-md transition-all bg-white"
                                    onClick={() => setSelectedAnnouncement(a)}
                                >

                                    {/* TOP SECTION: Date and Title */}
                                    <div className="flex flex-col gap-1">
                                        <Subtitle 
                                            text={a.created_at ? new Date(a.created_at).toLocaleDateString() : "-"}
                                            color={"text-oasis-gray"}
                                            size={"text-[0.7rem]"}
                                            isItalic
                                        />
                                        <Subtitle 
                                            text={a.title} 
                                            size={"text-[0.9rem]"}
                                            weight={"font-bold"}
                                        />
                                        <Subtitle
                                            text={a.content}
                                            className="line-clamp-2 text-sm text-gray-600 mt-1"
                                        />
                                    </div>

                                    {/* BOTTOM SECTION: The Badge */}
                                    {isNew && (
                                        <span className="absolute bottom-4 right-4 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-tight">
                                            New
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                   
                </section>
            </div>
        </MainScreen>
    );
}