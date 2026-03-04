import { FooterWave } from "../utilities/waves"
import Title from "../utilities/title.jsx"
import Subtitle from "../utilities/subtitle.jsx";
import { MultiField, SingleField } from "./fieldComp.jsx";
import { AdminField } from "../utilities/inputField.jsx";
import { Button } from "./button.jsx";
import oasisLogo from "../assets/oasisLogo.png";
import komunidevsLogo from "../assets/komunidevs logo-02.png";
import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="z-90 w-full">

            <div className="mt-[-3px] w-full min-h-50 flex flex-col lg:flex-row p-5 sticky bottom-0 bg-linear-to-b from-oasis-blue from-10% via-oasis-blue via-40% to-white">

                {/* LEFT */}
                <section className="w-full lg:w-1/3 flex justify-center lg:justify-start">
                    <img src={oasisLogo} className="object-contain w-full"/>
                </section>

                {/* MIDDLE */}
                <section className="w-full lg:w-1/3 flex flex-col lg:flex-row justify-center items-center gap-6">

                    <ul className="w-full flex flex-col justify-center items-center p-3">
                        <Title text={"Contact Info"}/>
                        <li>Email: oasisofficial@gmail.com</li>
                        <li>Phone: (+63) 123 456 7890</li>
                    </ul>

                    <ul className="w-full flex flex-col justify-center items-center p-3">
                        <Title text={"Menu"}/>
                        <Link to={"/"}><li>Home</li></Link>
                        <li>HTE Directory</li>
                        <li>OJT Hub</li>
                        <li>Announcements</li>
                    </ul>

                    <ul className="w-full flex flex-col justify-center items-center p-3">
                        <Title text={"Policy Links"}/>
                        <li>Privacy Policy</li>
                        <li>Terms & Conditions</li>
                        <li>Copyright Notice</li>
                    </ul>

                </section>

                {/* RIGHT */}
                <section className="w-full lg:w-1/3 flex flex-col items-center justify-center mt-6 lg:mt-0">
                    <form className="flex flex-col gap-5">
                        <Title text={"Give our system a feedback!"}/>
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
                    className="h-12 w-auto object-contain"
                />
            </div>

        </footer>
    )
}