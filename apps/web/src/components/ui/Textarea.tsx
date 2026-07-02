import type { TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
};

export function Textarea({
  className = "",
  label,
  ...props
}: TextareaProps) {
  return (
    <label className="field">
      {label ? <span>{label}</span> : null}
      <textarea className={`textarea ${className}`.trim()} {...props} />
    </label>
  );
}
