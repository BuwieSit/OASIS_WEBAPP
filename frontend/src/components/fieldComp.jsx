import { AdminField, ContentField, UploadField } from "../utilities/inputField";
import { Label } from "../utilities/label";

export function SingleField({
  labelText,
  fieldType = "text",
  fieldHolder,
  fieldId,
  value,
  hasBorder,
  onChange,
  icon,
  disabled = false,
  autoComplete = "off"
}) {
  return (
    <div className="w-full">
      <Label fieldId={fieldId} labelText={labelText} />
      <AdminField
        hasBorder={hasBorder}
        type={fieldType}
        pholder={fieldHolder}
        id={fieldId}
        value={value}
        onChange={onChange}
        disabled={disabled}
        autoComplete={autoComplete}
      />
    </div>
  );
}

export function MultiField({
  labelText,
  fieldId,
  fieldHolder,
  value,
  onChange,
  max,
  disabled = false,
  hasBorder,
  autoComplete = "off"
}) {
  return (
    <div className="w-full">
      <Label fieldId={fieldId} labelText={labelText} />
      <ContentField
        hasBorder={hasBorder}
        pholder={fieldHolder}
        id={fieldId}
        value={value}
        onChange={onChange}
        maxNum={max}
        disabled={disabled}
        autoComplete={autoComplete}
      />
    </div>
  );
}

export function FileUploadField({ labelText, fieldId, accept, onChange, disabled = false }) {
  return (
    <div>
      <Label fieldId={fieldId} labelText={labelText} />
      <UploadField
        id={fieldId}
        accept={accept}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}

