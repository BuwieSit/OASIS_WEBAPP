import AdminScreen from '../../layouts/adminScreen.jsx';
import { AdminHeader } from '../../components/headers.jsx'
import Title from "../../utilities/title.jsx";
import { AdmCard } from "../../utilities/card.jsx"
import { UsersRound, ScrollText, Bell, User, Book, BookAlert, BookPlus, Building2, FileCheck, CheckCheckIcon, Check, X } from 'lucide-react';
import { SingleField, MultiField } from '../../components/fieldComp.jsx';
import { Filter, Dropdown } from '../../components/adminComps.jsx';
import { Label } from '../../utilities/label.jsx';
import SearchBar from '../../components/searchBar.jsx';
import { AnnounceButton } from '../../components/button.jsx';
import { useLocalStorage } from '../../hooks/useLocalStorage.jsx';
import { useState, useEffect } from 'react';
import { AnnouncementModal } from '../../components/userModal.jsx';
import { ConfirmModal, GeneralPopupModal } from '../../components/popupModal.jsx';
import { Link } from 'react-router-dom';

export default function Admin() {
     const categories = [
        "HTE Related",
        "Deadlines",
        "Newly Approved HTEs",
        "Events and Webinars",
        "Others"
    ];

    const [announcements, setAnnouncements] = useLocalStorage("announcements", []);
    const [activeFilter, setActiveFilter] = useState("All");
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    
    const filteredAnnouncements =
        activeFilter === "All"
            ? announcements
            : announcements.filter(a => a.category === activeFilter);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState(categories[0]);

    const [modalStatus, setModalStatus] = useState(null); // null | "success" | "failed"
    const [failedFields, setFailedFields] = useState([]);

    const handlePost = (e) => {
        e.preventDefault();

        // validate
    if (!title || !content || !category) {
        const emptyFields = [];

        if (!title) emptyFields.push("Title");
        if (!content) emptyFields.push("Content");
        if (!category) emptyFields.push("Category");

        setModalStatus("failed");
        setFailedFields(emptyFields); 
        return;
    }

   
        const newAnnouncement = {
            id: crypto.randomUUID(),
            title,
            content,
            category,
            date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
            time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
        };

        setAnnouncements(prev => [newAnnouncement, ...prev]);

        setTitle("");
        setContent("");
        setCategory("");
        setModalStatus("success");
    };

    const handleDelete = (id) => {
        console.log("Deleting ID:", id);
        setAnnouncements(prev => prev.filter(a => a.id !== id));
    };


    // useEffect(() => {
    //     console.log("Updated announcements:", announcements);
    // }, [announcements]);

    return(
        <>
            <AdminScreen>
                 <AnnouncementModal 
                    visible={!!selectedAnnouncement} 
                    onClose={() => setSelectedAnnouncement(null)}
                    {...selectedAnnouncement}
                />

                
                {modalStatus === "success" && (
                    <GeneralPopupModal
                        icon={<Check size={40}/>}
                        time={3000}
                        onClose={() => setModalStatus(null)}
                        title="Success"
                        isSuccess={true}
                    />
                )}

                {modalStatus === "failed" && (
                    <GeneralPopupModal
                        icon={<X size={40}/>}
                        time={5000}
                        onClose={() => setModalStatus(null)}
                        title={"Failed"}
                        text={`Please fill the following field(s)\n: ${failedFields.join(", ")}`}
                        isFailed={true}
                    />
                )}
                {/* PARENT CONTAINER */}
                
                <div className='w-full flex flex-col gap-10 items-center justify-center rounded-3xl drop-shadow-[0_5px_10px_rgba(0,0,0,0.25)]'>
                    <div>
                        <Title text={"Admin Dashboard"}/>
                    </div>

                    <section className='p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10'>
                        {/* VINCENT - router per card, total students (if clicked) > Students tab */}
                        <Link to={"/admStudents"}>
                            <AdmCard 
                                cardTitle={"Total Students"}
                                cardIcon={<UsersRound color='#377268'/>}
                                cardNumber={"24"}
                                cardDate={"January 7, 2026"}
                            />
                        </Link>

                        <Link to={"/admMoaOverview"}>
                            <AdmCard 
                                cardTitle={"Total Active MOAs"}
                                cardIcon={<Book color='#377268'/>}
                                cardNumber={"105"}
                                cardDate={"January 7, 2026"}
                            />
                        </Link>

                        <Link to={"/admMoaOverview"}>
                            <AdmCard 
                                cardTitle={"Total expired MOAs"}
                                cardIcon={<BookAlert color='#377268'/>}
                                cardNumber={"32"}
                                cardDate={"January 7, 2026"}
                            />
                        </Link>
                        <Link to={"/admMoaOverview"}>
                            <AdmCard 
                                cardTitle={"Total MOA Prospect submissions"}
                                cardIcon={<BookPlus color='#377268'/>}
                                cardNumber={"15"}
                                cardDate={"January 7, 2026"}
                            />
                        </Link>

                        <Link to={"/admOperations"}>
                            <AdmCard 
                                cardTitle={"Total Host Training Establishments"}
                                cardIcon={<Building2 color='#377268'/>}
                                cardNumber={"137"}
                                cardDate={"January 7, 2026"}
                            />
                        </Link>
                        <Link to={"/admUploads"}>
                            <AdmCard 
                                cardTitle={"Total Uploaded Documents"}
                                cardIcon={<FileCheck color='#377268'/>}
                                cardNumber={"15"}
                                cardDate={"January 7, 2026"}
                            />
                        </Link>
                    </section>
                    <div className='flex justify-start items-start w-[90%]'>
                            <Title text={"Post Announcements"}/>
                    </div>
                    {/* POST ANNOUNCEMENTS SECTION */}
                    <section className='p-5 w-[90%] flex flex-row justify-between items-start gap-5 font-oasis-text text-oasis-button-dark'>
                        
                        <form className='w-[70%] min-h-24 p-10 bg-admin-element flex flex-col items-start justify-center gap-5 text-black' 
                        onSubmit={(e) => {
                            e.preventDefault();
                            handlePost(e);
                        }}>

                            <SingleField
                                labelText="Announcement Title"
                                fieldHolder="Enter title..."
                                fieldId="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />

                            <MultiField
                                labelText="Announcement Content"
                                fieldHolder="Enter contents..."
                                fieldId="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />

                            <div className='w-full'>

                               <Dropdown
                                    labelText="Select Category"
                                    categories={categories}
                                    value={category}
                                    onChange={setCategory}
                                />

                                <section className='flex flex-row items-start justify-start gap-10 mt-10'>
                                    <AnnounceButton btnText="Post" type="submit" />

                                </section>
                            </div>
                            
                        
                        {/* FILTER ANNOUNCEMNTS */}

                            <Label labelText={"Filter Announcements"}/>
                            <section className='w-full flex flex-row items-center justify-start gap-5'>
                                {["All", "HTE Related", "Deadlines", "Newly Approved HTEs", "Events and Webinars", "Others"].map(f => (
                                    <Filter
                                        key={f}
                                        text={f}
                                        onClick={() => setActiveFilter(f)}
                                        isActive={activeFilter === f}
                                    />
                                ))} 

                            </section>
                            
                            <SearchBar />
                            {filteredAnnouncements.map(a => (
                                <section
                                    key={a.id}
                                    onClick={() => setSelectedAnnouncement(a)}
                                    className="w-full bg-white p-5 flex flex-row items-center justify-evenly cursor-pointer"
                                >
                                    <div className="p-5 w-full text-black rounded-2xl">
                                        <p className="text-[0.6rem] font-normal mb-5">{a.date}</p>
                                        <h3 className="text-[1rem] font-bold">{a.title}</h3>
                                        <p className="text-[0.8rem] font-medium">{a.content}</p>
                                    </div>

                                    <div className="w-[50%] flex flex-row justify-evenly items-center gap-10">
                                        <AnnounceButton btnText="Posted" />
                                        <AnnounceButton btnText="Delete" onClick={() => handleDelete(a.id)}/>
                                    </div>
                                </section>
                            ))}
                        </form>
                       
                        {/* NOTIFICATIONS */}
                        <div id='notifications' className='w-[25%] min-h-24 p-10 bg-admin-element'>
                            <p className='text-[0.8rem] mb-5 font-black'>Notifications</p>
 
                            <div className='w-full max-h-14 bg-white p-3 rounded-2xl rounded-tl-none text-black border border-oasis-button-dark hover:cursor-pointer hover:bg-oasis-aqua transition ease-in-out duration-300'>
                                <h3 className='text-[0.8rem] font-bold'>Notif title</h3>
                                <p className='text-[0.7rem] font-light'>Notif Description</p>
                            </div>


                        </div>
                        
                    </section>

                </div>
            </AdminScreen>
        </>
    )
}   