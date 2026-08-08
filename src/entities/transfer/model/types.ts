export type TransferSuggestion = {
  fromUserId: string;
  fromDisplayName: string;
  fromUsername?: string;
  toUserId: string;
  toDisplayName: string;
  toUsername?: string;
  amount: number;
};
