type MasterDataLoadingStateProps = {
  message: string;
};

export function MasterDataLoadingState({ message }: MasterDataLoadingStateProps) {
  return <div className="state-panel">{message}</div>;
}
