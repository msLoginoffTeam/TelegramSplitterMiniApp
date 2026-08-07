import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { usePlatform } from '@/app/providers/PlatformProvider';
import {
  editableGroupPermissions,
  groupPermissionLabels,
  groupPermissions,
  groupRoleLabels,
  groupRoles,
  type GroupMember,
  useGroupDashboardQuery,
  useRemoveGroupMember,
  useUpdateGroupMemberPermissions,
} from '@/entities/group';
import { routes } from '@/shared/config/routes';
import { getRuntimeConfig } from '@/shared/config/runtimeConfig';
import { PageLayout } from '@/shared/ui';
import styles from './MembersPage.module.scss';

export function MembersPage() {
  const { groupId } = useParams();
  const platform = usePlatform();
  const canRequest =
    platform.kind === 'telegram'
      ? Boolean(platform.getInitData())
      : Boolean(getRuntimeConfig().developmentTelegramUserId);

  const dashboardQuery = useGroupDashboardQuery(groupId ?? '', Boolean(groupId) && canRequest);
  const removeMember = useRemoveGroupMember(groupId ?? '');
  const updatePermissions = useUpdateGroupMemberPermissions(groupId ?? '');
  const [error, setError] = useState<string>();

  if (!groupId) return null;
  if (!canRequest) {
    return (
      <PageLayout
        backTo={routes.group(groupId)}
        backLabel="К группе"
        title="Участники"
        description="Откройте приложение из Telegram или настройте local development ID."
      />
    );
  }
  if (dashboardQuery.isPending) {
    return (
      <PageLayout
        backTo={routes.group(groupId)}
        backLabel="К группе"
        title="Участники"
        description="Загружаем список…"
      />
    );
  }
  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <PageLayout
        backTo={routes.group(groupId)}
        backLabel="К группе"
        title="Участники"
        description="Не удалось загрузить список участников."
      >
        <button className={styles.retry} onClick={() => dashboardQuery.refetch()} type="button">
          Повторить
        </button>
      </PageLayout>
    );
  }

  const dashboard = dashboardQuery.data;
  const currentMember = dashboard.members.find(
    (member) => member.userId === dashboard.currentUserId,
  );
  const canManageMembers =
    currentMember?.permissions.includes(groupPermissions.manageMembers) ?? false;
  const canManagePermissions =
    currentMember?.permissions.includes(groupPermissions.managePermissions) ?? false;

  const handleRemove = async (member: GroupMember) => {
    if (!window.confirm(`Удалить ${member.displayName} из группы?`)) return;

    setError(undefined);
    try {
      await removeMember.mutateAsync(member.userId);
    } catch {
      setError('Не удалось удалить участника. Попробуйте ещё раз.');
    }
  };

  const handleUpdatePermissions = async (
    member: GroupMember,
    role: number,
    permissions?: number[],
  ) => {
    setError(undefined);
    try {
      await updatePermissions.mutateAsync({
        userId: member.userId,
        role,
        permissions,
      });
    } catch {
      setError('Не удалось сохранить права. Проверьте их и попробуйте ещё раз.');
    }
  };

  return (
    <PageLayout
      backTo={routes.group(groupId)}
      backLabel="К группе"
      title="Участники"
      description={`${dashboard.members.length} участников в группе`}
    >
      {error ? <p className={styles.error}>{error}</p> : null}
      {canManageMembers ? (
        <Link className={styles.invite} to={routes.invite(groupId)}>
          Пригласить участника
        </Link>
      ) : null}
      <ul className={styles.list}>
        {dashboard.members.map((member) => (
          <MemberRow
            key={member.userId}
            member={member}
            canManageMembers={canManageMembers}
            canManagePermissions={canManagePermissions}
            isCurrentUser={member.userId === dashboard.currentUserId}
            isBusy={removeMember.isPending || updatePermissions.isPending}
            onRemove={handleRemove}
            onUpdatePermissions={handleUpdatePermissions}
          />
        ))}
      </ul>
    </PageLayout>
  );
}

type MemberRowProps = {
  member: GroupMember;
  canManageMembers: boolean;
  canManagePermissions: boolean;
  isCurrentUser: boolean;
  isBusy: boolean;
  onRemove: (member: GroupMember) => Promise<void>;
  onUpdatePermissions: (member: GroupMember, role: number, permissions?: number[]) => Promise<void>;
};

function MemberRow({
  member,
  canManageMembers,
  canManagePermissions,
  isCurrentUser,
  isBusy,
  onRemove,
  onUpdatePermissions,
}: MemberRowProps) {
  const [role, setRole] = useState(member.role);
  const [permissions, setPermissions] = useState(member.permissions);

  useEffect(() => {
    setRole(member.role);
    setPermissions(member.permissions);
  }, [member.permissions, member.role]);

  const hasPermissionChanges =
    role !== member.role ||
    (role === groupRoles.custom &&
      (permissions.length !== member.permissions.length ||
        permissions.some((permission) => !member.permissions.includes(permission))));

  const togglePermission = (permission: number) => {
    if (permission === groupPermissions.viewGroup) return;
    setPermissions((current) =>
      current.includes(permission)
        ? current.filter((currentPermission) => currentPermission !== permission)
        : [...current, permission],
    );
  };

  return (
    <li className={styles.member}>
      <div className={styles.memberHeader}>
        <span className={styles.person}>
          <strong>{isCurrentUser ? 'Вы' : member.displayName}</strong>
          {member.username ? <small>@{member.username}</small> : null}
        </span>
        <span className={styles.role}>
          {member.isOwner ? 'Владелец' : groupRoleLabels[member.role]}
        </span>
      </div>

      {!member.isOwner && canManagePermissions ? (
        <div className={styles.permissions}>
          <label className={styles.field}>
            <span>Роль</span>
            <select
              disabled={isBusy}
              onChange={(event) => setRole(Number(event.target.value))}
              value={role}
            >
              <option value={groupRoles.admin}>{groupRoleLabels[groupRoles.admin]}</option>
              <option value={groupRoles.member}>{groupRoleLabels[groupRoles.member]}</option>
              <option value={groupRoles.viewer}>{groupRoleLabels[groupRoles.viewer]}</option>
              <option value={groupRoles.custom}>{groupRoleLabels[groupRoles.custom]}</option>
            </select>
          </label>

          {role === groupRoles.custom ? (
            <fieldset className={styles.permissionList}>
              <legend>Права</legend>
              {editableGroupPermissions.map((permission) => (
                <label className={styles.permission} key={permission}>
                  <input
                    checked={permissions.includes(permission)}
                    disabled={isBusy || permission === groupPermissions.viewGroup}
                    onChange={() => togglePermission(permission)}
                    type="checkbox"
                  />
                  <span>{groupPermissionLabels[permission]}</span>
                </label>
              ))}
            </fieldset>
          ) : null}

          {hasPermissionChanges ? (
            <button
              className={styles.save}
              disabled={isBusy}
              onClick={() =>
                void onUpdatePermissions(
                  member,
                  role,
                  role === groupRoles.custom ? permissions : undefined,
                )
              }
              type="button"
            >
              {isBusy ? 'Сохраняем…' : 'Сохранить права'}
            </button>
          ) : null}
        </div>
      ) : null}

      {!member.isOwner && canManageMembers ? (
        <button
          className={styles.remove}
          disabled={isBusy}
          onClick={() => void onRemove(member)}
          type="button"
        >
          Удалить из группы
        </button>
      ) : null}
    </li>
  );
}
