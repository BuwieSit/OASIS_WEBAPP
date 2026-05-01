import { Link } from 'react-router-dom';
import oasisLogo from './assets/oasisLogo.png';
import Title from './utilities/title';
import Subtitle from './utilities/subtitle';
import LandingScreen from './layouts/landingScreen';
import { AnnounceButton } from './components/button';
import { Home, Compass } from 'lucide-react';

export default function NotFound() {
    return(
        <LandingScreen>
            <div className='w-full h-[calc(100vh-60px)] flex flex-col justify-center items-center px-6 text-center overflow-hidden'>
                {/* 404 Background Decoration */}
                <div className="absolute text-[15rem] md:text-[25rem] font-black text-oasis-header/5 pointer-events-none select-none animate__animated animate__fadeIn">
                    404
                </div>

                <div className='relative z-10 flex flex-col items-center gap-6 animate__animated animate__zoomIn animate__faster'>
                    <div className="relative">
                        <img 
                            src={oasisLogo} 
                            className='w-48 sm:w-64 md:w-80 aspect-auto drop-shadow-2xl' 
                            alt="OASIS Logo"
                        />
                        <div className="absolute -top-4 -right-4 p-3 bg-white rounded-full shadow-lg animate-bounce">
                            <Compass size={32} className="text-oasis-header" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Title text="Are you lost?" size="text-3xl md:text-5xl" />
                        <Subtitle 
                            text="The page you're looking for doesn't exist or has been moved." 
                            size="text-base md:text-lg"
                            color="text-gray-500"
                            isCenter
                            isItalic
                        />
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row gap-4">
                        <Link to="/">
                            <AnnounceButton 
                                btnText="Back to Home" 
                                icon={<Home size={18} />}
                                isFullWidth={true}
                                className="!px-8 !py-3 !text-base shadow-lg hover:shadow-oasis-header/20"
                            />
                        </Link>
                    </div>

                    <div className="mt-12 flex items-center gap-3 text-gray-400">
                        <div className="h-px w-8 bg-gray-200"></div>
                        <span className="text-[0.65rem] font-black uppercase tracking-widest">FOR QUESTIONS: oasiskomunidevs@gmail.com</span>
                        <div className="h-px w-8 bg-gray-200"></div>
                    </div>
                </div>
            </div>
        </LandingScreen>
    )
}