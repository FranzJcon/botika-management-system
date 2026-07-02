type MasterDataStatusBadgeProps = {
  isActive: boolean;
};

export function MasterDataStatusBadge({ isActive }: MasterDataStatusBadgeProps) {
  return (
    <span className={isActive ? "status-pill active" : "status-pill archived"}>
      {isActive ? "Active" : "Archived"}
    </span>
  );
}
