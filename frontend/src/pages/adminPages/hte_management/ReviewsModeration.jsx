import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { AdminAPI } from '../../../api/admin.api';
import Title from '../../../utilities/title.jsx';
import Subtitle from '../../../utilities/subtitle.jsx';
import { RatingLabel } from '../../../utilities/label.jsx';
import { Filter } from '../../../components/adminComps.jsx';
import { Dropdown } from '../../../components/adminComps.jsx';

export default function ReviewsModeration() {
    const queryClient = useQueryClient();
    
    // REVIEWS MODERATION STATE
    const [reviewStatus, setReviewStatus] = useState("PENDING");
    const [reviewCriteria, setReviewCriteria] = useState("");
    const [reviewSort, setReviewSort] = useState("newest");
    const [reviewRating, setReviewRating] = useState("");
    const [reviewHteName, setReviewHteName] = useState("");

    const reviewParams = useMemo(() => {
        const params = { status: reviewStatus, sort: reviewSort };
        if (reviewCriteria) params.criteria = reviewCriteria;
        if (reviewRating) params.rating = reviewRating;
        if (reviewHteName) params.hte_name = reviewHteName;
        return params;
    }, [reviewStatus, reviewSort, reviewCriteria, reviewRating, reviewHteName]);

    const { data: reviews = [], isLoading: reviewsLoading, refetch: refetchReviews } = useQuery({
        queryKey: ['adminReviews', reviewParams],
        queryFn: () => AdminAPI.getReviews(reviewParams),
    });

    const approveReviewMutation = useMutation({
        mutationFn: AdminAPI.approveReview,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminReviews'] }),
    });

    const rejectReviewMutation = useMutation({
        mutationFn: AdminAPI.rejectReview,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminReviews'] }),
    });

    return (
        <div className='w-[90%] flex flex-col items-center animate__animated animate__fadeIn'>
            <div className='flex justify-start items-start w-full mb-5 border-b border-gray-200 pb-3'>
                <Title text={"Reviews Moderation"} />
            </div>
            <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
                <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
                    {reviewsLoading ? (
                        <Subtitle text="Loading..." />
                    ) : reviews.length === 0 ? (
                        <Subtitle text="No reviews found." />
                    ) : (
                        reviews.map(r => (
                            <div key={r.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <Subtitle text={r.criteria === "Anonymous" ? "Anonymous" : (r.reviewer || "Anonymous Student")} weight="font-bold" color="text-oasis-header" />
                                        <p className='text-[0.7rem] font-bold text-gray-400 uppercase'>{r.hte_name}</p>
                                    </div>
                                    <RatingLabel rating={String(r.rating)} />
                                </div>
                                <p className="text-sm text-gray-700 my-4 italic bg-gray-50 p-3 rounded-xl border border-gray-100">"{r.message}"</p>
                                <div className="flex justify-end gap-3 mt-4 border-t pt-4">
                                    <button 
                                        onClick={() => approveReviewMutation.mutate(r.id)} 
                                        className="px-6 py-2 bg-oasis-header text-white rounded-xl text-xs font-bold hover:bg-oasis-button-dark transition-all"
                                    >
                                        Approve
                                    </button>
                                    <button 
                                        onClick={() => rejectReviewMutation.mutate(r.id)} 
                                        className="px-6 py-2 border border-oasis-red text-oasis-red rounded-xl text-xs font-bold hover:bg-red-50 transition-all"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                
                <div className="bg-white p-6 rounded-3xl border border-gray-200 h-fit sticky top-5 shadow-sm">
                    <Subtitle text="Quick Filters" weight="font-bold" color="text-oasis-header" />
                    <div className="flex flex-col gap-6 mt-6">
                        <div>
                            <Subtitle text="Workflow Status" size="text-xs" weight="font-bold" />
                            <div className="flex flex-wrap gap-1 mt-2">
                                {["PENDING", "APPROVED", "REJECTED"].map(s => (
                                    <Filter 
                                        key={s} 
                                        text={s.charAt(0) + s.slice(1).toLowerCase()} 
                                        isActive={reviewStatus === s} 
                                        onClick={() => setReviewStatus(s)} 
                                    />
                                ))}
                            </div>
                        </div>
                        <Dropdown 
                            labelText="Rating Filter" 
                            categories={["All", "5", "4", "3", "2", "1"]} 
                            value={reviewRating === "" ? "All" : reviewRating} 
                            onChange={(val) => setReviewRating(val === "All" ? "" : val)} 
                            hasBorder 
                        />
                        <button 
                            onClick={() => refetchReviews()} 
                            className="w-full py-3 bg-oasis-header text-white rounded-xl font-bold hover:bg-oasis-button-dark transition-all shadow-lg shadow-oasis-header/10"
                        >
                            Refresh Data
                        </button>
                        <button 
                            onClick={() => { setReviewStatus("PENDING"); setReviewRating(""); setReviewHteName(""); }} 
                            className="w-full text-xs text-gray-400 underline cursor-pointer"
                        >
                            Reset All Filters
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
