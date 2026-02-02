import { AdminProfileScreen } from "../../layouts/profileScreen";
import { Label } from "../../utilities/label";
import fallbackImg from "../../assets/fallbackImage.jpg"
import Subtitle from "../../utilities/subtitle";
import Title from "../../utilities/title";
import { AnnounceButton } from "../../components/button";
import { Settings2 } from "lucide-react";

export default function AdminProfile() {
    return (
        <>
            <AdminProfileScreen className={"gap-5 items-start"}>
                <Title text={"Admin Profile"}/>
                 <AdminSect>
                    <div className="w-full h-full flex flex-row items-center gap-5">
                        <img src={fallbackImg} className="rounded-full w-30 aspect-square object-cover"/>
                        <div className="flex flex-col justify-center gap-1">
                            <Subtitle text={"Buwie Santos"} weight="font-bold" size="text-[1rem]" color={"text-oasis-button-dark"}/>
                            <Subtitle text={"OJT Coordinator (Admin)"} size="text-[0.8rem]"/>
                            <Subtitle text={"buwiesantos@gmail.com"} color={"text-oasis-button-dark"} isUnderlined={true}/>
                        </div>
                    </div>
                 </AdminSect>

                 <AdminSect className={"gap-5"}>
                    <div className={`w-[80%] flex justify-between items-center border-b-oasis-button-dark border-b py-3`}>
                        <Label labelText={"Personal Information"}/>
                        <AnnounceButton btnText={"Edit"} icon={<Settings2 size={20}/>}/>
                    </div>
                    
                    <div className="w-[80%] grid grid-cols-3 place-items-center justify-items-start gap-5">
                        <InfoWrapper label={"First name"} value={"Buhawie"}/>
                        <InfoWrapper label={"Last Name"} value={"Santos"}/>
                        <InfoWrapper label={"Date of Birth"} value={"10-28-2004"}/>
                        <InfoWrapper label={"Email Address"} value={"buwiesantos@gmail.com"}/>
                        <InfoWrapper label={"Phone Number"} value={"(+63) 921-734-7932"}/>
                        <InfoWrapper label={"User Role"} value={"Admin"}/>
                    </div>  
                 </AdminSect>

                <AdminSect className={"gap-5"}>
                    <div className={`w-[80%] flex justify-between items-center border-b-oasis-button-dark border-b py-3`}>
                        <Label labelText={"Address"}/>
                        <AnnounceButton btnText={"Edit"} icon={<Settings2 size={20}/>}/>
                    </div>
                    <div className="w-[80%] grid grid-cols-3 place-items-center justify-items-start gap-5">
                        <InfoWrapper label={"Country"} value={"Philippines"}/>
                        <InfoWrapper label={"City"} value={"Manila"}/>
                        <InfoWrapper label={"Postal Code"} value={"1234"}/>
                    </div>  
                </AdminSect>
            </AdminProfileScreen>
           
        </>
    )
}
export function AdminSect({ children, className }) {
    return (
        <section className={`w-full p-5 bg-white shadow-[0px_2px_2px_rgba(0,0,0,0.3)] flex flex-col justify-center items-center rounded-3xl ${className}`}>
            {children}
        </section>
    )
}

export function InfoWrapper({ label, value, className }) {
    return (
        <div className={`flex flex-col items-start justify-center gap-2 ${className}`}>
            <Subtitle text={label} color={"text-gray-600"}/>
            <Subtitle text={value} size={"text-[1rem]"}/>
        </div>
    )
}