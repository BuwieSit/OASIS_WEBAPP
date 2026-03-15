import { AnnounceButton } from "../components/button";
import { LandingHeader } from "../components/headers";

export default function LandingScreen( { children }) {

    return (
        <>
            
            <div className={`w-full h-full pb-5 bg-page-white flex flex-col  overflow-x-hidden overflow-y-auto`}>
                <LandingHeader/>
                {children}
            </div>
        </>
    )
}
