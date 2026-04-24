import AdminScreen from '../../layouts/adminScreen.jsx';
import Title from "../../utilities/title.jsx";
import { AdmCard } from "../../utilities/card.jsx";
import { UsersRound, Book, BookAlert, BookPlus, Building2, Check, X, Eye, Trash} from 'lucide-react';
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
import { OasisPieChart, OasisBarChart } from '../../components/Charts.jsx';

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
    // DISABLE after posting announcemnet
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
                console.log("DASHBOARD DATA LOADED:", res.data); // Log res.data directly
            } catch (err) {
                console.error("Dashboard error:", err.response?.data || err.message);
                setDashboardError(err.message);
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
        const currentTitle = title; // Capture title immediately

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

        const payload = {
            title,
            content,
            category: CATEGORY_TO_ENUM[category] || category
        };

        console.log("DEBUG: Sending Payload to Local Backend:", payload);

        try {
            await AdminAPI.createAnnouncement(payload);

            setTitle("");
            setContent("");
            setCategory("HTE Related");
            setPopup({
                title: "Success",
                text: `Posted announcement: ${currentTitle}`,
                icon: <Check size={50} />,
                type: "success",
                time: 2000
            });

            const res = await AdminAPI.getAnnouncements();
            setAnnouncements(res.data);
        } catch (err) {
            let errorMsg = "Server error";
            
            // If the server returns HTML (500 error), try to find the error message in the text
            if (typeof err.response?.data === 'string' && err.response.data.includes("<html")) {
                console.error("FULL SERVER HTML ERROR:", err.response.data);
                // Try to extract a specific SQL error if it exists in the HTML
                const sqlErrorMatch = err.response.data.match(/error: (.*)/i) || err.response.data.match(/column "(.*)"/i);
                if (sqlErrorMatch) {
                    errorMsg = `DB Error: ${sqlErrorMatch[0]}`;
                } else {
                    errorMsg = "Internal Server Error (Check Backend Terminal for SQL logs)";
                }
            } else {
                errorMsg = err.response?.data?.message || err.message;
            }

            console.error("Post Error Details:", errorMsg);
            setPopup({
                title: "Failed",
                text: errorMsg,
                icon: <X size={50} />,
                type: "failed",
                time: 5000 // Give more time to read the error
            });
        }
    };

    const handleDelete = async (id) => {
        await AdminAPI.deleteAnnouncement(id);
        setAnnouncements(prev => prev.filter(a => a.id !== id));

        const deletedAnnouncement = announcementToDelete?.title || "announcement";

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
                <Title text="Admin Dashboard" size='text-[1.5rem] md:text-[2rem]'/>
                <Subtitle text={"Overview of admin information, and management of announcements."}/>
            </div>

            {/* METRICS & CHARTS GRID */}
            <section className="w-[90%] p-2 md:p-5 gap-4 md:gap-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">

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
                        ribbonColor={"bg-oasis-header"}
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
                        hasRibbon={true}
                        ribbonColor={"bg-oasis-aqua"}
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
                        hasRibbon={true}
                        ribbonColor={"bg-purple-700"}
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
                        hasRibbon={true}
                        ribbonColor={"bg-black"}
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

                {/* CHARTS SUB-GRID */}
                <div className='col-span-1 sm:col-span-2 lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 md:p-10 border border-gray-200 rounded-3xl bg-white shadow-sm mt-5'>
                    <div className="flex flex-col items-center w-full min-w-0">
                        <Subtitle text="MOA Status Distribution" weight="font-bold" />
                        <div className="w-full flex justify-center overflow-hidden">
                            <OasisPieChart
                                items={[
                                    {   label: "Active MOA", 
                                        value: dashboard?.metrics?.total_active_moas ?? 0, 
                                        color: "#2B6259" 
                                    },
                                    { 
                                        label: "Expired MOA", 
                                        value: dashboard?.metrics?.total_expired_moas ?? 0, 
                                        color: "#800020" 
                                    }
                                ]}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col items-center w-full min-w-0">
                        <Subtitle text="System Overview Metrics" weight="font-bold" />
                        <div className="w-full flex justify-center overflow-hidden">
                            <OasisBarChart
                                data={[
                                    { name: 'Students', value: dashboard?.metrics?.total_students ?? 0, color: '#00D0FF'},
                                    { name: 'HTEs', value: dashboard?.metrics?.total_htes ?? 0 },
                                    { name: 'Prospects', value: dashboard?.metrics?.total_moa_prospects ?? 0 },
                                ]}
                            />
                        </div>
                    </div>
                </div>
            </section>

            <div className='flex justify-start items-start w-[90%] mb-5'>
                <Title text={"Post Announcements"} size="text-[1.5rem] md:text-[2rem]" />
            </div>

            <section className='w-full px-4 md:px-0 md:w-[90%] grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10 font-oasis-text text-oasis-button-dark min-w-0'>
                {/* POSTING FORM & FEED */}
                <div className='lg:col-span-8 flex flex-col gap-6 w-full min-w-0'>
                    <form
                        className='w-full p-4 md:p-6 lg:p-10 bg-admin-element flex flex-col items-start justify-center gap-5 text-black rounded-3xl shadow-sm overflow-hidden box-border min-w-0'
                        onSubmit={(e) => {
                            e.preventDefault();
                            handlePost(e);
                        }}
                    >
                        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5 min-w-0">
                            <div className="md:col-span-2 w-full min-w-0">
                                <SingleField
                                    labelText="Announcement Title"
                                    fieldHolder="Enter title..."
                                    fieldId="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            <div className="md:col-span-2 w-full min-w-0">
                                <MultiField
                                    labelText="Announcement Content"
                                    fieldHolder="Enter contents..."
                                    fieldId="content"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                />
                            </div>

                            <div className='w-full min-w-0'>
                                <Dropdown
                                    labelText="Select Category"
                                    categories={categories}
                                    value={category}
                                    onChange={setCategory}
                                />
                            </div>
                            
                            <div className='flex items-end w-full min-w-0'>
                                <AnnounceButton btnText="Post" type="submit" className="w-full" />
                            </div>
                        </div>

                        <div className="w-full mt-5 max-w-full min-w-0">
                            <Label labelText={"Filter Announcements"} />
                            <section id='announcements' className='w-full flex flex-wrap items-center justify-start gap-2 mt-2 overflow-hidden'>
                                {["All", "HTE Related", "Deadlines", "Newly Approved HTEs", "Events and Webinars", "Others"].map(f => (
                                    <Filter
                                        key={f}
                                        text={f}
                                        onClick={() => setActiveFilter(f)}
                                        isActive={activeFilter === f}
                                    />
                                ))}
                            </section>
                        </div>

                        <div className="w-full max-w-full min-w-0">
                            <Label labelText={"Search by Title"} />
                            <div className="w-full mt-2 min-w-0">
                                <input
                                    className="w-full max-w-full p-3 bg-white border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-oasis-header transition-all text-sm md:text-base box-border min-w-0"
                                    placeholder="Search announcements title..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className='w-full flex flex-col gap-4 max-h-[500px] md:max-h-[600px] overflow-y-auto p-1 md:p-2 custom-scrollbar overflow-x-hidden min-w-0'>
                            {filteredAnnouncements.length === 0 ? (
                                <p className="text-center text-gray-500 py-10 italic text-sm">No announcements found</p>
                            ) : (
                                filteredAnnouncements.map(a => (
                                    <section
                                        key={a.id}
                                        className="w-full bg-oasis-gradient rounded-2xl p-3 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-md border border-gray-100 box-border min-w-0 overflow-hidden"
                                    >
                                        <div className="w-full min-w-0 flex-1 overflow-hidden">
                                            <p className="text-[0.6rem] md:text-[0.7rem] text-black italic font-normal mb-0.5">
                                                {a.created_at ? new Date(a.created_at).toLocaleDateString() : "-"}
                                            </p>
                                            <h3 className="text-[0.85rem] md:text-[1rem] font-bold text-gray-800 truncate block w-full">{a.title}</h3>
                                            <p className="text-[0.7rem] md:text-[0.8rem] font-medium line-clamp-2 text-gray-600 break-words">{a.content}</p>
                                        </div>

                                        <div className="flex flex-row gap-2 w-full md:w-auto shrink-0 mt-1 md:mt-0">
                                            <AnnounceButton
                                                icon={<Eye size={12}/>}
                                                btnText="View"
                                                onClick={() => setSelectedAnnouncement(a)}
                                                className="flex-1 md:flex-none py-1 px-2 text-[0.6rem] md:text-xs"
                                            />
                                            <AnnounceButton
                                                icon={<Trash size={12}/>}
                                                btnText="Delete"
                                                onClick={() => {
                                                    setAnnouncementToDelete(a);
                                                    setDeleteModalShow(true);
                                                }}
                                                className="flex-1 md:flex-none py-1 px-2 text-[0.6rem] md:text-xs"
                                            />
                                        </div>
                                    </section>
                                ))
                            )}
                        </div>
                    </form>
                </div>

                {/* NOTIFICATIONS SIDEBAR */}
                <div id='notifications' className='lg:col-span-4 w-full rounded-3xl bg-admin-element flex flex-col max-h-[1000px] shadow-sm border border-gray-100 overflow-hidden'>
                    <div className='sticky top-0 bg-admin-element w-full px-6 lg:px-10 py-5 border-b border-gray-200 z-10'>
                        <p className='text-[0.9rem] font-black'>System Notifications</p>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto px-6 lg:px-10 py-5 flex flex-col gap-4 custom-scrollbar">
                        {alerts.length === 0 && (
                            <p className="text-[0.8rem] text-gray-500 italic text-center py-10">No alerts available</p>
                        )}

                        {alerts.map(alert => (
                            <div key={alert.id}>
                                <div
                                    className='w-full bg-white p-4 rounded-2xl border-l-4 border-l-oasis-button-dark border border-gray-100 hover:shadow-md transition-all cursor-default'
                                >
                                    <h3 className='text-[0.8rem] font-bold text-gray-800'>{alert.title}</h3>
                                    <p className='text-[0.75rem] font-light text-gray-600 mt-1'>{alert.message}</p>
                                    <p className='text-[0.65rem] text-gray-400 mt-2 font-medium'>
                                        {alert.date ? new Date(alert.date).toLocaleDateString() : ""}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

        </AdminScreen>
    );
}