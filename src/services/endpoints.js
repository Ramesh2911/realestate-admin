export const AUTH = {
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  PROFILE: "/auth/profile",
  UPDATE_PROFILE: "/auth/update-profile",
  CHANGE_PASSWORD: "/auth/change-password",
};

export const USER = {
  GET_OWNER: "/users/owners",
  GET_BROKER: "/users/brokers",
  GET_DEVELOPER: "/users/developers",
  GET_BUYER: "/users/buyers",
};

export const PROPERTY = {
  GET_ALL: "/properties/all",
  APPROVE: (id) => `/properties/admin/approve/${id}`,
  REJECT: (id) => `/properties/admin/reject/${id}`,
  STATUS: (id) => `/properties/admin/status/${id}`,
  FEATURED: (id) => `/properties/admin/featured/${id}`,
  DELETE: (id) => `/properties/delete/${id}`,
};

export const DASHBOARD = {
  STATS: "/dashboard/stats",
  ADMIN_STATS: "/dashboard/admin/stats",
  LOGS: "/dashboard/logs",
  PROPERTY_STATS: "/dashboard/property-stats",
};

export const LEADS = {
  REQUIREMENTS: "/leads/requirements",
  REQUIREMENT_BY_ID: (id) => `/leads/requirements/${id}`,
  INTERESTS: "/leads/interests",
};

export const NOTIFICATIONS = {
  LIST: "/notifications",
  UNREAD: "/notifications/unread-count",
  MARK_READ: (id) => `/notifications/read/${id}`,
  MARK_ALL: "/notifications/read-all",
};

export const SEO = {
  PAGES: "/seo/pages",
  PAGE_BY_ID: (id) => `/seo/pages/${id}`,
};

export const SETTINGS = {
  BASE: "/settings",
};
