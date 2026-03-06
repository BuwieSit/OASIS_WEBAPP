import AdminScreen from '../../layouts/adminScreen.jsx';
import Title from "../../utilities/title.jsx";
import { AdmCard } from "../../utilities/card.jsx"
import { UsersRound, Book, BookAlert, BookPlus, Building2, FileCheck, Check, X, Eye, Trash, Paperclip, Megaphone, Bell} from 'lucide-react';
import { SingleField, MultiField } from '../../components/fieldComp.jsx';
import { Filter, Dropdown } from '../../components/adminComps.jsx';
import { Label } from '../../utilities/label.jsx';
import SearchBar from '../../components/searchBar.jsx';
import { AnnounceButton } from '../../components/button.jsx';
import { useState, useEffect } from 'react';
import { AnnouncementModal } from '../../components/userModal.jsx';
import { ConfirmModal, GeneralPopupModal } from '../../components/popupModal.jsx';
import { Link } from 'react-router-dom';
import { AdminAPI } from "../../api/admin.api";
import SvgLoader from '../../components/SvgLoader.jsx';

export default function Admin() {
    const [dashboard, setDashboard] = useState(null);
    const [loadingDashboard, setLoadingDashboard] = useState(true);
    const [dashboardError, setDashboardError] = useState(null);
    const [announcements, setAnnouncements] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [search, setSearch] = useState("");

    const [activeFilter, setActiveFilter] = useState("All");
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    const [deleteModalShow, setDeleteModalShow] = useState(false);
    const [announcementToDelete, setAnnouncementToDelete] = useState(null);
    const [lastPostedTitle, setLastPostedTitle] = useState("");

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("HTE Related");
    const [modalStatus, setModalStatus] = useState(null); // null | "success" | "failed"
    const [failedFields, setFailedFields] = useState([]);

    const categories = [
        "HTE Related",
        "Deadlines",
        "Newly Approved HTEs",
        "Events and Webinars",
        "Others"
    ];

    const CATEGORY_TO_ENUM = {
        "HTE Related": "HTE_RELATED",
        "Deadlines": "DEADLINES",
        "Newly Approved HTEs": "NEWLY_APPROVED_HTES",
        "Events and Webinars": "EVENTS_AND_WEBINARS",
        "Others": "OTHERS"
    };

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const res = await AdminAPI.getDashboard();
                setDashboard(res.data);
            } catch (err) {
                console.error("Dashboard error:", err);
                setDashboardError(err);
            } finally {
                setLoadingDashboard(false);
            }
        };

        loadDashboard();
    }, []);

    // useEffect(() => {
    //     AdminAPI.getDashboard()
    //     .then(res => setDashboard(res.data))
    //     .catch(err => console.error("Dashboard error", err));
    // }, []);

    useEffect(() => {
        AdminAPI.getAnnouncements()
        .then(res => setAnnouncements(res.data))
        .catch(err => console.error("Announcements error", err));
    }, []);

    // ⚠️ TEMPORARY: backend not implemented yet
    useEffect(() => {
        AdminAPI.getAdminAlerts()
        .then(res => setAlerts(res.data))
        .catch(() => setAlerts([])); 
    }, []);

    const handlePost = async (e) => {
        e.preventDefault();
        setLastPostedTitle(title);

        if (!title || !content || !category) {
            const emptyFields = [];
            if (!title) emptyFields.push("Title");
            if (!content) emptyFields.push("Content");
            if (!category) emptyFields.push("Category");

            setModalStatus("failed");
            setFailedFields(emptyFields);
            return;
        }
        

    try {
        await AdminAPI.createAnnouncement({
        title,
        content,
        category: CATEGORY_TO_ENUM[category] || category
        });


        setTitle("");
        setContent("");
        setCategory("HTE Related");
        setModalStatus("success");

        const res = await AdminAPI.getAnnouncements();
        setAnnouncements(res.data);
    } catch (err) {
        console.error(err);
        setModalStatus("failed");
        setFailedFields(["Server error (check backend/API)"]);
    }
    };

    const handleDelete = async (id) => {
        await AdminAPI.deleteAnnouncement(id);
        setAnnouncements(prev => prev.filter(a => a.id !== id));
    };


    const matchesFilter = (a) => {
        if (activeFilter === "All") return true;
        const enumFilter = CATEGORY_TO_ENUM[activeFilter] || activeFilter;
        return a.category === enumFilter;
    };

    const matchesSearch = (a) => {
        if (!search.trim()) return true;
        return (a.title || "").toLowerCase().includes(search.trim().toLowerCase());
    };

    const filteredAnnouncements = announcements.filter(a => matchesFilter(a) && matchesSearch(a));

    return(
        <>
            <AdminScreen>
                 <AnnouncementModal 
                    visible={!!selectedAnnouncement} 
                    onClose={() => setSelectedAnnouncement(null)}
                    {...selectedAnnouncement}
                />

                {deleteModalShow && announcementToDelete && (
                    <ConfirmModal 
                        onConfirm={() => {
                            handleDelete(announcementToDelete.id);
                            setDeleteModalShow(false);
                            setAnnouncementToDelete(null);
                        }}
                        onCancel={() => {
                            setDeleteModalShow(false);
                            setAnnouncementToDelete(null);
                        }}
                        confText={`delete "${announcementToDelete.title}"?`}
                    />
                )}
                
                {modalStatus === "success" && lastPostedTitle && (
                    <GeneralPopupModal
                        icon={<Check size={35}/>}
                        time={2000}
                        onClose={() => setModalStatus(null)}
                        title="Success"
                        text={`Posted announcement: ${lastPostedTitle}`}
                        isSuccess={true}
                    />
                )}

                {modalStatus === "failed" && (
                    <GeneralPopupModal
                        icon={<X size={35}/>}
                        time={2000}
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

                    <section className='p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
                        {/* VINCENT - router per card, total students (if clicked) > Students tab */}
                        <Link to={"/admStudents"}>
                            <AdmCard
                                cardTitle="Total Students"
                                cardIcon={<UsersRound color="#377268" />}
                                cardNumber={
                                    loadingDashboard ? <SvgLoader size={20}/> :
                                    dashboardError ? "-" : 
                                    dashboard?.metrics?.total_students ?? "-"
                                }
                                cardDate={dashboard?.last_updated
                                    ? new Date(dashboard.last_updated).toLocaleDateString()
                                    : "-"}
                            />
                        </Link>

                        <Link to={"/admMoaOverview"}>
                            <AdmCard
                                cardTitle="Total Active MOAs"
                                cardIcon={<Book color="#377268" />}
                                cardNumber={
                                    loadingDashboard ? <SvgLoader size={20}/> :
                                    dashboardError ? "-" : 
                                    dashboard?.metrics?.total_active_moas ?? "-"}
                                cardDate={dashboard?.last_updated
                                    ? new Date(dashboard.last_updated).toLocaleDateString()
                                    : "-"}
                            />
                        </Link>

                        <Link to={"/admMoaOverview"}>
                            <AdmCard
                                cardTitle="Total Expired MOAs"
                                cardIcon={<BookAlert color="#377268" />}
                                cardNumber={
                                    loadingDashboard ? <SvgLoader size={20}/> :
                                    dashboardError ? "-" : 
                                    dashboard?.metrics?.total_expired_moas ?? "-"}
                                cardDate={dashboard?.last_updated
                                    ? new Date(dashboard.last_updated).toLocaleDateString()
                                    : "-"}
                            />
                        </Link>

                        <Link to={"/admMoaOverview"}>
                            <AdmCard
                                cardTitle="Total MOA Prospect Submissions"
                                cardIcon={<BookPlus color="#377268" />}
                                cardNumber={
                                    loadingDashboard ? <SvgLoader size={20}/> :
                                    dashboardError ? "-" : 
                                    dashboard?.metrics?.total_moa_prospects ?? "-"}
                                cardDate={dashboard?.last_updated
                                    ? new Date(dashboard.last_updated).toLocaleDateString()
                                    : "-"}
                            />
                        </Link>

                        <Link to={"/admOperations"}>
                            <AdmCard
                                cardTitle="Total Host Training Establishments"
                                cardIcon={<Building2 color="#377268" />}
                                cardNumber={
                                    loadingDashboard ? <SvgLoader size={20}/> :
                                    dashboardError ? "-" : 
                                    dashboard?.metrics?.total_htes ?? "-"}
                                cardDate={dashboard?.last_updated
                                    ? new Date(dashboard.last_updated).toLocaleDateString()
                                    : "-"}
                            />
                        </Link>
                        <Link to={"/admUploads"}>
                            <AdmCard
                                cardTitle="Total Uploaded Documents"
                                cardIcon={<FileCheck color="#377268" />}
                                cardNumber={
                                    loadingDashboard ? <SvgLoader size={30}/> :
                                    dashboardError ? "-" : 
                                    dashboard?.metrics?.total_uploaded_documents ?? "-"}
                                cardDate={dashboard?.last_updated
                                    ? new Date(dashboard.last_updated).toLocaleDateString()
                                    : "-"}
                            />
                        </Link>
                         <a href='#announcements'>
                            <AdmCard
                                cardTitle="Total Announcements posted"
                                cardIcon={<Megaphone color="#377268" />}
                                cardNumber={'2'}
                                cardDate={'00/00/0000'}
                            />
                        </a>
                        <a href='#notifications'>
                            <AdmCard
                                cardTitle="Total Notifications"
                                cardIcon={<Bell color="#377268" />}
                                cardNumber={'2'}
                                cardDate={'00/00/0000'}
                            />
                        </a>
                    </section>
                    {/* OJT JOURNEY */}
                        

                    <div className='flex justify-start items-start w-[90%]'>
                            <Title text={"Post Announcements"}/>
                    </div>
                    {/* POST ANNOUNCEMENTS SECTION */}
                    <section className='p-5 w-[90%] flex flex-row justify-between items-start gap-5 font-oasis-text text-oasis-button-dark '>
                        
                        <form className='w-[70%] min-h-24 p-10 bg-admin-element flex flex-col items-start justify-center gap-5 text-black rounded-3xl' 
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
                            <section id='announcements' className='w-full flex flex-row items-center justify-start gap-5'>
                                {["All", "HTE Related", "Deadlines", "Newly Approved HTEs", "Events and Webinars", "Others"].map(f => (
                                    <Filter
                                        key={f}
                                        text={f}
                                        onClick={() => setActiveFilter(f)}
                                        isActive={activeFilter === f}
                                    />
                                ))} 

                            </section>
                            
                            <div className="w-full">
                                <Label labelText={"Search by Title"} />
                                <input
                                    className="w-full p-3 bg-white border border-gray-300 rounded-xl outline-none"
                                    placeholder="Search announcements title..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            {filteredAnnouncements.map(a => (
                                <section
                                    key={a.id}
                                    className="w-full bg-white rounded-3xl p-5 flex flex-row items-center justify-evenly"
                                >
                                    <div className="p-5 w-full text-black rounded-2xl">
                                        <p className="text-[0.8rem] text-gray-500 italic font-normal mb-5">
                                            {a.created_at ? new Date(a.created_at).toLocaleDateString() : "-"}
                                        </p>
                                        <h3 className="text-[1rem] font-bold">{a.title}</h3>
                                        <p className="text-[0.8rem] font-medium line-clamp-2">{a.content}</p>
                                    </div>

                                    <div className="w-[50%] flex flex-row gap-10">
                                        <AnnounceButton 
                                            icon={<Eye/>} 
                                            btnText="View" 
                                            onClick={() => setSelectedAnnouncement(a)}
                                        />
                                        <AnnounceButton 
                                            btnText="Delete" 
                                            onClick={() => {
                                                setAnnouncementToDelete(a);
                                                setDeleteModalShow(true);
                                                // onClick={(e) => { e.stopPropagation();
                                            }}
                                        />
                                    </div>
                                </section>
                            ))}
                        </form>
                       
                        {/* NOTIFICATIONS */}
                        <div id='notifications' className='w-[25%] rounded-3xl min-h-24 p-10 bg-admin-element'>
                        <p className='text-[0.8rem] mb-5 font-black'>Notifications</p>

                        {alerts.length === 0 && (
                            <p className="text-[0.7rem] text-gray-500">No alerts</p>
                        )}

                        {alerts.map(alert => (
                            <div>
                                <div
                                    key={alert.id}
                                    className='w-full bg-white p-3 mb-3 rounded-2xl rounded-tl-none text-black border border-oasis-button-dark hover:bg-oasis-gradient transition cursor-pointer'
                                >
                                    <h3 className='text-[0.8rem] font-bold'>{alert.title}</h3>
                                    <p className='text-[0.7rem] font-light line-clamp-2'>{alert.message}</p>
                                    <p className='text-[0.65rem] text-gray-600 mt-1'>
                                        {alert.date ? new Date(alert.date).toLocaleDateString() : ""}
                                    </p>
                                </div>
                            </div>
                            
                        ))}
                        </div>
                    </section>

                </div>
            </AdminScreen>
        </>
    )
}   