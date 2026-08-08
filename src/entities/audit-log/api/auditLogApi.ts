import * as GeneratedClient from '@/shared/api/generated/client/Client';
import type { AuditLogEvent, AuditLogPage, AuditValues } from '@/entities/audit-log/model/types';

function parseValues(value: string | null | undefined): AuditValues {
  if (!value) return {};

  try {
    const parsed: unknown = JSON.parse(value);
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function isRecord(value: unknown): value is AuditValues {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toAuditLogEvent(response: {
  id?: string;
  occurredAtUtc?: Date;
  actorDisplayName?: string | null;
  actorUsername?: string | null;
  subjectType?: string | null;
  operation?: string | null;
  oldValuesJson?: string | null;
  newValuesJson?: string | null;
}): AuditLogEvent {
  if (!response.id || !response.occurredAtUtc || !response.subjectType || !response.operation) {
    throw new Error('Backend returned an incomplete audit event.');
  }

  return {
    id: response.id,
    occurredAtUtc: response.occurredAtUtc,
    actorDisplayName: response.actorDisplayName ?? undefined,
    actorUsername: response.actorUsername ?? undefined,
    subjectType: response.subjectType,
    operation: response.operation,
    oldValues: parseValues(response.oldValuesJson),
    newValues: parseValues(response.newValuesJson),
  };
}

export const auditLogApi = {
  async getPage(groupId: string, offset: number): Promise<AuditLogPage> {
    const response = await GeneratedClient.auditLog(groupId, offset, 30);

    return {
      entries: (response.entries ?? []).map(toAuditLogEvent),
      hasMore: response.hasMore ?? false,
      nextOffset: response.nextOffset ?? undefined,
    };
  },
};
