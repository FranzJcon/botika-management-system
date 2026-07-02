import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className = "", id, label, ...props },
  ref,
) {
  return (
    <label className="field">
      {label ? <span>{label}</span> : null}
      <input
        className={`input ${className}`.trim()}
        id={id}
        ref={ref}
        {...props}
      />
    </label>
  );
});
