import { Label } from "../utilities/label";
import Subtitle from "../utilities/subtitle";

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

export function Filter({ text, size, isActive = false, onClick, icon }) {
    return (
        <div
            onClick={onClick}
            className={`px-3 py-2 font-oasis-text font-medium text-[0.7rem] rounded-2xl cursor-pointer transition duration-300 ease-in-out flex flex-row gap-2 items-center justify-center text-oasis-header
                ${
                    isActive
                        ? "border-b-4 border-oasis-header "
                        : ""
                }
            `}
        >
            {icon}
            <Subtitle text={text} size={size} weight={"font-bold"}/>
        </div>
    );
}

export function Dropdown({
    labelText,
    currentValueColor = {},
    fieldId,
    categories = [],
    value = "",
    onChange,
    placeholder = "Select category",
    disabled,
    hasBorder
}) {
    const handleChange = (e) => {
        onChange?.(e.target.value); 
    };
    const textColor = currentValueColor[value] || "text-black";

    return (
        <>
            <div>
                <Label labelText={labelText} fieldId={fieldId} />
                <select
                    id={fieldId}
                    value={value}
                    onChange={handleChange}
                    className={`w-full px-2 py-1 bg-white rounded text-[0.8rem] font-oasis-text disabled:cursor-not-allowed ${textColor} ${hasBorder && "border border-oasis-gray"}`}
                    disabled={disabled}
                >
                    <option value="" disabled className="text-black">
                        {`${placeholder}`}
                    </option>

                    {categories.map((option, index) => {
                        const value = typeof option === "string" ? option : option.value;
                        const label = typeof option === "string" ? option : option.label;

                        return (
                            <option key={index} value={value} className="text-black">
                                {label}
                            </option>
                        );
                    })}
                </select>
            </div>
            
        </>
    );
}

