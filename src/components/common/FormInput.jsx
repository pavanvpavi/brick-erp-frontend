export default function FormInput({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder = "",
  step,
  min,
  rows,
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {rows ? (
        <textarea
          className="input-field"
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          rows={rows}
        />
      ) : (
        <input
          type={type}
          className="input-field"
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          step={step}
          min={min}
        />
      )}
    </div>
  );
}
