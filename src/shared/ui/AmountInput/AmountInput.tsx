import { calculateMoneyExpression, formatKopecksForInput } from '@/shared/lib/moneyExpression';
import { formatRubles } from '@/shared/lib/money';
import styles from './AmountInput.module.scss';

interface AmountInputProps {
  ariaLabel?: string;
  autoFocus?: boolean;
  compact?: boolean;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}

export function AmountInput({
  ariaLabel,
  autoFocus,
  compact = false,
  onChange,
  placeholder = '0',
  value,
}: AmountInputProps) {
  const hasExpression = /[+-]/.test(value);
  const resultKopecks = calculateMoneyExpression(value);

  return (
    <div className={[styles.root, compact ? styles.compact : undefined].join(' ')}>
      <input
        aria-label={ariaLabel}
        autoComplete="off"
        autoFocus={autoFocus}
        inputMode="text"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        title="Можно вводить выражения: 1200+350-50"
        type="text"
        value={value}
      />
      {hasExpression ? (
        <button
          className={styles.result}
          disabled={resultKopecks === undefined}
          onClick={() => {
            if (resultKopecks !== undefined) onChange(formatKopecksForInput(resultKopecks));
          }}
          type="button"
        >
          {resultKopecks === undefined
            ? 'Проверьте выражение'
            : `= ${formatRubles(resultKopecks / 100)}`}
        </button>
      ) : null}
    </div>
  );
}
