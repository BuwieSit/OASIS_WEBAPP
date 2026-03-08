import 'animate.css';
import { useMemo } from 'react';

export function AdminField({
  type = 'text',
  pholder,
  id,
  value,
  onChange,
  hasBorder,
  disabled = false
}) {
  return (
    <input
      type={type}
      placeholder={pholder}
      id={id}
      value={value}
      onChange={onChange}
      disabled={disabled}
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
  disabled = false
}) {
  return (
    <textarea
      placeholder={pholder}
      id={id}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full ${maxNum} min-h-12 bg-white px-2 py-2 text-[0.9rem] rounded ${
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

  return (
    <label
      htmlFor={inputId}
      className={`w-full flex items-center gap-4 p-4 bg-white rounded border border-gray-300 transition ${
        disabled
          ? "opacity-60 cursor-not-allowed"
          : "cursor-pointer hover:border-oasis-button-light"
      }`}
    >
      <input
        id={inputId}
        type="file"
        accept={accept}
        onChange={onChange}
        disabled={disabled}
        className="hidden"
      />

      <div className="px-4 py-2 bg-oasis-button-light text-white rounded-xl text-sm font-medium">
        Choose File
      </div>

      <span className="text-sm text-gray-500">
        Select a file to upload
      </span>
    </label>
  );
}