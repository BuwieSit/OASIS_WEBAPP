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

            <div className='flex justify-start items-start w-[90%]'>
                <Title text={"HTE Overview"} />
            </div>

            {/* =============================
                HTE TABLE
            ============================== */}
            <OasisTable columns={columns} data={data}>
                <div className="flex gap-4 mt-4">
                    <Subtitle
                        text="All"
                        isLink
                        onClick={() => navigate("/admOperations")}
                    />
                    <Subtitle
                        text="ACTIVE"
                        isLink
                        onClick={() => navigate("/admOperations?status=ACTIVE")}
                    />
                    <Subtitle
                        text="EXPIRED"
                        isLink
                        onClick={() => navigate("/admOperations?status=EXPIRED")}
                    />
                </div>
            </OasisTable>

            {/* =============================
                ADD / UPDATE HTE FORM
            ============================== */}
            <div className="w-[80%] p-5 rounded-3xl bg-admin-element flex flex-col gap-5 shadow-[0px_0px_10px_rgba(0,0,0,0.5)]">
            <form
                className="w-full flex flex-col gap-5"
                onSubmit={handleSaveHTE}
            >
                <div className="w-full flex flex-row justify-evenly p-2 text-oasis-button-dark">

                <div className="w-[20%] p-2 flex flex-col gap-5">
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
                </div>

                <div className="w-[70%] p-2 flex flex-col gap-3">
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

                    <FileUploadField
                    labelText="MOA"
                    fieldId="moaFile"
                    onChange={e => setMoaFile(e.target.files[0])}
                    />
                </div>
                </div>

                <div className="w-full flex justify-start gap-5 px-5">
                <AnnounceButton btnText="Save HTE" type="submit" />
                <AnnounceButton
                    btnText="Cancel"
                    type="button"
                    onClick={resetForm}
                />
                </div>
            </form>
            </div>
            {/* =============================
                REVIEWS (STATIC FOR NOW)
            ============================== */}
            <div className='flex justify-start items-start w-[90%]'>
                <Title text={"Reviews Moderation"} />
            </div>

            <div className='w-[90%] p-5 rounded-3xl bg-admin-element shadow-[0px_0px_10px_rgba(0,0,0,0.5)]'>
                <Subtitle text={"Approve or reject student reviews. Approved reviews will be visible on the public HTE profiles."} />

                <section className='w-full flex flex-row justify-between mt-5'>
                    <div className='w-[30%]'>
                        <Subtitle text="HTE" weight="font-bold" />
                        <Dropdown categories={hteDropdown} />
                    </div>
                </section>
            </div>

        </AdminScreen>
    );
}
