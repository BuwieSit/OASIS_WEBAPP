import LogoWrap from "../../utilities/logoWrap";
import oasisLogo from "../../assets/oasisLogo.png";
import Subtitle from "../../utilities/subtitle";

export default function AdminHeader() {
    return (
        <header className="sticky top-0 w-full h-5 flex flex-row justify-between
        items-center bg-linear-to-t from-oasis-blue via-oasis-blue to-oasis-dark min-h-15 px-5 shadow-[0_5px_10px_rgba(0,0,0,0.3)] z-90">
            <LogoWrap />
            <img src={oasisLogo} className="absolute left-1/2 -translate-x-1/2 w-25 aspect-auto" alt="Oasis Logo"/>
            <Subtitle text={"Admin"} color={"text-[#3E8679]"} size={"text-[1rem]"}/> 
        </header>
    )
}
