import AdminScreen from '../../layouts/adminScreen.jsx';
import Title from "../../utilities/title.jsx";
import OasisTable from '../../components/oasisTable.jsx';
import { FileUploadField, MultiField, SingleField } from '../../components/fieldComp.jsx';
import { Dropdown, Filter } from '../../components/adminComps.jsx';
import { Label, RatingLabel } from '../../utilities/label.jsx';
import { AnnounceButton, CoursesButton } from '../../components/button.jsx';
import Subtitle from '../../utilities/subtitle.jsx';
import { Text } from '../../utilities/tableUtil.jsx';
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AdminAPI } from "../../api/admin.api";

import { ArrowRightFromLine, Check, Download, Save, Upload, X } from 'lucide-react';


export default function AdmOperations() {

    const [data, setData] = useState([]);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const categories = ["ACTIVE", "EXPIRED", "PENDING"];
    const hteDropdown = data.map(h => h.company_name);

    const status = searchParams.get("status"); // ACTIVE | EXPIRED | null

    // =============================
    // ADD HTE FORM STATE
    // =============================

    const [companyName, setCompanyName] = useState("");
    const [companyAbout, setCompanyAbout] = useState("");
    const [companyLoc, setCompanyLoc] = useState("");
    const [statusValue, setStatusValue] = useState("ACTIVE");

    const [eligibleCourses, setEligibleCourses] = useState([]);

    const [logoFile, setLogoFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [moaFile, setMoaFile] = useState(null);

    // =============================
    // FETCH HTEs
    // =============================
    useEffect(() => {
        AdminAPI.getHTEs(status)
            .then(res => setData(res.data))
            .catch(console.error);
    }, [status]);

    // =============================
    // HELPERS
    // =============================
    const calcValidity = (moa) => {
        if (!moa?.signed_at || !moa?.expires_at) return "—";
        const start = new Date(moa.signed_at);
        const end = new Date(moa.expires_at);
        const years = Math.floor(
            (end - start) / (1000 * 60 * 60 * 24 * 365)
        );
        return `${years} year${years !== 1 ? "s" : ""}`;
    };

    const toggleCourse = (course) => {
    setEligibleCourses(prev =>
        prev.includes(course)
        ? prev.filter(c => c !== course)
        : [...prev, course]
    );
    };

    const resetForm = () => {
        setCompanyName("");
        setCompanyAbout("");
        setCompanyLoc("");
        setStatusValue("ACTIVE");
        setEligibleCourses([]);
        setLogoFile(null);
        setThumbnailFile(null);
        setMoaFile(null);
    };

    const formatDate = (d) =>
        d ? new Date(d).toLocaleDateString() : "—";

    // =============================
    // TABLE COLUMNS
    // =============================
    const columns = [
        { header: "HTE Name", render: r => <Text text={r.company_name} /> },
        { header: "Industry", render: r => <Text text={r.industry} /> },
        { header: "Location", render: r => <Text text={r.address} /> },
        { header: "Status", render: r => <Text text={r.moa?.status || "NO MOA"} /> },
        { header: "MOA Validity", render: r => <Text text={calcValidity(r.moa)} /> },
        { header: "Signed Date", render: r => <Text text={formatDate(r.moa?.signed_at)} /> },
        { header: "Expiry Date", render: r => <Text text={formatDate(r.moa?.expires_at)} /> },
    ];

    const handleSaveHTE = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("company_name", companyName);
        formData.append("description", companyAbout);
        formData.append("address", companyLoc);
        formData.append("status", statusValue);
        formData.append(
            "eligible_courses",
            JSON.stringify(eligibleCourses)
        );

        if (logoFile) formData.append("logo", logoFile);
        if (thumbnailFile) formData.append("thumbnail", thumbnailFile);
        if (moaFile) formData.append("moa_file", moaFile);

        try {
            await AdminAPI.createHTE(formData);
            alert("HTE saved successfully");
            const res = await AdminAPI.getHTEs(status);
            setData(res.data);

            resetForm();
        } catch (err) {
            console.error(err);
            alert("Failed to save HTE");
        }
    };

    return (
        <AdminScreen>

            {/* =============================
                HEADER
            ============================== */}
            <div className='mb-10'>
                <Title text={"Admin Operations"} />
            </div>

            {/* =============================
                HTE TABLE
            ============================== */}
        
            {/* TITLE */}
            <div className='flex justify-start items-start w-[80%]'>
                <Title text={"HTE Overview"}/>
            </div>

            <OasisTable columns={columns} data={data}>
                <div className="w-full flex flex-row justify-between items-center gap-4 mt-4">

                    <div className='flex flex-row gap-3 items-center justify-start'>
                        
                        <Subtitle
                            text="All"
                            isLink
                            onClick={() => navigate("/admOperations")}
                            size="text-[1rem]"
                        />
                        <Subtitle text={"|"} size='text-[1rem]'/>
                        <Subtitle
                            text="ACTIVE"
                            isLink
                            onClick={() => navigate("/admOperations?status=ACTIVE")}
                            size="text-[1rem]"
                        />
                        <Subtitle text={"|"} size='text-[1rem]'/>
                        <Subtitle
                            text="EXPIRED"
                            isLink
                            onClick={() => navigate("/admOperations?status=EXPIRED")}
                            size="text-[1rem]"
                        />
                    </div>
                    

                    <div className='w-full flex flex-row justify-end items-center gap-3'>
                        <AnnounceButton icon={<Upload/>} btnText='Upload'/>
                        <AnnounceButton icon={<Download/>} btnText='Download'/>
                    </div>
                </div>
            </OasisTable>

            {/* =============================
                ADD / UPDATE HTE FORM
            ============================== */}
            {/* TITLE */}
            <div className='flex justify-start items-start w-[80%]'>
                <Title text={"Add HTE"}/>
            </div>
            <div className="w-[80%] p-5 rounded-3xl bg-admin-element flex flex-col gap-5 shadow-[0px_0px_10px_rgba(0,0,0,0.5)]">



                {/* FORM FOR ADD HTE*/}
                <form className="w-full flex flex-col gap-5" onSubmit={handleSaveHTE}>
                    {/* CONTAINER */}
                    <div className="w-full grid grid-cols-2 p-2 text-oasis-button-dark">
                        {/* FIRST COLUMN LOGO & THUMBNAIL*/}
                        <div className="w-full px-2 py-3 flex flex-col gap-5">
                            <FileUploadField
                            labelText="Upload Logo"
                            fieldId="logoFile"
                            onChange={e => setLogoFile(e.target.files[0])}
                            />
                            <FileUploadField
                            labelText="Upload HTE Thumbnail"
                            fieldId="thumbnailFile"
                            onChange={e => setThumbnailFile(e.target.files[0])}
                            />
                            <FileUploadField
                                labelText="MOA"
                                fieldId="moaFile"
                                onChange={e => setMoaFile(e.target.files[0])}
                            />
                            {/* SAVE HTE BUTTONS */}
                            <div className="w-full h-full flex justify-start items-end gap-5 px-5">
                                <AnnounceButton icon={<Save size={15}/>} btnText="Save" type="submit" />
                                <AnnounceButton
                                    btnText="Cancel"
                                    type="button"
                                    onClick={resetForm}
                                />
                            </div>
                        </div>

                        {/* SECOND COLUMN FIELDS */}
                        <div className="w-full p-2 flex flex-col justify-start gap-5">
                            <div className="w-full p-2 flex flex-col gap-3">
                                <SingleField
                                labelText="Company Name"
                                fieldHolder="Enter company name"
                                fieldId="companyName"
                                value={companyName}
                                onChange={e => setCompanyName(e.target.value)}
                                />

                                <MultiField
                                labelText="About Company"
                                fieldHolder="Enter company description"
                                fieldId="companyAbout"
                                value={companyAbout}
                                onChange={e => setCompanyAbout(e.target.value)}
                                />

                                <SingleField
                                labelText="Location"
                                fieldHolder="Enter company address"
                                fieldId="companyLoc"
                                value={companyLoc}
                                onChange={e => setCompanyLoc(e.target.value)}
                                />

                                <Dropdown
                                labelText="Status"
                                categories={categories}
                                value={statusValue}
                                onChange={setStatusValue}
                                />

                                <Label labelText="Eligible Course" />
                                <section className="w-full flex flex-row flex-wrap gap-3">
                                    {["DIT","DLMOT","DEET","DMET","DCvET","DCpET","DRET","DECET"].map(c =>
                                        <CoursesButton
                                        key={c}
                                        text={c}
                                        isActive={eligibleCourses.includes(c)}
                                        onClick={() => toggleCourse(c)}
                                        />
                                    )}
                                </section>
                                
                            </div>
                        </div>
                            

                    </div>
                </form>
                {/* ADD / EDIT HTE FORM END */}
        </div>



         {/* TITLE FOR REVIEW*/}
            <div className='flex justify-start items-start w-[80%]'>
                <Title text={"Reviews Moderation"}/>
            </div>

            {/* REVIEW FOR PARENT CONTAINER */}
            <div className='w-[80%] max-h-200 overflow-x-hidden p-5 rounded-3xl bg-admin-element flex flex-col items-center shadow-[0px_0px_10px_rgba(0,0,0,0.5)]'>
                
                {/* DESCRIPTION WRAPPER */}
                <div>
                    <Subtitle text={"Approve or reject student reviews. Approved reviews will be visible on the public HTE profiles."} size='text-[0.9rem]'/>
                </div>

                {/* CONTENT WRAPPER */}
                <section className='w-full py-5 flex flex-row justify-evenly items-start font-oasis-text'>

                    {/* CARDS WRAPPER */}
                    <div className="w-[50%] h-full grid gap-4 grid-cols-[repeat(auto-fit,minmax(260px,2fr))]">

                        {/* CARD */}
                        <div className="relative w-full h-fit max-h-100 p-5 bg-white rounded-3xl drop-shadow-[0px_2px_5px_rgba(0,0,0,0.5)] transition duration-300 ease-in-out flex flex-col justify-evenly items-start">

                            <section className='w-full flex flex-row justify-between items-center'>
                                <Subtitle text={"Maria S."} color={"text-[#2D6259]"} size='text-[1.5rem]' weight='font-bold'/>
                                <p className='font-oasis-text text-[0.8rem] italic'>Prima Tech - 22/11/2025, 8:41 PM</p>
                            </section>

                            <section className='h-[50%] flex flex-col justify-start items-start gap-3 relative overflow-hidden'>
                                <RatingLabel rating={"5"}/>
                                
                                {/* REVIEWS DESCRIPTION BELOW */}
                                <div className='overflow-x-hidden overflow-y-auto'>
                                        <p className='font-oasis-text text-[0.8rem] text-justify w-full overflow-y-auto'>Prima Tech is such a good company to take an intern job since they have benefits like allowance as well as a healthy environment with supportive and kind employees and mentors! Really had a great time here.Prima Tech is such a good company to take an intern job since they have benefits like allowance as well as a healthy environment with supportive and kind employees and mentors! Really had a great time here.Prima Tech is such a good company to take an intern job since they have benefits like allowance as well as a healthy environment with supportive and kind employees and mentors! Really had a great time here.</p>
                                </div>
                                
                            </section>

                            <section className='w-full h-full flex justify-center items-center gap-5 px-5'>
                                <AnnounceButton 
                                    icon={<Check size={25}/>} 
                                    type="submit" 
                                    btnText=''
                                />
                                <AnnounceButton
                                    btnText=""
                                    type="button"
                                    isRed={true}
                                    onClick={resetForm}
                                    icon={<X size={25}/>}
                                />
                            </section>
                        </div>  {/* CARD END */}
                        {/* CARD */}

                        {/* CARD WRAPPER END */}
                    </div>
                        
                    {/* REVIEW FILTERS PARENT */}
                    <div className='w-[40%] p-3 flex flex-col justify-start items-start sticky top-0 transiiton-all duration-100 ease-in-out'>

                            <Subtitle text={"Review Criteria"} size={'text-[1rem]'} weight='font-bold'/>

                            <div className='mt-3 mb-5 w-full flex flex-wrap justify-start items-start gap-1'>
                                <Filter text={'Learning Experience'}/> 
                                <Filter text={'Skill Acquisition'}/> 
                                <Filter text={'Adequate Supervisor Support'}/> 
                                <Filter text={'Course related'}/> 
                            </div>

                            <Subtitle text={"Date Posted"} size={'text-[1rem]'} weight='font-bold'/>

                            <div className='mt-3 mb-5 w-full flex flex-wrap justify-start items-start gap-1'>
                                <Filter text={'Newest'}/> 
                                <Filter text={'Oldest'}/> 
                            </div>

                            <Subtitle text={"Ratings"} size={'text-[1rem]'} weight='font-bold'/>

                            <div className='mt-3 mb-5 w-full flex flex-wrap justify-start items-start gap-1'>
                                <Filter text={'5 stars'}/> 
                                <Filter text={'4 stars'}/> 
                                <Filter text={'3 stars'}/> 
                                <Filter text={'2 stars'}/> 
                                <Filter text={'1 stars'}/> 
                            </div>

                            <Subtitle text={"HTE"} size={'text-[1rem]'} weight='font-bold'/>

                            <div className='mt-3 w-full flex flex-wrap justify-start items-start gap-1'>
                                <Dropdown categories={hteDropdown}/>
                            </div>

                            <div className='mt-3 p-5 w-full flex justify-between items-center gap-1'>
                                <AnnounceButton btnText='Approve All'/>
                                <AnnounceButton btnText='Clear All'/>
                            </div>
                        
                        {/* REVIEWS FILTER PARENT END */}

                    </div>    
                        {/* REVIEWS WRAPPER END */}
                </section>

            </div>




        </AdminScreen>
    );
}
