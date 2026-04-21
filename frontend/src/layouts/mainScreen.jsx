import { Header, StudentHeader } from '../components/headers'
import Footer from '../components/footer'   
import OrbiChatbot from '../components/OrbiChatbot';
import ProspectMoaForm from '../components/prospectMoaForm';
import { AnnouncementModal } from '../components/userModal';
import { useState, useEffect } from 'react';
import { NotificationAPI } from '../api/notification.api';
import { getRole } from '../api/token';

export default function MainScreen({ children, showHeader = true, hasTopMargin = true }) {
    const userRole = getRole();
    const isAdmin = userRole === "admin" || userRole === "ADMIN";
    const isStudent = userRole === "student" || userRole === "STUDENT";

    const [activeModal, setActiveModal] = useState(null);
    const [notifications, setNotifications] = useState([]);

    const loadNotifications = async () => {
        if (!isStudent) return;
        try {
            const res = await NotificationAPI.getStudentNotifications();
            setNotifications(res.data || []);
        } catch (err) {
            console.error("Failed to load notifications:", err);
        }
    };

    useEffect(() => {
        if (isStudent) {
            loadNotifications();
            const interval = setInterval(loadNotifications, 5000);
            return () => clearInterval(interval);
        }
    }, [isStudent]);

    const getModalContent = () => {
        switch (activeModal) {
            case 'privacy':
                return {
                    title: "Privacy Policy",
                    content: (
                        <div className="flex flex-col gap-4 text-sm leading-relaxed text-gray-700">
                            <p className="italic text-gray-500">Last Updated: April 2026</p>
                            
                            <section>
                                <h3 className="font-bold text-gray-900">1. Introduction</h3>
                                <p>OASIS (OJT Administration, Support, and Information System) is committed to protecting the privacy of PUP ITech students and administrative staff. This policy outlines how we collect, use, and safeguard your personal and academic data within our digital ecosystem.</p>
                            </section>

                            <section>
                                <h3 className="font-bold text-gray-900">2. Data Collection</h3>
                                <p>We collect the following information to facilitate efficient OJT coordination:</p>
                                <ul className="list-disc ml-5 mt-1 space-y-1">
                                    <li><strong>Personal Identification:</strong> Full name, student number, and contact details.</li>
                                    <li><strong>Academic Records:</strong> Course, year level, and OJT eligibility status.</li>
                                    <li><strong>Documents:</strong> Uploaded resumes, MOAs, and personal identification documents.</li>
                                    <li><strong>Chatbot Data:</strong> Interaction logs from ORBI (OJT Resource Bot for ITech).</li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="font-bold text-gray-900">3. Use of Data</h3>
                                <p>Your data is used strictly for academic and administrative purposes, specifically:</p>
                                <ul className="list-disc ml-5 mt-1 space-y-1">
                                    <li>Managing and tracking Memoranda of Agreement (MOAs).</li>
                                    <li>Centralizing OJT document storage for institutional reliability.</li>
                                    <li>Providing automated support via the ORBI AI feature.</li>
                                    <li>Improving administrative efficiency and data accuracy.</li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="font-bold text-gray-900">4. Data Security</h3>
                                <p>OASIS employs centralized secure storage to prevent unauthorized access, alteration, or disclosure of student records. Access is restricted to authorized OJT Coordinators and administrators of PUP ITech.</p>
                            </section>
                            
                            <p className="mt-2 text-xs text-gray-500 border-t pt-4">
                                By using OASIS, you consent to the collection and processing of your data as described in this policy.
                            </p>
                        </div>
                    )
                };
            case 'terms':
                return {
                    title: "Terms & Conditions",
                    content: (
                        <div className="flex flex-col gap-4 text-sm text-gray-700 leading-relaxed">
                            <p className="italic text-gray-500">Last Updated: April 2026</p>

                            <section>
                                <h3 className="font-bold text-gray-900 uppercase text-xs tracking-wider mb-1">1. Acceptance of Terms</h3>
                                <p>By accessing OASIS (OJT Administration, Support, and Information System), you agree to comply with these terms designed to ensure a transparent, efficient, and data-driven internship coordination process for PUP ITech.</p>
                            </section>

                            <section>
                                <h3 className="font-bold text-gray-900 uppercase text-xs tracking-wider mb-1">2. User Responsibilities</h3>
                                <p>Users are expected to maintain the integrity of the OJT process by:</p>
                                <ul className="list-disc ml-5 space-y-1 mt-1">
                                    <li>Providing accurate academic and personal data for centralized storage.</li>
                                    <li>Ensuring all uploaded OJT requirements and MOA documents are authentic and up-to-date.</li>
                                    <li>Maintaining the confidentiality of account credentials to protect sensitive internship records.</li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="font-bold text-gray-900 uppercase text-xs tracking-wider mb-1">3. Use of ORBI (AI Chatbot)</h3>
                                <p>ORBI is provided to simplify access to internship resources. Users agree not to misuse the chatbot feature, inject malicious prompts, or use the automated support for purposes other than inquiring about OJT procedures and requirements.</p>
                            </section>

                            <section>
                                <h3 className="font-bold text-gray-900 uppercase text-xs tracking-wider mb-1">4. System Limitations & Digital Transformation</h3>
                                <p>As OASIS connects traditional coordination with modern digital practices, users acknowledge that the system is a support tool. While we strive for high reliability and data accuracy, official OJT credit remains subject to the final verification of the PUP ITech OJT Coordination Office.</p>
                            </section>

                            <section>
                                <h3 className="font-bold text-gray-900 uppercase text-xs tracking-wider mb-1">5. Prohibited Activities</h3>
                                <p>Any attempt to bypass system security, automate repetitive tasks via unauthorized scripts, or interfere with the centralized data management of other students will result in immediate suspension of access.</p>
                            </section>

                            <p className="text-xs text-gray-500 mt-2 italic border-t pt-4">
                                Usage of this system constitutes an agreement to advance the digital transformation goals of PUP ITech.
                            </p>
                        </div>
                    )
                };
            case 'copyright':
                return {
                    title: "Copyright Notice",
                    content: (
                        <div className="flex flex-col gap-4 text-sm text-gray-700 text-center">
                            <p className="font-bold">© 2026 OASIS Development Team | PUP ITech</p>
                            <p>All intellectual property rights for the OASIS web application and ORBI chatbot logic are owned by the student researchers and PUP ITech.</p>
                        </div>
                    )
                };
            default:
                return null;
        }
    };

    const modalData = getModalContent();

    return (
        <div className="w-full h-full bg-page-white flex flex-col justify-center items-center overflow-x-hidden overflow-y-auto">
            {isAdmin ? (
                <Header admin notifications={notifications} setNotifications={setNotifications} />
            ) : (
                <Header notifications={notifications} setNotifications={setNotifications} />
            )}
            {showHeader ? (
                <StudentHeader 
                    notifications={notifications} 
                    setNotifications={setNotifications} 
                />
            ) : ""}
            {hasTopMargin ? <div className='mt-25'></div> : ""}
            
            {children}

            <OrbiChatbot />

            <AnnouncementModal
                visible={!!activeModal}
                onClose={() => setActiveModal(null)}
                title={modalData?.title}
                content={modalData?.content}
            />

            <div className='my-20'></div>
            <ProspectMoaForm />

            <Footer onOpenModal={setActiveModal} />
        </div>
    );
}