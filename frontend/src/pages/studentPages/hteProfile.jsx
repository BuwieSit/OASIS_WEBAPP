import MainScreen from "../../layouts/mainScreen";
import { useSearchParams } from "react-router-dom";
import Title from "../../utilities/title";
import hteLogo from "../../assets/hteLogo.png";
import Subtitle from "../../utilities/subtitle";
import pin from "../../assets/icons/pin.png";
import linkIcon from "../../assets/icons/link.png";
import { AnnounceButton } from "../../components/button";
import { useEffect, useState } from "react";
import fallbackImg from "../../assets/fallbackImage.jpg";
import { fetchHTEById, downloadMOA } from "../../api/student.service";
import { StatusView } from "../../utilities/tableUtil";

export default function HteProfile() {
  const [searchParams] = useSearchParams();
  const [hte, setHte] = useState(null);
  const [loading, setLoading] = useState(true);
  const hteId = searchParams.get("hteId");

  useEffect(() => {
    if (!hteId) return;

    fetchHTEById(hteId)
      .then((data) => {
        setHte(data);
      })
      .catch((err) => {
        console.error("Failed to load HTE profile", err);
      })
      .finally(() => setLoading(false));
  }, [hteId]);

    const handleDownloadMOA = async () => {
      try {
        const res = await downloadMOA(hte.id);

        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;

        const safeName = hte.company_name
          .replace(/\s+/g, "_")
          .replace(/[^\w\-]/g, "");

        link.setAttribute("download", `${safeName}_MOA.pdf`);

        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (err) {
        console.error("Failed to download MOA", err);
      }
    };

  if (loading) {
    return (
      <MainScreen>
        <p className="p-5">Loading HTE profile...</p>
      </MainScreen>
    );
  }

  if (!hte) {
    return (
      <MainScreen>
        <p className="p-5">HTE not found.</p>
      </MainScreen>
    );
  }

  return (
    <MainScreen>
      <div className="flex w-full">
        {/* FIRST COLUMN */}
        <div className="w-full flex flex-col justify-center items-center p-5">
          <section className="w-full p-3 flex flex-row">
            {/* HTE LOGO */}
            <img
              src={
                hte.thumbnail
                  ? `${import.meta.env.VITE_API_URL}/${hte.thumbnail}`
                  : fallbackImg
              }
              className="object-contain w-30 rounded-full row-span-2 border"
            />

            <div className="p-3 flex flex-col justify-center items-start">
              {/* HTE NAME */}
              <Title
                isAnimated={false}
                text={hte.company_name}
                size={"text-[3rem]"}
              />

              {/* SMALL DETAILS */}
              <div className="w-full flex flex-row gap-4 items-center justify-between">
                <section className="flex justify-center items-center gap-1">
                  <img src={pin} className="w-4 aspect-square object-contain" />
                  <Subtitle
                    text={hte.address || "—"}
                    size={"text-[0.85rem]"}
                  />
                </section>

                <section className="flex justify-center items-center gap-1">
                  <img 
                    src={linkIcon} 
                    className="w-4 aspect-square object-contain" 
                  />
                  <Subtitle
                    text={hte.website || "N/A"}
                    isLink={!!hte.website}
                    link={hte.website}
                    size={"text-[0.85rem]"}
                  />
                </section>
              </div>
            </div>
          </section>

          {/* ABOUT SECTION */}
          <section className="w-full p-5 flex flex-col gap-2 place-items-start">
            <div className="w-[90%]">
              <Subtitle
                text={`About ${hte.company_name}`}
                weight={"font-bold"}
                size={"text-[0.9rem]"}
              />
              <p className="font-oasis-text text-[0.75rem] text-justify">
                {hte.description || "No description available."}
              </p>
            </div>
          </section>
        </div>

        {/* SECOND COLUMN */}
        <div className="w-full flex flex-col justify-center items-center">
          <div className="w-[70%] p-5 aspect-video rounded-3xl bg-oasis-gradient shadow-[2px_2px_2px_rgba(0,0,0,0.5)]">
            <div className="w-full px-5">
              <Subtitle
                text={"Details"}
                size={"text-[1.2rem]"}
                weight={"font-bold"}
              />
            </div>

            <div className="w-full py-5 px-10 grid grid-cols-[100px_1fr] gap-y-4 items-center">
              <Subtitle text="Status:" size="text-[1rem]" />
              <StatusView value={hte.moa_status} />

              <Subtitle text="Valid Until:" size="text-[1rem]" />
              <p>{hte.moa_expiry_date || "—"}</p>

              <Subtitle text="Course:" size="text-[1rem]" />
              <p>{hte.course || "—"}</p>

              <Subtitle text="MOA:" size="text-[1rem]" />
              <AnnounceButton
                btnText="Download MOA"
                onClick={handleDownloadMOA}
              />
            </div>
          </div>
        </div>
      </div>
    </MainScreen>
  );
}