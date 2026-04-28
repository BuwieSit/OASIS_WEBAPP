import 'animate.css';
import { useMemo, useState } from 'react';

export function AdminField({
  type = 'text',
  pholder,
  id,
  value,
  onChange,
  hasBorder,
  disabled = false,
  autoComplete = "off"
}) {
  return (
    <input
      type={type}
      placeholder={pholder}
      id={id}
      value={value}
      onChange={onChange}
      disabled={disabled}
      autoComplete={autoComplete}
      className={`bg-white w-full px-2 py-2 text-[0.9rem] rounded text-black ${
        hasBorder ? "border" : ""
      } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
    />
  );
}

export function ContentField({
  pholder,
  id,
  maxNum = 'max-h-100',
  value,
  onChange,
  disabled = false,
  hasBorder,
  autoComplete = "off"
}) {
  return (
    <textarea
      placeholder={pholder}
      id={id}
      value={value}
      onChange={onChange}
      disabled={disabled}
      autoComplete={autoComplete}
      className={`w-full ${maxNum} min-h-12 bg-white px-2 py-2 text-[0.9rem] rounded 
      ${hasBorder && "border border-oasis-gray"}
      ${
        disabled ? "opacity-60 cursor-not-allowed" : ""
      }`}
    />
  );
}

export function UploadField({ id, accept, onChange, disabled = false }) {
  const inputId = useMemo(
    () => id || `upload-${Math.random().toString(36).slice(2, 10)}`,
    [id]
  );

  const [fileName, setFileName] = useState("Select a file to upload");

  const handleChange = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      setFileName(file.name);
    }

    if (onChange) {
      onChange(e);
    }
  };

  return (
    <label
      htmlFor={inputId}
      className={`flex items-center gap-4 p-3 rounded border transition 
        ${fileName !== "Select a file to upload" ? 
          "border-oasis-button-light bg-oasis-button-light text-white" 
          : "bg-white border-gray-300"} 
          ${disabled ? 
            "opacity-60 cursor-not-allowed"
          : "cursor-pointer hover:border-oasis-button-light"
      }`}
    >
      <input
        id={inputId}
        type="file"
        accept={accept}
        onChange={handleChange}
        disabled={disabled}
        className="hidden"
      />

      <div className={`px-4 py-2 bg-oasis-button-light text-white rounded-xl text-sm font-medium`}>
        Choose File
      </div>

      <span className={`
        ${fileName !== "Select a file to upload" ? "text-white font-bold" : "text-gray-500"} 
        text-sm line-clamp-1 w-full
        
        `
      }>
        {fileName !== "Select a file to upload"
          ? `File selected: ${fileName}`
          : fileName
        }
      </span>
    </label>
  );
}
