import { useEffect, useState, type SyntheticEvent } from 'react';

type OverviewSection = 'balance' | 'expenses' | 'payments';
type OverviewState = Record<OverviewSection, boolean>;

const defaultState: OverviewState = {
  balance: true,
  expenses: false,
  payments: false,
};

export function useGroupOverviewState(groupId: string) {
  const storageKey = `splitter:group-overview:${groupId}`;
  const [state, setState] = useState<OverviewState>(() => readState(storageKey));

  useEffect(() => {
    setState(readState(storageKey));
  }, [storageKey]);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // State persistence is a convenience; the page still works when storage is unavailable.
    }
  }, [state, storageKey]);

  const onToggle = (section: OverviewSection) => (event: SyntheticEvent<HTMLDetailsElement>) => {
    setState((current) => ({
      ...current,
      [section]: event.currentTarget.open,
    }));
  };

  return { onToggle, state };
}

function readState(storageKey: string): OverviewState {
  try {
    const saved = window.sessionStorage.getItem(storageKey);
    if (!saved) return defaultState;

    const parsed = JSON.parse(saved) as Partial<OverviewState>;
    return {
      balance: parsed.balance ?? defaultState.balance,
      expenses: parsed.expenses ?? defaultState.expenses,
      payments: parsed.payments ?? defaultState.payments,
    };
  } catch {
    return defaultState;
  }
}
