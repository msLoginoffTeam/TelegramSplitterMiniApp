import { useState } from 'react';
import type { ExpenseWriteInput } from '@/entities/expense';
import type { GroupMember } from '@/entities/group';
import { formatRubles } from '@/shared/lib/money';
import { splitEvenly, sumKopecks, toKopecks } from '@/features/expense-editor/model/split';
import styles from '@/features/expense-editor/ui/ExpenseEditorForm.module.scss';

export type ExpenseEditorInitialValues = {
  title: string;
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
  const [totalInput, setTotalInput] = useState(
    initialValues ? String(initialValues.totalAmount) : '',
  );
  const [payerId, setPayerId] = useState(initialPayerId);
  const [participantIds, setParticipantIds] = useState(initialParticipantIds);
  const [allocations, setAllocations] = useState<Record<string, number>>(
    initialValues?.allocations ?? {},
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
    setAllocations(splitEvenly(totalKopecks, participantIds, payerId));
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
        <span>За что</span>
        <input
          autoComplete="off"
          autoFocus
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Например, ужин"
          value={title}
        />
      </label>

      <label className={styles.field}>
        <span>Сумма, ₽</span>
        <input
          inputMode="decimal"
          min="0"
          onChange={(event) => setTotalInput(event.target.value)}
          placeholder="0"
          step="0.01"
          type="number"
          value={totalInput}
        />
      </label>

      <label className={styles.field}>
        <span>Заплатил</span>
        <select onChange={(event) => changePayer(event.target.value)} value={payerId}>
          {members.map((member) => (
            <option key={member.userId} value={member.userId}>
              {member.userId === currentUserId ? 'Вы' : member.displayName}
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

            return (
              <div className={styles.participant} key={member.userId}>
                <label className={styles.participantName}>
                  <input
                    checked={isSelected}
                    disabled={isPayer}
                    onChange={() => toggleParticipant(member.userId)}
                    type="checkbox"
                  />
                  <span>{member.userId === currentUserId ? 'Вы' : member.displayName}</span>
                  {isPayer ? <small>плательщик</small> : null}
                </label>
                {isSelected ? (
                  <label className={styles.allocation}>
                    <input
                      inputMode="decimal"
                      min="0"
                      onChange={(event) =>
                        setAllocations((current) => ({
                          ...current,
                          [member.userId]: toKopecks(event.target.value),
                        }))
                      }
                      step="0.01"
                      type="number"
                      value={allocation ? allocation / 100 : ''}
                    />
                    <span>₽</span>
                  </label>
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
