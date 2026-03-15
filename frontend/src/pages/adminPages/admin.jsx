import AdminScreen from '../../layouts/adminScreen.jsx';
import Title from "../../utilities/title.jsx";
import { AdmCard } from "../../utilities/card.jsx";
import { UsersRound, Book, BookAlert, BookPlus, Building2, FileCheck, Check, X, Eye, Trash, Paperclip, Megaphone, Bell} from 'lucide-react';
import { SingleField, MultiField } from '../../components/fieldComp.jsx';
import { Filter, Dropdown } from '../../components/adminComps.jsx';
import { Label } from '../../utilities/label.jsx';
import { AnnounceButton } from '../../components/button.jsx';
import { useState, useEffect } from 'react';
import { AnnouncementModal } from '../../components/userModal.jsx';
import { ConfirmModal, GeneralPopupModal } from '../../components/popupModal.jsx';
import { Link } from 'react-router-dom';
import { AdminAPI } from "../../api/admin.api";
import SvgLoader from '../../components/SvgLoader.jsx';
import Subtitle from '../../utilities/subtitle.jsx';
import { PieChart } from '../../components/Charts.jsx';

export default function Admin() {
    const [dashboard, setDashboard] = useState(null);
    const [loadingDashboard, setLoadingDashboard] = useState(true);
    const [dashboardError, setDashboardError] = useState(null);

    const [announcements, setAnnouncements] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [search, setSearch] = useState("");

    const [activeFilter, setActiveFilter] = useState("All");
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

    // POPUPS
    const [popup, setPopup] = useState(null);
    const [deleteModalShow, setDeleteModalShow] = useState(false);
    const [announcementToDelete, setAnnouncementToDelete] = useState(null);
    const [lastPostedTitle, setLastPostedTitle] = useState("");
    const [disableButton, setDisableButton] = useState(false);
    
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("HTE Related");

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

    const handleDisableButton = () => {
        setDisableButton(true);
        setTimeout(() => {
            setDisableButton(false);
        }, 5000)
    }
    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const res = await AdminAPI.getDashboard();
                setDashboard(res.data);
                console.log("Data returned: ", dashboard);
            } catch (err) {
                console.error("Dashboard error:", err);
               
            } finally {
                setLoadingDashboard(false);
            }
        };

        loadDashboard();
        
    }, []);
    
    useEffect(() => {
        AdminAPI.getAnnouncements()
            .then(res => setAnnouncements(res.data))
            .catch(err => {
                console.error("Announcements error", err);
                setAnnouncements([]);
            });
    }, []);

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

            if (emptyFields.length > 0) {
                setPopup({
                    title: "Failed",
                    text: `Please fill the following field(s): ${emptyFields.join(", ")}`,
                    icon: <X size={50} />,
                    type: "failed",
                    time: 2000
                });
                return;
            }
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
            setPopup({
                title: "Success",
                text: `Posted announcement: ${lastPostedTitle}`,
                icon: <Check size={50} />,
                type: "success",
                time: 2000
            });

            const res = await AdminAPI.getAnnouncements();
            setAnnouncements(res.data);
        } catch (err) {
            console.error(err);
            setPopup({
                title: "Failed",
                text: `Server error (check backend/API)`,
                icon: <X size={50} />,
                type: "failed",
                time: 2000
            });
        }
    };

    const handleDelete = async (id) => {
        await AdminAPI.deleteAnnouncement(id);
        setAnnouncements(prev => prev.filter(a => a.id !== id));

        const deletedAnnouncement = announcementToDelete?.title || "announcement";

        // Trigger deletion popup
        setPopup({
            title: "Deleted Announcement",
            text: `Successfully deleted ${deletedAnnouncement}`,
            icon: <Trash size={50} />,
            type: "failed", 
            time: 2000
        });
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

    const filteredAnnouncements = announcements.filter(
        a => matchesFilter(a) && matchesSearch(a)
    );

    const latestAnnouncement = announcements.length > 0
        ? [...announcements].sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
        )[0]
        : null;

    const totalAnnouncements = announcements.length;

    const latestNotification = alerts.length > 0
        ? [...alerts].sort(
            (a, b) => new Date(b.date) - new Date(a.date)
        )[0]
        : null;

    const totalNotifications = alerts.length;


    return (
        <AdminScreen>
            <AnnouncementModal
                visible={!!selectedAnnouncement}
                onClose={() => setSelectedAnnouncement(null)}
                {...selectedAnnouncement}
            />

            {popup && (
                <GeneralPopupModal
                    icon={popup.icon}
                    time={popup.time}
                    title={popup.title}
                    text={popup.text}
                    onClose={() => setPopup(null)}
                    isSuccess={popup.type === "success"}
                    isFailed={popup.type === "failed"}
                    isNeutral={popup.type === "neutral"}
                />
            )}

            {/* Confirm delete modal */}
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

            {/* TITLE */}
            <div className='w-[90%] flex flex-col gap-3 items-start justify-center border-b border-gray-400 py-5'>
                <Title text="Admin Dashboard" size='text-[2rem]'/>
                <Subtitle text={"Overview of admin information, and management of announcements."}/>
            </div>

            {/* CARDS */}
            <section className="w-[90%] p-5 gap-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">

                <Link to={"/admMoaOverview"}>
                    <AdmCard
                        hasRibbon={true}
                        ribbonColor={"bg-yellow-500"}
                        cardTitle="Total MOAs"
                        cardIcon={<Book color="#377268" />}
                        cardNumber={
                            loadingDashboard ? <SvgLoader size={20} /> :
                            dashboardError ? "-" :
                            dashboard?.metrics?.total_active_moas + 
                            dashboard?.metrics?.total_expired_moas ?? "-"
                        }
                        cardDate={
                            dashboard?.last_updated
                                ? new Date(dashboard.last_updated).toLocaleDateString()
                                : "-"
                        }
                    />
                </Link>

                <Link to={"/admMoaOverview"}>
                    <AdmCard
                        hasRibbon={true}
                        ribbonColor={"bg-green-500"}
                        cardTitle="Active MOAs"
                        cardIcon={<Book color="#377268" />}
                        cardNumber={
                            loadingDashboard ? <SvgLoader size={20} /> :
                            dashboardError ? "-" :
                            dashboard?.metrics?.total_active_moas ?? "-"
                        }
                        cardDate={
                            dashboard?.last_updated
                                ? new Date(dashboard.last_updated).toLocaleDateString()
                                : "-"
                        }
                    />
                </Link>

                <Link to={"/admMoaOverview"}>
                    <AdmCard
                        hasRibbon={true}
                        ribbonColor={"bg-red-800"}
                        cardTitle="Expired MOAs"
                        cardIcon={<BookAlert color="#377268" />}
                        cardNumber={
                            loadingDashboard ? <SvgLoader size={20} /> :
                            dashboardError ? "-" :
                            dashboard?.metrics?.total_expired_moas ?? "-"
                        }
                        cardDate={
                            dashboard?.last_updated
                                ? new Date(dashboard.last_updated).toLocaleDateString()
                                : "-"
                        }
                    />
                </Link>
                
                <Link to={"/admStudents"}>
                    <AdmCard
                        cardTitle="Total Students"
                        cardIcon={<UsersRound color="#377268" />}
                        cardNumber={
                            loadingDashboard ? <SvgLoader size={20} /> :
                            dashboardError ? "-" :
                            dashboard?.metrics?.total_students ?? "-"
                        }
                        cardDate={
                            dashboard?.last_updated
                                ? new Date(dashboard.last_updated).toLocaleDateString()
                                : "-"
                        }
                    />
                </Link>

                <Link to={"/admMoaOverview"}>
                    <AdmCard
                        cardTitle="MOA Prospect Submissions"
                        cardIcon={<BookPlus color="#377268" />}
                        cardNumber={
                            loadingDashboard ? <SvgLoader size={20} /> :
                            dashboardError ? "-" :
                            dashboard?.metrics?.total_moa_prospects ?? "-"
                        }
                        cardDate={
                            dashboard?.last_updated
                                ? new Date(dashboard.last_updated).toLocaleDateString()
                                : "-"
                        }
                    />
                </Link>

                <Link to={"/admOperations"}>
                    <AdmCard
                        cardTitle="Host Training Establishments"
                        cardIcon={<Building2 color="#377268" />}
                        cardNumber={
                            loadingDashboard ? <SvgLoader size={20} /> :
                            dashboardError ? "-" :
                            dashboard?.metrics?.total_htes ?? "-"
                        }
                        cardDate={
                            dashboard?.last_updated
                                ? new Date(dashboard.last_updated).toLocaleDateString()
                                : "-"
                        }
                    />
                </Link>

                <Link to={"/admUploads"}>
                    <AdmCard
                        hasRibbon
                        cardTitle="Uploaded Documents"
                        cardIcon={<FileCheck color="#377268" />}
                        cardNumber={
                            loadingDashboard ? <SvgLoader size={30} /> :
                            dashboardError ? "-" :
                            dashboard?.metrics?.total_uploaded_documents ?? "-"
                        }
                        cardDate={
                            dashboard?.last_updated
                                ? new Date(dashboard.last_updated).toLocaleDateString()
                                : "-"
                        }
                    />
                </Link>

                {/* <a href='#announcements'>
                    <AdmCard
                        cardTitle="Total Announcements Posted"
                        cardIcon={<Megaphone color="#377268" />}
                        cardNumber={totalAnnouncements}
                        cardDate={
                            latestAnnouncement?.created_at
                                ? new Date(latestAnnouncement.created_at).toLocaleDateString()
                                : "-"
                        }
                    />
                </a>

                <a href='#notifications'>
                    <AdmCard
                        cardTitle="Total Notifications"
                        cardIcon={<Bell color="#377268" />}
                        cardNumber={totalNotifications}
                        cardDate={
                            latestNotification?.date
                                ? new Date(latestNotification.date).toLocaleDateString()
                                : "-"
                        }
                    />
                </a> */}
            </section>
            
            {/* <section className='w-[90%] p-5 flex gap-3 justify-center items-center'>
                   <PieChart
                        items={[
                            { label: "Active MOA", value: 18, color: "#16a34a" },
                            { label: "Expired MOA", value: 7, color: "#dc2626" },
                        ]}
                    />
            </section> */}

            <div className='flex justify-start items-start w-[90%]'>
                <Title text={"Post Announcements"} />
            </div>

            <section className='p-5 w-[90%]  flex flex-row justify-between items-start gap-5 font-oasis-text text-oasis-button-dark'>
                <form
                    className='w-[70%] min-h-24 p-10 bg-admin-element flex flex-col items-start justify-center gap-5 text-black rounded-3xl'
                    onSubmit={(e) => {
                        e.preventDefault();
                        handlePost(e);
                    }}
                >
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

                    <Label labelText={"Filter Announcements"} />
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

                    <div className='w-full flex flex-col gap-3 max-h-100 overflow-y-auto p-5'>
                        {filteredAnnouncements.map(a => (
                            <section
                                key={a.id}
                                className="w-full bg-oasis-gradient rounded-3xl px-5 flex flex-row items-center justify-evenly shadow-[2px_2px_2px_rgba(0,0,0,1)]"
                            >
                                <div className="p-5 w-full text-black rounded-2xl">
                                    <p className="text-[0.8rem] text-black italic font-normal mb-5">
                                        {a.created_at ? new Date(a.created_at).toLocaleDateString() : "-"}
                                    </p>
                                    <h3 className="text-[1rem] font-bold">{a.title}</h3>
                                    <p className="text-[0.8rem] font-medium line-clamp-2">{a.content}</p>
                                </div>

                                <div className="w-[50%] flex flex-row gap-10">
                                    <AnnounceButton
                                        icon={<Eye />}
                                        btnText="View"
                                        onClick={() => setSelectedAnnouncement(a)}
                                    />
                                    <AnnounceButton
                                        btnText="Delete"
                                        onClick={() => {
                                            setAnnouncementToDelete(a);
                                            setDeleteModalShow(true);
                                        }}
                                    />
                                </div>
                            </section>
                        ))}
                    </div>
                    
                </form>

                <div id='notifications' className='w-[25%] rounded-3xl min-h-24 max-h-screen px-10 overflow-y-auto bg-admin-element'>
                    <div className='sticky top-0 bg-admin-element w-full'>
                        <p className='text-[0.8rem] mb-5 font-black py-5'>Notifications</p>
                    </div>
                    

                    {alerts.length === 0 && (
                        <p className="text-[0.7rem] text-gray-500">No alerts</p>
                    )}

                    {alerts.map(alert => (
                        <div key={alert.id}>
                            <div
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

        </AdminScreen>
    );
}