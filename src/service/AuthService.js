import { api } from "./Api";

export const authService = {
  async login(email, senha) {
    const response = await api.post("/auth/login", { email, senha });
    const data = response.data;

    if (data?.token) {
      localStorage.setItem("token", data.token);
    }

    return data;
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

  async redefinirSenha(token, novaSenha, confirmacaoSenha) {
    const response = await api.post(
      "/auth/reset-password",
      { token, novaSenha, confirmacaoSenha },
      { skipAuth: true }
    );
    return response.data;
  },
};

