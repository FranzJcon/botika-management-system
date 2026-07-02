import { Button } from "../ui/Button";

type MasterDataPageHeaderProps = {
  title: string;
  actionLabel?: string;
  eyebrow?: string;
  onAction?: () => void;
};

export function MasterDataPageHeader({
  actionLabel,
  eyebrow = "Master Data",
  onAction,
  title,
}: MasterDataPageHeaderProps) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {actionLabel && onAction ? <Button onClick={onAction}>{actionLabel}</Button> : null}
    </div>
  );
}
