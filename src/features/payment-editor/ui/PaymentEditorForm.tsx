import { useState } from 'react';
import type { GroupMember } from '@/entities/group';
import type { CreatePaymentInput } from '@/entities/payment';
import { toKopecks } from '@/features/expense-editor/model/split';
import styles from './PaymentEditorForm.module.scss';

export type PaymentExpenseOption = {
  id: string;
  title: string;
  payerId: string;
  payerName: string;
};

interface PaymentEditorFormProps {
  currentUserId: string;
  expenses: PaymentExpenseOption[];
  initialAmount?: number;
  initialExpenseId?: string;
  initialFromUserId?: string;
  initialToUserId?: string;
  members: GroupMember[];
  onSave: (input: CreatePaymentInput) => Promise<void>;
}

export function PaymentEditorForm({
  currentUserId,
  expenses,
  initialAmount,
  initialExpenseId,
  initialFromUserId,
  initialToUserId,
  members,
  onSave,
}: PaymentEditorFormProps) {
  const [kind, setKind] = useState<'direct' | 'expense'>(initialExpenseId ? 'expense' : 'direct');
  const [expenseId, setExpenseId] = useState(initialExpenseId ?? expenses[0]?.id ?? '');
  const selectedExpense = expenses.find((expense) => expense.id === expenseId);
  const [fromUserId, setFromUserId] = useState(
    initialFromUserId ?? currentUserId ?? members[0]?.userId ?? '',
  );
  const [toUserId, setToUserId] = useState(
    initialToUserId ?? members.find((member) => member.userId !== currentUserId)?.userId ?? '',
  );
  const [amountInput, setAmountInput] = useState(initialAmount?.toString() ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>();

  const amountKopecks = toKopecks(amountInput);
  const isExpensePayment = kind === 'expense';
  const canSave =
    amountKopecks > 0 &&
    fromUserId.length > 0 &&
    (isExpensePayment
      ? Boolean(selectedExpense && selectedExpense.payerId !== fromUserId)
      : Boolean(toUserId && toUserId !== fromUserId)) &&
    !isSaving;

  const displayMember = (member: GroupMember) =>
    `${member.userId === currentUserId ? 'Вы' : member.displayName}${member.username ? ` (@${member.username})` : ''}`;

  const selectExpense = (nextExpenseId: string) => {
    setExpenseId(nextExpenseId);
    const nextPayerId = expenses.find((expense) => expense.id === nextExpenseId)?.payerId;
    if (fromUserId === nextPayerId) {
      setFromUserId(members.find((member) => member.userId !== nextPayerId)?.userId ?? '');
    }
  };

  const changeKind = (nextKind: 'direct' | 'expense') => {
    setKind(nextKind);
    if (nextKind === 'expense' && fromUserId === selectedExpense?.payerId) {
      setFromUserId(
        members.find((member) => member.userId !== selectedExpense.payerId)?.userId ?? '',
      );
    }
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSave || (!selectedExpense && isExpensePayment)) return;

    setSaveError(undefined);
    setIsSaving(true);
    try {
      await onSave(
        isExpensePayment
          ? {
              kind: 'expense',
              expenseId: selectedExpense!.id,
              fromUserId,
              amount: amountKopecks / 100,
            }
          : {
              kind: 'direct',
              fromUserId,
              toUserId,
              amount: amountKopecks / 100,
            },
      );
    } catch {
      setSaveError(
        isExpensePayment
          ? 'Не удалось сохранить платёж. Проверьте, что сумма не превышает долг по трате.'
          : 'Не удалось сохранить платёж. Попробуйте ещё раз.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      {!initialExpenseId ? (
        <label className={styles.field}>
          <span>Тип платежа</span>
          <select onChange={(event) => changeKind(event.target.value as typeof kind)} value={kind}>
            <option value="direct">Просто перевод</option>
            <option value="expense">Погашение траты</option>
          </select>
        </label>
      ) : null}

      {isExpensePayment ? (
        <label className={styles.field}>
          <span>Трата</span>
          <select
            disabled={Boolean(initialExpenseId)}
            onChange={(event) => selectExpense(event.target.value)}
            value={expenseId}
          >
            {expenses.map((expense) => (
              <option key={expense.id} value={expense.id}>
                {expense.title} · заплатил {expense.payerName}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <label className={styles.field}>
        <span>{isExpensePayment ? 'Кто возвращает деньги' : 'Кто перевёл'}</span>
        <select onChange={(event) => setFromUserId(event.target.value)} value={fromUserId}>
          {members
            .filter((member) => !isExpensePayment || member.userId !== selectedExpense?.payerId)
            .map((member) => (
              <option key={member.userId} value={member.userId}>
                {displayMember(member)}
              </option>
            ))}
        </select>
      </label>

      {isExpensePayment ? (
        <p className={styles.receiver}>
          Получатель: <strong>{selectedExpense?.payerName ?? 'выберите трату'}</strong>
        </p>
      ) : (
        <label className={styles.field}>
          <span>Кому перевели</span>
          <select onChange={(event) => setToUserId(event.target.value)} value={toUserId}>
            {members
              .filter((member) => member.userId !== fromUserId)
              .map((member) => (
                <option key={member.userId} value={member.userId}>
                  {displayMember(member)}
                </option>
              ))}
          </select>
        </label>
      )}

      <label className={styles.field}>
        <span>Сумма, ₽</span>
        <input
          inputMode="decimal"
          min="0"
          onChange={(event) => setAmountInput(event.target.value)}
          placeholder="0"
          step="0.01"
          type="number"
          value={amountInput}
        />
      </label>

      {saveError ? <p className={styles.error}>{saveError}</p> : null}
      <button className={styles.submit} disabled={!canSave} type="submit">
        {isSaving ? 'Сохраняем…' : 'Сохранить платёж'}
      </button>
    </form>
  );
}
