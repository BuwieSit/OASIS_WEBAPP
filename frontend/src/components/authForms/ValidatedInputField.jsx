export function ValidatedInputField({ 
  type, 
  id,
  value,
  placeholder, 
  ref,
  autoComplete, 
  required, 
  onChange,
  ariaInvalid,
  ariaDescribedBy,
  onFocus,
  onBlur,
  onCopy,
  onCut,
  onPaste,
  hasError
}) {
  return (
    <>
      <input
          type={type}
          id={id}
          placeholder={placeholder}
          ref={ref}
          autoComplete={autoComplete}
          required={required}
          onChange={onChange}
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
          onFocus={onFocus}
          onBlur={onBlur}
          value={value}
          onCopy={onCopy}
          onCut={onCut}
          onPaste={onPaste}

          className={`w-full p-3 border-b-2 transition-all duration-300 focus:outline-none ${
            hasError 
            ? "border-red-500 focus:border-red-600 bg-red-50/10" 
            : "border-oasis-light focus:border-oasis-aqua"
          }`}
      />
    </>
  )
}
