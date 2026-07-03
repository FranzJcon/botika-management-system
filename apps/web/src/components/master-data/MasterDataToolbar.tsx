import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

type MasterDataToolbarProps = {
  searchPlaceholder: string;
  searchValue?: string;
  showRetry?: boolean;
  onSearchChange?: (value: string) => void;
  onRetry?: () => void;
};

export function MasterDataToolbar({
  onRetry,
  onSearchChange,
  searchPlaceholder,
  searchValue,
  showRetry = false,
}: MasterDataToolbarProps) {
  return (
    <div className="toolbar">
      <Input
        label="Search"
        onChange={(event) => onSearchChange?.(event.target.value)}
        placeholder={searchPlaceholder}
        type="search"
        value={searchValue ?? ""}
      />
      {showRetry ? (
        <Button variant="secondary" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}
