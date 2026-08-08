import type { AuditLogEvent, AuditValues } from './types';

export interface AuditEventPresentation {
  title: string;
  details?: string;
}

export function formatAuditEvent(event: AuditLogEvent): AuditEventPresentation {
  return { title: getTitle(event), details: getDetails(event) };
}

function getTitle(event: AuditLogEvent): string {
  const title = asText(event.newValues.Title) ?? asText(event.oldValues.Title);

  switch (event.subjectType) {
    case 'Group':
      if (event.operation === 'Added') return 'Создана группа';
      if (hasValue(event.newValues, 'Members')) return 'Добавлен участник';
      if (hasValue(event.oldValues, 'Members')) return 'Удалён участник';
      if (hasValue(event.newValues, 'OwnerId')) return 'Передано владение группой';
      return 'Изменена группа';
    case 'Expense':
      if (event.operation === 'Added')
        return title ? `Добавлена трата «${title}»` : 'Добавлена трата';
      if (event.operation === 'Deleted')
        return title ? `Удалена трата «${title}»` : 'Удалена трата';
      return title ? `Изменена трата «${title}»` : 'Изменена трата';
    case 'ExpenseShare':
      return event.operation === 'Deleted'
        ? 'Удалена доля траты'
        : event.operation === 'Added'
          ? 'Добавлена доля траты'
          : 'Изменено распределение траты';
    case 'Payment':
      return event.operation === 'Deleted'
        ? 'Удалён платёж'
        : event.operation === 'Added'
          ? 'Добавлен платёж'
          : 'Изменён платёж';
    case 'GroupInvite':
      return 'Создана ссылка-приглашение';
    case 'GroupMemberPermissions':
      return 'Изменены права участника';
    default:
      return event.operation === 'Deleted' ? 'Удалена запись' : 'Изменена запись';
  }
}

function getDetails(event: AuditLogEvent): string | undefined {
  if (event.subjectType === 'GroupInvite') {
    const suffix = asText(event.newValues.TokenSuffix);
    return suffix ? `Ссылка оканчивается на ···${suffix}` : undefined;
  }

  const members = getTextList(event.newValues.Members) ?? getTextList(event.oldValues.Members);
  if (members?.length) return members.join(', ');

  const role = asText(event.newValues.Role);
  return role ? `Роль: ${role}` : undefined;
}

function hasValue(values: AuditValues, key: string): boolean {
  return values[key] !== undefined && values[key] !== null;
}

function asText(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function getTextList(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const values = value.filter(
    (item): item is string => typeof item === 'string' && Boolean(item.trim()),
  );
  return values.length ? values : undefined;
}
