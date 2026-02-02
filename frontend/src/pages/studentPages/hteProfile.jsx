import MainScreen from "../../layouts/mainScreen";
import { useSearchParams } from "react-router-dom";
import Title from "../../utilities/title";
import hteLogo from "../../assets/hteLogo.png";
import Subtitle from "../../utilities/subtitle";
import pin from "../../assets/icons/pin.png";
import link from "../../assets/icons/link.png";
import { AnnounceButton } from "../../components/button";

export default function HteProfile() {
  const [searchParams] = useSearchParams();
  const hte = searchParams.get("hte");

  return (
    <MainScreen>
      <div className="flex w-full">
        {/* first column */}
         <div className="w-full flex flex-col justify-center items-center p-5">
          <section className="w-full p-3 flex flex-row">

              {/* HTE LOGO */}
              <img src={hteLogo} className="object-contain w-30 rounded-full row-span-2 border"/>

              <div className="p-3 flex flex-col justify-center items-start">
                  {/* HTE NAME */}
                  <Title isAnimated={false} text={hte} size={"text-[3rem]"}/>

                  {/* small details */}
                  <div className="w-full flex flex-row gap-4 items-center justify-between">
                      <section className="flex justify-center items-center">
                        <img src={pin} className="w-4 aspect-square object-contain"/>
                        <Subtitle text={"Taguig City, Philippines"} size={"text-[0.85rem]"}/>
                      </section>
                      
                      <section className="flex justify-center items-center gap-1">
                        <img src={link} className="w-4 aspect-square object-contain"/>
                        <Subtitle text={"technova.ph"} isLink={true} link={"www.youtube.com"} size={"text-[0.85rem]"}/>
                      </section>

                  </div>
              </div>
          </section>

          {/* 2nd ROW */}
          <section className="w-full p-5 flex flex-col gap-2 place-items-start">
            <div className="w-[90%]">
                <Subtitle text={"About TechNova"} weight={"font-bold"} size={"text-[0.9rem]"}/>
                <p className="font-oasis-text text-[0.75rem] text-justify">TechNova Solutions is an IT company specializing in software development, digital systems, and technical support services. The company partners with various colleges to provide hands-on training in real industry projects.
                Interns can expect mentorship, modern tools, and exposure to real client-based systems.</p>
            </div>
                
          </section>

        </div>

        {/* 2nd column */}
        <div className="w-full flex flex-col justify-center items-center">

            <div className="w-[70%] p-5 aspect-video rounded-3xl bg-oasis-gradient shadow-[2px_2px_2px_rgba(0,0,0,0.5)]">
                <div className="w-full px-5">
                  <Subtitle text={"Details"} size={"text-[1.2rem]"} weight={"font-bold"}/>
                </div>
                

                <div className="w-full py-5 px-10 grid grid-cols-[100px_1fr] gap-y-4 items-center">
                    <Subtitle text="Status:" size="text-[1rem]" />
                    <AnnounceButton btnText="Pending" />

                    <Subtitle text="Valid Until:" size="text-[1rem]" />
                    <p>December 12, 2026</p>

                    <Subtitle text="Course:" size="text-[1rem]" />
                    <p>Diploma in Information Technology</p>

                    <Subtitle text="MOA:" size="text-[1rem]" />
                    <AnnounceButton btnText="Download MOA" />
                </div>

            </div>
        </div>

      </div>
      
    </MainScreen>
  );
}
