export type AuditValues = Record<string, unknown>;

export interface AuditLogEvent {
  id: string;
  occurredAtUtc: Date;
  actorDisplayName?: string;
  actorUsername?: string;
  subjectType: string;
  operation: string;
  entityKeyJson: string;
  oldValues: AuditValues;
  newValues: AuditValues;
}

export interface AuditLogPage {
  entries: AuditLogEvent[];
  hasMore: boolean;
  nextOffset?: number;
}
