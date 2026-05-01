import AdminScreen from '../../layouts/adminScreen.jsx';
import Title from "../../utilities/title.jsx";
import { Bell, Calendar, ChevronRight, FileText, AlertCircle, Clock } from "lucide-react";
import { useEffect, useState } from 'react';
import Subtitle from '../../utilities/subtitle.jsx';
import { AdminAPI } from "../../api/admin.api";

export default function AdmNotifications() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("ALL");

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                setLoading(true);
                const res = await AdminAPI.getAdminAlerts();
                setAlerts(res.data || []);
            } catch (err) {
                console.error("Failed to fetch alerts:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAlerts();
    }, []);

    const filteredAlerts = alerts.filter(alert => {
        if (activeTab === "ALL") return true;
        if (activeTab === "EXPIRED") return alert.type === "MOA_EXPIRED";
        if (activeTab === "EXPIRING") return alert.type === "MOA_EXPIRING";
        if (activeTab === "PROSPECTS") return alert.type === "MOA_PROSPECT";
        return true;
    });

    const getIcon = (type) => {
        switch (type) {
            case "MOA_EXPIRED":
                return <AlertCircle className="text-oasis-red" size={24} />;
            case "MOA_EXPIRING":
                return <Clock className="text-oasis-button-light" size={24} />;
            case "MOA_PROSPECT":
                return <FileText className="text-oasis-aqua" size={24} />;
            default:
                return <Bell className="text-oasis-header" size={24} />;
        }
    };

    const getTypeLabel = (type) => {
        return type.replace(/_/g, " ");
    };

    return (
        <AdminScreen>
            <div className="w-[90%] flex flex-col gap-5">

                <div className='w-[90%] flex flex-col gap-3 items-start justify-center border-b border-gray-400 py-5'>
                    <Title text="Notifications" size='text-[2rem]'/>
                    <Subtitle text={"A complete list of all administrative alerts and system notifications."}/>
                </div>

                {/* TABS */}
                <div className='flex flex-row gap-3 items-center mt-2'>
                    <Subtitle
                        text="All"
                        onClick={() => setActiveTab("ALL")}
                        isActive={activeTab === "ALL"}
                        isLink
                        weight={"font-bold"}
                        size="text-[1rem]"
                        className={"rounded-2xl"}
                    />
                    <Subtitle text="|" size="text-[1rem]" />
                    <Subtitle
                        text="Expired"
                        onClick={() => setActiveTab("EXPIRED")}
                        isActive={activeTab === "EXPIRED"}
                        isLink
                        weight={"font-bold"}
                        size="text-[1rem]"
                        className={"rounded-2xl"}
                    />
                    <Subtitle text="|" size="text-[1rem]" />
                    <Subtitle
                        text="Expiring Soon"
                        onClick={() => setActiveTab("EXPIRING")}
                        isActive={activeTab === "EXPIRING"}
                        isLink
                        weight={"font-bold"}
                        size="text-[1rem]"
                        className={"rounded-2xl"}
                    />
                    <Subtitle text="|" size="text-[1rem]" />
                    <Subtitle
                        text="Prospects"
                        onClick={() => setActiveTab("PROSPECTS")}
                        isActive={activeTab === "PROSPECTS"}
                        isLink
                        weight={"font-bold"}
                        size="text-[1rem]"
                        className={"rounded-2xl"}
                    />
                </div>

                <div className="flex flex-col gap-4 mt-5">
                    {loading ? (
                        <div className="flex flex-col gap-4 animate-pulse">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-24 bg-gray-100 rounded-2xl w-full" />
                            ))}
                        </div>
                    ) : filteredAlerts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                            <Bell size={48} className="text-gray-300 mb-4" />
                            <Subtitle text={`No ${activeTab !== "ALL" ? activeTab.toLowerCase().replace(/_/g, " ") : ""} notifications available yet.`} color="text-gray-400" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {filteredAlerts.map((alert) => (
                                <div 
                                    key={alert.id}
                                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6 hover:shadow-md transition-all duration-300 group cursor-pointer"
                                >
                                    <div className="p-4 bg-gray-50 rounded-xl group-hover:bg-oasis-aqua/10 transition-colors">
                                        {getIcon(alert.type)}
                                    </div>

                                    <div className="flex-1 flex flex-col gap-1">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[0.65rem] font-black uppercase tracking-widest text-oasis-aqua bg-oasis-aqua/10 px-2 py-0.5 rounded">
                                                {getTypeLabel(alert.type)}
                                            </span>
                                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                                <Calendar size={12} />
                                                {new Date(alert.date).toLocaleDateString(undefined, { 
                                                    year: 'numeric', 
                                                    month: 'long', 
                                                    day: 'numeric' 
                                                })}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-oasis-header">{alert.title}</h3>
                                        <p className="text-gray-600 whitespace-pre-wrap">{alert.message}</p>
                                    </div>

                                    <div className="p-2 text-gray-300 group-hover:text-oasis-aqua transition-colors">
                                        <ChevronRight size={24} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminScreen>
    );
}
