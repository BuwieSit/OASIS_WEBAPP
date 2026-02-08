import Subtitle from "../utilities/subtitle"
import { DownloadIcon } from "lucide-react"

export default function FormDownloadable({ text, link}) {
    return(
        <div className="w-full p-4 flex flex-row items-center gap-5 bg-oasis-header rounded-2xl overflow-hidden transition-all cursor-pointer hover:underline underline-offset-2">
            <DownloadIcon color='white'/>
            <Subtitle isLink={true} link={link} size={"text-[1rem]"} color={"text-white"} weight={"font-bold"} text={text}/>
        </div>
    )
}