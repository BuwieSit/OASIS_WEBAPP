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

            <div className="w-full flex flex-col items-center">
                <Title text="Announcements" size="text-[3rem]" />
                <Subtitle
                    size="text-[1rem]"
                    color="text-oasis-button-dark"
                    text="See the latest news about OJT and internship concerns"
                />
            </div>

            <div className="w-[70%] p-5 flex flex-col">
                <section className="flex gap-5 mb-5">
                    {["All", "HTE Related", "Deadlines", "Newly Approved HTEs", "Events and Webinars", "Others"].map(f => (
                        <Filter
                            key={f}
                            text={f}
                            onClick={() => setActiveFilter(f)}
                            isActive={activeFilter === f}
                        />
                    ))}
                </section>

                <section className="flex flex-col">
                    {loading && (
                        <p className="text-sm text-gray-500">Loading announcements...</p>
                    )}

                    {!loading && filteredAnnouncements.length === 0 && (
                        <p className="text-sm text-gray-500">No announcements yet.</p>
                    )}

                    {filteredAnnouncements.map(a => (
                        <div
                            key={a.id}
                            className="w-full flex gap-5 p-3 border border-oasis-button-dark bg-linear-to-b from-oasis-button-light via-oasis-blue cursor-pointer"
                            onClick={() => setSelectedAnnouncement(a)}
                        >
                            <section>
                                <Subtitle text={a.created_at ? new Date(a.created_at).toLocaleDateString() : "-"} />
                            </section>

                            <section className="flex flex-col">
                                <Subtitle
                                    size="text-[1rem]"
                                    weight="font-bold"
                                    color="text-oasis-button-dark"
                                    text={a.title}
                                />
                                <Subtitle size="text-[0.7rem]" text={a.content} />
                            </section>
                        </div>
                    ))}
                </section>
            </div>
        </MainScreen>
    );
}