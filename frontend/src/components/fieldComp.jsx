import { AdminField, ContentField, UploadField } from "../utilities/inputField"
import { Label } from "../utilities/label"

export function SingleField({
  labelText,
  fieldType = "text",
  fieldHolder,
  fieldId,
  value,
  onChange
}) {
  return (
    <div className="w-full">
      <Label fieldId={fieldId} labelText={labelText} />
      <AdminField
        type={fieldType}
        pholder={fieldHolder}
        id={fieldId}
        value={value}
        onChange={onChange}
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
  max
}) {
  return (
    <div className="w-full">
      <Label fieldId={fieldId} labelText={labelText} />
      <ContentField
        pholder={fieldHolder}
        id={fieldId}
        value={value}
        onChange={onChange}
        maxNum={max}
      />
    </div>
  );
}


export function FileUploadField( {labelText, fieldId, accept, onChange} ) {
    return (
        <>
            <Label fieldId={fieldId} labelText={labelText}/>
            <UploadField accept={accept} onChange={onChange}/>
        </>
    )
}

export function BulletField( { labelText, fieldId }) {
    return(
        <>
            
        
        </>
    )
}