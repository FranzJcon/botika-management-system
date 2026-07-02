import { Button } from "../ui/Button";

type MasterDataPageHeaderProps = {
  title: string;
  actionLabel: string;
  onAction: () => void;
};

export function MasterDataPageHeader({
  actionLabel,
  onAction,
  title,
}: MasterDataPageHeaderProps) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">Master Data</p>
        <h2>{title}</h2>
      </div>
      <Button onClick={onAction}>{actionLabel}</Button>
    </div>
  );
}
