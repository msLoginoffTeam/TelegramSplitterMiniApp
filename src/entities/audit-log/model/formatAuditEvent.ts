import type { AuditLogEvent, AuditValues } from './types';

export interface AuditEventPresentation {
  title: string;
  details?: string;
}

export interface AuditFieldChange {
  label: string;
  value?: string;
  oldValue?: string;
  newValue?: string;
}

const fieldLabels: Record<string, string> = {
  Title: 'Название',
  TotalAmount: 'Общая сумма',
  Amount: 'Сумма',
  Members: 'Участники',
  Permissions: 'Права',
  Role: 'Роль',
  TokenSuffix: 'Окончание ссылки',
  ExpiresAtUtc: 'Действует до',
  IsDraft: 'Черновик',
  PayerName: 'Плательщик',
  CreatedByUserName: 'Автор',
  CreatedByName: 'Автор',
  FromUserName: 'Отправитель',
  ToUserName: 'Получатель',
  OwnerName: 'Владелец',
  UserName: 'Участник',
  MemberUserName: 'Участник',
  Participant: 'Участник',
  ExpenseTitle: 'Трата',
  FromParticipant: 'Отправитель',
  ToParticipant: 'Получатель',
  Payer: 'Плательщик',
  Author: 'Автор',
  ExpenseId: 'ID траты',
  GroupId: 'ID группы',
};

const idNamePairs: Record<string, string> = {
  PayerId: 'PayerName',
  CreatedByUserId: 'CreatedByUserName',
  CreatedById: 'CreatedByName',
  FromUserId: 'FromUserName',
  ToUserId: 'ToUserName',
  OwnerId: 'OwnerName',
  UserId: 'Participant',
  MemberUserId: 'MemberUserName',
  ExpenseId: 'ExpenseTitle',
};

const contextFieldNames = new Set([
  'Participant',
  'ExpenseTitle',
  'FromParticipant',
  'ToParticipant',
  'Payer',
  'Author',
]);

export function formatAuditEvent(event: AuditLogEvent): AuditEventPresentation {
  return { title: getTitle(event), details: getDetails(event) };
}

export function getAuditFieldChanges(event: AuditLogEvent): AuditFieldChange[] {
  const keys = new Set([...Object.keys(event.oldValues), ...Object.keys(event.newValues)]);

  return [...keys]
    .filter((key) => !isDuplicateIdentifier(key, event.oldValues, event.newValues))
    .sort((first, second) => getFieldLabel(first).localeCompare(getFieldLabel(second), 'ru'))
    .map((key) =>
      contextFieldNames.has(key)
        ? {
            label: getFieldLabel(key),
            value: formatValue(event.newValues[key] ?? event.oldValues[key], key),
          }
        : {
            label: getFieldLabel(key),
            oldValue: formatValue(event.oldValues[key], key),
            newValue: formatValue(event.newValues[key], key),
          },
    );
}

export function formatEntityKey(event: AuditLogEvent): string {
  try {
    return JSON.stringify(JSON.parse(event.entityKeyJson), null, 2);
  } catch {
    return event.entityKeyJson;
  }
}

function getTitle(event: AuditLogEvent): string {
  const title =
    asText(event.newValues.Title) ??
    asText(event.oldValues.Title) ??
    asText(event.newValues.ExpenseTitle) ??
    asText(event.oldValues.ExpenseTitle);

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
      return formatShareTitle(event);
    case 'Payment':
      return formatPaymentTitle(event);
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

function formatShareTitle(event: AuditLogEvent): string {
  const participant = asText(event.newValues.Participant) ?? asText(event.oldValues.Participant);
  const expenseTitle = asText(event.newValues.ExpenseTitle) ?? asText(event.oldValues.ExpenseTitle);
  const context = [participant, expenseTitle ? `в трате «${expenseTitle}»` : undefined]
    .filter((value): value is string => Boolean(value))
    .join(' ');
  const action =
    event.operation === 'Deleted'
      ? 'Удалена доля'
      : event.operation === 'Added'
        ? 'Добавлена доля'
        : 'Изменена доля';

  return context ? `${action} ${context}` : `${action} траты`;
}

function formatPaymentTitle(event: AuditLogEvent): string {
  const from = asText(event.newValues.FromParticipant) ?? asText(event.oldValues.FromParticipant);
  const to = asText(event.newValues.ToParticipant) ?? asText(event.oldValues.ToParticipant);
  const expenseTitle = asText(event.newValues.ExpenseTitle) ?? asText(event.oldValues.ExpenseTitle);
  const action =
    event.operation === 'Deleted'
      ? 'Удалён платёж'
      : event.operation === 'Added'
        ? 'Добавлен платёж'
        : 'Изменён платёж';
  const route = from && to ? ` ${from} → ${to}` : '';
  const expense = expenseTitle ? ` по трате «${expenseTitle}»` : '';

  return `${action}${route}${expense}`;
}

function hasValue(values: AuditValues, key: string): boolean {
  return values[key] !== undefined && values[key] !== null;
}

function isDuplicateIdentifier(
  key: string,
  oldValues: AuditValues,
  newValues: AuditValues,
): boolean {
  if (
    key === 'UserName' &&
    (hasValue(oldValues, 'Participant') || hasValue(newValues, 'Participant'))
  ) {
    return true;
  }

  if (
    (key === 'FromUserName' || key === 'ToUserName') &&
    (hasValue(oldValues, key === 'FromUserName' ? 'FromParticipant' : 'ToParticipant') ||
      hasValue(newValues, key === 'FromUserName' ? 'FromParticipant' : 'ToParticipant'))
  ) {
    return true;
  }

  const nameKey = idNamePairs[key];
  return Boolean(nameKey && (hasValue(oldValues, nameKey) || hasValue(newValues, nameKey)));
}

function getFieldLabel(key: string): string {
  return fieldLabels[key] ?? key;
}

function formatValue(value: unknown, key: string): string | undefined {
  if (value === undefined) return undefined;
  if (value === null) return '—';
  if (Array.isArray(value)) return value.map((item) => formatValue(item, key) ?? '—').join(', ');
  if (typeof value === 'boolean') return value ? 'Да' : 'Нет';
  if (typeof value === 'number') {
    return key === 'Amount' || key === 'TotalAmount'
      ? `${new Intl.NumberFormat('ru-RU').format(value)} ₽`
      : String(value);
  }
  if (typeof value === 'string' && key.endsWith('AtUtc')) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date.toLocaleString('ru-RU');
  }
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
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
