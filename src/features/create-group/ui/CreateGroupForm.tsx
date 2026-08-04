import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useCreateGroup } from '@/features/create-group/model/useCreateGroup';
import styles from '@/features/create-group/ui/CreateGroupForm.module.scss';

const createGroupSchema = z.object({
  title: z.string().trim().min(1, 'Введите название группы.').max(120, 'Не более 120 символов.'),
});

type CreateGroupFormValues = z.infer<typeof createGroupSchema>;

interface CreateGroupFormProps {
  onCreated: (groupId: string) => void;
}

export function CreateGroupForm({ onCreated }: CreateGroupFormProps) {
  const createGroup = useCreateGroup();
  const form = useForm<CreateGroupFormValues>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: { title: '' },
  });

  const submit = form.handleSubmit(async ({ title }) => {
    const group = await createGroup.mutateAsync(title.trim());
    onCreated(group.id);
  });

  return (
    <form className={styles.form} onSubmit={submit}>
      <label className={styles.field}>
        <span>Название</span>
        <input
          autoFocus
          autoComplete="off"
          placeholder="Например, Поездка в Томск"
          {...form.register('title')}
        />
        {form.formState.errors.title ? <small>{form.formState.errors.title.message}</small> : null}
      </label>
      {createGroup.error ? (
        <p className={styles.error}>Не удалось создать группу. Попробуйте ещё раз.</p>
      ) : null}
      <button className={styles.submit} disabled={createGroup.isPending} type="submit">
        {createGroup.isPending ? 'Создаём…' : 'Создать группу'}
      </button>
    </form>
  );
}
