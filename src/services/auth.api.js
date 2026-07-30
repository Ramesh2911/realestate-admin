import API from "./api";
import {
  AUTH,
  PROPERTY,
  USER,

} from "./endpoints";

export const loginApi = (payload) => {
  return API.post(AUTH.LOGIN, payload);
};

export const logoutApi = () => {
  return API.post(AUTH.LOGOUT);
};

export const getOwnerApi = () => {
  return API.get(USER.GET_OWNER);
}

export const getBrokerApi = () => {
  return API.get(USER.GET_BROKER);
}

export const getDeveloperApi = () => {
  return API.get(USER.GET_DEVELOPER);
}

export const getBuyerApi = () => {
  return API.get(USER.GET_BUYER);
}

export const getPropertyApi = () => {
  return API.get(PROPERTY.GET_ALL);
}

export const approvePropertyApi = (id, payload = {}) => {
  return API.patch(PROPERTY.APPROVE_PROPERTY(id), payload);
};

export const rejectPropertyApi = (id, payload = {}) => {
  return API.patch(PROPERTY.REJECT_PROPERTY(id), payload);
};

