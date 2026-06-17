import { api } from "./Api";

export const authService = {
  async login(email, senha) {
    const response = await api.post("/auth/login", { email, senha });
    return response.data;
  },

  async confirmEmail(email, codigo) {
    const response = await api.post(
      "/auth/confirm-email",
      { email, codigo },
      { skipAuth: true }
    );
    return response.data;
  },

  async register(data) {
    const { confirmarSenha, ...rest } = data;
    const response = await api.post("/usuarios/cadastrar", {
      ...rest,
      confirmacaoSenha: data.confirmacaoSenha || confirmarSenha,
    });
    return response.data;
  },

  async esqueciSenha(email) {
    const response = await api.post("/auth/forgot-password", { email }, { skipAuth: true });
    return response.data;
  },

  async redefinirSenha(email, codigo, novaSenha, confirmacaoSenha) {
    const response = await api.post(
      "/auth/reset-password",
      { email, codigo, novaSenha, confirmacaoSenha },
      { skipAuth: true }
    );
    return response.data;
  },
};

