import { FooterWave } from "../utilities/waves"
import Title from "../utilities/title.jsx"
import Subtitle from "../utilities/subtitle.jsx";
import { MultiField, SingleField } from "./fieldComp.jsx";
import { AdminField } from "../utilities/inputField.jsx";
import { Button } from "./button.jsx";
import oasisLogo from "../assets/oasisLogo.png";
import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <>
        <footer className="z-100">
            <FooterWave/>
            <div className="mt-[-3px] w-full min-h-50 flex flex-row sticky bottom-0 bg-linear-to-b p-5 from-oasis-blue from-10% via-oasis-blue via-40% to-white">
                {/* LEFT SIDE */}
                <section className="w-[50%]">
                    <img src={oasisLogo}/>
                </section>
                {/* MIDDLE*/}
                <section className="w-full h-full flex flex-row justify-center items-center">
                    <ul className="w-full flex flex-col items-start justify-center p-3">
                        <Title text={"Contact Info"}/>
                        <li>Email: oasisofficial@gmail.com</li>
                        <li>Phone: (+63) 123 456 7890</li>
                    </ul>
                    <ul className="w-full flex flex-col items-start justify-center p-3">
                        <Title text={"Menu"}/>
                        <Link to={"/"}><li>Home</li></Link>
                        <li>HTE Directory</li>
                        <li>OJT Hub</li>
                        <li>Announcements</li>
                    </ul>
                    <ul className="w-full flex flex-col items-start justify-center p-3">
                        <Title text={"Policy Links"}/>
                        <li>Privacy Policy</li>
                        <li>Terms & Conditions</li>
                        <li>Copyright Notice</li>
                    </ul>
                </section>
                {/* RIGHT SIDE */}
                <section className=" w-[50%] flex flex-col items-center justify-center">
                    <form>
                        <Title text={"Give our system a feedback!"}/>
                        <SingleField labelText={"Name"} fieldHolder={"Enter Name"} fieldId={"name"}/>
                        <MultiField labelText={"Message"} fieldHolder={"Enter Message"} fieldId={"message"} max={'max-h-25'}/>
                        <Button text={"Submit"}/>
                    </form>
                </section>
            </div>
        </footer>
            

        </>
    )
}