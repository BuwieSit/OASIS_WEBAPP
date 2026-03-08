import { useEffect, useState } from 'react';
import MainScreen from '../../layouts/mainScreen';
import Title from '../../utilities/title';
import Subtitle from '../../utilities/subtitle';
import useQueryParam from '../../hooks/useQueryParams';
import FormDownloadable from '../../components/formDownloadable';
import api from '../../api/axios.jsx';

const SECTION_KEYS = {
    procedures: "Procedures",
    moa: "MOA Process",
    guidelines: "Key Guidelines",
    forms: "Internship Forms and Templates"
};

const TAB_KEY_MAP = {
    procedures: "procedures",
    moa: "moa",
    moaprocess: "moa",
    guidelines: "guidelines",
    keyguidelines: "guidelines",
    forms: "forms",
    formstemplates: "forms"
};

function normalizeTabKey(tab) {
    return TAB_KEY_MAP[tab] || "procedures";
}

export default function OjtHub() {
    const [activeFilterParam, setActiveFilter] = useQueryParam("tab", "procedures");
    const activeFilter = normalizeTabKey(activeFilterParam);

    const [sections, setSections] = useState({
        procedures: [],
        moa: [],
        guidelines: [],
        forms: []
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const normalized = normalizeTabKey(activeFilterParam);
        if (normalized !== activeFilterParam) {
            setActiveFilter(normalized);
        }
    }, [activeFilterParam, setActiveFilter]);

    useEffect(() => {
        loadAllSections();
    }, []);

    async function loadAllSections() {
        try {
            setLoading(true);
            const response = await api.get("/api/documents/student/all");

            setSections({
                procedures: response?.data?.procedures || [],
                moa: response?.data?.moa || [],
                guidelines: response?.data?.guidelines || [],
                forms: response?.data?.forms || []
            });
        } catch (error) {
            console.error("Failed to load OJT hub content:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <MainScreen>
            <div className="w-full flex flex-col items-center mb-10 px-4 text-center">
                <Title
                    text={"OJT Hub"}
                    size="text-2xl sm:text-3xl md:text-base lg:text-5xl"
                />
                <Subtitle
                    size="text-xs sm:text-sm md:text-base"
                    color="text-oasis-button-dark"
                    text="Access internship procedures, MOA process, key guidelines, and downloadable forms prepared by the admin."
                    isCenter
                />
            </div>

            <div className="
                w-full
                px-4 sm:px-8 lg:px-16
                py-10
                flex
                flex-col lg:flex-row
                gap-10
                items-start
                transition duration-500 ease-in-out
            ">
                <div className="
                    w-full
                    lg:w-[260px]
                    bg-linear-to-top bg-oasis-gradient
                    p-4 sm:p-5
                    rounded-3xl
                    lg:sticky lg:top-10
                ">
                    <section className="w-full border-b-2 py-2">
                        <Subtitle text={"Contents"} size={"text-base"} weight={"font-bold"} />
                    </section>

                    <section className="
                        w-full
                        flex
                        flex-wrap
                        lg:flex-col
                        gap-5
                        mt-4
                        justify-center
                    ">
                        <SideNavText
                            text={"Procedures"}
                            onClick={() => setActiveFilter("procedures")}
                            isActive={activeFilter === "procedures"}
                        />

                        <SideNavText
                            text={"MOA Process"}
                            onClick={() => setActiveFilter("moa")}
                            isActive={activeFilter === "moa"}
                        />

                        <SideNavText
                            text={"Key Guidelines"}
                            onClick={() => setActiveFilter("guidelines")}
                            isActive={activeFilter === "guidelines"}
                        />

                        <SideNavText
                            text={"Internship Forms and Templates"}
                            onClick={() => setActiveFilter("forms")}
                            isActive={activeFilter === "forms"}
                        />
                    </section>
                </div>

                <div className="
                    w-full
                    lg:flex-1
                    flex
                    flex-col
                    gap-16
                ">
                    {loading ? (
                        <div className="w-full py-10">
                            <Subtitle text="Loading OJT Hub content..." />
                        </div>
                    ) : (
                        <DynamicSection
                            sectionKey={activeFilter}
                            title={SECTION_KEYS[activeFilter]}
                            items={sections[activeFilter] || []}
                        />
                    )}
                </div>
            </div>
        </MainScreen>
    );
}

export function SideNavText({ text, link, isActive = false, onClick }) {
    return (
        <div className='py-2 duration-300 transition ease-in-out'>
            <a
                href={`#${link || ""}`}
                className={`text-[0.9rem] font-oasis-text cursor-pointer hover:underline underline-offset-2 hover:text-oasis-button-dark
                ${isActive ? "underline underline-offset-2 text-oasis-button-dark" : ""}
                `}
                onClick={onClick}
            >
                {text}
            </a>
        </div>
    );
}

export function DynamicSection({ sectionKey, title, items = [] }) {
    return (
        <section className='w-full flex flex-col items-start justify-center gap-5'>
            <Title text={title} isAnimated={false} id={sectionKey} />
            <div className='w-full border'></div>

            {items.length === 0 ? (
                <Subtitle
                    size={"text-[0.9rem]"}
                    text={"No content available yet for this section."}
                />
            ) : (
                <StudentTreeRenderer items={items} sectionKey={sectionKey} />
            )}
        </section>
    );
}

export function StudentTreeRenderer({ items = [], sectionKey }) {
    if (!items.length) return null;

    return (
        <div className="w-full flex flex-col gap-4">
            {items.map((item) => (
                <StudentItemRenderer
                    key={item.id}
                    item={item}
                    sectionKey={sectionKey}
                />
            ))}
        </div>
    );
}

export function StudentItemRenderer({ item, sectionKey }) {
    const hasChildren = item.children && item.children.length > 0;

    if (item.type === "header") {
        return (
            <div className="w-full flex flex-col gap-3">
                <h2 className="font-oasis-title font-bold text-[1.3rem]">
                    {item.title}
                </h2>

                {item.description && (
                    <p className="text-[0.95rem] font-oasis-text whitespace-pre-wrap">
                        {item.description}
                    </p>
                )}

                {hasChildren && (
                    <div className="pl-2">
                        <StudentTreeRenderer items={item.children} sectionKey={sectionKey} />
                    </div>
                )}
            </div>
        );
    }

    if (item.type === "description") {
        return (
            <div className="w-full flex flex-col gap-3">
                <p className="text-[0.95rem] font-oasis-text whitespace-pre-wrap">
                    {item.description || item.title}
                </p>

                {hasChildren && (
                    <div className="pl-2">
                        <StudentTreeRenderer items={item.children} sectionKey={sectionKey} />
                    </div>
                )}
            </div>
        );
    }

    if (item.type === "document") {
        return (
            <div className="w-full flex flex-col gap-3">
                <FormDownloadable
                    text={item.title}
                    link={item.downloadUrl || item.file}
                />

                {item.description && (
                    <p className="text-[0.9rem] font-oasis-text whitespace-pre-wrap">
                        {item.description}
                    </p>
                )}

                {hasChildren && (
                    <div className="pl-2">
                        <StudentTreeRenderer items={item.children} sectionKey={sectionKey} />
                    </div>
                )}
            </div>
        );
    }

    if (
        item.type === "numerical_list" ||
        item.type === "bulleted_list" ||
        item.type === "alphabetical_list"
    ) {
        return (
            <div className="w-full">
                <ListBlock item={item} sectionKey={sectionKey} />
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-3">
            <p className="text-[0.95rem] font-oasis-text whitespace-pre-wrap">
                {item.title}
            </p>

            {item.description && (
                <p className="text-[0.9rem] font-oasis-text whitespace-pre-wrap">
                    {item.description}
                </p>
            )}

            {hasChildren && (
                <div className="pl-2">
                    <StudentTreeRenderer items={item.children} sectionKey={sectionKey} />
                </div>
            )}
        </div>
    );
}

export function ListBlock({ item, sectionKey }) {
    const hasChildren = item.children && item.children.length > 0;

    if (item.type === "numerical_list") {
        return (
            <ol className="list-decimal px-8 py-1 text-justify flex flex-col gap-2 text-[1rem] font-oasis-text">
                <li>
                    <span className="whitespace-pre-wrap">{item.title}</span>

                    {item.description && (
                        <div className="whitespace-pre-wrap mt-1">{item.description}</div>
                    )}

                    {hasChildren && (
                        <div className="mt-2">
                            <StudentTreeRenderer items={item.children} sectionKey={sectionKey} />
                        </div>
                    )}
                </li>
            </ol>
        );
    }

    if (item.type === "bulleted_list") {
        return (
            <ul className="list-disc px-8 py-1 text-justify flex flex-col gap-2 text-[1rem] font-oasis-text">
                <li>
                    <span className="whitespace-pre-wrap">{item.title}</span>

                    {item.description && (
                        <div className="whitespace-pre-wrap mt-1">{item.description}</div>
                    )}

                    {hasChildren && (
                        <div className="mt-2">
                            <StudentTreeRenderer items={item.children} sectionKey={sectionKey} />
                        </div>
                    )}
                </li>
            </ul>
        );
    }

    return (
        <ol className="list-[lower-alpha] px-8 py-1 text-justify flex flex-col gap-2 text-[1rem] font-oasis-text">
            <li>
                <span className="whitespace-pre-wrap">{item.title}</span>

                {item.description && (
                    <div className="whitespace-pre-wrap mt-1">{item.description}</div>
                )}

                {hasChildren && (
                    <div className="mt-2">
                        <StudentTreeRenderer items={item.children} sectionKey={sectionKey} />
                    </div>
                )}
            </li>
        </ol>
    );
}




// CONNECTED TO BACKEND

// import MainScreen from '../../layouts/mainScreen';
// import Accordion from '../../components/accordion';
// import Title from '../../utilities/title';
// import Subtitle from '../../utilities/subtitle';
// import Download from "../../assets/icons/download.png";
// import useQueryParam from '../../hooks/useQueryParams';
// import { DownloadIcon } from 'lucide-react';
// import FormDownloadable from '../../components/formDownloadable';

// export default function OjtHub() {
    
//     const [activeFilter, setActiveFilter] = useQueryParam("tab", "guidelines");

    
//     return(
//         <>
//             <MainScreen>
//                 <div className="w-full flex flex-col items-center mb-10 px-4 text-center">
//                     <Title 
//                         text={"OJT Hub"} 
//                         size="text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
//                     />
//                     <Subtitle
//                         size="text-xs sm:text-sm md:text-base"
//                         color="text-oasis-button-dark"
//                         text="See the lists of HTEs with their MOA and significant details; See the reviews about HTEs and make a review yourself!"
//                         isCenter
//                     />
//                 </div>

//                 {/* PARENT CONTAINER */}
//                 <div className="
//                     w-full
//                     px-4 sm:px-8 lg:px-16
//                     py-10
//                     flex
//                     flex-col lg:flex-row
//                     gap-10
//                     items-start
//                     transition duration-500 ease-in-out
//                 ">
//                     {/* SIDENAV */}
//                     <div className="
//                         w-full
//                         lg:w-[260px]
//                         bg-linear-to-top bg-oasis-gradient
//                         p-4 sm:p-5
//                         rounded-3xl
//                         lg:sticky lg:top-10
//                     ">

//                         <section className="w-full border-b-2 py-2">
//                             <Subtitle text={"Contents"} size={"text-base"} weight={"font-bold"} />
//                         </section>

//                         {/* MOBILE = horizontal scroll row */}
//                         {/* DESKTOP = vertical column */}
//                         <section className="
//                             w-full
//                             flex
//                             flex-wrap
//                             lg:flex-col
//                             gap-5
//                             mt-4
//                             justify-center
//                         ">

//                             <SideNavText 
//                                 text={"Guidelines"} 
//                                 onClick={() => setActiveFilter("guidelines")}
//                                 isActive={activeFilter === "guidelines"}
//                             />

//                             <SideNavText 
//                                 text={"OJT Journey"} 
//                                 onClick={() => setActiveFilter("ojtjourney")}
//                                 isActive={activeFilter === "ojtjourney"}
//                             />
//                             <SideNavText 
//                                 text={"MOA Process"} 
//                                 onClick={() => setActiveFilter("moaprocess")}
//                                 isActive={activeFilter === "moaprocess"}
//                             />
//                             <SideNavText 
//                                 text={"Key Guidelines"}
//                                 onClick={() => setActiveFilter("keyguidelines")}
//                                 isActive={activeFilter === "keyguidelines"} 
//                             />
//                             <SideNavText 
//                                 text={"Internship Forms and Templates"} 
//                                 onClick={() => setActiveFilter("formstemplates")}
//                                 isActive={activeFilter === "formstemplates"} 
//                             />
//                             <SideNavText 
//                                 text={"OJT Portfolio"} 
//                                 onClick={() => setActiveFilter("ojtportfolio")}
//                                 isActive={activeFilter === "ojtportfolio"} 
//                             />

//                         </section>
//                     </div>

//                     {/* CONTENT */}
//                     <div className="
//                         w-full
//                         lg:flex-1
//                         flex
//                         flex-col
//                         gap-16
//                     ">
//                         {activeFilter === "guidelines" && <Guidelines/>}
//                         {activeFilter === "ojtjourney" && <OjtJourney/>}
//                         {activeFilter === "moaprocess" && <MoaProcess/>}
//                         {activeFilter === "keyguidelines" && <KeyGuidelines/>}
//                         {activeFilter === "formstemplates" && <FormsTemplates/>}
//                         {activeFilter === "ojtportfolio" && <OjtPortfolio/>}
//                     </div>

//                 </div>
               
//             </MainScreen>
//         </>
//     )
// }

// export function SideNavText({ text, link, isActive = false, onClick }) {
//     return (
//         <>
//             <div className='py-2 duration-300 transition ease-in-out'>
//                 <a href={`#${link}`} 
//                 className={`text-[0.9rem] font-oasis-text cursor-pointer hover:underline underline-offset-2 hover:text-oasis-button-dark
//                 ${isActive ? "underline underline-offset-2 text-oasis-button-dark" : ""}
//                 `} onClick={onClick}>{text}</a>
//             </div>
//         </>
//     )
// }

// export function Guidelines() {
//     return (
//         <>
//              <section className='w-full flex flex-col items-start justify-center gap-5'>
//                 <Title text={"Guidelines"} isAnimated={false} id={"guidelines"}/>
//                 <div className='w-full border' ></div>
//                 <Subtitle size={"text-[0.9rem]"} text={"Welcome to OASIS, your partner in a seamless internship journey. Read the procedures carefully to understand the pre-internship, during, and post-internship requirements."}/>
//             </section>

//             {/* ADDED CONTENTS */}

//                 {/* HEADER GUIDELINES */}
//             <section className='flex flex-col gap-2'>
//                  <Accordion headerText={"General Reminders"}>
                    
//                     {/* STEPS GUIDELINES */}
//                     <ul className="list-decimal px-10 py-1 text-justify flex flex-col gap-2 text-[1rem] font-oasis-text">
//                         <li>All students enrolled in the <strong>On-the-job Training (OJT)</strong> program are required to submit both hard and soft copies of their OJT Portfolio as part of their course completion.</li>
//                          <li>Ensure that all required documents are <strong>complete, accurate, and well-organized</strong></li>
//                         <li>Observe professionalism in formatting and content.</li>
//                     </ul>
//                 </Accordion>

//                 <Accordion headerText={"Format and Content"}>

//                     {/* STEPS GUIDELINES */}
//                     <ul className="list-decimal px-10 py-1 text-justify flex flex-col gap-2 text-[1rem] font-oasis-text">
//                         {/* STEP */}
//                         <li>
//                             <strong>Soft Copy Requirements</strong>
//                             <span className='italic'>(follow the format provided below)</span> 
                            
//                             {/* SUB STEP LIST */}
//                             <ul className='list-disc px-5'>
//                                 <li>File format: <strong>PDF</strong></li>
//                                 <li>
//                                     Filename Format: LastName_FirstName_OJT Portfolio 
//                                     <span className='italic'> (e.g., Santos_Ana_OJT Portfolio)</span>
//                                     <br/>Must include the following:
//                                     {/* THIRD LAYER LIST */}
//                                     <ul className='list-disc px-5'>
//                                         <li>Cover Page</li>
//                                         <li>Table of Contents</li>
//                                     </ul>
//                                 </li>
//                             </ul>

//                             <br/><strong>Checklist of Requirements</strong>
//                             <ul className='list-disc px-5'>
//                                 <li>Notarized MOA</li>
//                                 <li>Endorsement Letter</li>
//                                 <li>Internship Agreement</li>
//                                 <li>Consent Form</li>
//                                 <li>Comprehensive Resume/Profile</li>
//                                 <li>Daily Attendance Report (DTR) Duly Signed by the Training Supervisor</li>
//                                 <li>Weekly Accomplishment/Progress Report/Learning Diary</li>
//                                 <li>Professional Readings (Optional)</li>
//                                 <li>Certificates from Networking and Linkages participation such as local/national/international webinars/trainings/conferences (Optional)</li>
//                                 <li>Evaluation Forms Accomplished by the Employer/Training Supervisor</li>
//                                 <li>Evaluation Forms Accomplished by the Student-Intern for the HTE and Training Supervisor</li>
//                                 <li>Internship Experience Summary Report (overall review and analysis of internship experience in narrative form)</li>
//                                 <li>Photo Documentation of the Actual Training/Output</li>
//                                 <li>Certificate of Completion issued by HTE</li>

//                             </ul>
//                             {/* SUB STEP LIST END*/}
//                         </li>

//                         <li>
//                             <strong>Hard Copy Requirements:</strong>
//                             <span className='italic'>(follow format provided below)</span><br/>
                           
//                             {/* THIRD LAYER LIST */}
//                             <ul className='list-disc px-5'>
//                                 <li>All OJT Requirements should be printed on legal bond paper</li>
//                                 <li>Use a long folder with a transparent cover</li>
//                                 <li>All pages should be clean, readable, and properly labeled</li>
//                                 <li>The following are the colors for each department in the long transparent folder:</li>
//                                 <li>
//                                     {/* FOURTH LAYER LIST */}
//                                     <ul className='list-disc px-5'>
//                                         <li>OM and IT - Purple 🟪</li>
//                                         <li>Computer and Electronics - Blue 🟦</li>
//                                         <li>Electrical and Mechanical - Yellow 🟨</li>
//                                         <li>Civil and Railway - Black ⬛</li>
//                                     </ul>
//                                 </li>
//                             </ul>
//                         </li>
//                     </ul>
//                 </Accordion>


//             </section>
               

//         </>
//     )
// }

// export function OjtJourney() {
//     return (
//         <>
//             <section className='w-full flex flex-col items-start justify-center gap-5'>
//                 <Title text={"OJT Journey"} isAnimated={false} id={"ojtJourney"}/>
//                 <div className='w-full border'></div>

//                 <Accordion headerText={"Before Internship"}>
//                     {/* STEPS GUIDELINES */}
//                     <ul className="list-decimal px-10 py-1 text-justify flex flex-col gap-2 text-[1rem] font-oasis-text">
//                         {/* STEP */}
//                         <li>Attend the Pre-internship Orientation</li>
//                         <li>Attend the Pre-internship Orientation</li>
//                         <li>Attend the Pre-internship Orientation</li>
//                         <li>Intent Letter</li>
//                         <li>Enrolling in the internship course</li>
                            
//                     </ul>
//                 </Accordion>

//                 <Accordion headerText={"During Internship"}>
//                     {/* STEPS GUIDELINES */}
//                     <ul className="list-decimal px-10 py-1 text-justify flex flex-col gap-2 text-[1rem] font-oasis-text">
//                         {/* STEP */}
//                         <li>Attend Consultations and Monitoring</li>
//                         <li>Attend Consultations and Monitoring</li>
//                         <li>Attend HTE Orientation</li>
//                         <li>Submit Required Reports</li>
//                         <li>Begin Internship on time</li>
//                         <li>Report issues promptly</li>
                        
//                     </ul>

                    
//                 </Accordion>

//                 <Accordion headerText={"After Internship"}>
//                     {/* STEPS GUIDELINES */}
//                     <ul className="list-decimal px-10 py-1 text-justify flex flex-col gap-2 text-[1rem] font-oasis-text">
//                         {/* STEP */}
//                         <li>Submit Portfolio to internship adviser</li>
//                         <li>Submit Portfolio to internship adviser</li>
//                         <li>Answer the post-OJT student feedback form</li>
//                         <li>Answer the post-OJT student feedback form</li>
//                         <li>For final evaluation and grade computation</li>
                            
//                     </ul>
//                 </Accordion>
//             </section>
//         </>
//     )
// }

// export function MoaProcess() {
//     return (
//         <>
//             <section className='w-full flex flex-col items-start justify-center gap-5'>
//                 <Title text={"MOA Process"} isAnimated={false} id={"moaProcess"}/>
//                 <div className='w-full border'></div>
                
//                 <Accordion headerText={"MOA Process (HTE without an existing MOA)"}>
//                     <ul className="list-decimal px-10 py-1 text-justify flex flex-col gap-2 text-[1rem] font-oasis-text">
//                         <li>New Potential HTE's</li>
//                         <li>Submit the MOA to HTE</li>
//                         <li>MOA to OJT Coordinator</li>
//                         <li>MOA to Legal Approval</li>
//                         <li>Approved MOA</li>
//                         <li>Printing of MOA</li>
//                         <li>MOA for Signature</li>
//                         <li>Informing of Retrieval</li>
//                         <li>Retrieval of MOA</li>
//                         <li>Signature of HTE in MOA and Notarization</li>
//                     </ul>
//                 </Accordion>
//             </section>
//         </>
//     )
// }

// export function KeyGuidelines() {
//     return (
//         <>  
//             <section className='w-full flex flex-col items-start justify-center gap-5'>
//                 <Title text={"Key Guidelines"} isAnimated={false} id={"keyGuidelines"}/>
//                 <div className='w-full border'></div>
                
//                 <Accordion headerText={"Important reminders"}>
//                     <ul className="list-decimal px-10 py-1 text-justify flex flex-col gap-2 text-[1rem] font-oasis-text">
//                         <li>Working students are not required to submit the MOA, endorsement letter, consent form and internship agreement; however, they must submit a certificate of employment and company profile, a job description attesting that their job is in line with their specialization, and a company ID, if applicable.</li>
//                     </ul>
//                 </Accordion>
//             </section>
//         </>
//     )
// }

// export function FormsTemplates() {
//     return (
//         <>
//             <section className='w-full flex flex-col items-start justify-center gap-5'>
//                 <Title text={"Internship Forms and Templates"} isAnimated={false} id={"formsTemplates"}/>
//                 <div className='w-full border'></div>

//                 {/* DOWNLOADABLE */}
//                 <FormDownloadable text={"Memorandum of Agreement"} link={"www.youtube.com"}/>
//                 <FormDownloadable text={"Endorsement Letter"}/>
//                 <FormDownloadable text={"Internship Agreement"}/>
//                 <FormDownloadable text={"Consent Form"}/>
//                 <FormDownloadable text={"Daily Attendance Report (DTR)"}/>
//                 <FormDownloadable text={"Weekly Accomplisment"}/>
//                 <FormDownloadable text={"Evaluation Form by Employer/Training Supervisor"}/>
//                 <FormDownloadable text={"Evaluation Form by Student-Intern for the HTE and Training Supervisor"}/>
//                 <FormDownloadable text={"Internship Experiences Summary Report"}/>
                
//             </section>
//         </>
//     )
// }

// export function OjtPortfolio() {

//     return (
//         <>
//             <div className='w-full p-5 shadow-[0px_0px_5px_rgba(0,0,0,0.5)] 
//             font-oasis-text'>
//                 <section className='w-full py-5 border-b flex flex-col justify-center items-center'>
//                     <h2 className='font-bold font-oasis-title text-[1.5rem]'>HEADER</h2>
//                 </section>  

//                 <section className='w-full mt-5 mb-5 flex justify-center items-center'>
//                     <h3 className='font-bold font-oasis-text'>TABLE OF CONTENTS</h3>
//                 </section>

//                 <section className='w-full grid grid-cols-2 py-2 px-10 mb-10'>
//                     <p className='font-bold cursor-pointer'>Cover Page</p>
//                     <p className='justify-self-end'>i</p>

//                     <p className='font-bold cursor-pointer'>Table of Contents</p>
//                     <p className='justify-self-end'>ii</p>
//                 </section>
//                 <section className='w-full grid grid-cols-2 py-2 px-10'>
//                     <h4 className='col-span-2 font-bold'>THE HOST TRAINING ESTABLISHMENT</h4>

//                     <p className='pl-5 text-[0.9rem] cursor-pointer'>Location of Host Training Establishment</p>
//                     <p className='justify-self-end'>XX</p>

//                 </section>
                
//                 <section className='w-full py-5 mt-2 border-t flex flex-col justify-center items-center'>
//                     <h2 className='font-bold font-oasis-title text-[1.5rem]'>FOOTER</h2>
//                 </section> 
//             </div>

//             <div className='w-full p-5 shadow-[0px_0px_5px_rgba(0,0,0,0.5)] 
//             font-oasis-text'>
//                 <section className='w-full mt-5 mb-5 flex flex-col justify-center items-center'>
//                     <h3 className='font-bold font-oasis-text'>LIST OF APPENDICES</h3>

//                     <section className='w-full grid grid-cols-2 py-2 px-10 mb-10'>
//                         <p className='justify-self-end col-span-2'>Page</p>
//                         <p className='justify-self-end col-span-2 font-bold'>XX</p>

//                         <p className='col-span-2'>Endorsement Letter</p>
//                         <p className='col-span-2'>Letter of Intent (if applicable)</p>
//                     </section>
//                 </section>
//             </div>
//         </>
//     )
// }