import BaseModal from "./BaseModal";
import Subtitle from "../../utilities/subtitle";
import { Star } from "lucide-react";

export function ReviewDetailModal({ review, visible, onClose, hteName }) {
    if (!review) return null;

    return (
        <BaseModal 
            visible={visible} 
            onClose={onClose}
            maxWidth="max-w-2xl"
            padding="p-0"
        >
            {/* HEADER */}
            <div className="p-8 bg-oasis-gradient flex flex-col gap-2 border-b border-gray-100">
                <Subtitle text={hteName || "HTE Review"} weight="font-bold" size="text-xl" />
                <div className="flex items-center gap-3">
                     <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                size={18}
                                color={review.rating >= star ? "#EAB308" : "#D1D5DB"}
                                fill={review.rating >= star ? "#EAB308" : "none"}
                            />
                        ))}
                    </div>
                    <span className="text-sm font-bold text-gray-500 bg-white/50 px-3 py-1 rounded-full uppercase tracking-wider">
                        {review.rating}.0 Rating
                    </span>
                </div>
            </div>

            {/* MESSAGE AREA */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-gray-50/30">
                <p className="text-gray-700 leading-relaxed text-lg font-oasis-text italic whitespace-pre-wrap">
                    "{review.message}"
                </p>
            </div>

            {/* FOOTER */}
            <div className="p-6 bg-white border-t border-gray-100 flex justify-between items-center">
                <div className="flex flex-col">
                    <Subtitle text={review.criteria === "Anonymous" ? "Anonymous" : (review.reviewer || "Anonymous")} weight="font-bold" size="text-sm" />
                    <p className="text-xs text-gray-400 font-medium">
                        {review.criteria || "IT Intern"} • {new Date(review.created_at).toLocaleDateString()}
                    </p>
                </div>
                <button 
                    onClick={onClose}
                    className="px-6 py-2 bg-oasis-button-dark text-white rounded-xl font-bold text-sm hover:bg-oasis-header transition-all"
                >
                    Close
                </button>
            </div>
        </BaseModal>
    );
}
