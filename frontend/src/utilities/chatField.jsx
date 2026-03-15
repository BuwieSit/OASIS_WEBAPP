import Subtitle from "./subtitle";

export default function ChatField({ isOrbi, isUser}) {
    return (
        <>
            {isOrbi && 
                <section className="py-2 flex flex-col justify-center items-start gap-1">
                    {/* These divs will be appended based on the msg */}
                    <div className="flex flex-col justify-center items-start">
                        <div className="animate__animate animate__bounceIn max-w-[50%] overflow-hidden bg-oasis-button-light shadow-oasis-button-light shadow-[0px_0px_10px] p-3 rounded-lg duration-200 transition ease-in-out text-white wrap-break-word ml-4">
                            <Subtitle text={"Chat from orbi lorem ipsum long response message test lorem ipsum dolor lorem lorem ipsum ipsum dolor dolor"}/>
                        </div>

                        <section className="p-3 w-[45%] flex flex-col justify-start items-start gap-1 ">
                            <div className="rounded-full aspect-square w-2 shadow-[0px_0px_5px] shadow-oasis-button-light ml-1.5"/>
                            <div className="rounded-full aspect-square w-1.5 shadow-[0px_0px_5px] shadow-oasis-button-light ml-1"/>
                            <div className="rounded-full aspect-square w-1 shadow-[0px_0px_5px] shadow-oasis-button-light ml-"/>
                        </section>
                    </div>


                </section>
            }
            {isUser && 
                <section className="py-2 flex flex-col justify-center items-end gap-2">
                    
                    {/* chat */}
                    <div className="flex flex-col justify-center items-end">
                        <div className="animate__animate animate__bounceIn max-w-[50%] overflow-hidden shadow-oasis-button-light shadow-[0px_0px_5px] p-3 rounded-lg duration-200 transition ease-in-out text-black wrap-break-word mr-5">
                        
                            <Subtitle text={"Chat from user lorem ipsum dolor long message user lorem ipsum Chat from user lorem ipsum dolor long message user lorem ipsum Chat from user lorem ipsum dolor long message user lorem ipsum"}/>
                        </div>
                        

                        <section className="p-3 w-[45%] flex flex-col justify-end items-end gap-1">
                            <div className="rounded-full aspect-square w-2 shadow-oasis-button-light shadow-[0px_0px_5px] mr-2.5"/>
                            <div className="rounded-full aspect-square w-1.5 shadow-oasis-button-light shadow-[0px_0px_5px] mr-1.5"/>
                            <div className="rounded-full aspect-square w-1 shadow-oasis-button-light shadow-[0px_0px_5px] mr-0.5"/>
                        </section>
                    </div> 
                    
                        
                </section>
            }
            
        </>
    )
}