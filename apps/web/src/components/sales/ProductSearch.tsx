import { forwardRef } from "react";

import { Input } from "../ui/Input";

type ProductSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export const ProductSearch = forwardRef<HTMLInputElement, ProductSearchProps>(
  function ProductSearch({ onChange, value }, ref) {
    return (
      <Input
        label="Search products"
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search by product name or SKU"
        ref={ref}
        value={value}
      />
    );
  },
);
