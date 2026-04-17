const AUTH_USER_KEY = "ilhaFitAuthUser";

export const authSession = {
  getUser() {
    const rawUser = localStorage.getItem(AUTH_USER_KEY);
    if (!rawUser) return null;

    try {
      return JSON.parse(rawUser);
    } catch {
      localStorage.removeItem(AUTH_USER_KEY);
      return null;
    }
  },

  setUser(user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event("auth-change"));
  },

  clear() {
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("auth-change"));
  },
};

