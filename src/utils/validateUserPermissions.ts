type User = {
  permissions: string[];
  roles: string[];
}

type validateUserPermissionsParams = {
  user: User;
  permissions?: string[];
  roles?: string[];
}

export function validateUserPermissions({
  user,
  permissions,
  roles
}: validateUserPermissionsParams) {
  if (permissions?.length > 0) {
    const hasAllPermissions = permissions.every(permission => {
      // Retorna true caso todas as condições estiverem satisfeitas
      return user.permissions.includes(permission);
    });

    if (!hasAllPermissions) {
      return false
    }
  }

  if (roles?.length > 0) {
    const hasAllRoles = roles.every(role => {
      // Retorna true caso todas as condições estiverem satisfeitas
      return user.roles.includes(role);     
    });
    
    if (!hasAllRoles) {
      return false
    }
  }

  return true;
}