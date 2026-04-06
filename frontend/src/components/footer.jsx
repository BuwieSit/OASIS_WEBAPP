import Title from "../utilities/title.jsx"
import { SingleField } from "./fieldComp.jsx";
import { Button } from "./button.jsx";
import oasisLogo from "../assets/oasisLogo.png";
import komunidevsLogo from "../assets/komunidevs logo-02.png";
import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="z-90 w-full">
            <div className="mt-[-3px] w-full min-h-50 flex flex-col lg:flex-row items-start justify-between p-10 bg-linear-to-b from-oasis-blue from-10% via-oasis-blue via-40% to-white gap-10">

                {/* LEFT: Logo Section */}
                <section className="w-full lg:w-1/5 flex justify-center lg:justify-start">
                    <img src={oasisLogo} className="object-contain w-48 lg:w-full"/>
                </section>

                {/* MIDDLE: Link Sections - Use a 3-column grid that aligns to the top */}
                <section className="w-full lg:w-3/5 grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    <ul className="flex flex-col items-center lg:items-start text-sm">
                        <Title text={"Contact Info"}/>
                        <li className="mt-2 text-center lg:text-left">Email: oasisofficial@gmail.com</li>
                    </ul>

                    <ul className="flex flex-col items-center lg:items-start text-sm">
                        <Title text={"Menu"}/>
                        <div className="flex flex-col items-center lg:items-start mt-2 gap-1">
                            <Link to={"/home"}><li>Home</li></Link>
                            <Link to={"/htedirectory"}><li>HTE Directory</li></Link>
                            <Link to={"/ojthub"}><li>OJT Hub</li></Link>
                            <Link to={"/announcements"}><li>Announcements</li></Link>
                        </div>
                    </ul>

                    <ul className="flex flex-col items-center lg:items-start text-sm">
                        <Title text={"Policy Links"}/>
                        <div className="flex flex-col items-center lg:items-start mt-2 gap-1">
                            <li>Privacy Policy</li>
                            <li>Terms & Conditions</li>
                            <li>Copyright Notice</li>
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