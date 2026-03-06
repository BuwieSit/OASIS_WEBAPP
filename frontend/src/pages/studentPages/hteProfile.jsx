import MainScreen from "../../layouts/mainScreen";
import { Link, useSearchParams } from "react-router-dom";
import Title from "../../utilities/title";
import hteLogo from "../../assets/hteLogo.png";
import Subtitle from "../../utilities/subtitle";
import pin from "../../assets/icons/pin.png";
import linkIcon from "../../assets/icons/link.png";
import { AnnounceButton } from "../../components/button";
import { useEffect, useState } from "react";
import fallbackImg from "../../assets/htePlaceholder.png";
import { fetchHTEById, downloadMOA, getHteReviews, submitHteReview } from "../../api/student.service";
import { StatusView } from "../../utilities/tableUtil";
import SvgLoader from "../../components/SvgLoader";
import { Home } from "lucide-react";

export default function HteProfile() {
  const [searchParams] = useSearchParams();
  const [hte, setHte] = useState(null);
  const [loading, setLoading] = useState(true);
  const hteId = searchParams.get("hteId");3

  // REVIEWS
  const [reviews, setReviews] = useState([]);
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

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

  const handleSubmitReview = async () => {

  if (!reviewMessage.trim()) {
    alert("Please enter a review.");
    return;
  }

  try {

    setReviewSubmitting(true);

    await submitHteReview(hteId, {
      rating: reviewRating,
      message: reviewMessage
    });

    alert("Review submitted. Waiting for admin approval.");

    setReviewMessage("");
    setReviewRating(5);

  } catch (err) {

    console.error(err);
    alert("Failed to submit review.");

  } finally {

    setReviewSubmitting(false);

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
      <Link to={"/htedirectory"}><AnnounceButton icon={<Home/>} btnText="Go Back"/></Link>
      <div className="w-full flex flex-col lg:flex-row gap-10">

        {/* FIRST COLUMN */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-5">

          {/* HEADER SECTION */}
          <section className="w-full flex flex-col sm:flex-row gap-5 items-center sm:items-start">

            {/* HTE LOGO */}
            <img
              src={
                hte.thumbnail
                  ? `${import.meta.env.VITE_API_URL}/${hte.thumbnail}`
                  : fallbackImg
              }
              className="object-contain w-24 sm:w-28 md:w-32 rounded-full border"
            />

            <div className="flex flex-col justify-center items-center sm:items-start text-center sm:text-left">

              <Title
                isAnimated={false}
                text={hte.company_name}
                size={"text-2xl sm:text-3xl lg:text-4xl"}
              />

              {/* SMALL DETAILS */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 mt-3">

                <section className="flex items-center gap-1 justify-center sm:justify-start">
                  <img src={pin} className="w-4 aspect-square object-contain" />
                  <Subtitle
                    text={hte.address || "—"}
                    size={"text-xs sm:text-sm"}
                  />
                </section>

                <section className="flex items-center gap-1 justify-center sm:justify-start">
                  <img
                    src={linkIcon}
                    className="w-4 aspect-square object-contain"
                  />
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
          <section className="w-full mt-10 flex flex-col gap-2 justify-center items-center">
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

      <div className="w-full mt-15">

        <Subtitle
          text="Student Reviews"
          weight="font-bold"
          size="text-lg"
        />

        {/* EXISTING REVIEWS */}

        <div className="mt-5 flex flex-col gap-4">

          {reviews.length === 0 && (
            <p className="font-oasis-text text-sm">No reviews yet.</p>
          )}

          {reviews.map((r) => (

            <div
              key={r.id}
              className="w-full p-4 bg-white rounded-xl shadow-[0px_2px_5px_rgba(0,0,0,0.2)]"
            >

              <div className="flex justify-between items-center">

                <Subtitle
                  text={r.reviewer || "Anonymous"}
                  weight="font-bold"
                  size="text-sm"
                />

                <span className="text-xs italic">
                  {new Date(r.created_at).toLocaleDateString()}
                </span>

              </div>

              <div className="mt-2">
                ⭐ {r.rating} / 5
              </div>

              <p className="mt-2 text-sm font-oasis-text">
                {r.message}
              </p>

            </div>

          ))}

        </div>

        {/* SUBMIT REVIEW */}

        <div className="mt-10 flex flex-col gap-3">

          <Subtitle
            text="Leave a Review"
            weight="font-bold"
            size="text-md"
          />

          <textarea
            className="w-full p-3 rounded-lg border font-oasis-text text-sm"
            rows="4"
            placeholder="Write your review here..."
            value={reviewMessage}
            onChange={(e) => setReviewMessage(e.target.value)}
          />

          <div className="flex items-center gap-3">

            <span className="text-sm">Rating:</span>

            <select
              value={reviewRating}
              onChange={(e) => setReviewRating(Number(e.target.value))}
              className="p-2 border rounded"
            >
              <option value={5}>5</option>
              <option value={4}>4</option>
              <option value={3}>3</option>
              <option value={2}>2</option>
              <option value={1}>1</option>
            </select>

            <AnnounceButton
              btnText={reviewSubmitting ? "Submitting..." : "Submit Review"}
              onClick={handleSubmitReview}
            />

          </div>

        </div>

      </div>
    </MainScreen>
  );
}