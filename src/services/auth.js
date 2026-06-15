// export const getToken = () => {
//   return localStorage.getItem("access_token");
// };

// export const setToken = (token) => {
//   localStorage.setItem("access_token", token);
// };

// export const logout = () => {
//   localStorage.removeItem("access_token");
//   window.location.href = "/login";
// };

// export const isAuthenticated = () => {
//   return !!localStorage.getItem("access_token");
// };


export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const setUser = (userData) => {
  localStorage.setItem(
    "user",
    JSON.stringify(userData)
  );
};

export const getRole = () => {
  const user = getUser();
  return user?.role || null;
};

export const logout = () => {
  localStorage.removeItem("user");
  window.location.href = "/";
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("user");
};