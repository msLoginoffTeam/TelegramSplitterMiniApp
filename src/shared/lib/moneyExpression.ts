export function calculateMoneyExpression(value: string): number | undefined {
  const normalized = value.trim().replaceAll(' ', '').replaceAll(',', '.');
  if (!/^\d+(?:\.\d{0,2})?(?:[+-]\d+(?:\.\d{0,2})?)*$/.test(normalized)) {
    return undefined;
  }

  const terms = normalized.match(/[+-]?\d+(?:\.\d{0,2})?/g);
  if (!terms) return undefined;

  const total = terms.reduce((sum, term) => sum + parseTermToKopecks(term), 0);
  return total >= 0 ? total : undefined;
}

export function formatKopecksForInput(kopecks: number): string {
  const rubles = Math.floor(kopecks / 100);
  const cents = kopecks % 100;
  if (cents === 0) return String(rubles);

  return `${rubles}.${String(cents).padStart(2, '0').replace(/0$/, '')}`;
}

function parseTermToKopecks(term: string): number {
  const sign = term.startsWith('-') ? -1 : 1;
  const unsignedTerm = term.replace(/^[+-]/, '');
  const [whole, decimal = ''] = unsignedTerm.split('.');
  const kopecks = Number(whole) * 100 + Number(decimal.padEnd(2, '0'));

  return sign * kopecks;
}
