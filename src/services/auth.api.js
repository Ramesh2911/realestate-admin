import API from "./api";
import {
  AUTH,
  PROPERTY,
  USER,
  DASHBOARD,
  LEADS,
  NOTIFICATIONS,
  SEO,
  SETTINGS,
} from "./endpoints";

export const loginApi = (payload) => API.post(AUTH.LOGIN, payload);
export const logoutApi = () => API.post(AUTH.LOGOUT);
export const getProfileApi = () => API.get(AUTH.PROFILE);
export const updateProfileApi = (formData) =>
  API.put(AUTH.UPDATE_PROFILE, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const changePasswordApi = (payload) =>
  API.put(AUTH.CHANGE_PASSWORD, payload);

export const getOwnerApi = () => API.get(USER.GET_OWNER);
export const getBrokerApi = () => API.get(USER.GET_BROKER);
export const getDeveloperApi = () => API.get(USER.GET_DEVELOPER);
export const getBuyerApi = () => API.get(USER.GET_BUYER);

export const getPropertyApi = () => API.get(PROPERTY.GET_ALL);
export const approvePropertyApi = (id, payload = {}) => API.patch(PROPERTY.APPROVE(id), payload);
export const rejectPropertyApi = (id, payload = {}) => API.patch(PROPERTY.REJECT(id), payload);

export const getDashboardStatsApi = () => API.get(DASHBOARD.STATS);
export const getAdminStatsApi = () => API.get(DASHBOARD.ADMIN_STATS);
export const getLogsApi = (params) => API.get(DASHBOARD.LOGS, { params });
export const getPropertyStatsApi = () => API.get(DASHBOARD.PROPERTY_STATS);

export const getLeadsApi = () => API.get(LEADS.REQUIREMENTS);
export const createLeadApi = (payload) => API.post(LEADS.REQUIREMENTS, payload);
export const updateLeadApi = (id, payload) =>
  API.put(LEADS.REQUIREMENT_BY_ID(id), payload);
export const deleteLeadApi = (id) => API.delete(LEADS.REQUIREMENT_BY_ID(id));
export const getAllInterestsApi = () => API.get(LEADS.INTERESTS);

export const deletePropertyApi = (id) => API.delete(PROPERTY.DELETE(id));

export const getNotificationsApi = (params) => API.get(NOTIFICATIONS.LIST, { params });
export const getUnreadCountApi = () => API.get(NOTIFICATIONS.UNREAD);
export const markNotificationReadApi = (id) => API.patch(NOTIFICATIONS.MARK_READ(id));
export const markAllReadApi = () => API.patch(NOTIFICATIONS.MARK_ALL);

export const getSeoPagesApi = () => API.get(SEO.PAGES);
export const createSeoPageApi = (data) => API.post(SEO.PAGES, data);
export const updateSeoPageApi = (id, data) => API.put(SEO.PAGE_BY_ID(id), data);
export const deleteSeoPageApi = (id) => API.delete(SEO.PAGE_BY_ID(id));

export const getSettingsApi = () => API.get(SETTINGS.BASE);
export const updateSettingsApi = (payload) => API.put(SETTINGS.BASE, payload);
