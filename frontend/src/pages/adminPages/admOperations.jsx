
import AdminScreen from '../../layouts/adminScreen.jsx';
import { AdminHeader } from '../../components/headers.jsx'
import Title from "../../utilities/title.jsx";
import OasisTable from '../../components/oasisTable.jsx';
import { FileUploadField, MultiField, SingleField } from '../../components/fieldComp.jsx';
import { Dropdown, Filter } from '../../components/adminComps.jsx';
import { Label, RatingLabel } from '../../utilities/label.jsx';
import { AnnounceButton, CoursesButton } from '../../components/button.jsx';
import Subtitle from '../../utilities/subtitle.jsx';
import { Text, StatusDropdown, HteLocation, SignedExpiryDate } from '../../utilities/tableUtil.jsx';


export default function AdmOperations() {

    const hteOverviewHeaders = [
        {header: "Name", render: row => <Text text={row.hteName}/>},
        {header: "Industry", render: row => <Text text={row.hteIndustry}/>},
        {header: "Location", render: row => <HteLocation address={row.hteLocation}/>},
        {header: "Status", render: row => 
                                <StatusDropdown 
                                    value={row.status} 
                                    onChange={(newStatus) => {
                                        console.log(`Change HTE ${row.id} status to`, newStatus)
                                    }}
                                />},
        {header: "MOA Validity", render: row => <Text text={row.moaValidity}/>},
        {header: "Signed Date", render: row => <SignedExpiryDate mode={"signed"} signedDate={row.moaSigned}/>},
        {header: "Expiry Date", render: row => <SignedExpiryDate mode={"expiry"} signedDate={row.moaSigned}/>},
    ]

    const hteData = [
        {
            id: 1,
            hteName: "ABC Tech Solutions",
            hteIndustry: "IT",
            hteLocation: "Antipolo, Rizal",
            moaValidity: "3 years",
            moaSigned: "2023-05-15",
        }
    ]
    const categories = ["Active", "Expired", "Pending"];
    const hteDropdown = ["ABC Corp", "Prima Tech", "AbsoluteTech"];

    return(
        <>
            <AdminScreen>
                <AdminHeader/>
                 <div className='mb-10'>
                    <Title text={"Admin Operations"}/>
                </div>

                <div className='flex justify-start items-start w-[90%]'>
                    <Title text={"HTE Overview"}/>
                </div>
                <OasisTable columns={hteOverviewHeaders} data={hteData}></OasisTable>

                <div className="w-[90%] p-5 rounded-3xl bg-admin-element flex flex-col gap-5 shadow-[0px_0px_10px_rgba(0,0,0,0.5)]">

                    <form className="w-full flex flex-col gap-5">

                        {/* ROW CONTENT */}
                        <div className="w-full flex flex-row justify-evenly p-2 text-oasis-button-dark">

                            <div className="w-[20%] p-2 flex flex-col gap-5">
                                <FileUploadField labelText="Upload Logo" fieldId="logoFile" />
                                <FileUploadField labelText="Upload HTE Thumbnail" fieldId="thumbnailFile" />
                            </div>

                            <div className="w-[70%] p-2 flex flex-col gap-3">
                                <SingleField labelText="Company Name" fieldHolder="Enter company name" fieldType="text" fieldId="companyName" />
                                <MultiField labelText="About Company" fieldHolder="Enter company description" fieldId="companyAbout" />
                                <SingleField labelText="Location" fieldHolder="Enter company address" fieldType="text" fieldId="companyLoc" />
                                <Dropdown labelText="Status" categories={categories} />
                                <Label labelText="Eligible Course" />

                                <section className="w-full flex flex-row flex-wrap gap-3">
                                <CoursesButton text="DIT" />
                                <CoursesButton text="DLMOT" />
                                <CoursesButton text="DEET" />
                                <CoursesButton text="DMET" />
                                <CoursesButton text="DCvET" />
                                <CoursesButton text="DCpET" />
                                <CoursesButton text="DRET" />
                                <CoursesButton text="DECET" />
                                </section>

                                <FileUploadField labelText="MOA" fieldId="moaFile" />
                            </div>
                        </div>

                        {/* ACTION BUTTONS (NOT PART OF ROW) */}
                        <div className="w-full flex justify-start gap-5 px-5">
                            <AnnounceButton btnText="Save HTE" />
                            <AnnounceButton btnText="Cancel" />
                        </div>

                    </form>
                </div>

                <div className='flex justify-start items-start w-[90%]'>
                    <Title text={"Reviews Moderation"}/>
                </div>

                {/* PARENT CONTAINER */}
                <div className='w-[90%] p-5 rounded-3xl bg-admin-element flex flex-col justify-between items-start shadow-[0px_0px_10px_rgba(0,0,0,0.5)]'>
                    <Subtitle text={"Approve or reject student reviews. Approved reviews will be visible on the public HTE profiles."}/>
                    
                    
                    <section className='w-full flex flex-row justify-evenly items-start font-oasis-text'>
                        {/* REVIEWS PARENT CONTAINER */}
                        <div className="w-[70%] py-5 flex flex-wrap gap-4">

                    {/* CARD CONTAINER */}
                            <div className="basis-[calc(50%-0.5rem)] aspect-video max-h-75 p-5 bg-white rounded-3xl drop-shadow-[0px_2px_5px_rgba(0,0,0,0.5)] transition duration-300 ease-in-out flex flex-col justify-evenly items-start">

                                <sections className='w-full flex flex-row justify-between items-center'>
                                    <Label labelText={'Maria S.'}/>
                                    <p className='font-oasis-text text-[0.7rem] italic'>Prima Tech - 22/11/2025, 8:41 PM</p>
                                    
                                </sections>

                                <sections className='w-full flex flex-col justify-start items-start'>
                                    <RatingLabel rating={"5"}/>
                                    <p className='font-oasis-text text-[0.7rem] text-justify w-full overflow-y-auto'>Prima Tech is such a good company to take an intern job since they have benefits like allowance as well as a healthy environment with supportive and kind employees and mentors! Really had a great time here.</p>
                                </sections>

                                <sections className='w-full flex flex-row justify-start items-start gap-3'>
                                    <AnnounceButton btnText='Approve'/>
                                    <AnnounceButton btnText='Reject'/>
                                </sections>

                            </div>

                            
                    
                        </div>

                        {/* REVIEW FILTERS PARENT */}
                        <div className='w-[30%] p-3 flex flex-col justify-start items-start'>
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

                            <div className='mt-3 w-full flex flex-wrap justify-between items-start gap-1'>
                                <AnnounceButton btnText='Submit'/>
                                <AnnounceButton btnText='Clear All'/>
                            </div>

                        </div>
                    </section>

                </div>
            </AdminScreen>
        </>
    )
}