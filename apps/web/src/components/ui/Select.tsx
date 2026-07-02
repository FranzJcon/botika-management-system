import type { SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
};

export function Select({ children, className = "", label, ...props }: SelectProps) {
  return (
    <label className="field">
      {label ? <span>{label}</span> : null}
      <select className={`select ${className}`.trim()} {...props}>
        {children}
      </select>
    </label>
  );
}
