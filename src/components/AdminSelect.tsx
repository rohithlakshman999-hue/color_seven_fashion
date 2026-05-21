"use client";

import { ADMIN_OPTION_CLASS, ADMIN_SELECT_CLASS } from "@/lib/catalogHelpers";

type AdminSelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  placeholder?: string;
};

export default function AdminSelect({
  className,
  children,
  placeholder,
  style,
  ...props
}: AdminSelectProps) {
  return (
    <select
      {...props}
      className={className ?? ADMIN_SELECT_CLASS}
      style={{ colorScheme: "dark", ...style }}
    >
      {placeholder && (
        <option key="__placeholder__" value="" className={ADMIN_OPTION_CLASS}>
          {placeholder}
        </option>
      )}
      {children}
    </select>
  );
}

export function AdminSelectOption({
  optionKey,
  value,
  children,
  ...props
}: React.OptionHTMLAttributes<HTMLOptionElement> & {
  optionKey: string;
  value: string | number;
}) {
  return (
    <option
      key={optionKey}
      value={value}
      className={ADMIN_OPTION_CLASS}
      {...props}
    >
      {children}
    </option>
  );
}
