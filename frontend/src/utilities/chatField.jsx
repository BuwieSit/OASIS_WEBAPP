import Subtitle from "./subtitle";

export default function ChatField({ isOrbi, isUser}) {
    return (
        <>
            {isOrbi && 
                <section className="py-2 flex flex-col justify-center items-start gap-1">
                    {/* These divs will be appended based on the msg */}
                    <div className="max-w-[50%] overflow-hidden bg-oasis-button-light p-3 rounded-lg duration-200 transition ease-in-out text-white wrap-break-word">
                        <Subtitle text={"Chat from orbi"}/>
                    </div>
                    <div className="max-w-[50%] overflow-hidden bg-oasis-button-light p-3 rounded-lg duration-200 transition ease-in-out text-white wrap-break-word">
                        <Subtitle text={"Chat from orbi lorem ipsum long response message test lorem ipsum dolor lorem lorem ipsum ipsum dolor dolor"}/>
                    </div>
                </section>
            }
            {isUser && 
                <section className="py-2 flex flex-col justify-center items-end gap-1">
                    <div className="max-w-[50%] overflow-hidden bg-white p-3 rounded-lg duration-200 transition ease-in-out text-black wrap-break-word">
                        <Subtitle text={"Chat from user"}/>
                    </div>

                    <div className="max-w-[50%] overflow-hidden bg-white p-3 rounded-lg duration-200 transition ease-in-out text-black wrap-break-word">
                        <Subtitle text={"Chat from user lorem ipsum dolor long message user lorem ipsum Chat from user lorem ipsum dolor long message user lorem ipsum Chat from user lorem ipsum dolor long message user lorem ipsum"}/>
                    </div>
                </section>
            }
            
        </>
    )
}