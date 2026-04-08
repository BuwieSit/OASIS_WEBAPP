import Subtitle from "./subtitle";

function TypingDots() {
    return (
        <div className="flex items-center gap-1 py-1">
            <span className="w-2 h-2 rounded-full bg-white/90 animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 rounded-full bg-white/90 animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 rounded-full bg-white/90 animate-bounce" />
        </div>
    );
}

function MessageText({ text }) {
    const lines = String(text || "").split("\n");

    return (
        <div className="whitespace-pre-wrap break-words leading-relaxed">
            {lines.map((line, index) => (
                <div key={index} className={line.trim() === "" ? "h-3" : ""}>
                    {line.trim() === "" ? "" : <Subtitle text={line} />}
                </div>
            ))}
        </div>
    );
}

export default function ChatField({
    isOrbi,
    isUser,
    text = "",
    isLoading = false,
    moaLink = null
}) {
    return (
        <>
            {isOrbi && (
                <section className="py-2 flex flex-col justify-center items-start gap-1">
                    <div className="flex flex-col justify-center items-start w-full">
                        <div
                            className="
                                animate__animated animate__fadeInUp
                                max-w-[82%] sm:max-w-[78%]
                                overflow-hidden
                                bg-oasis-button-light
                                shadow-oasis-button-light shadow-[0px_0px_10px]
                                px-4 py-3
                                rounded-2xl rounded-bl-md
                                duration-200 transition ease-in-out
                                text-white
                                ml-2 sm:ml-4
                            "
                        >
                            {isLoading ? (
                                <TypingDots />
                            ) : (
                                <>
                                    <MessageText text={text} />

                                    {moaLink && (
                                        <a
                                            href={moaLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="
                                                mt-3 inline-block
                                                px-4 py-2
                                                bg-white text-oasis-header
                                                rounded-full
                                                text-[0.75rem] font-medium
                                                shadow
                                                hover:bg-oasis-header hover:text-white
                                                transition
                                            "
                                        >
                                            📄 View MOA File
                                        </a>
                                    )}
                                </>
                            )}
                        </div>

                        <section className="p-3 w-[45%] flex flex-col justify-start items-start gap-1">
                            <div className="rounded-full aspect-square w-2 shadow-[0px_0px_5px] shadow-oasis-button-light ml-1.5" />
                            <div className="rounded-full aspect-square w-1.5 shadow-[0px_0px_5px] shadow-oasis-button-light ml-1" />
                            <div className="rounded-full aspect-square w-1 shadow-[0px_0px_5px] shadow-oasis-button-light ml-0.5" />
                        </section>
                    </div>
                </section>
            )}

            {isUser && (
                <section className="py-2 flex flex-col justify-center items-end gap-2">
                    <div className="flex flex-col justify-center items-end w-full">
                        <div
                            className="
                                animate__animated animate__fadeInUp
                                max-w-[82%] sm:max-w-[78%]
                                overflow-hidden
                                bg-white
                                shadow-oasis-button-light shadow-[0px_0px_5px]
                                px-4 py-3
                                rounded-2xl rounded-br-md
                                duration-200 transition ease-in-out
                                text-black
                                mr-2 sm:mr-5
                            "
                        >
                            <MessageText text={text} />
                        </div>

                        <section className="p-3 w-[45%] flex flex-col justify-end items-end gap-1">
                            <div className="rounded-full aspect-square w-2 shadow-oasis-button-light shadow-[0px_0px_5px] mr-2.5" />
                            <div className="rounded-full aspect-square w-1.5 shadow-oasis-button-light shadow-[0px_0px_5px] mr-1.5" />
                            <div className="rounded-full aspect-square w-1 shadow-oasis-button-light shadow-[0px_0px_5px] mr-0.5" />
                        </section>
                    </div>
                </section>
            )}
        </>
    );
}