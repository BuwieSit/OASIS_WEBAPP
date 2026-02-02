import 'animate.css';

export function AdminField({ type = 'text', pholder, id, value, onChange }) {
    return (
        <input
            type={type}
            placeholder={pholder}
            id={id}
            value={value}
            onChange={onChange}
            className='bg-white w-full px-2 py-2 text-[0.9rem] rounded-2xl text-black'
        />
    );
}

export function ContentField({ pholder, id, maxNum = 'max-h-100', value, onChange }) {
    return (
        <textarea
            placeholder={pholder}
            id={id}
            value={value}
            onChange={onChange}
            className={`w-full ${maxNum} min-h-12 bg-white px-2 py-2 text-[0.9rem] rounded-2xl rounded-tl-none`}
        />
    );
}


export function UploadField( { accept, onChange} ) {
  return (
    <label className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl cursor-pointer border border-gray-300 hover:border-oasis-button-light transition">
      
      <input
        type="file"
        accept={accept}
        onChange={onChange}
        className="hidden"
      />

      <div className="px-4 py-2 bg-oasis-button-light text-white rounded-xl text-sm font-medium">
        Choose File
      </div>

      <span className="text-sm text-gray-500">
        No file selected
      </span>
    </label>
  );
}
