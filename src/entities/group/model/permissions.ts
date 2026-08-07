export const groupPermissions = {
  viewGroup: 1,
  updateGroup: 2,
  manageMembers: 3,
  managePermissions: 4,
  deleteGroup: 5,
  transferOwnership: 6,
  createExpense: 7,
  updateOwnExpense: 8,
  updateAnyExpense: 9,
  deleteOwnExpense: 10,
  deleteAnyExpense: 11,
  createPayment: 12,
  updateOwnPayment: 13,
  updateAnyPayment: 14,
  deleteOwnPayment: 15,
  deleteAnyPayment: 16,
} as const;

export const groupRoles = {
  admin: 1,
  member: 2,
  viewer: 3,
  custom: 4,
} as const;

export const groupRoleLabels: Record<number, string> = {
  [groupRoles.admin]: 'Администратор',
  [groupRoles.member]: 'Участник',
  [groupRoles.viewer]: 'Только просмотр',
  [groupRoles.custom]: 'Свои права',
};

export const editableGroupPermissions = [
  groupPermissions.viewGroup,
  groupPermissions.updateGroup,
  groupPermissions.manageMembers,
  groupPermissions.managePermissions,
  groupPermissions.createExpense,
  groupPermissions.updateOwnExpense,
  groupPermissions.updateAnyExpense,
  groupPermissions.deleteOwnExpense,
  groupPermissions.deleteAnyExpense,
  groupPermissions.createPayment,
  groupPermissions.updateOwnPayment,
  groupPermissions.updateAnyPayment,
  groupPermissions.deleteOwnPayment,
  groupPermissions.deleteAnyPayment,
] as const;

export const groupPermissionLabels: Record<number, string> = {
  [groupPermissions.viewGroup]: 'Просматривать группу',
  [groupPermissions.updateGroup]: 'Редактировать группу',
  [groupPermissions.manageMembers]: 'Добавлять и удалять участников',
  [groupPermissions.managePermissions]: 'Изменять права участников',
  [groupPermissions.createExpense]: 'Создавать траты',
  [groupPermissions.updateOwnExpense]: 'Редактировать свои траты',
  [groupPermissions.updateAnyExpense]: 'Редактировать чужие траты',
  [groupPermissions.deleteOwnExpense]: 'Удалять свои траты',
  [groupPermissions.deleteAnyExpense]: 'Удалять чужие траты',
  [groupPermissions.createPayment]: 'Создавать платежи',
  [groupPermissions.updateOwnPayment]: 'Редактировать свои платежи',
  [groupPermissions.updateAnyPayment]: 'Редактировать чужие платежи',
  [groupPermissions.deleteOwnPayment]: 'Удалять свои платежи',
  [groupPermissions.deleteAnyPayment]: 'Удалять чужие платежи',
};
