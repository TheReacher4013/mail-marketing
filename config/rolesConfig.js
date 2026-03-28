const ROLES = {
  SUPER_ADMIN:       'super_admin',
  BUSINESS_ADMIN:    'business_admin',
  MARKETING_MANAGER: 'marketing_manager',
  VIEWER:            'viewer',
};

const ALL_ROLES   = Object.values(ROLES);
const ADMIN_ROLES = [ROLES.SUPER_ADMIN, ROLES.BUSINESS_ADMIN];
const EDIT_ROLES  = [ROLES.SUPER_ADMIN, ROLES.BUSINESS_ADMIN, ROLES.MARKETING_MANAGER];

module.exports = { ROLES, ALL_ROLES, ADMIN_ROLES, EDIT_ROLES };