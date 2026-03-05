import MainScreen from '../../layouts/mainScreen';
import Title from '../../utilities/title';
import Subtitle from '../../utilities/subtitle';
import { Filter } from '../../components/adminComps';
import { useEffect, useState } from 'react';
import { AnnouncementModal } from '../../components/userModal';

import api from "../../api/axios.jsx";

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
                    text="See the lists of HTEs with their MOA and significant details; See the reviews about HTEs and make a review yourself!"
                    isCenter
                />
            </div>

            <div className="
                w-full
                lg:w-[70%]
                px-4 sm:px-6
                py-5
                flex flex-col
            ">

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
                        />
                    ))}
                </section>

                {/* ANNOUNCEMENTS */}
                <section className="flex flex-col gap-3">

                    {loading && (
                        <p className="text-sm text-gray-500">Loading announcements...</p>
                    )}

                    {!loading && filteredAnnouncements.length === 0 && (
                        <p className="text-sm text-gray-500">No announcements yet.</p>
                    )}

                    {filteredAnnouncements.map(a => (
                        <div
                            key={a.id}
                            className="
                                w-full
                                flex
                                flex-col sm:flex-row
                                gap-3 sm:gap-5
                                p-4
                                border border-oasis-button-dark
                                bg-linear-to-b from-oasis-button-light via-oasis-blue
                                cursor-pointer
                                rounded-xl
                                hover:shadow-md
                                transition duration-200
                            "
                            onClick={() => setSelectedAnnouncement(a)}
                        >

                            {/* DATE */}
                            <section className="shrink-0">
                                <Subtitle
                                    size="text-xs sm:text-sm"
                                    text={a.created_at ? new Date(a.created_at).toLocaleDateString() : "-"}
                                />
                            </section>

                            {/* TITLE + CONTENT */}
                            <section className="flex flex-col gap-1">

                                <Subtitle
                                    size="text-sm sm:text-base"
                                    weight="font-bold"
                                    color="text-oasis-button-dark"
                                    text={a.title}
                                />
                                <Subtitle
                                    size="text-xs sm:text-sm line-clamp-3"
                                    text={a.content}
                                />
                            </section>
                        </div>
                    ))}
                </section>
            </div>
        </MainScreen>
    );
}