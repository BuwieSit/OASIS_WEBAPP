import MainScreen from "../../layouts/mainScreen";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import Title from "../../utilities/title";
import Subtitle from "../../utilities/subtitle";
import { AnnounceButton } from "../../components/button";
import { useEffect, useState, useMemo, useCallback } from "react";
import fallbackImg from "../../assets/htePlaceholder.png";
import { fetchHTEById, downloadMOA, submitHteReview, getHteReviews } from "../../api/student.service";
import { StatusView } from "../../utilities/tableUtil";
import SvgLoader from "../../components/SvgLoader";
import { ChevronLeft, ChevronRight, ChevronUp, Home, LinkIcon, MapPinned, Star, Building2, Briefcase, User, Phone, Mail, Globe, MapPin } from "lucide-react";
import { AddReviewCard } from "../../utilities/card";
import SearchBar from "../../components/searchBar";
import { Dropdown } from "../../components/adminComps";
import ReviewRatings from "../../components/reviewRatings";
import { ReviewDetailModal, GeneralPopupModal } from "../../components/popupModal";
import { Check, X } from "lucide-react";
import { useLoading } from "../../context/LoadingContext";

export default function HteProfile() {
  const { setLoading: setGlobalLoading } = useLoading();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [hte, setHte] = useState(null);
  const [hteName, setHteName] = useState("");
  const [localLoading, setLocalLoading] = useState(true);
  const [popup, setPopup] = useState(null);
  const hteId = searchParams.get("hteId");

  // Redirect if no hteId is provided
  useEffect(() => {
    if (!hteId && !localLoading) {
      navigate("/htedirectory");
    }
  }, [hteId, localLoading, navigate]);
  
  // Update global loading when localLoading changes
  useEffect(() => {
    setGlobalLoading(localLoading);
    return () => setGlobalLoading(false); // Reset on unmount
  }, [localLoading, setGlobalLoading]);

  // REVIEWS STATE
  const [allReviews, setAllReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewRatingFilter, setReviewRatingFilter] = useState("All");
  const [reviewSort, setReviewSort] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReviewForModal, setSelectedReviewForModal] = useState(null);
  const itemsPerPage = 4;

  const fetchReviews = useCallback(async () => {
    if (!hteId) return;
    setReviewsLoading(true);
    try {
      const res = await getHteReviews(hteId);
      setAllReviews(res.data || []);
    } catch (err) {
      console.error("Failed to fetch reviews", err);
      setAllReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  }, [hteId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // CALCULATE STATS
  const stats = useMemo(() => {
    if (allReviews.length === 0) {
      return {
        average: 0,
        total: 0,
        distribution: [
          { stars: 5, count: 0 },
          { stars: 4, count: 0 },
          { stars: 3, count: 0 },
          { stars: 2, count: 0 },
          { stars: 1, count: 0 },
        ]
      };
    }

    const total = allReviews.length;
    const sum = allReviews.reduce((acc, r) => acc + r.rating, 0);
    const average = (sum / total).toFixed(1);

    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    allReviews.forEach(r => {
      if (counts[r.rating] !== undefined) counts[r.rating]++;
    });

    const distribution = [5, 4, 3, 2, 1].map(s => ({ stars: s, count: counts[s] }));

    return { average, total, distribution };
  }, [allReviews]);

  // FILTER & SORT
  const filteredReviews = useMemo(() => {
    let result = [...allReviews];

    // Filter by Rating
    if (reviewRatingFilter !== "All") {
      const targetStar = parseInt(reviewRatingFilter);
      result = result.filter(r => r.rating === targetStar);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.message.toLowerCase().includes(q) || 
        (r.reviewer && r.reviewer.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return reviewSort === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [allReviews, reviewRatingFilter, reviewSort, searchQuery]);

  // PAGINATION
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredReviews.slice(start, start + itemsPerPage);
  }, [filteredReviews, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [reviewRatingFilter, searchQuery]);

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
      .finally(() => setLocalLoading(false));
  }, [hteId]);

  const handleDownloadMOA = async () => {
    try {
      const res = await downloadMOA(hte.id);

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;

      const safeName = hte.company_name
        .replace(/\s+/g, "_")
        .replace(/[^\w-]/g, "");

      link.setAttribute("download", `${safeName}_MOA.pdf`);

      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Failed to download MOA", err);
    }
  };

  if (localLoading) {
    return null; // Global loader handles this
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


      {/* REDESIGNED HTE INFORMATION SECTION */}
      <div className="w-[90%] flex flex-col gap-10">
        
        {/* HEADER SECTION */}
        <section className="w-full bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row items-center gap-8 p-8 lg:p-10">
          
          {/* LOGO */}
          <div className="shrink-0">
            <img
              src={hte.thumbnail ? `${import.meta.env.VITE_API_URL}/${hte.thumbnail}` : fallbackImg}
              className="w-32 h-32 md:w-40 md:h-40 object-contain rounded-2xl border-2 border-gray-50 shadow-inner p-2 bg-white"
              alt={`${hte.company_name} logo`}
            />
          </div>

          {/* MAIN TITLES */}
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
              <Building2 className="text-oasis-header" size={24} />
              <Title
                isAnimated={false}
                text={hte.company_name}
                size={"text-2xl sm:text-3xl lg:text-4xl"}
              />
            </div>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2">
              <div className="flex items-center gap-1.5 text-oasis-header bg-oasis-blue/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <Briefcase size={14} />
                {hte.industry || "N/A"}
              </div>
              
              {hte.website && (
                <a 
                  href={hte.website.startsWith('http') ? hte.website : `https://${hte.website}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-xs font-bold hover:bg-blue-100 transition-all border border-blue-100"
                >
                  <Globe size={14} />
                  Visit Website
                </a>
              )}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-4 sm:gap-8 items-center text-gray-500">
               <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-oasis-header" />
                  <span className="text-sm font-medium">{hte.address || "No address provided."}</span>
               </div>
            </div>
          </div>
        </section>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT: ABOUT & CONTACT (COL-SPAN-2) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* ABOUT */}
            <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xs">
              <div className="flex items-center gap-2 mb-4 border-b pb-3 border-gray-50">
                 <Subtitle text={`About ${hte.company_name}`} weight="font-bold" size="text-lg" />
              </div>
              <p className="font-oasis-text text-sm sm:text-base text-gray-600 leading-relaxed text-justify">
                {hte.description || "No description available for this establishment."}
              </p>
            </section>

            {/* CONTACT INFO */}
            <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xs">
              <div className="flex items-center gap-2 mb-6 border-b pb-3 border-gray-50">
                 <Subtitle text="Contact Information" weight="font-bold" size="text-lg" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* PERSON */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-oasis-blue/10 rounded-2xl text-oasis-header">
                    <User size={24} />
                  </div>
                  <div>
                    <p className="text-[0.65rem] text-oasis-icons font-black uppercase tracking-widest mb-1">Contact Person</p>
                    <p className="font-bold text-gray-800 text-lg">{hte.contact_person || "—"}</p>
                    <p className="text-sm text-gray-500 italic font-medium">{hte.contact_position || "—"}</p>
                  </div>
                </div>

                {/* CONTACT METHODS */}
                <div className="space-y-4">
                   <div className="flex items-center gap-3 group">
                      <div className="p-2 bg-gray-50 rounded-xl text-oasis-header group-hover:bg-oasis-header group-hover:text-white transition-all">
                        <Phone size={18} />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">{hte.contact_number || "—"}</span>
                   </div>
                   
                   <div className="flex items-center gap-3 group">
                      <div className="p-2 bg-gray-50 rounded-xl text-oasis-header group-hover:bg-oasis-header group-hover:text-white transition-all">
                        <Mail size={18} />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 break-all">{hte.contact_email || "—"}</span>
                   </div>
                </div>

              </div>
            </section>

            {/* LOCATION & MAP SECTION */}
            <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xs">
              <div className="flex items-center gap-2 mb-6 border-b pb-3 border-gray-50">
                 <Subtitle text="Location & Map" weight="font-bold" size="text-lg" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="flex items-start gap-4">
                  <div className="p-4 bg-red-50 rounded-2xl text-red-500 shrink-0">
                      <MapPinned size={28} />
                  </div>
                  <div>
                      <p className="text-[0.7rem] font-black uppercase tracking-widest text-gray-400 mb-1">Main Office Address</p>
                      <p className="text-base font-bold text-gray-700 leading-relaxed">{hte.address || "No address provided."}</p>
                  </div>
                </div>

                {/* EMBEDDED GOOGLE MAP */}
                <div className="w-full aspect-video rounded-3xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50 relative group">
                  {hte.address ? (
                    <iframe
                      className="w-full h-full border-0 grayscale hover:grayscale-0 transition-all duration-700"
                      src={`https://www.google.com/maps?q=${encodeURIComponent(hte.address)}&output=embed`}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      title={`Map of ${hte.company_name}`}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-gray-400 p-10 text-center">
                      <MapPin size={48} className="opacity-20" />
                      <p className="font-oasis-text text-sm italic">Map unavailable: No address provided.</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT: OFFICIAL STATUS CARD */}
          <div className="space-y-8">
            
            <div className="bg-oasis-gradient p-8 rounded-[2.5rem] shadow-xl text-oasis-button-dark flex flex-col gap-6 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              
              <Subtitle
                text={"Internship Details"}
                size={"text-xl"}
                weight={"font-bold"}
              />

              <div className="space-y-5 relative z-10">
                <div className="flex justify-between items-center bg-white/40 p-3 rounded-2xl border border-white/50">
                  <Subtitle text="Status" size="text-xs" className="font-black uppercase tracking-wider" />
                  <StatusView value={hte.moa_status} />
                </div>

                <div className="flex flex-col gap-1 px-2">
                  <span className="text-[0.65rem] font-black uppercase tracking-widest opacity-70">Valid Until</span>
                  <p className="font-bold text-lg">{hte.moa_expiry_date || "—"}</p>
                </div>

                <div className="flex flex-col gap-2 px-2">
                  <span className="text-[0.65rem] font-black uppercase tracking-widest opacity-70 border-b border-white/20 pb-1 mb-1">Eligible Courses</span>
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      if (!hte.course || hte.course === "—") return <p className="font-bold text-base">Any Course</p>;
                      
                      try {
                        // Try to parse if it's a JSON string like ["BSIT", "BSCS"]
                        let courses = [];
                        if (typeof hte.course === 'string') {
                          if (hte.course.startsWith('[') && hte.course.endsWith(']')) {
                            courses = JSON.parse(hte.course);
                          } else {
                            courses = hte.course.split(',').map(c => c.trim());
                          }
                        } else if (Array.isArray(hte.course)) {
                          courses = hte.course;
                        }

                        if (!Array.isArray(courses) || courses.length === 0) return <p className="font-bold text-base">{hte.course}</p>;

                        return courses.map((course, index) => (
                          <span 
                            key={index}
                            className="bg-white/30 text-oasis-button-dark px-2 py-0.5 rounded-md text-[0.7rem] font-bold border border-white/40 shadow-sm whitespace-nowrap"
                          >
                            {course}
                          </span>
                        ));
                      } catch (e) {
                        // Fallback: strip brackets and split if parsing fails
                        const cleanStr = hte.course.replace(/[\[\]"]/g, '');
                        const parts = cleanStr.split(',').map(p => p.trim());
                        return parts.map((course, index) => (
                          <span 
                            key={index}
                            className="bg-white/30 text-oasis-button-dark px-2 py-0.5 rounded-md text-[0.7rem] font-bold border border-white/40 shadow-sm whitespace-nowrap"
                          >
                            {course}
                          </span>
                        ));
                      }
                    })()}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-white/30">
                  <AnnounceButton
                    btnText="Download Official MOA"
                    onClick={handleDownloadMOA}
                    className="w-full justify-center py-4 text-base"
                  />
                </div>
              </div>
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
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </section>

          <section className="w-full rounded-lg border bg-white border-gray-400 flex">
              <div className="flex-1 p-3 border-r border-gray-400 flex flex-col gap-2">
                <Subtitle text={"Filter by Rating:"}/>
                <div className="flex flex-wrap gap-2">
                  <SortByStarButton 
                    text={"All"} 
                    hasIcon={false} 
                    isActive={reviewRatingFilter === "All"}
                    onClick={() => setReviewRatingFilter("All")}
                  />
                  {[5, 4, 3, 2, 1].map((star) => (
                      <SortByStarButton 
                        key={star} 
                        text={star} 
                        isActive={reviewRatingFilter === String(star)}
                        onClick={() => setReviewRatingFilter(String(star))}
                      />
                  ))}
                  
                </div>
              </div>
            

              <div className="flex-2 p-3 flex flex-col gap-2 items-start justify-center">
                  <Subtitle text={"Sort by Date:"}/>
                  <Dropdown 
                    hasBorder={true} 
                    value={reviewSort}
                    onChange={setReviewSort}
                    categories={[
                      { label: "Newest First", value: "newest" },
                      { label: "Oldest First", value: "oldest" }
                    ]}
                  />
              </div>
          </section>

          {/* MAIN GRID */}
          <section className="grid grid-cols-1 lg:grid-cols-[33%_1fr] gap-5 w-full items-start">
            
            <div className="flex flex-col gap-5 sticky top-5 h-fit">
                
                {/* OVERALL RATING CARD */}
                <div className="w-full max-w-80 sm:w-80 flex flex-col justify-center items-center gap-3 bg-linear-to-br border border-oasis-gray rounded-lg overflow-hidden p-3 ">
            
                  <Subtitle text={"Overall Internship Ratings"} size={"text-[1rem]"} color={"text-[#2B6259]"} weight={"font-bold"} isCenter={true}/>

                  <section className="w-fit border border-oasis-gray px-3 py-1 rounded-lg flex items-center justify-center gap-2">
                    <Subtitle text={stats.average} size={"text-[2.5rem]"} weight={"font-bold"} isCenter={true}/>

                    <div className="flex gap-1">
                        {[1,2,3,4,5].map((star) => (
                          <Star 
                            key={star} 
                            size={20}
                            color="#2B6259" 
                            fill={parseFloat(stats.average) >= star ? "#2B6259" : "none"}
                          />  
                        ))}
                    </div>
                  </section>
                  <Subtitle text={`Based on ${stats.total} student reviews`} color={"text-[#2B6259]"} isItalic={true}/>

                  <ReviewRatings distribution={stats.distribution} />
                  
                </div>
                
                <AddReviewCard
                  hteName={`${hteName}`}
                  onSubmit={async ({ message, rating, isAnonymous }) => {
                    if (!message.trim()) {
                      setPopup({
                        title: "Validation Error",
                        text: "Please enter a review.",
                        icon: <X color="#800020" size={35}/>,
                        type: "failed"
                      });
                      return;
                    }
                    try {
                      await submitHteReview(hteId, {
                        rating: rating,
                        message: message,
                        criteria: isAnonymous ? "Anonymous" : "IT Intern",
                      });

                      setPopup({
                        title: "Success",
                        text: "Review submitted. Waiting for admin approval.",
                        icon: <Check size={35}/>,
                        type: "success"
                      });

                    } catch (err) {
                      console.error(err);
                      setPopup({
                        title: "Error",
                        text: "Failed to submit review.",
                        icon: <X color="#800020" size={35}/>,
                        type: "failed"
                      });
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
                    {paginatedReviews.length === 0 && 
                      <div className="col-span-full py-10">
                        <Subtitle text={"No reviews match your filter."}/>
                      </div>
                    }
                    {paginatedReviews.map((r) => (
                      <div 
                        key={r.id} 
                        onClick={() => setSelectedReviewForModal(r)}
                        className="border border-oasis-gray p-5 w-full max-w-sm aspect-3/1 rounded-lg flex flex-col gap-2 hover:shadow-md transition-shadow cursor-pointer"
                      >

                        <Subtitle text={hteName} weight={"font-bold"} size={"text-[1rem]"}/>

                        <div className="flex gap-1 w-full">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={16}
                              color={r.rating >= star ? "#EAB308" : "#D1D5DB"}
                              fill={r.rating >= star ? "#EAB308" : "none"}
                            />
                          ))}
                        </div>

                        <Subtitle 
                          text={r.message}
                          className={"text-ellipsis line-clamp-5 min-h-[5rem]"}
                          isJustify={true}
                        />

                        <Subtitle text={r.criteria === "Anonymous" ? "Anonymous" : (r.reviewer || "Anonymous")} weight={"font-bold"}/>

                        <section className="w-full flex justify-between items-center mt-auto pt-2 border-t border-gray-100">
                          <Subtitle text={r.criteria || "IT Intern"} color={"text-oasis-gray"} size="text-xs"/>
                          <Subtitle text={new Date(r.created_at).toLocaleDateString()} color={"text-oasis-gray"} size="text-xs"/>
                        </section>

                      </div>
                    ))}
                    
                  </>
                }
                
              </div>

              {/* PAGINATION SECTION */}
              {totalPages > 1 && (
                <section className="w-full flex justify-between items-center px-2 mt-4">
                  <Subtitle text={`Showing ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, filteredReviews.length)} of ${filteredReviews.length} reviews`} />

                  <div className="flex gap-4 items-center justify-center">
                      <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        className="disabled:opacity-30 p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                      >
                        <ChevronLeft size={24}/>
                      </button>
                      <Subtitle text={`${currentPage} / ${totalPages}`} size={`text-[1rem]`} weight="font-bold"/>
                      <button 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        className="disabled:opacity-30 p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                      >
                        <ChevronRight size={24}/>
                      </button>
                  </div>
                </section>
              )}
            </div>
          </section>
        </div>
            
      </div>

      <ReviewDetailModal 
        review={selectedReviewForModal}
        visible={!!selectedReviewForModal}
        onClose={() => setSelectedReviewForModal(null)}
        hteName={hteName}
      />

      {popup && (
        <GeneralPopupModal
          icon={popup.icon}
          time={popup.time || 3000}
          title={popup.title}
          text={popup.text}
          onClose={() => setPopup(null)}
          isSuccess={popup.type === "success"}
          isFailed={popup.type === "failed"}
          isNeutral={popup.type === "neutral"}
        />
      )}
    </MainScreen>
  );
}

export function SortByStarButton({ text, hasIcon = true, isActive, onClick}) {
  return (
    <>
      <div 
        onClick={onClick}
        className={`w-fit px-3 py-1 rounded-lg flex justify-center items-center gap-1 border cursor-pointer transition-all
          ${isActive ? "bg-oasis-header text-white border-oasis-header" : "bg-white text-gray-700 border-oasis-gray hover:bg-gray-50"}
        `}
      >
        <Subtitle text={text} weight={"font-bold"} color={isActive ? "text-white" : "text-gray-700"}/>
        {hasIcon && <Star size={14} color={isActive ? "white" : "#2B6259"} fill={isActive ? "white" : "#2B6259"}/>}
      </div>
    </>
  )
}
