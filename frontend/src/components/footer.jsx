import Title from "../utilities/title.jsx"
import { SingleField } from "./fieldComp.jsx";
import { Button } from "./button.jsx";
import oasisLogo from "../assets/oasisLogo.png";
import komunidevsLogo from "../assets/komunidevs logo-02.png";
import { Link } from "react-router-dom";


export default function Footer({ onOpenModal }) {
    return (
        <footer className="z-90 w-full">

            <div className="mt-[-3px] w-full min-h-50 flex flex-col lg:flex-row items-start justify-between p-10 bg-linear-to-b from-oasis-blue from-10% via-oasis-blue via-40% to-white gap-10">

                {/* LEFT: Logo Section */}
                <section className="w-full lg:w-1/5 flex justify-center lg:justify-start">
                    <img src={oasisLogo} className="object-contain w-48 lg:w-full"/>
                </section>

                {/* MIDDLE: Link Sections */}
                <section className="w-full lg:w-3/5 grid grid-cols-1 md:grid-cols-3 gap-10">
                    
                    <ul className="flex flex-col items-center lg:items-start text-sm">
                        <Title text={"Contact Info"}/>
                        <li className="mt-2 text-center lg:text-left">
                            <a href="mailto:oasiskomunidevs@gmail.com">
                                Email:
                                oasiskomunidevs@gmail.com
                            </a>
                            
                        </li>
                    </ul>

                    <ul className="flex flex-col items-center lg:items-start text-sm">
                        <Title text={"Menu"}/>
                        <div className="flex flex-col items-center lg:items-start mt-2 gap-1">
                            <Link to={"/home"} className="hover:underline"><li>Home</li></Link>
                            <Link to={"/htedirectory"} className="hover:underline"><li>HTE Directory</li></Link>
                            <Link to={"/ojthub"} className="hover:underline"><li>OJT Hub</li></Link>
                            <Link to={"/announcements"} className="hover:underline"><li>Announcements</li></Link>
                        </div>
                    </ul>

                    <ul className="flex flex-col items-center lg:items-start text-sm">
                        <Title text={"Policy Links"}/>
                        <div className="flex flex-col items-center lg:items-start mt-2 gap-1">
                            {/* Policy Link Triggers */}
                            <li 
                                className="cursor-pointer hover:underline hover:text-oasis-header transition-all"
                                onClick={() => onOpenModal('privacy')}
                            >
                                Privacy Policy
                            </li>
                            <li 
                                className="cursor-pointer hover:underline hover:text-oasis-header transition-all"
                                onClick={() => onOpenModal('terms')}
                            >
                                Terms & Conditions
                            </li>
                            <li 
                                className="cursor-pointer hover:underline hover:text-oasis-header transition-all"
                                onClick={() => onOpenModal('copyright')}
                            >
                                Copyright Notice
                            </li>
                        </div>
                    </ul>
                </section>

                {/* RIGHT: Contact Form */}
                <section className="w-full lg:w-1/4 flex flex-col">
                    <form className="flex flex-col gap-4">
                        <Title text={"Have questions? Contact support."} size="text-[1rem]"/>
                        <SingleField labelText={"Message"} fieldHolder={"Enter Message"} fieldId={"message"}/>
                        <Button text={"Submit"}/>
                    </form>
                </section>
            </div>

            {/* KOMUNIDEVS FOOTER */}
            <div className="w-full bg-gray-900 py-6 flex flex-col md:flex-row items-center justify-center gap-3">
                <p className="text-gray-300 text-sm text-center">
                    This system is developed by
                    <span className="font-bold text-white ml-1">Komunidevs</span>
                </p>
                <img 
                    src={komunidevsLogo} 
                    alt="Komunidevs Logo" 
                    className="h-10 w-auto object-contain"
                />
            </div>
        </footer>
    );
}