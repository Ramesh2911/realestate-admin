export const getToken = () => {
  return localStorage.getItem("access_token");
};

export const setToken = (token) => {
  localStorage.setItem("access_token", token);
};

export const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
  localStorage.removeItem("role");
  window.location.href = "/";
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("access_token");
};


