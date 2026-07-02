type MasterDataErrorStateProps = {
  message: string;
};

export function MasterDataErrorState({ message }: MasterDataErrorStateProps) {
  return <div className="state-panel error-state">{message}</div>;
}
