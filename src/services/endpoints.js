export const AUTH = {
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
};

export const USER = {
  GET_OWNER: "/users/owners",
  GET_BROKER: "/users/brokers",
  GET_DEVELOPER: "/users/developers",
  GET_BUYER: "/users/buyers",
}

export const PROPERTY = {
  GET_ALL: "/properties/all",
 APPROVE_PROPERTY: (id) => `/properties/admin/approve/${id}`,
  REJECT_PROPERTY: (id) => `/properties/admin/reject/${id}`,
}