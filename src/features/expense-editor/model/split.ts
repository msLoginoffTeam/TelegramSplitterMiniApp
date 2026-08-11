import { calculateMoneyExpression } from '@/shared/lib/moneyExpression';

export function toKopecks(value: string): number {
  return calculateMoneyExpression(value) ?? 0;
}

export function splitEvenly(
  totalKopecks: number,
  participantIds: string[],
  payerId: string,
): Record<string, number> {
  if (totalKopecks <= 0 || participantIds.length === 0) {
    return {};
  }

  const baseShare = Math.floor(totalKopecks / participantIds.length);
  const payerRemainder = totalKopecks - baseShare * participantIds.length;

  return Object.fromEntries(
    participantIds.map((userId) => [userId, baseShare + (userId === payerId ? payerRemainder : 0)]),
  );
}

export function sumKopecks(allocations: Record<string, number>, participantIds: string[]): number {
  return participantIds.reduce((sum, userId) => sum + (allocations[userId] ?? 0), 0);
}
