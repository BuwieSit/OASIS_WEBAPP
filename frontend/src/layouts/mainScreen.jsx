import { Header, StudentHeader } from '../components/headers'
import Footer from '../components/footer'   
import OrbiChatbot from '../components/OrbiChatbot';
import ProspectMoaForm from '../components/prospectMoaForm';


export default function MainScreen({ children,  showHeader = true, hasTopMargin = true, isRow = false}) {

    return(
        <>
            <div className={`w-full h-full pb-5 bg-[#F4FCF8] flex flex-col justify-center items-center overflow-x-hidden overflow-y-auto`}>
                <Header /> 
                {showHeader ? <StudentHeader/> : ""}
                {hasTopMargin ? <div className='mt-25'></div> : ""}
                {children}

                <OrbiChatbot/>

                <div className='my-20'></div>
                <ProspectMoaForm/>
                <Footer />
            </div>
        </>
    )
}
