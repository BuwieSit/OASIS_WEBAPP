import BaseModal from "./BaseModal";
import { AnnounceButton } from "../button";
import Subtitle from "../../utilities/subtitle";

export function ConfirmModal({ confText = "complete action?", onCancel, onLogOut, onConfirm, visible = true }) {
    // If visible is not passed (legacy usage), we assume it's controlled by the parent rendering it conditionally.
    // However, to use BaseModal properly, we should ideally pass 'visible'.
    // For now, I'll keep it compatible with existing conditional rendering if 'visible' is undefined.
    
    return (
        <BaseModal 
            visible={visible} 
            onClose={onCancel} 
            showCloseButton={false} 
            padding="p-10"
            className="flex flex-col items-center justify-center gap-5"
        >
            <Subtitle 
                text={`Do you want to ${confText}`} 
                size="text-[1rem]" 
                weight="font-bold" 
                isCenter={true}
            />
            <div className="flex flex-row gap-3">
                <AnnounceButton btnText="Confirm" onClick={onLogOut || onConfirm}/>
                <AnnounceButton btnText="Cancel" onClick={onCancel}/>
            </div>
        </BaseModal>
    );
}
