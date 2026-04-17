import MainScreen from "../../layouts/mainScreen";
import { Link, useSearchParams } from "react-router-dom";
import Title from "../../utilities/title";
import Subtitle from "../../utilities/subtitle";
import { AnnounceButton } from "../../components/button";
import { useEffect, useState } from "react";
import fallbackImg from "../../assets/htePlaceholder.png";
import { fetchHTEById, downloadMOA, submitHteReview } from "../../api/student.service";
import { StatusView } from "../../utilities/tableUtil";
import SvgLoader from "../../components/SvgLoader";
import { ChevronLeft, ChevronRight, ChevronUp, Home, LinkIcon, MapPinned, Star } from "lucide-react";
import { AddReviewCard } from "../../utilities/card";
import SearchBar from "../../components/searchBar";
import { Dropdown } from "../../components/adminComps";
import ReviewRatings from "../../components/reviewRatings";

export default function HteProfile() {
  const [searchParams] = useSearchParams();
  const [hte, setHte] = useState(null);
  const [hteName, setHteName] = useState("");
  const [loading, setLoading] = useState(true);
  const hteId = searchParams.get("hteId");
  
  // REVIEWS
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewRating, setReviewRating] = useState(null);
  const [reviewHteName, setReviewHteName] = useState("");
  
    const fetchReviews = async () => {
        setReviewsLoading(true);
        try {
            const params = {
                status: reviewStatus,
                sort: reviewSort,
            };
            if (reviewCriteria) params.criteria = reviewCriteria;
            if (reviewRating) params.rating = reviewRating;
            if (reviewHteName) params.hte_name = reviewHteName;

            const res = await AdminAPI.getReviews(params);
            setReviews(res.data || []);
        } catch (err) {
            console.error(err);
            setReviews([]);
        } finally {
            setReviewsLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [reviewRating, reviewHteName]);

  useEffect(() => {
    if (!hteId) return;

    fetchHTEById(hteId)
      .then((data) => {
        setHte(data);
        setHteName(data.company_name);
        
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
        <SvgLoader/>
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
      <Link to={"/htedirectory"} className="w-[80%] p-4 flex items-center justify-center gap-5 group transition ease-in-out duration-100 rounded-full hover:bg-oasis-header hover:text-white mb-5">
        <ChevronUp size={30} className="transition ease-in-out duration-200 rotate-180  group-hover:rotate-0"/>
        <Subtitle text={"Go back"} size={"1rem"}/>
      </Link>
      <div className="w-[90%] flex flex-col lg:flex-row gap-10">

        {/* FIRST COLUMN */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-5">

          {/* HEADER SECTION */}
          <section className="w-full flex flex-col sm:flex-row gap-5 justify-center items-center sm:items-center">

            {/* HTE LOGO */}
            <img
              src={
                hte.thumbnail
                  ? `${import.meta.env.VITE_API_URL}/${hte.thumbnail}`
                  : fallbackImg
              }
              className="object-contain w-24 sm:w-28 md:w-32 rounded-full border"
            />

            <div className="flex flex-col justify-center items-center sm:items-center text-center sm:text-left">

              <Title
                isAnimated={false}
                text={hte.company_name}
                size={"text-2xl sm:text-3xl lg:text-4xl"}
              />

              {/* SMALL DETAILS */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 mt-3">

                <section className="flex items-center gap-1 justify-center sm:justify-start">
                  <MapPinned size={20}/>
                  <Subtitle
                    text={hte.address || "—"}
                    size={"text-xs sm:text-sm"}
                  />
                </section>

                <section className="flex items-center gap-1 justify-center sm:justify-start">
                  <LinkIcon size={20}/>
                  <Subtitle
                    text={hte.website || "N/A"}
                    isLink={!!hte.website}
                    link={hte.website}
                    size={"text-xs sm:text-sm"}
                  />
                </section>

              </div>
            </div>
          </section>

          {/* ABOUT SECTION */}
          <section className="w-full mt-10 flex flex-col gap-2 justify-center items-start">
            <Subtitle
              text={`About ${hte.company_name}`}
              weight={"font-bold"}
              size={"text-sm sm:text-base"}
            />
            <p className="font-oasis-text text-xs sm:text-sm text-justify">
              {hte.description || "No description available."}
            </p>
          </section>

        </div>


        {/* SECOND COLUMN */}
        <div className="w-full lg:w-1/2 flex justify-center items-start">
                 
          <div className="
            w-[80%]
            max-w-md
            p-6
            aspect-auto
            rounded-3xl
            bg-oasis-gradient
            shadow-[2px_2px_5px_rgba(0,0,0,0.5)]
          ">

            <Subtitle
              text={"Details"}
              size={"text-lg sm:text-xl"}
              weight={"font-bold"}
            />

            <div className="mt-5 grid grid-cols-[110px_1fr] gap-y-4 items-center">

              <Subtitle text="Status:" size="text-sm" />
              <StatusView value={hte.moa_status} />

              <Subtitle text="Valid Until:" size="text-sm" />
              <p className="text-sm">{hte.moa_expiry_date || "—"}</p>

              <Subtitle text="Course:" size="text-sm" />
              <p className="text-sm">{hte.course || "—"}</p>

              <Subtitle text="MOA:" size="text-sm" />
              <AnnounceButton
                btnText="Download MOA"
                onClick={handleDownloadMOA}
              />

            </div>
          </div>

        </div>

      </div>
      {/* =========================
          REVIEWS SECTION
      ========================= */}

      <div className="w-[90%] mt-15 p-5">

        {/* SUBMIT REVIEWS NEW */} 
        <div className="w-full p-5 flex flex-col gap-5">
          <section className="w-full flex flex-col items-center justify-center">
            <Subtitle text={"Student Reviews"} size={"text-[1.8rem]"} color={"text-[#2B6259]"} weight={"font-bold"}/>
            <Subtitle text={"See what students say about this HTE"}/>
          </section>
          
          <section className="w-full flex items-center justify-start">
            <SearchBar/>
          </section>

          <section className="w-full rounded-lg border bg-white border-gray-400 flex">
              <div className="flex-1 p-3 border-r border-gray-400 flex flex-col gap-2">
                <Subtitle text={"Filter by Rating:"}/>
                <div className="flex flex-wrap gap-2">
                  <SortByStarButton text={"All"} hasIcon={false}/>
                  {Array.from({ length: 5 }, (_, i) => 5 - i).map((star) => (
                      <SortByStarButton key={star} text={star} />
                  ))}
                  
                </div>
              </div>
            

              <div className="flex-2 p-3 flex flex-col gap-2 items-start justify-center">
                  <Subtitle text={"Sort by Date:"}/>
                  <Dropdown hasBorder={true}/>
              </div>
          </section>

          {/* MAIN GRID */}
          <section className="grid grid-cols-1 lg:grid-cols-[33%_1fr] gap-5 w-full items-start">
            
            <div className="flex flex-col gap-5 sticky top-5 h-fit">
                
                {/* OVERALL RATING CARD */}
                <div className="w-full max-w-80 sm:w-80 flex flex-col justify-center items-center gap-3 bg-linear-to-br border border-oasis-gray rounded-lg overflow-hidden p-3 ">
            
                  <Subtitle text={"Overall Internship Ratings"} size={"text-[1rem]"} color={"text-[#2B6259]"} weight={"font-bold"} isCenter={true}/>

                  <section className="w-fit border border-oasis-gray px-3 py-1 rounded-lg flex items-center justify-center gap-2">
                    <Subtitle text={"4.1"} size={"text-[2.5rem]"} weight={"font-bold"} isCenter={true}/>

                    <div className="flex gap-2">
                        {[1,2,3,4,5].map((star) => (
                          <Star key={star} color="#2B6259" fill="#2B6259"/>  
                        ))}
                    </div>
                  </section>
                  <Subtitle text={`Based on 1,123 student reviews`} color={"text-[#2B6259]"} isItalic={true}/>

                  <ReviewRatings/>
                  
                </div>
                
                <AddReviewCard
                  hteName={`${hteName}`} 
                  onSubmit={async ({ message, rating }) => {
                    if (!message.trim()) {
                      alert("Please enter a review.");
                      return;
                    }
                    try {
                      await submitHteReview(hteId, {
                        rating: rating,
                        message: message,
                      });

                      alert("Review submitted. Waiting for admin approval.");

                    } catch (err) {
                      console.error(err);
                      alert("Failed to submit review.");
                    }
                  }}
                />

            </div>
            
            <div className="flex flex-col gap-2">
              
              {/* REVIEW GRID */}
              <div className="w-full row-span-2 p-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 justify-items-center">
                {reviewsLoading ? 
                  <Subtitle text={"Loading Reviews..."}/> 
                  : 
                  <>
                    {reviews.length === 0 && 
                      <div>
                        <Subtitle text={"No reviews yet."}/>
                      </div>
                      
                    }
                    {reviews.map((r) => (
                      <div key={r.id} className="border border-oasis-gray p-5 w-full max-w-sm aspect-3/1 rounded-lg flex flex-col gap-2">
                      
                        <Subtitle text={"Prima Tech"} weight={"font-bold"} size={"text-[1rem]"}/>
                        
                        <div className="flex gap-2 w-full">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={16}
                              className={r.rating >= star ? "text-yellow-400" : "text-gray-300"}
                            />
                          ))}
                        </div>

                        <Subtitle 
                          text={r.message}
                          className={"text-ellipsis line-clamp-5"}
                          isJustify={true}
                        />

                        <Subtitle text={r.reviewer || "Anonymous"} weight={"font-bold"}/>

                        <section className="w-full flex justify-between items-center">
                          <Subtitle text={"IT Intern"} color={"text-oasis-gray"}/>
                          <Subtitle text={new Date(r.created_at).toLocaleDateString()} color={"text-oasis-gray"}/>
                        </section>

                      </div>
                    ))}
                    
                  </>
                }
                
              </div>

              {/* PAGINATION SECTION */}
              <section className="w-full flex justify-between items-center px-2">

                <Subtitle text={`Showing 1-4 of 100 reviews`} />

                <div className="flex gap-2 items-center justify-center">
                    <ChevronLeft/>
                    <Subtitle text={"1 / 20"} size={`text-[1rem]`}/>
                    <ChevronRight/>
                </div>
              </section>
            </div>
          </section>
        </div>
            
      </div>
    </MainScreen>
  );
}

export function SortByStarButton({ text, hasIcon = true, onActive}) {
  return (
    <>
      <div className="w-fit px-2 py-0.5 rounded-lg flex justify-center items-center gap-1 border border-oasis-gray cursor-pointer">
        <Subtitle text={text} weight={"font-bold"}/>
        {hasIcon && <Star size={15} color="#2B6259" fill="#2B6259"/>}
      </div>
    </>
  )
}
