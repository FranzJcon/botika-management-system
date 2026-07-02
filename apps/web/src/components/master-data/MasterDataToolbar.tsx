import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

type MasterDataToolbarProps = {
  searchPlaceholder: string;
  showRetry?: boolean;
  onRetry?: () => void;
};

export function MasterDataToolbar({
  onRetry,
  searchPlaceholder,
  showRetry = false,
}: MasterDataToolbarProps) {
  return (
    <div className="toolbar">
      <Input label="Search" placeholder={searchPlaceholder} type="search" />
      {showRetry ? (
        <Button variant="secondary" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}
