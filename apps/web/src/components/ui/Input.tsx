import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Input({ className = "", id, label, ...props }: InputProps) {
  return (
    <label className="field">
      {label ? <span>{label}</span> : null}
      <input className={`input ${className}`.trim()} id={id} {...props} />
    </label>
  );
}
