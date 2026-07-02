type MasterDataEmptyStateProps = {
  message: string;
};

export function MasterDataEmptyState({ message }: MasterDataEmptyStateProps) {
  return <div className="state-panel">{message}</div>;
}
