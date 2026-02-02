
import MainScreen from '../../layouts/mainScreen'
import Title from '../../utilities/title'
import Subtitle from '../../utilities/subtitle'
import { Filter } from '../../components/adminComps'
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { useState } from 'react'
import { AnnouncementModal } from '../../components/userModal'
import img from "../../assets/fallbackImage.jpg"
export default function Announcements() {
    const [announcements] = useLocalStorage("announcements", []);
    const [activeFilter, setActiveFilter] = useState("All");
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    
    const filteredAnnouncements =
        activeFilter === "All"
            ? announcements
            : announcements.filter(a => a.category === activeFilter);

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
                {/* FILTERS */}
                <section className="flex gap-5 mb-5">
                    {["All", "HTE Related", "Deadlines", "Newly Approved HTEs", "Events and Webinars"].map(f => (
                        <Filter
                            key={f}
                            text={f}
                            onClick={() => setActiveFilter(f)}
                            isActive={activeFilter === f}
                        />
                    ))}
                </section>

                {/* ANNOUNCEMENTS */}
                <section className="flex flex-col">
                    {filteredAnnouncements.map(a => (
                        <div
                            key={a.id}
                            className="w-full flex gap-5 p-3 border border-oasis-button-dark bg-linear-to-b from-oasis-button-light via-oasis-blue cursor-pointer"
                            onClick={() => setSelectedAnnouncement(a)} // <-- set the clicked announcement
                        >
                            <section>
                                <Subtitle text={a.date} />
                                <Subtitle text={a.time} />
                            </section>

                            <section className="flex flex-col">
                                <Subtitle
                                    size="text-[1rem]"
                                    weight="font-bold"
                                    color="text-oasis-button-dark"
                                    text={a.title}
                                />
                                <Subtitle
                                    size="text-[0.7rem]"
                                    text={a.content}
                                />
                            </section>
                        </div>
                    ))}
                </section>
                    
            </div>
            <div className='bg-oasis-gradient relative w-90 aspect-video shadow-[2px_2px_2px_rgba(0,0,0,0.5)] overflow-hidden cursor-pointer'>
                    <img src={img} className='opacity-90 absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 object-cover w-full'/>
                    <div className='bg-[rgba(0,0,0,1)] w-full h-full z-10'></div>
            </div>
        </MainScreen>
    );
}
