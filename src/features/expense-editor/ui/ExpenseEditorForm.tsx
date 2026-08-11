import { useState } from 'react';
import type { ExpenseWriteInput } from '@/entities/expense';
import type { GroupMember } from '@/entities/group';
import { formatKopecksForInput } from '@/shared/lib/moneyExpression';
import { formatRubles } from '@/shared/lib/money';
import { AmountInput } from '@/shared/ui';
import { splitEvenly, sumKopecks, toKopecks } from '@/features/expense-editor/model/split';
import styles from '@/features/expense-editor/ui/ExpenseEditorForm.module.scss';

export type ExpenseEditorInitialValues = {
  title: string;
  description?: string;
  totalAmount: number;
  payerId: string;
  participantIds: string[];
  allocations: Record<string, number>;
};

interface ExpenseEditorFormProps {
  members: GroupMember[];
  currentUserId: string;
  initialValues?: ExpenseEditorInitialValues;
  submitLabel: string;
  onSave: (input: ExpenseWriteInput) => Promise<void>;
}

export function ExpenseEditorForm({
  members,
  currentUserId,
  initialValues,
  submitLabel,
  onSave,
}: ExpenseEditorFormProps) {
  const initialPayerId = initialValues?.payerId ?? currentUserId ?? members[0]?.userId ?? '';
  const initialParticipantIds =
    initialValues?.participantIds ?? members.map((member) => member.userId);
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [totalInput, setTotalInput] = useState(
    initialValues ? String(initialValues.totalAmount) : '',
  );
  const [payerId, setPayerId] = useState(initialPayerId);
  const [participantIds, setParticipantIds] = useState(initialParticipantIds);
  const [allocations, setAllocations] = useState<Record<string, number>>(
    initialValues?.allocations ?? {},
  );
  const [allocationInputs, setAllocationInputs] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      Object.entries(initialValues?.allocations ?? {}).map(([userId, amount]) => [
        userId,
        formatKopecksForInput(amount),
      ]),
    ),
  );
  const [saveError, setSaveError] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);

  const totalKopecks = toKopecks(totalInput);
  const allocatedKopecks = sumKopecks(allocations, participantIds);
  const remainingKopecks = totalKopecks - allocatedKopecks;
  const selectedMembers = members.filter((member) => participantIds.includes(member.userId));
  const hasInvalidNonPayerShare = selectedMembers.some(
    (member) => member.userId !== payerId && (allocations[member.userId] ?? 0) <= 0,
  );
  const canSave =
    title.trim().length > 0 &&
    totalKopecks > 0 &&
    remainingKopecks === 0 &&
    !hasInvalidNonPayerShare &&
    !isSaving;

  const applyEvenSplit = () => {
    const nextAllocations = splitEvenly(totalKopecks, participantIds, payerId);
    setAllocations(nextAllocations);
    setAllocationInputs(
      Object.fromEntries(
        Object.entries(nextAllocations).map(([userId, amount]) => [
          userId,
          formatKopecksForInput(amount),
        ]),
      ),
    );
  };

  const applyRemainingToParticipant = (userId: string) => {
    const nextAmount = (allocations[userId] ?? 0) + remainingKopecks;
    setAllocations((current) => ({ ...current, [userId]: nextAmount }));
    setAllocationInputs((current) => ({
      ...current,
      [userId]: formatKopecksForInput(nextAmount),
    }));
  };

  const changeAllocation = (userId: string, value: string) => {
    setAllocationInputs((current) => ({ ...current, [userId]: value }));
    setAllocations((current) => ({ ...current, [userId]: toKopecks(value) }));
  };

  const toggleParticipant = (userId: string) => {
    if (userId === payerId) return;

    setParticipantIds((current) =>
      current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId],
    );
  };

  const changePayer = (nextPayerId: string) => {
    setPayerId(nextPayerId);
    setParticipantIds((current) =>
      current.includes(nextPayerId) ? current : [...current, nextPayerId],
    );
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSave) return;

    setSaveError(undefined);
    setIsSaving(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        totalAmount: totalKopecks / 100,
        payerId,
        shares: participantIds.map((userId) => ({
          userId,
          amount: (allocations[userId] ?? 0) / 100,
        })),
      });
    } catch {
      setSaveError('Не удалось сохранить трату. Попробуйте ещё раз.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <label className={styles.field}>
        <span>Название</span>
        <input
          autoComplete="off"
          autoFocus
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Например, ужин"
          value={title}
        />
      </label>

      <label className={styles.field}>
        <span>
          Комментарий <small>необязательно</small>
        </span>
        <textarea
          maxLength={1000}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Например, продукты на ужин"
          rows={3}
          value={description}
        />
      </label>

      <div className={styles.field}>
        <span>Сумма, ₽</span>
        <AmountInput onChange={setTotalInput} placeholder="0" value={totalInput} />
      </div>

      <label className={styles.field}>
        <span>Заплатил</span>
        <select onChange={(event) => changePayer(event.target.value)} value={payerId}>
          {members.map((member) => (
            <option key={member.userId} value={member.userId}>
              {member.userId === currentUserId ? 'Вы' : member.displayName}
              {member.username ? ` (@${member.username})` : ''}
            </option>
          ))}
        </select>
      </label>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <h2>Делят трату</h2>
            <p>Плательщик всегда участвует.</p>
          </div>
          <button onClick={applyEvenSplit} type="button">
            Поровну
          </button>
        </div>

        <div className={styles.participants}>
          {members.map((member) => {
            const isPayer = member.userId === payerId;
            const isSelected = participantIds.includes(member.userId);
            const allocation = allocations[member.userId] ?? 0;
            const nextAllocation = allocation + remainingKopecks;
            const canApplyRemaining = isPayer ? nextAllocation >= 0 : nextAllocation > 0;
            const adjustmentLabel =
              remainingKopecks > 0
                ? `+ ${formatRubles(remainingKopecks / 100)}`
                : `− ${formatRubles(Math.abs(remainingKopecks) / 100)}`;

            return (
              <div className={styles.participant} key={member.userId}>
                <label className={styles.participantName}>
                  <input
                    checked={isSelected}
                    disabled={isPayer}
                    onChange={() => toggleParticipant(member.userId)}
                    type="checkbox"
                  />
                  <span>
                    {member.userId === currentUserId ? 'Вы' : member.displayName}
                    {member.username ? <small>@{member.username}</small> : null}
                  </span>
                  {isPayer ? <small>плательщик</small> : null}
                </label>
                {isSelected ? (
                  <div className={styles.allocationStack}>
                    <div className={styles.allocation}>
                      <AmountInput
                        ariaLabel={`Доля ${member.displayName}`}
                        compact
                        onChange={(value) => changeAllocation(member.userId, value)}
                        value={
                          allocationInputs[member.userId] ??
                          (allocation ? String(allocation / 100) : '')
                        }
                      />
                      <span>₽</span>
                    </div>
                    {remainingKopecks !== 0 && canApplyRemaining ? (
                      <button
                        aria-label={
                          remainingKopecks > 0
                            ? `Добавить весь нераспределённый остаток ${formatRubles(remainingKopecks / 100)}`
                            : `Убрать лишнее ${formatRubles(Math.abs(remainingKopecks) / 100)}`
                        }
                        className={styles.applyRemaining}
                        onClick={() => applyRemainingToParticipant(member.userId)}
                        title={
                          remainingKopecks > 0
                            ? 'Добавить весь нераспределённый остаток'
                            : 'Убрать лишнюю сумму из этой доли'
                        }
                        type="button"
                      >
                        {adjustmentLabel}
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <p className={styles.summary} data-invalid={remainingKopecks !== 0}>
        {remainingKopecks === 0
          ? 'Сумма распределена.'
          : `Осталось распределить: ${formatRubles(remainingKopecks / 100)}`}
      </p>
      {saveError ? <p className={styles.error}>{saveError}</p> : null}
      <button className={styles.submit} disabled={!canSave} type="submit">
        {isSaving ? 'Сохраняем…' : submitLabel}
      </button>
    </form>
  );
}
