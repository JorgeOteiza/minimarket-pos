type Props = {
  label: string;

  name?: string;

  type?: string;

  value?: string | number | null;

  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;

  error?: string;

  warning?: string;

  className?: string;

  inputClassName?: string;

  disabled?: boolean;

  placeholder?: string;

  step?: string | number;
};

export const FormField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  warning,
  className = "",
  inputClassName = "",
  disabled = false,
  placeholder,
  step,
}: Props) => {
  const computedInputClassName = error
    ? "input-error"
    : warning
      ? "input-warning"
      : "";

  return (
    <div className={`form-field ${className}`}>
      <label>{label}</label>

      <input
        name={name}
        type={type}
        value={value ?? ""}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        step={step}
        className={`
          ${computedInputClassName}
          ${inputClassName}
        `}
      />

      {error && <span className="field-error">{error}</span>}

      {!error && warning && <span className="field-warning">{warning}</span>}
    </div>
  );
};
