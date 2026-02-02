import { useState } from "react";
import { Label } from "../utilities/label";

export function Container({ children, column = true }) {
    return (
        <div
            className={`w-[90%] p-5 rounded-3xl bg-admin-element flex ${
                column ? "flex-col" : "flex-row"
            } justify-between items-start shadow-[0px_0px_10px_rgba(0,0,0,0.5)]`}
        >
            {children}
        </div>
    );
}

export function Filter({ text, isActive = false, onClick }) {
    return (
        <div
            onClick={onClick}
            className={`p-3 font-oasis-text font-medium text-[0.7rem] rounded-3xl cursor-pointer
                transition duration-300 ease-in-out
                ${
                    isActive
                        ? "bg-oasis-aqua text-black translate-y-[-10%] shadow-[inset_0px_0px_5px_rgba(0,0,0,0.4)]"
                        : "bg-oasis-button-dark text-white hover:bg-oasis-aqua hover:translate-y-[-10%] drop-shadow-[0px_2px_5px_rgba(0,0,0,0.5)]"
                }
            `}
        >
            {text}
        </div>
    );
}

export function Dropdown({
    labelText,
    fieldId,
    categories = [],
    value = "",
    onChange
}) {
    const handleChange = (e) => {
        onChange?.(e.target.value); 
    };

    return (
        <>
            <Label labelText={labelText} fieldId={fieldId} />

            <select
                id={fieldId}
                value={value}
                onChange={handleChange}
                className="w-full p-3 bg-white rounded-2xl rounded-tl-none text-[0.8rem] font-oasis-text"
            >
                <option value="" disabled>
                    Select category
                </option>

                {categories.map((option, index) => (
                    <option key={index} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </>
    );
}

