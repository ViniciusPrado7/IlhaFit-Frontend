const AUTH_USER_KEY = "ilhaFitAuthUser";
const AUTH_TOKEN_KEY = "token";
const AUTH_TOKEN_TYPE_KEY = "tokenType";

const normalizeUser = (user) => ({
  id: user?.id,
  nome: user?.nome,
  email: user?.email,
  tipo: user?.tipo,
  role: user?.role,
  tokenType: user?.tokenType,
});

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

  getToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  getTokenType() {
    return localStorage.getItem(AUTH_TOKEN_TYPE_KEY) || this.getUser()?.tokenType || "Bearer";
  },

  isEstabelecimentoAuthenticated() {
    const user = this.getUser();
    return Boolean(user?.tipo === "ESTABELECIMENTO" && this.getToken());
  },

  setSession(authData) {
    if (authData?.token) {
      localStorage.setItem(AUTH_TOKEN_KEY, authData.token);
    }

    if (authData?.tokenType) {
      localStorage.setItem(AUTH_TOKEN_TYPE_KEY, authData.tokenType);
    }

    this.setUser(normalizeUser(authData));
  },

  setUser(user) {
    const normalizedUser = normalizeUser(user);

    if (normalizedUser.tipo !== "ESTABELECIMENTO") {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_TOKEN_TYPE_KEY);
    }

    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(normalizedUser));
    window.dispatchEvent(new Event("auth-change"));
  },

  clear() {
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_TOKEN_TYPE_KEY);
    window.dispatchEvent(new Event("auth-change"));
  },
};

